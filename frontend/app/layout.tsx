import type { Metadata } from 'next';
import { SolanaProvider } from '@/components/SolanaProvider';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
    title: 'EchoChain | Voice Licensing Protocol on Solana',
    description: 'Own, license, and monetize your voice with NFTs. Solana-native protocol for voice ownership, consent, and per-use payments.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body>
                <SolanaProvider>
                    <Header />
                    {children}
                </SolanaProvider>
            </body>
        </html>
    );
}
