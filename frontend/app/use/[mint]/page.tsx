'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AILicenseSummary } from '@/components/AILicenseSummary';
import { AIGenerateButton } from '@/components/AIGenerateButton';
import { VoiceLicenseData } from '@/lib/ai';

// Demo data (would come from on-chain in production)
const VOICE_DATA: Record<string, any> = {
    'Voice1111111111111111111111111111111111111111': {
        name: 'Epic Narrator',
        creator: '7xKX...gAsU',
        pricePerUse: 0.1,
        licenseType: 1,
        maxUses: 100,
    },
};

export default function UsePage() {
    const params = useParams();
    const mint = params.mint as string;
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [remainingUses, setRemainingUses] = useState(3); // Demo starting value
    const [loading, setLoading] = useState(false);
    const [lastTx, setLastTx] = useState('');
    const [totalUsed, setTotalUsed] = useState(0);

    const voiceData = VOICE_DATA[mint] || {
        name: 'Voice NFT',
        creator: 'Unknown',
        pricePerUse: 0.1,
        licenseType: 1,
        maxUses: 100,
    };

    // License data for AI components
    const licenseData: VoiceLicenseData = {
        licenseType: voiceData.licenseType,
        pricePerUse: voiceData.pricePerUse,
        remainingUses: remainingUses,
        resaleAllowed: false,
        maxUses: voiceData.maxUses,
        totalUses: totalUsed,
    };

    const handleUseVoice = async () => {
        if (!connected || !publicKey) {
            alert('Please connect your wallet');
            return;
        }

        if (remainingUses <= 0) {
            alert('No uses remaining! Purchase more on the marketplace.');
            return;
        }

        setLoading(true);

        try {
            // Demo: Simulate use_voice instruction
            // In production: Call use_voice on EchoChain program
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setRemainingUses(remainingUses - 1);
            setTotalUsed(totalUsed + 1);
            setLastTx(signature);

        } catch (error) {
            console.error('Use voice failed:', error);
            alert('Failed to use voice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle successful AI generation
    const handleAISuccess = () => {
        setTotalUsed(totalUsed + 1);
    };

    // Handle usage decrement from AI button
    const handleUsageDecrement = () => {
        setRemainingUses(prev => Math.max(0, prev - 1));
    };

    if (!connected) {
        return (
            <div className="page">
                <div className="container usage-container" style={{ paddingTop: '80px' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '24px' }}>
                        🎤 Use Voice
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                        Connect your wallet to use your purchased voice rights.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container usage-container">
                <div className="usage-icon">
                    🎤
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
                    {voiceData.name}
                </h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                    by {voiceData.creator}
                </p>

                {/* AI License Summary */}
                <AILicenseSummary license={licenseData} />

                {/* Remaining Uses Counter */}
                <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                    <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>Remaining Uses</p>
                    <div className="usage-remaining">{remainingUses}</div>
                </div>

                {/* Manual Use Button */}
                <button
                    className="btn btn-secondary"
                    style={{
                        width: '100%',
                        marginBottom: '16px',
                    }}
                    onClick={handleUseVoice}
                    disabled={loading || remainingUses <= 0}
                >
                    {loading ? '⏳ Processing...' : remainingUses > 0 ? '🎙️ Use Voice (Manual)' : '❌ No Uses Left'}
                </button>

                {/* AI Generate Button - Solana-First Gatekeeper */}
                <AIGenerateButton
                    voiceMint={mint}
                    remainingUses={remainingUses}
                    onSuccess={handleAISuccess}
                    onUsageDecrement={handleUsageDecrement}
                />

                {/* AI Gatekeeper Explanation */}
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '12px',
                }}>
                    <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>
                        <strong>🔐 AI Gatekeeper Active</strong>
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        AI generation requires Solana approval first. If your license is exhausted, AI is blocked.
                    </p>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    justifyContent: 'center',
                    marginTop: '32px',
                    marginBottom: '32px',
                }}>
                    <div className="stat" style={{ minWidth: '120px' }}>
                        <div className="stat-value">{totalUsed}</div>
                        <div className="stat-label">Times Used</div>
                    </div>
                </div>

                {/* Last Transaction */}
                {lastTx && (
                    <div className="alert alert-success">
                        <strong>✅ Voice Used!</strong>
                        <br />
                        <a
                            href={`https://explorer.solana.com/tx/${lastTx}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--success)', textDecoration: 'underline' }}
                        >
                            View Transaction on Solana Explorer
                        </a>
                    </div>
                )}

                {/* No Uses Warning */}
                {remainingUses <= 0 && (
                    <div className="alert alert-error" style={{ marginTop: '24px' }}>
                        <strong>⚠️ License Exhausted</strong>
                        <br />
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>
                            AI generation is blocked. Purchase more uses to continue.
                        </p>
                        <Link href="/marketplace" style={{ color: 'var(--error)', textDecoration: 'underline' }}>
                            Purchase more on the Marketplace →
                        </Link>
                    </div>
                )}

                {/* On-Chain Proof Info */}
                <div style={{
                    marginTop: '32px',
                    padding: '24px',
                    background: 'var(--card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>🔗 On-Chain Proof</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        Each usage emits a <code style={{ color: 'var(--primary)' }}>VoiceUsed</code> event
                        on Solana. AI generation is only allowed after this on-chain verification succeeds.
                    </p>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <Link href="/marketplace" className="btn btn-secondary">
                        ← Back to Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}
