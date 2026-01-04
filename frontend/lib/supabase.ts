import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily initialize Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (typeof window === 'undefined') {
        // Server-side: check if env vars are set
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return null;
        return createClient(url, key);
    }

    if (!supabaseInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
            supabaseInstance = createClient(url, key);
        }
    }
    return supabaseInstance;
}

// Types for voice data
export interface VoiceRecord {
    id?: string;
    mint: string;
    name: string;
    creator: string;
    creator_short: string;
    price_per_use: number;
    max_uses: number;
    remaining_uses: number;
    license_type: number;
    resale_allowed: boolean;
    total_uses: number;
    description: string;
    audio_url?: string;
    signature?: string;
    created_at?: string;
}

// Voice storage functions
export const voiceStorage = {
    // Get all voices
    async getAll(): Promise<VoiceRecord[]> {
        const supabase = getSupabase();
        if (!supabase) {
            // Fallback for local development without Supabase
            return [];
        }

        const { data, error } = await supabase
            .from('voices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching voices:', error);
            return [];
        }

        return data || [];
    },

    // Get a single voice by mint address
    async getByMint(mint: string): Promise<VoiceRecord | null> {
        const supabase = getSupabase();
        if (!supabase) {
            return null;
        }

        const { data, error } = await supabase
            .from('voices')
            .select('*')
            .eq('mint', mint)
            .single();

        if (error) {
            console.error('Error fetching voice by mint:', error);
            return null;
        }

        return data;
    },

    // Save a new voice
    async save(voice: VoiceRecord): Promise<VoiceRecord | null> {
        const supabase = getSupabase();
        if (!supabase) {
            console.log('Supabase not configured, skipping save');
            return voice;
        }

        const { data, error } = await supabase
            .from('voices')
            .insert([voice])
            .select()
            .single();

        if (error) {
            console.error('Error saving voice:', error);
            return null;
        }

        return data;
    },

    // Upload audio file to Supabase Storage
    async uploadAudio(file: File, fileName: string): Promise<string | null> {
        const supabase = getSupabase();
        if (!supabase) {
            console.log('Supabase not configured, skipping upload');
            throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        }

        console.log('Uploading audio file:', fileName, 'Size:', file.size);

        const { data, error } = await supabase.storage
            .from('voice-samples')
            .upload(`voices/${fileName}`, file, {
                cacheControl: '3600',
                upsert: true // Allow overwriting existing files
            });

        if (error) {
            console.error('Error uploading audio:', error);
            throw new Error(`Audio upload failed: ${error.message}`);
        }

        console.log('Audio uploaded successfully:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('voice-samples')
            .getPublicUrl(`voices/${fileName}`);

        console.log('Audio URL:', urlData.publicUrl);
        return urlData.publicUrl;
    }
};
