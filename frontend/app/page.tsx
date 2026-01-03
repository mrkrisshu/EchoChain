'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/void-hero';
import { TestimonialsSection } from '@/components/testimonials-with-marquee';

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

    const testimonials = [
        {
            author: {
                name: "Marcus Chen",
                handle: "@marcusvoice",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
            },
            text: "Minted my voice in 2 minutes. Now I wake up to SOL in my wallet every time a developer uses it for their game characters.",
            href: "https://twitter.com/marcusvoice"
        },
        {
            author: {
                name: "Sarah Williams",
                handle: "@sarahpods",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
            },
            text: "The easiest passive income I've ever made. I just set my price per use, coverage takes care of the licensing, and I get paid instantly.",
            href: "https://twitter.com/sarahpods"
        },
        {
            author: {
                name: "David Park",
                handle: "@davidnarrates",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            },
            text: "Finally, true ownership. No middlemen taking a cut. I see every single transaction on-chain and receive 100% of my royalties.",
            href: "https://twitter.com/davidnarrates"
        },
        {
            author: {
                name: "Emma Rodriguez",
                handle: "@emmavox",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
            },
            text: "I was skeptical about AI, but EchoChain lets me control it. Only approved apps can generate my voice, and they pay upfront in SOL.",
            href: "https://twitter.com/emmavox"
        }
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
                    bottom: '15%',
                    right: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    zIndex: 20,
                }}>
                    {connected ? (
                        <>
                            <Link href="/create" className="btn btn-primary">
                                Mint Your Voice
                            </Link>
                            <Link href="/marketplace" className="btn btn-secondary">
                                Browse Marketplace
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

            {/* Features Section */}
            <section className="container" style={{ padding: '100px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 300,
                        marginBottom: '16px',
                        color: 'white',
                    }}>
                        Voice Ownership Protocol
                    </h2>
                    <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
                        Voice = NFT + License + Payment
                    </p>
                </div>

                <div className="grid grid-3">
                    <div className="card">
                        <div style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.7 }}>01</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
                            Voice NFT
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Mint your voice as an NFT on Solana. Prove ownership. Enable licensing.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.7 }}>02</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
                            On-Chain Licensing
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            License terms stored in PDAs. Enforced by Solana programs.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.7 }}>03</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
                            Per-Use Payments
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Buyers pay SOL per use. Creators get paid directly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <TestimonialsSection
                title="What users say about EchoChain"
                description="Real feedback from the community building the future of voice AI"
                testimonials={testimonials}
                className="dark"
            />

            {/* AI Gatekeeper Section */}
            <section className="container" style={{ padding: '80px 24px' }}>
                <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '16px' }}>
                        AI Usage Gatekeeper
                    </h2>
                    <p style={{
                        color: 'white',
                        fontSize: '16px',
                        maxWidth: '600px',
                        margin: '0 auto 20px',
                    }}>
                        AI cannot generate unless Solana approves first.
                    </p>
                    <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
                        AI features only operate after on-chain verification. Solana is the authority.
                    </p>
                </div>
            </section>

            {/* Developer Section */}
            <section className="container" style={{ paddingBottom: '100px' }}>
                <div className="dev-section">
                    <h2>For Developers</h2>
                    <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
                        Integrate EchoChain. No backend required.
                    </p>
                    <div className="code-block">
                        <span className="keyword">import</span> {'{ useVoice }'} <span className="keyword">from</span> <span className="string">&apos;@echochain/sdk&apos;</span>;<br /><br />
                        <span className="keyword">const</span> result = <span className="keyword">await</span> <span className="function">useVoice</span>(voiceMint, wallet);
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="container" style={{ paddingBottom: '100px' }}>
                <div className="grid grid-3">
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 200, marginBottom: '8px' }}>
                            &lt;$0.001
                        </div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Per-use cost</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 200, marginBottom: '8px' }}>
                            400ms
                        </div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Finality</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 200, marginBottom: '8px' }}>
                            PDAs
                        </div>
                        <p style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Enforcement</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
