import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("echochain", () => {
    // Configure the client to use the local cluster
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // Program and accounts
    const program = anchor.workspace.Echochain;
    const creator = Keypair.generate();
    const buyer = Keypair.generate();
    let mintKeypair: Keypair;
    let voiceLicensePda: PublicKey;
    let usageRecordPda: PublicKey;

    const pricePerUse = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const maxUses = 100;
    const licenseType = 1; // Commercial
    const royaltyBps = 500; // 5%

    before(async () => {
        // Airdrop SOL to creator and buyer
        const airdropCreator = await provider.connection.requestAirdrop(
            creator.publicKey,
            10 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropCreator);

        const airdropBuyer = await provider.connection.requestAirdrop(
            buyer.publicKey,
            10 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropBuyer);

        mintKeypair = Keypair.generate();
    });

    it("Initializes a voice NFT with license", async () => {
        // Derive PDAs
        [voiceLicensePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("voice_license"), mintKeypair.publicKey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .initializeVoice(
                pricePerUse,
                maxUses,
                licenseType,
                true, // resale allowed
                royaltyBps,
                "https://arweave.net/metadata.json",
                "Epic Voice",
                "ECHO"
            )
            .accounts({
                creator: creator.publicKey,
                mint: mintKeypair.publicKey,
            })
            .signers([creator, mintKeypair])
            .rpc();

        console.log("Initialize voice tx:", tx);

        // Verify VoiceLicense PDA
        const voiceLicense = await program.account.voiceLicense.fetch(voiceLicensePda);

        assert.equal(voiceLicense.nftMint.toBase58(), mintKeypair.publicKey.toBase58());
        assert.equal(voiceLicense.creator.toBase58(), creator.publicKey.toBase58());
        assert.equal(voiceLicense.pricePerUse.toString(), pricePerUse.toString());
        assert.equal(voiceLicense.maxUses, maxUses);
        assert.equal(voiceLicense.remainingUses, maxUses);
        assert.equal(voiceLicense.licenseType, licenseType);
        assert.equal(voiceLicense.consentConfirmed, true);
    });

    it("Allows buyer to purchase usage", async () => {
        const usesToBuy = 5;
        const expectedCost = pricePerUse.toNumber() * usesToBuy;

        [usageRecordPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("usage_record"),
                mintKeypair.publicKey.toBuffer(),
                buyer.publicKey.toBuffer(),
            ],
            program.programId
        );

        const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);

        const tx = await program.methods
            .buyUsage(usesToBuy)
            .accounts({
                buyer: buyer.publicKey,
                creator: creator.publicKey,
                voiceLicense: voiceLicensePda,
                usageRecord: usageRecordPda,
            })
            .signers([buyer])
            .rpc();

        console.log("Buy usage tx:", tx);

        const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);

        // Verify SOL transferred to creator
        assert.equal(creatorBalanceAfter - creatorBalanceBefore, expectedCost);

        // Verify usage record
        const usageRecord = await program.account.usageRecord.fetch(usageRecordPda);
        assert.equal(usageRecord.remainingUses, usesToBuy);

        // Verify voice license updated
        const voiceLicense = await program.account.voiceLicense.fetch(voiceLicensePda);
        assert.equal(voiceLicense.remainingUses, maxUses - usesToBuy);
        assert.equal(voiceLicense.totalEarnings.toString(), expectedCost.toString());
    });

    it("Allows buyer to use voice", async () => {
        const tx = await program.methods
            .useVoice()
            .accounts({
                user: buyer.publicKey,
                voiceLicense: voiceLicensePda,
                usageRecord: usageRecordPda,
            })
            .signers([buyer])
            .rpc();

        console.log("Use voice tx:", tx);

        // Verify usage decremented
        const usageRecord = await program.account.usageRecord.fetch(usageRecordPda);
        assert.equal(usageRecord.remainingUses, 4); // Started with 5, used 1

        // Verify total uses incremented
        const voiceLicense = await program.account.voiceLicense.fetch(voiceLicensePda);
        assert.equal(voiceLicense.totalUses, 1);
    });

    it("Fails when no uses remaining", async () => {
        // Use all remaining uses
        for (let i = 0; i < 4; i++) {
            await program.methods
                .useVoice()
                .accounts({
                    user: buyer.publicKey,
                    voiceLicense: voiceLicensePda,
                    usageRecord: usageRecordPda,
                })
                .signers([buyer])
                .rpc();
        }

        // Try to use when empty
        try {
            await program.methods
                .useVoice()
                .accounts({
                    user: buyer.publicKey,
                    voiceLicense: voiceLicensePda,
                    usageRecord: usageRecordPda,
                })
                .signers([buyer])
                .rpc();

            assert.fail("Expected error when no uses remaining");
        } catch (err: any) {
            assert.include(err.message, "NoUsesRemaining");
        }
    });
});
