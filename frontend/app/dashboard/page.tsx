'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Link from 'next/link';

// Demo data (in production would come from on-chain)
const DEMO_OWNED_VOICES = [
    {
        mint: 'MyVoice1111111111111111111111111111111111111',
        name: 'My Epic Voice',
        pricePerUse: 0.1,
        maxUses: 100,
        remainingUses: 87,
        totalEarnings: 1.3,
        totalUses: 13,
        licenseType: 1,
    },
];

export default function DashboardPage() {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);

    // Demo stats
    const totalEarnings = 1.3;
    const totalUses = 13;
    const activeVoices = 1;

    useEffect(() => {
        if (connected && publicKey) {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / LAMPORTS_PER_SOL);
            });
        }
    }, [connected, publicKey, connection]);

    if (!connected) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', paddingTop: '120px' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '24px' }}>
                        📊 Creator Dashboard
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                        Connect your wallet to view your voice NFTs and earnings.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>📊 Creator Dashboard</h1>
                    <p>Track your voice NFTs, usage, and earnings.</p>
                </div>

                {/* Key Metric - Highlighted */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    borderRadius: '24px',
                    padding: '40px',
                    textAlign: 'center',
                    marginBottom: '32px',
                }}>
                    <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>
                        💰 Total Creator Earnings Secured On-Chain
                    </p>
                    <div style={{ fontSize: '56px', fontWeight: 800 }}>
                        {totalEarnings.toFixed(2)} SOL
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-icon">💳</div>
                        <div className="stat-card-value">
                            {balance !== null ? balance.toFixed(4) : '...'} SOL
                        </div>
                        <div className="stat-card-label">Wallet Balance</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-icon">🎙️</div>
                        <div className="stat-card-value">{activeVoices}</div>
                        <div className="stat-card-label">Active Voice NFTs</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-icon">📈</div>
                        <div className="stat-card-value">{totalUses}</div>
                        <div className="stat-card-label">Total Uses</div>
                    </div>
                </div>

                {/* Your Voices */}
                <div style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Your Voice NFTs</h2>
                        <Link href="/create" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                            + Mint New Voice
                        </Link>
                    </div>

                    {DEMO_OWNED_VOICES.length > 0 ? (
                        <div className="grid grid-3">
                            {DEMO_OWNED_VOICES.map((voice) => (
                                <div key={voice.mint} className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div className="voice-avatar">🎙️</div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{voice.name}</h3>
                                            <span className={`badge ${voice.licenseType === 0 ? 'badge-personal' : 'badge-commercial'}`}>
                                                {voice.licenseType === 0 ? 'Personal' : 'Commercial'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="voice-stats" style={{ marginBottom: '16px' }}>
                                        <div className="stat">
                                            <div className="stat-value">{voice.totalEarnings} SOL</div>
                                            <div className="stat-label">Earned</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-value">{voice.totalUses}</div>
                                            <div className="stat-label">Uses</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-value">{voice.remainingUses}</div>
                                            <div className="stat-label">Available</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-value">{voice.pricePerUse} SOL</div>
                                            <div className="stat-label">Per Use</div>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://explorer.solana.com/address/${voice.mint}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        View on Explorer
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
                            <h3 style={{ marginBottom: '8px' }}>No Voice NFTs Yet</h3>
                            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                                Mint your first voice NFT to start earning.
                            </p>
                            <Link href="/create" className="btn btn-primary">
                                Create Voice NFT
                            </Link>
                        </div>
                    )}
                </div>

                {/* Transaction History Placeholder */}
                <div style={{ marginTop: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Recent Transactions</h2>
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--muted)', fontWeight: 600 }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--muted)', fontWeight: 600 }}>Voice</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--muted)', fontWeight: 600 }}>Amount</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--muted)', fontWeight: 600 }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ color: 'var(--success)' }}>💰 Sale</span>
                                    </td>
                                    <td style={{ padding: '16px 0' }}>My Epic Voice</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', color: 'var(--success)' }}>+0.1 SOL</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', color: 'var(--muted)' }}>2 min ago</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ color: 'var(--secondary)' }}>🎙️ Used</span>
                                    </td>
                                    <td style={{ padding: '16px 0' }}>My Epic Voice</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right' }}>—</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', color: 'var(--muted)' }}>5 min ago</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ color: 'var(--primary)' }}>🎤 Minted</span>
                                    </td>
                                    <td style={{ padding: '16px 0' }}>My Epic Voice</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right' }}>—</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right', color: 'var(--muted)' }}>1 hour ago</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
