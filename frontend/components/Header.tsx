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

                <WalletMultiButton />
            </div>
        </header>
    );
}
