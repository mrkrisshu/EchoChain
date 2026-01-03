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
    // - If NEXT_PUBLIC_SOLANA_NETWORK is set, use that
    // - Otherwise: Devnet in browser (production), Localhost only if explicitly set
    const endpoint = useMemo(() => {
        const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;

        // If explicitly set, use that network
        if (network === 'localhost') {
            return 'http://127.0.0.1:8899';
        }
        if (network === 'mainnet-beta' || network === 'devnet') {
            return clusterApiUrl(network);
        }

        // Default to Devnet for production (when no env var is set)
        return clusterApiUrl('devnet');
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
