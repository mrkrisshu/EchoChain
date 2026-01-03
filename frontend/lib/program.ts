import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';

// Program ID (update after deployment)
export const PROGRAM_ID = new PublicKey('ECho1111111111111111111111111111111111111111');

// PDA Seeds
export const VOICE_LICENSE_SEED = 'voice_license';
export const USAGE_RECORD_SEED = 'usage_record';

/**
 * Find the VoiceLicense PDA for a given NFT mint
 */
export function findVoiceLicensePDA(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(VOICE_LICENSE_SEED), mint.toBuffer()],
        PROGRAM_ID
    );
}

/**
 * Find the UsageRecord PDA for a buyer and voice mint
 */
export function findUsageRecordPDA(mint: PublicKey, buyer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(USAGE_RECORD_SEED), mint.toBuffer(), buyer.toBuffer()],
        PROGRAM_ID
    );
}

/**
 * VoiceLicense account data structure
 */
export interface VoiceLicense {
    nftMint: PublicKey;
    creator: PublicKey;
    pricePerUse: BN;
    maxUses: number;
    remainingUses: number;
    licenseType: number;
    resaleAllowed: boolean;
    royaltyBps: number;
    consentConfirmed: boolean;
    totalEarnings: BN;
    totalUses: number;
    bump: number;
}

/**
 * UsageRecord account data structure
 */
export interface UsageRecord {
    voiceMint: PublicKey;
    buyer: PublicKey;
    remainingUses: number;
    bump: number;
}

/**
 * Initialize Voice parameters
 */
export interface InitializeVoiceParams {
    pricePerUse: number; // In SOL
    maxUses: number;
    licenseType: 0 | 1; // 0 = Personal, 1 = Commercial
    resaleAllowed: boolean;
    royaltyPercent: number; // 0-100
    metadataUri: string;
    name: string;
    symbol: string;
}

/**
 * Helper class for EchoChain program interactions
 */
export class EchoChainClient {
    connection: Connection;
    programId: PublicKey;

    constructor(connection: Connection, programId: PublicKey = PROGRAM_ID) {
        this.connection = connection;
        this.programId = programId;
    }

    /**
     * Get VoiceLicense account data
     */
    async getVoiceLicense(mint: PublicKey): Promise<VoiceLicense | null> {
        const [pda] = findVoiceLicensePDA(mint);
        const accountInfo = await this.connection.getAccountInfo(pda);

        if (!accountInfo) return null;

        // Decode account data (simplified - use Anchor's decode in production)
        // This is a placeholder - actual implementation needs IDL
        return null;
    }

    /**
     * Get UsageRecord for a buyer
     */
    async getUsageRecord(mint: PublicKey, buyer: PublicKey): Promise<UsageRecord | null> {
        const [pda] = findUsageRecordPDA(mint, buyer);
        const accountInfo = await this.connection.getAccountInfo(pda);

        if (!accountInfo) return null;

        // Decode account data (simplified)
        return null;
    }

    /**
     * Calculate total cost for buying uses
     */
    calculateCost(pricePerUse: number, uses: number): number {
        return pricePerUse * uses;
    }

    /**
     * Format SOL amount for display
     */
    formatSol(lamports: number): string {
        return (lamports / LAMPORTS_PER_SOL).toFixed(4);
    }
}

/**
 * SDK function for AI apps to use voice
 * This is the integration point for external applications
 */
export async function useVoice(
    voiceMint: PublicKey,
    wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
    connection: Connection
): Promise<{ success: boolean; txSignature: string; remainingUses: number }> {
    // In production: Build and send the use_voice instruction
    // This is a placeholder showing the expected interface

    throw new Error('Not implemented - requires deployed program');
}

export default EchoChainClient;
