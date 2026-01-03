import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const VOICES_FILE = path.join(process.cwd(), 'data', 'voices.json');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(VOICES_FILE)) {
        fs.writeFileSync(VOICES_FILE, '[]');
    }
}

export async function GET() {
    try {
        ensureDataDir();
        const voices = JSON.parse(fs.readFileSync(VOICES_FILE, 'utf-8'));
        return NextResponse.json(voices);
    } catch (error) {
        return NextResponse.json([]);
    }
}

export async function POST(request: NextRequest) {
    try {
        const voice = await request.json();

        ensureDataDir();
        const voices = JSON.parse(fs.readFileSync(VOICES_FILE, 'utf-8'));

        // Add new voice with timestamp and ID
        const newVoice = {
            ...voice,
            id: `voice_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        voices.push(newVoice);
        fs.writeFileSync(VOICES_FILE, JSON.stringify(voices, null, 2));

        return NextResponse.json({ success: true, voice: newVoice });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save voice' },
            { status: 500 }
        );
    }
}
