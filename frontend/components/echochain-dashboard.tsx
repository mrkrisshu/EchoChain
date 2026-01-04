"use client";

import React, { FC, useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Repeat2, TrendingUp, Clock, Wallet, Music, BarChart, DollarSign } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

// Mock data for EchoChain dashboard
const mockStats = {
    totalEarnings: 45.67,
    totalVoices: 3,
    totalLicenses: 12,
    avgPerUse: 0.05,
};

// Mock chart data - Usage per hour
const usageChartData = [
    { time: '18:00', amount: 0.15 },
    { time: '19:00', amount: 0.25 },
    { time: '20:00', amount: 0.10 },
    { time: '21:00', amount: 0.35 },
    { time: '22:00', amount: 0.20 },
    { time: '23:00', amount: 0.45 },
    { time: '00:00', amount: 0.30 },
];

// Mock chart data - Cumulative earnings
const cumulativeData = [
    { time: '18:00', total: 44.52 },
    { time: '19:00', total: 44.77 },
    { time: '20:00', total: 44.87 },
    { time: '21:00', total: 45.22 },
    { time: '22:00', total: 45.42 },
    { time: '23:00', total: 45.87 },
    { time: '00:00', total: 46.17 },
];

const recentTransactions = [
    { id: 1, type: 'license', voice: 'Professional Narrator', buyer: 'H3Cp...1QG2', amount: 0.15, time: '2 min ago' },
    { id: 2, type: 'usage', voice: 'Game Character Voice', buyer: '7xKm...9FtR', amount: 0.05, time: '15 min ago' },
    { id: 3, type: 'license', voice: 'Professional Narrator', buyer: 'Bx4L...2HnS', amount: 0.15, time: '1 hour ago' },
    { id: 4, type: 'usage', voice: 'Podcast Intro', buyer: 'N9Qr...5TyW', amount: 0.05, time: '2 hours ago' },
    { id: 5, type: 'license', voice: 'Game Character Voice', buyer: 'P2Wf...8JkM', amount: 0.25, time: '3 hours ago' },
    { id: 6, type: 'usage', voice: 'Professional Narrator', buyer: 'D6Hs...4LnC', amount: 0.05, time: '5 hours ago' },
    { id: 7, type: 'license', voice: 'Podcast Intro', buyer: 'K8Mn...3RtB', amount: 0.10, time: '6 hours ago' },
    { id: 8, type: 'usage', voice: 'Game Character Voice', buyer: 'Q5Xp...7YvL', amount: 0.05, time: '8 hours ago' },
];

const myVoices = [
    { id: 1, name: 'Professional Narrator', licenses: 8, totalUses: 234, earnings: 25.50 },
    { id: 2, name: 'Game Character Voice', licenses: 3, totalUses: 156, earnings: 15.20 },
    { id: 3, name: 'Podcast Intro', licenses: 1, totalUses: 45, earnings: 4.97 },
];

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, icon, description, valueClassName }) => (
    <Card className="flex-1 bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${valueClassName || 'text-white'}`}>
                {value}
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </CardContent>
    </Card>
);

// Chart component
const EarningsChart: FC<{ data: any[], title: string, dataKey: string, lineColor: string, legendName: string }> =
    ({ data, title, dataKey, lineColor, legendName }) => (
        <Card className="flex-1 bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart className="h-5 w-5 text-cyan-500" />{title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.5} />
                            <XAxis dataKey="time" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `${v} SOL`} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                                formatter={(value: number) => [`${value.toFixed(2)} SOL`, legendName]}
                            />
                            <Legend wrapperStyle={{ color: '#888', paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={lineColor}
                                strokeWidth={2}
                                dot={false}
                                name={legendName}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

export default function EchoChainDashboard() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white px-6 md:px-8 pt-28 pb-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-400">Your voice NFT earnings and activity</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        title="Current Balance"
                        value={balance !== null ? `${balance.toFixed(4)} SOL` : '...'}
                        icon={<Wallet className="h-4 w-4 text-cyan-500" />}
                        description="Wallet balance"
                        valueClassName="text-white"
                    />
                    <MetricCard
                        title="Total Earnings"
                        value={`${mockStats.totalEarnings.toFixed(2)} SOL`}
                        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                        description="Lifetime earnings"
                        valueClassName="text-cyan-400"
                    />
                    <MetricCard
                        title="My Voices"
                        value={mockStats.totalVoices}
                        icon={<Mic className="h-4 w-4 text-teal-500" />}
                        description="Voice NFTs minted"
                    />
                    <MetricCard
                        title="Active Licenses"
                        value={mockStats.totalLicenses}
                        icon={<Repeat2 className="h-4 w-4 text-amber-500" />}
                        description="Licenses sold"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-4 mb-6">
                    <EarningsChart
                        data={usageChartData}
                        title="Earnings per Hour"
                        dataKey="amount"
                        lineColor="#06b6d4"
                        legendName="Earnings"
                    />
                    <EarningsChart
                        data={cumulativeData}
                        title="Cumulative Revenue"
                        dataKey="total"
                        lineColor="#22c55e"
                        legendName="Total Revenue"
                    />
                </div>

                {/* Latest Payments */}
                <Card className="bg-white/5 border-white/10 mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Wallet className="h-5 w-5 text-cyan-500" />
                            Latest Payments
                        </CardTitle>
                        <CardDescription className="text-gray-400">Recently completed transactions, updated live.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[250px]">
                            <div className="divide-y divide-white/10">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'license' ? 'bg-green-500/20' : 'bg-cyan-500/20'}`}>
                                                {tx.type === 'license' ? '📜' : '🔊'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{tx.voice}</p>
                                                <p className="text-xs text-gray-500">{tx.buyer}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-400">+{tx.amount} SOL</p>
                                            <p className="text-xs text-gray-500">{tx.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-4 text-xs text-gray-500 border-t border-white/10">
                        Displaying the 8 most recent transactions
                    </CardFooter>
                </Card>

                {/* My Voices */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Music className="h-5 w-5 text-cyan-500" />
                            My Voices
                        </CardTitle>
                        <CardDescription className="text-gray-400">Your minted voice NFTs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            {myVoices.map((voice) => (
                                <div key={voice.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="font-medium text-white">{voice.name}</p>
                                        <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-cyan-400">{voice.licenses}</p>
                                            <p className="text-xs text-gray-500">Licenses</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">{voice.totalUses}</p>
                                            <p className="text-xs text-gray-500">Uses</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-green-400">{voice.earnings.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">SOL</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Status */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Connected to Solana
                </div>
            </div>
        </div>
    );
}
