'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import EchoChainDashboard from '@/components/echochain-dashboard';

// Dynamic import to prevent hydration mismatch
const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false, loading: () => <button className="btn btn-secondary">Connect</button> }
);

export default function DashboardPage() {
    const { connected } = useWallet();

    if (!connected) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6">📊</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Creator Dashboard
                    </h1>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Connect your wallet to view your voice NFTs, earnings, and transaction history.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    return <EchoChainDashboard />;
}
