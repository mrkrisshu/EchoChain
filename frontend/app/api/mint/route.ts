import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, pricePerUse, maxUses, licenseType } = body;

        // Load the local CLI keypair
        const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');

        if (!fs.existsSync(keypairPath)) {
            return NextResponse.json(
                { error: 'Local keypair not found. Run: solana-keygen new' },
                { status: 400 }
            );
        }

        const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

        // Connect to local validator
        const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

        // Check balance
        const balance = await connection.getBalance(payer.publicKey);
        if (balance === 0) {
            // Airdrop some SOL for testing
            const airdropSig = await connection.requestAirdrop(payer.publicKey, 2 * 1e9);
            await connection.confirmTransaction(airdropSig);
        }

        // Create a demo transaction (self-transfer to simulate minting)
        // In production, this would call the actual EchoChain program
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: payer.publicKey,
                lamports: 0,
            })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

        // Save voice to storage
        const voiceData = {
            mint: `Voice${Date.now()}`,
            name: name || 'Unnamed Voice',
            creator: payer.publicKey.toBase58(),
            creatorShort: payer.publicKey.toBase58().slice(0, 4) + '...' + payer.publicKey.toBase58().slice(-4),
            pricePerUse: parseFloat(pricePerUse) || 0.1,
            maxUses: parseInt(maxUses) || 100,
            remainingUses: parseInt(maxUses) || 100,
            licenseType: parseInt(licenseType) || 0,
            resaleAllowed: false,
            totalUses: 0,
            description: body.description || 'A custom voice NFT minted on EchoChain.',
            signature,
        };

        // Save to voices.json
        const VOICES_FILE = path.join(process.cwd(), 'data', 'voices.json');
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        let voices = [];
        if (fs.existsSync(VOICES_FILE)) {
            voices = JSON.parse(fs.readFileSync(VOICES_FILE, 'utf-8'));
        }
        voices.push(voiceData);
        fs.writeFileSync(VOICES_FILE, JSON.stringify(voices, null, 2));

        return NextResponse.json({
            success: true,
            signature,
            explorer: `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http://127.0.0.1:8899`,
            wallet: payer.publicKey.toBase58(),
            voiceData
        });

    } catch (error) {
        console.error('Mint error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to mint' },
            { status: 500 }
        );
    }
}
