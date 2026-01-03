import { NextRequest, NextResponse } from 'next/server';
import { voiceStorage } from '@/lib/supabase';

// Demo voices for fallback
const DEMO_VOICES: Record<string, { name: string; license_type: number; uses_remaining: number; max_uses: number; creator: string }> = {
    'Voice1111111111111111111111111111111111111111': {
        name: 'Epic Narrator',
        license_type: 1,
        uses_remaining: 87,
        max_uses: 100,
        creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    },
    'Voice2222222222222222222222222222222222222222': {
        name: 'Friendly Assistant',
        license_type: 0,
        uses_remaining: 342,
        max_uses: 500,
        creator: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgBsU',
    },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const voiceId = searchParams.get('voice_id');

    if (!wallet || !voiceId) {
        return NextResponse.json(
            { valid: false, error: 'Missing wallet or voice_id parameter' },
            { status: 400 }
        );
    }

    try {
        // Check demo voices first
        if (DEMO_VOICES[voiceId]) {
            const voice = DEMO_VOICES[voiceId];
            return NextResponse.json({
                valid: voice.uses_remaining > 0,
                voice_id: voiceId,
                voice_name: voice.name,
                license_type: voice.license_type === 0 ? 'personal' : 'commercial',
                uses_remaining: voice.uses_remaining,
                max_uses: voice.max_uses,
                creator: voice.creator,
                ai_training_allowed: voice.license_type === 1,
                attribution_required: voice.license_type === 0,
            });
        }

        // Check Supabase for minted voices
        const voices = await voiceStorage.getAll();
        const voice = voices.find(v => v.mint === voiceId);

        if (!voice) {
            return NextResponse.json(
                { valid: false, error: 'Voice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            valid: voice.remaining_uses > 0,
            voice_id: voiceId,
            voice_name: voice.name,
            license_type: voice.license_type === 0 ? 'personal' : 'commercial',
            uses_remaining: voice.remaining_uses,
            max_uses: voice.max_uses,
            creator: voice.creator,
            ai_training_allowed: voice.license_type === 1,
            attribution_required: voice.license_type === 0,
        });

    } catch (error) {
        console.error('License verification error:', error);
        return NextResponse.json(
            { valid: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
