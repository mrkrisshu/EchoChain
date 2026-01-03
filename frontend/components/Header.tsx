'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import to prevent hydration mismatch
const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false, loading: () => <button className="btn btn-secondary">Connect</button> }
);

export function Header() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/create', label: 'Create' },
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/dashboard', label: 'Dashboard' },
    ];

    return (
        <header className="header">
            <div className="container header-content">
                <Link href="/" className="logo">
                    <div className="logo-icon">◎</div>
                    <span>EchoChain</span>
                </Link>

                <nav className="nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Network Badge */}
                    <span style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        padding: '6px 12px',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                        Devnet
                    </span>
                    <WalletMultiButton />
                </div>
            </div>
        </header>
    );
}
