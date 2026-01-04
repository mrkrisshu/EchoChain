'use client';

import { useState, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { generateWithAI, canAttemptAIGeneration, AIGenerationResult } from '@/lib/ai';

interface AIGenerateButtonProps {
    voiceMint: string;
    remainingUses: number;
    onSuccess?: (result: AIGenerationResult) => void;
    onUsageDecrement?: () => void;
}

/**
 * AI Generate Button - Dark Minimal
 * Implements Solana-first gatekeeper pattern with Text-to-Speech
 */
export function AIGenerateButton({
    voiceMint,
    remainingUses,
    onSuccess,
    onUsageDecrement,
}: AIGenerateButtonProps) {
    const { publicKey, signTransaction, connected } = useWallet();
    const { connection } = useConnection();

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<AIGenerationResult | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Text-to-Speech function
    const speakContent = (text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            alert('Text-to-Speech is not supported in this browser.');
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        // Clean the text (remove markdown-like formatting)
        const cleanText = text
            .replace(/\[.*?\]/g, '')
            .replace(/\*/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to get a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.lang === 'en-US'
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const canGenerate = connected && canAttemptAIGeneration(remainingUses);

    const handleGenerate = async () => {
        if (!connected || !publicKey || !signTransaction) {
            setResult({
                success: false,
                error: 'Connect wallet first.',
            });
            setShowResult(true);
            return;
        }

        if (!canAttemptAIGeneration(remainingUses)) {
            setResult({
                success: false,
                error: 'License exhausted. Purchase more uses.',
            });
            setShowResult(true);
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const generationResult = await generateWithAI(
                voiceMint,
                { publicKey, signTransaction },
                connection,
                "Generate voice content"
            );

            setResult(generationResult);
            setShowResult(true);

            if (generationResult.success) {
                onSuccess?.(generationResult);
                onUsageDecrement?.();
            }
        } catch (error: any) {
            setResult({
                success: false,
                error: error.message || 'Generation failed',
            });
            setShowResult(true);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="ai-generate-container">
            <button
                className={`btn ${canGenerate ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleGenerate}
                disabled={isGenerating || !connected}
                style={{
                    width: '100%',
                    opacity: canGenerate ? 1 : 0.4,
                }}
            >
                {isGenerating ? (
                    <>Verifying...</>
                ) : remainingUses <= 0 ? (
                    <>No Uses Left</>
                ) : (
                    <>Generate with AI ({remainingUses} left)</>
                )}
            </button>

            {!canGenerate && remainingUses <= 0 && (
                <p style={{
                    color: '#666',
                    fontSize: '12px',
                    marginTop: '8px',
                    textAlign: 'center',
                }}>
                    Purchase more uses to generate.
                </p>
            )}

            {/* Result Modal - Dark Minimal */}
            {showResult && result && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '24px',
                }}>
                    <div style={{
                        background: '#111',
                        border: '1px solid #222',
                        borderRadius: '12px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '100%',
                    }}>
                        <div style={{
                            fontSize: '24px',
                            textAlign: 'center',
                            marginBottom: '16px',
                            opacity: 0.7,
                        }}>
                            {result.success ? '✓' : '✕'}
                        </div>

                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 400,
                            textAlign: 'center',
                            marginBottom: '16px',
                            color: result.success ? '#22c55e' : '#666',
                        }}>
                            {result.success ? 'Generation Complete' : 'Generation Blocked'}
                        </h3>

                        {result.success && result.txSignature && (
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.05)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                textAlign: 'center',
                            }}>
                                <span style={{ color: '#22c55e', fontSize: '13px' }}>Verified on Solana</span>
                                <br />
                                <a
                                    href={`https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#666', fontSize: '11px' }}
                                >
                                    View Transaction →
                                </a>
                            </div>
                        )}

                        {result.success && result.content && (
                            <div style={{
                                background: '#0a0a0a',
                                border: '1px solid #222',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px',
                            }}>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '12px',
                                    color: '#999',
                                    fontFamily: 'monospace',
                                }}>
                                    {result.content}
                                </pre>
                            </div>
                        )}

                        {/* Play Voice Button - Text-to-Speech */}
                        {result.success && result.content && (
                            <button
                                className={`btn ${isSpeaking ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => isSpeaking ? stopSpeaking() : speakContent(result.content!)}
                                style={{
                                    width: '100%',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                {isSpeaking ? (
                                    <>🔊 Stop Voice</>
                                ) : (
                                    <>🎤 Play Voice</>
                                )}
                            </button>
                        )}

                        {!result.success && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px',
                            }}>
                                <p style={{ color: '#ef4444', fontSize: '13px' }}>{result.error}</p>
                            </div>
                        )}

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                stopSpeaking();
                                setShowResult(false);
                            }}
                            style={{ width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
