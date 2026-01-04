'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AILicenseSummary } from '@/components/AILicenseSummary';
import { AIGenerateButton } from '@/components/AIGenerateButton';
import { VoiceLicenseData } from '@/lib/ai';
import { voiceStorage, VoiceRecord } from '@/lib/supabase';

export default function UsePage() {
    const params = useParams();
    const mint = params.mint as string;
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [remainingUses, setRemainingUses] = useState(3); // Demo starting value
    const [loading, setLoading] = useState(false);
    const [lastTx, setLastTx] = useState('');
    const [totalUsed, setTotalUsed] = useState(0);

    // Voice data from Supabase
    const [voiceData, setVoiceData] = useState<VoiceRecord | null>(null);
    const [isLoadingVoice, setIsLoadingVoice] = useState(true);

    // Audio playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch voice data from Supabase on mount
    useEffect(() => {
        async function fetchVoice() {
            setIsLoadingVoice(true);
            const voice = await voiceStorage.getByMint(mint);
            if (voice) {
                setVoiceData(voice);
                setRemainingUses(voice.remaining_uses);
                setTotalUsed(voice.total_uses);
            }
            setIsLoadingVoice(false);
        }
        fetchVoice();
    }, [mint]);

    // Default voice data fallback
    const displayData = voiceData || {
        name: 'Voice NFT',
        creator: 'Unknown',
        creator_short: 'Unknown',
        price_per_use: 0.1,
        license_type: 1,
        max_uses: 100,
        remaining_uses: 3,
        total_uses: 0,
        audio_url: '',
    };

    // License data for AI components
    const licenseData: VoiceLicenseData = {
        licenseType: displayData.license_type as 0 | 1,
        pricePerUse: displayData.price_per_use,
        remainingUses: remainingUses,
        resaleAllowed: voiceData?.resale_allowed || false,
        maxUses: displayData.max_uses,
        totalUses: totalUsed,
    };

    // Play the actual voice audio
    const playVoiceAudio = () => {
        if (!voiceData?.audio_url) {
            alert('No audio file available for this voice.');
            return;
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch((err) => {
                    console.error('Audio playback error:', err);
                    alert('Failed to play audio. Please try again.');
                });
                setIsPlaying(true);
            }
        }
    };

    // Handle audio ended
    const handleAudioEnded = () => {
        setIsPlaying(false);
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

            // Play the actual voice audio after successful use
            if (voiceData?.audio_url && audioRef.current) {
                audioRef.current.play().catch((err) => {
                    console.error('Audio playback error:', err);
                });
                setIsPlaying(true);
            } else {
                // Fallback: Speak confirmation using Text-to-Speech
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(
                        `Voice ${displayData.name} activated. You have ${remainingUses - 1} uses remaining.`
                    );
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                }
            }

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

                {/* Hidden Audio Element */}
                {voiceData?.audio_url && (
                    <audio
                        ref={audioRef}
                        src={voiceData.audio_url}
                        onEnded={handleAudioEnded}
                        style={{ display: 'none' }}
                    />
                )}

                <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
                    {displayData.name}
                </h1>
                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                    by {displayData.creator_short || displayData.creator}
                </p>

                {/* AI License Summary */}
                <AILicenseSummary license={licenseData} />

                {/* Remaining Uses Counter */}
                <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                    <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>Remaining Uses</p>
                    <div className="usage-remaining">{remainingUses}</div>
                </div>

                {/* Play Voice Audio Button - Plays the actual purchased audio */}
                {voiceData?.audio_url && (
                    <button
                        className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                            width: '100%',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onClick={playVoiceAudio}
                    >
                        {isPlaying ? (
                            <>🔊 Stop Audio</>
                        ) : (
                            <>🎧 Play Voice Audio</>
                        )}
                    </button>
                )}

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
