/**
 * EchoChain AI Integration
 * 
 * ABSOLUTE RULE: Solana is the authority. AI must obey Solana.
 * AI never enforces licensing, decides permissions, or bypasses on-chain logic.
 * AI is only a consumer and explainer of on-chain state.
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Types for license data
export interface VoiceLicenseData {
    licenseType: 0 | 1; // 0 = Personal, 1 = Commercial
    pricePerUse: number; // in SOL
    remainingUses: number;
    resaleAllowed: boolean;
    maxUses: number;
    totalUses: number;
}

export interface UseVoiceResult {
    success: boolean;
    txSignature?: string;
    error?: string;
    remainingUses?: number;
}

export interface AIGenerationResult {
    success: boolean;
    content?: string;
    error?: string;
    txSignature?: string;
}

/**
 * FEATURE 1: AI USAGE GATEKEEPER
 * 
 * AI generation must ONLY be allowed after a successful on-chain license usage transaction.
 * Flow: User clicks Generate → Solana use_voice() → IF success → AI allowed, IF failure → AI blocked
 */
export async function generateWithAI(
    voiceMint: string,
    wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
    connection: Connection,
    prompt: string = "Generate voice content"
): Promise<AIGenerationResult> {

    // STEP 1: Call Solana use_voice instruction FIRST
    // AI cannot run before this succeeds
    const useVoiceResult = await callUseVoiceOnSolana(voiceMint, wallet, connection);

    if (!useVoiceResult.success) {
        // BLOCK AI - License exhausted or invalid
        return {
            success: false,
            error: useVoiceResult.error || "Usage not allowed. License exhausted.",
        };
    }

    // STEP 2: Only now can AI be called
    try {
        const aiContent = await callOpenRouterAI(prompt);

        return {
            success: true,
            content: aiContent,
            txSignature: useVoiceResult.txSignature,
        };
    } catch (error: any) {
        // AI failed but blockchain transaction already succeeded
        // This is fine - user's usage was recorded on-chain
        return {
            success: false,
            error: `AI generation failed: ${error.message}. Note: Your usage was still recorded on-chain.`,
            txSignature: useVoiceResult.txSignature,
        };
    }
}

/**
 * Call the Solana program's use_voice instruction
 * This is the GATEKEEPER - if this fails, AI is blocked
 */
async function callUseVoiceOnSolana(
    voiceMint: string,
    wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
    connection: Connection
): Promise<UseVoiceResult> {
    try {
        // In production: Build and send the actual use_voice instruction
        // For demo: Simulate the transaction

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wallet.publicKey,
                lamports: 0, // Self-transfer to simulate
            })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTx = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());

        await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
        });

        return {
            success: true,
            txSignature: signature,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to execute use_voice on Solana",
        };
    }
}

/**
 * Call OpenRouter AI API
 * This is ONLY called after Solana approves the usage
 */
async function callOpenRouterAI(prompt: string): Promise<string> {
    // Note: In production, this would call the actual OpenRouter API
    // For demo purposes, we return a simulated response

    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if OpenRouter API key is available
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (apiKey) {
        // Real API call
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error('OpenRouter API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Demo: Simulated response
    return `[AI Generated Content]\n\nVoice generation authorized by Solana blockchain.\nTransaction confirmed. Your licensed voice content is ready.\n\nPrompt: "${prompt}"\n\nThis content was generated after on-chain verification.`;
}

/**
 * FEATURE 2: AI LICENSE EXPLAINER
 * 
 * Convert on-chain license data into simple human-readable language.
 * AI must: read license data, explain it, NEVER modify or enforce it.
 */
export function generateLicenseExplanation(license: VoiceLicenseData): string {
    const licenseTypeName = license.licenseType === 0 ? 'personal' : 'commercial';
    const resaleStatus = license.resaleAllowed ? 'allowed' : 'not allowed';

    // Build explanation without AI (deterministic, reliable)
    const parts: string[] = [];

    // Usage info
    if (license.remainingUses > 0) {
        parts.push(`This voice can be used ${license.remainingUses} more time${license.remainingUses > 1 ? 's' : ''} for ${licenseTypeName} projects.`);
    } else {
        parts.push(`This voice license is exhausted (0 uses remaining).`);
    }

    // Price info
    parts.push(`Each use costs ${license.pricePerUse} SOL.`);

    // Resale info
    parts.push(`Reselling the license is ${resaleStatus}.`);

    // Stats
    if (license.totalUses > 0) {
        parts.push(`This voice has been used ${license.totalUses} time${license.totalUses > 1 ? 's' : ''} in total.`);
    }

    return parts.join(' ');
}

/**
 * AI-enhanced license explanation using OpenRouter
 * Falls back to deterministic explanation if AI is unavailable
 */
export async function generateAILicenseExplanation(license: VoiceLicenseData): Promise<string> {
    const licenseTypeName = license.licenseType === 0 ? 'Personal' : 'Commercial';
    const resaleStatus = license.resaleAllowed ? 'Yes' : 'No';

    const prompt = `Explain the following voice license in simple, clear language. Be concise (2-3 sentences max):

License Type: ${licenseTypeName}
Price per use: ${license.pricePerUse} SOL
Remaining uses: ${license.remainingUses}
Resale allowed: ${resaleStatus}`;

    try {
        const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

        if (!apiKey) {
            // Fallback to deterministic explanation
            return generateLicenseExplanation(license);
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
            }),
        });

        if (!response.ok) {
            return generateLicenseExplanation(license);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch {
        // Fallback to deterministic explanation
        return generateLicenseExplanation(license);
    }
}

/**
 * Check if AI generation is allowed based on remaining uses
 * This is a PRE-CHECK only - actual enforcement is done by Solana
 */
export function canAttemptAIGeneration(remainingUses: number): boolean {
    return remainingUses > 0;
}
