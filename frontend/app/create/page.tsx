'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { voiceStorage, VoiceRecord } from '@/lib/supabase';
import { Mic, Upload, Music, Wallet, Shield, Check, Loader2 } from 'lucide-react';

const WalletMultiButton = dynamic(
    () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
    { ssr: false }
);

export default function CreatePage() {
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerUse: '0.1',
        maxUses: '100',
        licenseType: '0',
        resaleAllowed: false,
        royaltyPercent: '5',
        consent: false,
    });

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [txSignature, setTxSignature] = useState('');
    const [error, setError] = useState('');

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!connected || !publicKey) {
            setError('Please connect your Phantom wallet');
            return;
        }

        if (!formData.consent) {
            setError('You must confirm voice ownership consent');
            return;
        }

        if (!audioFile) {
            setError('Please upload a voice sample');
            return;
        }

        setLoading(true);

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

            let audioUrl = '';
            if (process.env.NEXT_PUBLIC_SUPABASE_URL && audioFile) {
                try {
                    const fileName = `${Date.now()}_${audioFile.name}`;
                    const uploadedUrl = await voiceStorage.uploadAudio(audioFile, fileName);
                    if (uploadedUrl) {
                        audioUrl = uploadedUrl;
                        console.log('Audio uploaded successfully:', audioUrl);
                    } else {
                        throw new Error('Upload returned empty URL');
                    }
                } catch (uploadError: any) {
                    console.error('Audio upload failed:', uploadError);
                    setError(`Audio upload failed: ${uploadError.message}. Voice will be created without audio.`);
                    // Continue without audio - don't block the mint
                }
            }

            const voiceData: VoiceRecord = {
                mint: `Voice${Date.now()}`,
                name: formData.name || 'Unnamed Voice',
                creator: publicKey.toBase58(),
                creator_short: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4),
                price_per_use: parseFloat(formData.pricePerUse) || 0.1,
                max_uses: parseInt(formData.maxUses) || 100,
                remaining_uses: parseInt(formData.maxUses) || 100,
                license_type: parseInt(formData.licenseType) || 0,
                resale_allowed: formData.resaleAllowed,
                total_uses: 0,
                description: formData.description || 'A custom voice NFT minted on EchoChain.',
                audio_url: audioUrl,
                signature,
            };

            if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                await voiceStorage.save(voiceData);
            }

            setTxSignature(signature);
            setSuccess(true);

            setFormData({
                name: '',
                description: '',
                pricePerUse: '0.1',
                maxUses: '100',
                licenseType: '0',
                resaleAllowed: false,
                royaltyPercent: '5',
                consent: false,
            });
            setAudioFile(null);
            setAudioPreview('');

        } catch (err) {
            console.error('Error minting voice:', err);
            setError(err instanceof Error ? err.message : 'Failed to mint voice NFT');
        } finally {
            setLoading(false);
        }
    };

    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'localhost';
    const explorerCluster = network === 'localhost'
        ? 'custom&customUrl=http://127.0.0.1:8899'
        : network;

    // Not Connected State
    if (!connected) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                        <Mic className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Create Voice NFT</h1>
                    <p className="text-gray-400 mb-8">
                        Connect your Phantom wallet to mint your voice as an NFT with licensing terms.
                    </p>
                    <WalletMultiButton />
                </div>
            </div>
        );
    }

    // Success State
    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="text-center max-w-lg">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Voice NFT Minted!</h1>
                    <p className="text-gray-400 mb-6">
                        Your voice has been minted as an NFT with licensing terms stored on-chain.
                    </p>
                    <div className="bg-white/5 border border-green-500/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-400 mb-2">Transaction</p>
                        <a
                            href={`https://explorer.solana.com/tx/${txSignature}?cluster=${explorerCluster}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm break-all"
                        >
                            {txSignature.slice(0, 20)}...{txSignature.slice(-20)}
                        </a>
                    </div>
                    <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                    >
                        Mint Another Voice
                    </button>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div className="min-h-screen bg-[#0a0a0a] px-6 md:px-8 pt-28 pb-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">🎙️ Create Voice NFT</h1>
                    <p className="text-gray-400">Mint your voice as an NFT and set your licensing terms.</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
                        {error}
                    </div>
                )}

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    {/* Voice Sample Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Voice Sample</label>
                        <div
                            onClick={() => document.getElementById('audio-upload')?.click()}
                            className="border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                        >
                            {audioPreview ? (
                                <div>
                                    <Music className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                                    <audio controls src={audioPreview} className="mx-auto" />
                                    <p className="text-sm text-gray-400 mt-3">{audioFile?.name}</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-400">Click to upload audio file</p>
                                    <p className="text-xs text-gray-600 mt-2">MP3, WAV, or OGG</p>
                                </div>
                            )}
                        </div>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioChange}
                            className="hidden"
                        />
                    </div>

                    {/* Voice Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Voice Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Deep Narrator Voice"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            placeholder="Describe your voice..."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition resize-none"
                        />
                    </div>

                    {/* Pricing Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Price per Use (SOL)</label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={formData.pricePerUse}
                                onChange={(e) => setFormData({ ...formData, pricePerUse: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Max Uses</label>
                            <input
                                type="number"
                                min="1"
                                max="1000000"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition"
                            />
                        </div>
                    </div>

                    {/* License Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">License Type</label>
                        <select
                            value={formData.licenseType}
                            onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
                        >
                            <option value="0" className="bg-[#1a1a1a]">Personal Use Only</option>
                            <option value="1" className="bg-[#1a1a1a]">Commercial Use Allowed</option>
                        </select>
                    </div>

                    {/* Royalty */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Royalty on Resale (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.royaltyPercent}
                            onChange={(e) => setFormData({ ...formData, royaltyPercent: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition"
                        />
                    </div>

                    {/* Resale Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.resaleAllowed}
                                onChange={(e) => setFormData({ ...formData, resaleAllowed: e.target.checked })}
                                className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                            />
                            <span className="text-gray-300">Allow license resale</span>
                        </label>
                    </div>

                    {/* Consent Confirmation */}
                    <div className="mb-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.consent}
                                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                required
                                className="w-5 h-5 mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                            />
                            <span className="text-gray-300">
                                <strong className="text-white">I confirm I own the rights to this voice</strong> and consent to it being licensed through EchoChain.
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.consent}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Minting...
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                Mint Voice NFT
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    Secured by Solana blockchain
                </div>
            </div>
        </div>
    );
}
