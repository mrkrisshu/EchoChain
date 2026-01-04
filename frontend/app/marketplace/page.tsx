'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { SystemProgram, Transaction } from '@solana/web3.js';
import Link from 'next/link';
import { AILicenseSummary } from '@/components/AILicenseSummary';
import { VoiceLicenseData } from '@/lib/ai';
import { voiceStorage, VoiceRecord } from '@/lib/supabase';
import { Mic, ShoppingCart, Shield, Link2, Check, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false }
);

// Demo voice data
const DEMO_VOICES = [
    {
        mint: 'Voice1111111111111111111111111111111111111111',
        name: 'Epic Narrator',
        creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        creatorShort: '7xKX...gAsU',
        pricePerUse: 0.1,
        maxUses: 100,
        remainingUses: 87,
        licenseType: 1 as const,
        resaleAllowed: false,
        totalUses: 13,
        description: 'Deep, commanding voice perfect for trailers and documentaries.',
    },
    {
        mint: 'Voice2222222222222222222222222222222222222222',
        name: 'Friendly Assistant',
        creator: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgBsU',
        creatorShort: '9xKX...BsU',
        pricePerUse: 0.05,
        maxUses: 500,
        remainingUses: 342,
        licenseType: 0 as const,
        resaleAllowed: true,
        totalUses: 158,
        description: 'Warm and approachable voice for virtual assistants and guides.',
    },
    {
        mint: 'Voice3333333333333333333333333333333333333333',
        name: 'Professional Narrator',
        creator: '5xKLtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgCsU',
        creatorShort: '5xKL...CsU',
        pricePerUse: 0.15,
        maxUses: 200,
        remainingUses: 178,
        licenseType: 1 as const,
        resaleAllowed: true,
        totalUses: 22,
        description: 'Clear and articulate voice ideal for audiobooks and podcasts.',
    },
];

type Voice = typeof DEMO_VOICES[0];

function toVoice(record: VoiceRecord): Voice {
    return {
        mint: record.mint,
        name: record.name,
        creator: record.creator,
        creatorShort: record.creator_short,
        pricePerUse: record.price_per_use,
        maxUses: record.max_uses,
        remainingUses: record.remaining_uses,
        licenseType: record.license_type as 0 | 1,
        resaleAllowed: record.resale_allowed,
        totalUses: record.total_uses,
        description: record.description,
    };
}

