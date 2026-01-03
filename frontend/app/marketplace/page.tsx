'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, Transaction } from '@solana/web3.js';
import Link from 'next/link';
import { AILicenseSummary } from '@/components/AILicenseSummary';
import { VoiceLicenseData } from '@/lib/ai';
import { voiceStorage, VoiceRecord } from '@/lib/supabase';

// Demo voice data (shown alongside user-minted voices)
const DEMO_VOICES = [
    {
        mint: 'Voice1111111111111111111111111111111111111111',
        name: 'Epic Narrator',
        creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        creatorShort: '7xKX...gAsU',
        pricePerUse: 0.1,
        maxUses: 100,
        remainingUses: 87,
        licenseType: 1 as const,
        resaleAllowed: false,
        totalUses: 13,
        description: 'Deep, commanding voice perfect for trailers and documentaries.',
    },
    {
        mint: 'Voice2222222222222222222222222222222222222222',
        name: 'Friendly Assistant',
        creator: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgBsU',
        creatorShort: '9xKX...BsU',
        pricePerUse: 0.05,
        maxUses: 500,
        remainingUses: 342,
        licenseType: 0 as const,
        resaleAllowed: true,
        totalUses: 158,
        description: 'Warm and approachable voice for virtual assistants and guides.',
    },
];

type Voice = typeof DEMO_VOICES[0];

// Convert Supabase record to Voice type
function toVoice(record: VoiceRecord): Voice {
    return {
        mint: record.mint,
        name: record.name,
        creator: record.creator,
        creatorShort: record.creator_short,
        pricePerUse: record.price_per_use,
        maxUses: record.max_uses,
        remainingUses: record.remaining_uses,
        licenseType: record.license_type as 0 | 1,
        resaleAllowed: record.resale_allowed,
        totalUses: record.total_uses,
        description: record.description,
    };
}

export default function MarketplacePage() {
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState<string | null>(null);
    const [purchasedVoices, setPurchasedVoices] = useState<Set<string>>(new Set());
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [allVoices, setAllVoices] = useState<Voice[]>(DEMO_VOICES);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch minted voices from Supabase
    useEffect(() => {
        async function fetchVoices() {
            try {
                const supabaseVoices = await voiceStorage.getAll();
                const mintedVoices = supabaseVoices.map(toVoice);
                // Combine minted voices with demo voices
                setAllVoices([...mintedVoices, ...DEMO_VOICES]);
            } catch (error) {
                console.error('Failed to fetch voices:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchVoices();
    }, []);

    const handleBuyUsage = async (voice: Voice) => {
        if (!connected || !publicKey) {
            alert('Please connect your Phantom wallet to purchase');
            return;
        }

        setLoading(voice.mint);

        try {
            // Create purchase transaction using Phantom
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0, // Demo: In production, transfer to creator
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setPurchasedVoices(new Set(Array.from(purchasedVoices).concat(voice.mint)));
            alert(`Success! Purchased 1 use of "${voice.name}"\n\nTx: ${signature}`);

        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    // Convert voice to license data for AI summary
    const toLicenseData = (voice: typeof DEMO_VOICES[0]): VoiceLicenseData => ({
        licenseType: voice.licenseType,
        pricePerUse: voice.pricePerUse,
        remainingUses: voice.remainingUses,
        resaleAllowed: voice.resaleAllowed,
        maxUses: voice.maxUses,
        totalUses: voice.totalUses,
    });

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🛒 Voice Marketplace</h1>
                    <p>Browse and purchase usage rights for AI-ready voice NFTs.</p>
                </div>

                {!connected && (
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                            Connect your wallet to purchase voice licenses
                        </p>
                        <WalletMultiButton />
                    </div>
                )}

                {isLoading && (
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <p style={{ color: 'var(--muted)' }}>Loading voices...</p>
                    </div>
                )}

                <div className="grid grid-3">
                    {allVoices.map((voice) => (
                        <div key={voice.mint} className="card voice-card">
                            <div className="voice-card-header">
                                <div className="voice-avatar">
                                    🎙️
                                </div>
                                <div className="voice-info">
                                    <h3>{voice.name}</h3>
                                    <p>by {voice.creatorShort}</p>
                                </div>
                                <span className={`badge ${voice.licenseType === 0 ? 'badge-personal' : 'badge-commercial'}`}>
                                    {voice.licenseType === 0 ? 'Personal' : 'Commercial'}
                                </span>
                            </div>

                            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                                {voice.description}
                            </p>

                            <div className="voice-stats">
                                <div className="stat">
                                    <div className="stat-value">{voice.pricePerUse} SOL</div>
                                    <div className="stat-label">Per Use</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-value" style={{
                                        color: voice.remainingUses === 0 ? 'var(--error)' : undefined
                                    }}>
                                        {voice.remainingUses}
                                    </div>
                                    <div className="stat-label">
                                        {voice.remainingUses === 0 ? 'EXHAUSTED' : 'Available'}
                                    </div>
                                </div>
                            </div>

                            {/* AI License Summary - Expandable */}
                            <button
                                onClick={() => setExpandedCard(expandedCard === voice.mint ? null : voice.mint)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    padding: '8px 0',
                                    width: '100%',
                                    textAlign: 'left',
                                }}
                            >
                                🤖 {expandedCard === voice.mint ? 'Hide' : 'Show'} AI License Summary
                            </button>

                            {expandedCard === voice.mint && (
                                <AILicenseSummary license={toLicenseData(voice)} />
                            )}

                            {/* Exhausted Warning */}
                            {voice.remainingUses === 0 && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '12px',
                                }}>
                                    <p style={{ color: 'var(--error)', fontSize: '13px', fontWeight: 600 }}>
                                        ⚠️ License Exhausted
                                    </p>
                                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                                        AI generation is blocked for this voice.
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1,
                                        opacity: voice.remainingUses === 0 ? 0.5 : 1,
                                    }}
                                    onClick={() => handleBuyUsage(voice)}
                                    disabled={loading === voice.mint || voice.remainingUses === 0}
                                >
                                    {loading === voice.mint ? '⏳ Processing...' :
                                        voice.remainingUses === 0 ? 'Sold Out' : 'Buy 1 Use'}
                                </button>

                                {purchasedVoices.has(voice.mint) && (
                                    <Link
                                        href={`/use/${voice.mint}`}
                                        className="btn btn-secondary"
                                    >
                                        Use →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Gatekeeper Info */}
                <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '16px',
                }}>
                    <h3 style={{ marginBottom: '12px', color: 'var(--secondary)' }}>
                        🔐 AI Usage Gatekeeper
                    </h3>
                    <p style={{ color: 'var(--foreground)', fontSize: '14px', marginBottom: '8px' }}>
                        <strong>AI cannot generate anything unless Solana approves usage first.</strong>
                    </p>
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                        When you use AI generation, EchoChain first calls the <code>use_voice</code> instruction
                        on Solana. Only if this transaction succeeds is AI allowed to run. This ensures
                        all licensing is enforced on-chain.
                    </p>
                </div>

                {/* Protocol Info */}
                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    padding: '32px',
                    background: 'var(--card)',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                }}>
                    <h3 style={{ marginBottom: '16px' }}>🔗 On-Chain Transparency</h3>
                    <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Every purchase creates an on-chain record. Usage rights are tracked in PDAs,
                        and creators receive payments directly — no intermediaries.
                    </p>
                </div>
            </div>
        </div>
    );
}
