'use client';

import { useState } from 'react';

export default function CreatePage() {
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
    const [result, setResult] = useState<any>(null);
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
            // Call the API that uses local CLI keypair
            const response = await fetch('/api/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    pricePerUse: formData.pricePerUse,
                    maxUses: formData.maxUses,
                    licenseType: formData.licenseType,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to mint');
            }

            setResult(data);
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
            setError(err instanceof Error ? err.message : 'Failed to mint');
        } finally {
            setLoading(false);
        }
    };

    if (success && result) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>
                        Voice NFT Minted!
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                        Your voice has been minted using your local CLI keypair.
                    </p>
                    <div className="alert alert-success" style={{ textAlign: 'left', marginBottom: '16px' }}>
                        <strong>Wallet:</strong> {result.wallet}
                    </div>
                    <div className="alert alert-success" style={{ textAlign: 'left' }}>
                        <strong>Transaction:</strong>{' '}
                        <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{result.signature}</code>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '24px' }}
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
                    <p>Mint your voice using your local Solana CLI keypair (no Phantom needed)</p>
                </div>

                {error && (
                    <div className="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#ef4444' }}>
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

                    {/* Consent Confirmation (CRITICAL) */}
                    <div className="form-group" style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
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
                        {loading ? '⏳ Minting with Local CLI...' : '🚀 Mint Voice NFT'}
                    </button>
                </form>
            </div>
        </div>
    );
}
