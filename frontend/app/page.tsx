'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/void-hero';
import TestimonialsV2 from '@/components/testimonial-v2';
import { Features } from '@/components/features-8';

// Dynamic import to prevent hydration mismatch
const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false, loading: () => <button className="btn btn-secondary">Connect</button> }
);

export default function HomePage() {
    const { connected } = useWallet();

    const navigationLinks = [
        { name: 'HOME', href: '/' },
        { name: 'CREATE', href: '/create' },
        { name: 'MARKETPLACE', href: '/marketplace' },
        { name: 'DASHBOARD', href: '/dashboard' }
    ];

    return (
        <main style={{ background: '#0a0a0a' }}>
            {/* Void Hero Section */}
            <div className="h-svh w-screen relative">
                <Hero
                    title="Own Your Voice. License It. Get Paid."
                    description="EchoChain is a Solana-native protocol that represents voices as NFTs, enforces licensing via on-chain state, and enables per-use payments in SOL."
                    links={navigationLinks}
                />

                {/* CTA Buttons */}
                <div style={{
                    position: 'absolute',
                    bottom: '12%',
                    right: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    zIndex: 20,
                }}>
                    {connected ? (
                        <>
                            <Link
                                href="/create"
                                className="btn btn-primary"
                                style={{
                                    padding: '18px 40px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #06b6d4, #06b6d4)',
                                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                                }}
                            >
                                🎙️ Mint Your Voice
                            </Link>
                            <Link
                                href="/marketplace"
                                className="btn btn-secondary"
                                style={{
                                    padding: '18px 40px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            >
                                🛒 Browse Marketplace
                            </Link>
                        </>
                    ) : (
                        <WalletMultiButton />
                    )}
                </div>

                {/* Protocol Badge */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '100px',
                    fontSize: '12px',
                    color: '#888',
                    zIndex: 20,
                    letterSpacing: '1px',
                }}>
                    SOLANA
                </div>
            </div>

            {/* Features Section - shadcn component */}
            <Features />

            {/* Testimonials Section - shadcn component */}
            <TestimonialsV2 />

            {/* Compact Stats + SDK Section */}
            <section style={{ maxWidth: '1152px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: '#06b6d4', marginBottom: '4px' }}>&lt;$0.001</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Per Use</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: '#06b6d4', marginBottom: '4px' }}>400ms</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Finality</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: '#06b6d4', marginBottom: '4px' }}>100%</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>On-Chain</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #222' }}>
                        <div style={{ fontSize: '24px', fontWeight: 600, color: '#06b6d4', marginBottom: '4px' }}>PDAs</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Enforced</div>
                    </div>
                </div>

                {/* Mini SDK Preview */}
                <div style={{
                    background: '#0d0d0d',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                }}>
                    <div style={{ color: '#666', marginBottom: '8px' }}>// Integrate in 2 lines</div>
                    <div><span style={{ color: '#06b6d4' }}>import</span> {'{ useVoice }'} <span style={{ color: '#06b6d4' }}>from</span> <span style={{ color: '#22c55e' }}>&apos;@echochain/sdk&apos;</span></div>
                    <div><span style={{ color: '#06b6d4' }}>const</span> result = <span style={{ color: '#06b6d4' }}>await</span> <span style={{ color: '#fff' }}>useVoice</span>(mint, wallet)</div>
                </div>
            </section>

            {/* Built For Section */}
            <section style={{
                borderTop: '1px solid #222',
                padding: '60px 24px',
                textAlign: 'center',
            }}>
                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '40px',
                }}>
                    Built for
                </p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '60px',
                    flexWrap: 'wrap',
                }}>
                    {/* Solana */}
                    <img
                        src="/partners/solana.png"
                        alt="Solana"
                        style={{ height: '40px', objectFit: 'contain' }}
                    />
                    {/* NOVA */}
                    <img
                        src="/partners/nova.png"
                        alt="NOVA Consortium"
                        style={{ height: '40px', objectFit: 'contain' }}
                    />
                    {/* Decentra.cloud */}
                    <img
                        src="/partners/decentra.png"
                        alt="Decentra.cloud"
                        style={{ height: '40px', objectFit: 'contain' }}
                    />
                </div>
            </section>
        </main>
    );
}
