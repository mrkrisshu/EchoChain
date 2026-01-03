'use client';

import { useState, useEffect } from 'react';
import { generateLicenseExplanation, VoiceLicenseData } from '@/lib/ai';

interface LicenseSummaryProps {
    license: VoiceLicenseData;
    className?: string;
}

/**
 * AI License Summary Component - Dark Minimal
 */
export function AILicenseSummary({ license, className = '' }: LicenseSummaryProps) {
    const [explanation, setExplanation] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const summary = generateLicenseExplanation(license);
        setExplanation(summary);
        setIsLoading(false);
    }, [license]);

    if (isLoading) {
        return (
            <div className={`ai-license-summary ${className}`} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ opacity: 0.5 }}>◎</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        AI Summary
                    </span>
                </div>
                <p style={{ color: '#444', fontSize: '13px' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className={`ai-license-summary ${className}`} style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '16px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ opacity: 0.5 }}>◎</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    AI Summary
                </span>
            </div>
            <p style={{ color: '#999', fontSize: '13px', lineHeight: 1.6 }}>
                {explanation}
            </p>
            <p style={{
                color: '#444',
                fontSize: '10px',
                marginTop: '12px',
                fontStyle: 'italic',
            }}>
                Generated from on-chain data. Solana enforces all licensing.
            </p>
        </div>
    );
}
