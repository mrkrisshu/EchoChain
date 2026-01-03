'use client';

import { useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
    children: ReactNode;
}

export function SolanaProvider({ children }: Props) {
    // Environment-aware network selection
    // - Production (Vercel): Uses Devnet
    // - Local development: Uses Localhost if NEXT_PUBLIC_SOLANA_NETWORK is not set
    const endpoint = useMemo(() => {
        const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'localhost';
        if (network === 'localhost') {
            return 'http://127.0.0.1:8899';
        }
        return clusterApiUrl(network as 'devnet' | 'mainnet-beta');
    }, []);

    const wallets = useMemo(
        () => [new PhantomWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
