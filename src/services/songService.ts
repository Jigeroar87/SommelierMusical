import { supabase } from '../lib/supabase';
import { Song } from '../types';

const VISIBLE_SONG_STATUSES = ['official_sommelier', 'generated_basic'];

export const songService = {
  async getSongs() {
    console.log('[songService] getSongs starting...');
    console.log(
      '[songService] Supabase configured:',
      !!import.meta.env.VITE_SUPABASE_URL,
      !!import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .in('status', VISIBLE_SONG_STATUSES)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[songService] getSongs error:', error);
      throw error;
    }

    console.log(`[songService] getSongs success: ${data?.length || 0} songs found.`);
    return data as Song[];
  },

  async searchSongs(query: string) {
    console.log(`[songService] searchSongs: "${query}"`);

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return this.getSongs();
    }

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .in('status', VISIBLE_SONG_STATUSES)
      .or(`title.ilike.%${cleanQuery}%,artist.ilike.%${cleanQuery}%`)
      .order('title', { ascending: true });

    if (error) {
      console.error('[songService] searchSongs error:', error);
      throw error;
    }

    return data as Song[];
  },

  async getSongBySlug(slug: string) {
    console.log(`[songService] getSongBySlug: "${slug}"`);

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('slug', slug)
      .in('status', VISIBLE_SONG_STATUSES)
      .single();

    if (error) {
      console.error('[songService] getSongBySlug error:', error);
      throw error;
    }

    return data as Song;
  },

  async getSongsByQuadrant(quadrant: string) {
    console.log(`[songService] getSongsByQuadrant: "${quadrant}"`);

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .in('status', VISIBLE_SONG_STATUSES)
      .eq('quadrant', quadrant)
      .order('title', { ascending: true });

    if (error) {
      console.error('[songService] getSongsByQuadrant error:', error);
      throw error;
    }

    return data as Song[];
  },

  async getQuestionsBySongId(songId: string) {
    console.log(`[songService] getQuestionsBySongId: "${songId}"`);

    const { data, error } = await supabase
      .from('song_test_questions')
      .select('*')
      .eq('song_id', songId)
      .order('position', { ascending: true });

    if (error) {
      console.error('[songService] getQuestionsBySongId error:', error);
      throw error;
    }

    return data;
  },

  async getSongWithQuestionsBySlug(slug: string) {
    const song = await this.getSongBySlug(slug);
    const questions = await this.getQuestionsBySongId(song.id);

    return { song, questions };
  },

  async validateSongRequest(request: { requested_title: string; requested_artist: string }) {
    console.log('[songService] validateSongRequest:', request);
    try {
      const response = await fetch('https://n8n.jimmygeorge.cloud/webhook/validate-song-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const rawText = await response.text();
      console.log('[songService] validateSongRequest status:', response.status);
      console.log('[songService] validateSongRequest raw response:', rawText);

      if (!response.ok) {
        throw new Error(rawText || `Error al validar la canción (Status: ${response.status})`);
      }

      if (!rawText || rawText.trim() === "") {
        throw new Error('No se recibió respuesta del validador de canción.');
      }

      try {
        return JSON.parse(rawText);
      } catch (parseError) {
        console.error('[songService] JSON parse error. Raw text:', rawText);
        throw new Error('El validador respondió en un formato no válido.');
      }
    } catch (error) {
      console.error('[songService] validateSongRequest error:', error);
      throw error;
    }
  },

  async requestSong(request: {
    requested_title: string;
    requested_artist: string;
    requested_url?: string;
    user_note?: string;
    user_id?: string;
    canonical_title?: string;
    canonical_artist?: string;
    normalized_slug?: string;
    validation_status?: string;
    validation_confidence?: number;
    validation_candidates?: any;
    matched_song_id?: string;
  }) {
    console.log('[songService] requestSong payload:', request);

    const insertData = {
      requested_title: request.requested_title,
      requested_artist: request.requested_artist,
      requested_url: request.requested_url || null,
      user_note: request.user_note || null,
      user_id: request.user_id || null,
      status: 'pending',
      canonical_title: request.canonical_title || null,
      canonical_artist: request.canonical_artist || null,
      normalized_slug: request.normalized_slug || null,
      validation_status: request.validation_status || null,
      validation_confidence: request.validation_confidence || null,
      validation_candidates: request.validation_candidates || null,
      matched_song_id: request.matched_song_id || null
    };

    const { error } = await supabase
      .from('song_requests')
      .insert([insertData]);

    if (error) {
      console.error('[songService] requestSong failed:');
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      throw error;
    }

    return true;
  }
};