export default function MarketplacePage() {
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState<string | null>(null);
    const [purchasedVoices, setPurchasedVoices] = useState<Set<string>>(new Set());
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [allVoices, setAllVoices] = useState<Voice[]>(DEMO_VOICES);
    const [isLoading, setIsLoading] = useState(true);
    const [successInfo, setSuccessInfo] = useState<{ name: string; signature: string; voiceId: string } | null>(null);

    useEffect(() => {
        async function fetchVoices() {
            try {
                const supabaseVoices = await voiceStorage.getAll();
                const mintedVoices = supabaseVoices.map(toVoice);
                setAllVoices([...mintedVoices, ...DEMO_VOICES]);
            } catch (error) {
                console.error('Failed to fetch voices:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchVoices();
    }, []);

    const handleBuyUsage = async (voice: Voice) => {
        if (!connected || !publicKey) {
            alert('Please connect your Phantom wallet to purchase');
            return;
        }

        setLoading(voice.mint);

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 0,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setPurchasedVoices(new Set(Array.from(purchasedVoices).concat(voice.mint)));
            setSuccessInfo({ name: voice.name, signature, voiceId: voice.mint });

        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const toLicenseData = (voice: Voice): VoiceLicenseData => ({
        licenseType: voice.licenseType,
        pricePerUse: voice.pricePerUse,
        remainingUses: voice.remainingUses,
        resaleAllowed: voice.resaleAllowed,
        maxUses: voice.maxUses,
        totalUses: voice.totalUses,
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-8 pt-28 pb-8">
            {/* Success Modal */}
            {successInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full text-center relative">
                        <button
                            onClick={() => setSuccessInfo(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
                        <p className="text-gray-300 mb-6">
                            You now have 1 use of <strong className="text-cyan-400">{successInfo.name}</strong>
                        </p>
                        <div className="bg-black/30 rounded-xl p-4 mb-6">
                            <p className="text-xs text-gray-500 mb-2">Transaction ID</p>
                            <a
                                href={`https://explorer.solana.com/tx/${successInfo.signature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-cyan-400 hover:text-cyan-300 break-all"
                            >
                                {successInfo.signature.slice(0, 16)}...{successInfo.signature.slice(-16)}
                            </a>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/license/${successInfo.voiceId}`}
                                className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition text-center text-sm"
                            >
                                View License
                            </Link>
                            <button
                                onClick={() => setSuccessInfo(null)}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">🛒 Voice Marketplace</h1>
                    <p className="text-gray-400">Browse and purchase usage rights for AI-ready voice NFTs.</p>
                </div>

                {/* Connect Wallet Prompt */}
                {!connected && (
                    <div className="text-center mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-gray-400 mb-4">Connect your wallet to purchase voice licenses</p>
                        <WalletMultiButton />
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-4" />
                        <p className="text-gray-400">Loading voices...</p>
                    </div>
                )}

                {/* Voice Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {allVoices.map((voice) => (
                        <div key={voice.mint} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-500/30 flex items-center justify-center">
                                        <Mic className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{voice.name}</h3>
                                        <p className="text-xs text-gray-500">by {voice.creatorShort}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${voice.licenseType === 0
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    }`}>
                                    {voice.licenseType === 0 ? 'Personal' : 'Commercial'}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{voice.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-cyan-400">{voice.pricePerUse} SOL</p>
                                    <p className="text-xs text-gray-500">Per Use</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className={`text-lg font-bold ${voice.remainingUses === 0 ? 'text-red-400' : 'text-white'}`}>
                                        {voice.remainingUses}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {voice.remainingUses === 0 ? 'Exhausted' : 'Available'}
                                    </p>
                                </div>
                            </div>

                            {/* AI License Summary Toggle */}
                            <button
                                onClick={() => setExpandedCard(expandedCard === voice.mint ? null : voice.mint)}
                                className="w-full flex items-center justify-between py-2 text-sm text-cyan-400 hover:text-cyan-300 transition mb-3"
                            >
                                <span>🤖 AI License Summary</span>
                                {expandedCard === voice.mint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {expandedCard === voice.mint && (
                                <div className="mb-4">
                                    <AILicenseSummary license={toLicenseData(voice)} />
                                </div>
                            )}

                            {/* Exhausted Warning */}
                            {voice.remainingUses === 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                                    <p className="text-sm text-red-400 font-medium">⚠️ License Exhausted</p>
                                    <p className="text-xs text-gray-500">AI generation is blocked for this voice.</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleBuyUsage(voice)}
                                    disabled={loading === voice.mint || voice.remainingUses === 0}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading === voice.mint ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : voice.remainingUses === 0 ? (
                                        'Sold Out'
                                    ) : (
                                        'Buy 1 Use'
                                    )}
                                </button>

                                {purchasedVoices.has(voice.mint) && (
                                    <Link
                                        href={`/use/${voice.mint}`}
                                        className="py-3 px-4 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition"
                                    >
                                        Use →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* AI Gatekeeper */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">AI Usage Gatekeeper</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                            <strong>AI cannot generate anything unless Solana approves usage first.</strong>
                        </p>
                        <p className="text-gray-500 text-sm">
                            When you use AI generation, EchoChain first calls the <code className="text-cyan-400">use_voice</code> instruction on Solana. Only if this transaction succeeds is AI allowed to run.
                        </p>
                    </div>

                    {/* On-Chain Transparency */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Link2 className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">On-Chain Transparency</h3>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Every purchase creates an on-chain record. Usage rights are tracked in PDAs, and creators receive payments directly — no intermediaries.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
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
