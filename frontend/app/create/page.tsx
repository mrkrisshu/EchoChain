'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { voiceStorage, VoiceRecord } from '@/lib/supabase';

export default function CreatePage() {
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerUse: '0.1',
        maxUses: '100',
        licenseType: '0',
        resaleAllowed: false,
        royaltyPercent: '5',
        consent: false,
    });

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [txSignature, setTxSignature] = useState('');
    const [error, setError] = useState('');

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!connected || !publicKey) {
            setError('Please connect your Phantom wallet');
            return;
        }

        if (!formData.consent) {
            setError('You must confirm voice ownership consent');
            return;
        }

        if (!audioFile) {
            setError('Please upload a voice sample');
            return;
        }

        setLoading(true);

        try {
            // 1. Create and send transaction to Solana
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0, // Demo: self-transfer. In production, call actual program
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            // 2. Upload audio to Supabase Storage (if configured)
            let audioUrl = '';
            if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                const fileName = `${Date.now()}_${audioFile.name}`;
                audioUrl = await voiceStorage.uploadAudio(audioFile, fileName) || '';
            }

            // 3. Save voice metadata to Supabase (if configured)
            const voiceData: VoiceRecord = {
                mint: `Voice${Date.now()}`,
                name: formData.name || 'Unnamed Voice',
                creator: publicKey.toBase58(),
                creator_short: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4),
                price_per_use: parseFloat(formData.pricePerUse) || 0.1,
                max_uses: parseInt(formData.maxUses) || 100,
                remaining_uses: parseInt(formData.maxUses) || 100,
                license_type: parseInt(formData.licenseType) || 0,
                resale_allowed: formData.resaleAllowed,
                total_uses: 0,
                description: formData.description || 'A custom voice NFT minted on EchoChain.',
                audio_url: audioUrl,
                signature,
            };

            if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                await voiceStorage.save(voiceData);
            }

            setTxSignature(signature);
            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                description: '',
                pricePerUse: '0.1',
                maxUses: '100',
                licenseType: '0',
                resaleAllowed: false,
                royaltyPercent: '5',
                consent: false,
            });
            setAudioFile(null);
            setAudioPreview('');

        } catch (err) {
            console.error('Error minting voice:', err);
            setError(err instanceof Error ? err.message : 'Failed to mint voice NFT');
        } finally {
            setLoading(false);
        }
    };

    // Determine network for explorer link
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'localhost';
    const explorerCluster = network === 'localhost'
        ? 'custom&customUrl=http://127.0.0.1:8899'
        : network;

    if (!connected) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '120px' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '24px' }}>
                        🎙️ Create Voice NFT
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                        Connect your Phantom wallet to mint your voice as an NFT with licensing terms.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>
                        Voice NFT Minted!
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                        Your voice has been minted as an NFT with licensing terms stored on-chain.
                    </p>
                    <div className="alert alert-success" style={{ textAlign: 'left' }}>
                        <strong>Transaction:</strong>{' '}
                        <a
                            href={`https://explorer.solana.com/tx/${txSignature}?cluster=${explorerCluster}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--success)', textDecoration: 'underline' }}
                        >
                            View on Solana Explorer
                        </a>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setSuccess(false)}
                    >
                        Mint Another Voice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1>🎙️ Create Voice NFT</h1>
                    <p>Mint your voice as an NFT and set your licensing terms.</p>
                </div>

                {error && (
                    <div className="alert" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#ef4444'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card">
                    {/* Voice Sample Upload */}
                    <div className="form-group">
                        <label className="form-label">Voice Sample</label>
                        <div
                            style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '12px',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'border-color 0.3s',
                            }}
                            onClick={() => document.getElementById('audio-upload')?.click()}
                        >
                            {audioPreview ? (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
                                    <audio controls src={audioPreview} className="voice-audio" />
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                                    <p style={{ color: 'var(--muted)' }}>Click to upload audio file</p>
                                </>
                            )}
                        </div>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Voice Name */}
                    <div className="form-group">
                        <label className="form-label">Voice Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Deep Narrator Voice"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            placeholder="Describe your voice..."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* Pricing Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Price per Use (SOL)</label>
                            <input
                                type="number"
                                className="form-input"
                                step="0.001"
                                min="0.001"
                                value={formData.pricePerUse}
                                onChange={(e) => setFormData({ ...formData, pricePerUse: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Uses</label>
                            <input
                                type="number"
                                className="form-input"
                                min="1"
                                max="1000000"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* License Type */}
                    <div className="form-group">
                        <label className="form-label">License Type</label>
                        <select
                            className="form-select"
                            value={formData.licenseType}
                            onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                        >
                            <option value="0">Personal Use Only</option>
                            <option value="1">Commercial Use Allowed</option>
                        </select>
                    </div>

                    {/* Royalty */}
                    <div className="form-group">
                        <label className="form-label">Royalty on Resale (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="50"
                            value={formData.royaltyPercent}
                            onChange={(e) => setFormData({ ...formData, royaltyPercent: e.target.value })}
                        />
                    </div>

                    {/* Resale Toggle */}
                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.resaleAllowed}
                                onChange={(e) => setFormData({ ...formData, resaleAllowed: e.target.checked })}
                            />
                            <span>Allow license resale</span>
                        </label>
                    </div>

                    {/* Consent Confirmation */}
                    <div className="form-group" style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                    }}>
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.consent}
                                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                required
                            />
                            <span>
                                <strong>I confirm I own the rights to this voice</strong> and consent to it being
                                licensed through EchoChain.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading || !formData.consent}
                    >
                        {loading ? '⏳ Minting...' : '🚀 Mint Voice NFT'}
                    </button>
                </form>
            </div>
        </div>
    );
}
