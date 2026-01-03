'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface LicenseData {
    valid: boolean;
    voice_id: string;
    voice_name: string;
    license_type: string;
    uses_remaining: number;
    max_uses: number;
    creator: string;
    ai_training_allowed: boolean;
    attribution_required: boolean;
    error?: string;
}

export default function LicenseProofPage() {
    const params = useParams();
    const voiceId = params.voiceId as string;
    const [license, setLicense] = useState<LicenseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLicense() {
            try {
                const response = await fetch(`/api/verify-license?voice_id=${voiceId}&wallet=public`);
                const data = await response.json();
                setLicense(data);
            } catch (error) {
                console.error('Failed to fetch license:', error);
            } finally {
                setLoading(false);
            }
        }
        if (voiceId) fetchLicense();
    }, [voiceId]);

    if (loading) {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>Loading license proof...</p>
            </div>
        );
    }

    if (!license || license.error) {
        return (
            <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>❌</h1>
                    <h2>License Not Found</h2>
                    <p style={{ color: 'var(--muted)' }}>This voice ID does not exist.</p>
                    <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
                        Browse Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const usagePercent = ((license.max_uses - license.uses_remaining) / license.max_uses) * 100;

    return (
        <div className="page" style={{ minHeight: '100vh', paddingTop: '80px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
                {/* Header Badge */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        padding: '8px 24px',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}>
                        🔐 Verified License Proof
                    </span>
                </div>

                {/* License Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '24px',
                    padding: '32px',
                }}>
                    {/* Voice Info */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎙️</div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                            {license.voice_name}
                        </h1>
                        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                            Voice ID: {voiceId.slice(0, 8)}...{voiceId.slice(-8)}
                        </p>
                    </div>

                    {/* License Type Badge */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{
                            background: license.license_type === 'commercial' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: license.license_type === 'commercial' ? '#22c55e' : '#3b82f6',
                            padding: '8px 20px',
                            borderRadius: '50px',
                            fontSize: '14px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                        }}>
                            {license.license_type === 'commercial' ? '✓ Commercial License' : '✓ Personal License'}
                        </span>
                    </div>

                    {/* Usage Bar */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Usage</span>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>
                                {license.uses_remaining} / {license.max_uses} remaining
                            </span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            height: '8px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                                height: '100%',
                                width: `${usagePercent}%`,
                                borderRadius: '50px',
                            }} />
                        </div>
                    </div>

                    {/* License Terms */}
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--muted)' }}>
                            LICENSE TERMS
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#22c55e' }}>✓</span>
                                <span>{license.license_type === 'commercial' ? 'Commercial use allowed' : 'Personal use only'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#22c55e' }}>✓</span>
                                <span>Max {license.max_uses} uses</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: license.ai_training_allowed ? '#22c55e' : '#ef4444' }}>
                                    {license.ai_training_allowed ? '✓' : '✗'}
                                </span>
                                <span>AI Training {license.ai_training_allowed ? 'Allowed' : 'Not Allowed'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: license.attribution_required ? '#f59e0b' : '#22c55e' }}>
                                    {license.attribution_required ? '!' : '✓'}
                                </span>
                                <span>Attribution {license.attribution_required ? 'Required' : 'Optional'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Creator</p>
                        <p style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                            {license.creator.slice(0, 4)}...{license.creator.slice(-4)}
                        </p>
                    </div>
                </div>

                {/* Powered By */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Verified on <strong>Solana</strong> • Powered by <strong>EchoChain</strong>
                    </p>
                    <Link href="/marketplace" style={{ color: '#8b5cf6', fontSize: '14px' }}>
                        ← Back to Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}
