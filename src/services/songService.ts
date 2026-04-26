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

  async requestSong(request: {
    requested_title: string;
    requested_artist: string;
    requested_url?: string;
    user_note?: string;
    user_id?: string;
  }) {
    console.log('[songService] requestSong payload:', request);

    const insertData = {
      requested_title: request.requested_title,
      requested_artist: request.requested_artist,
      requested_url: request.requested_url || null,
      user_note: request.user_note || null,
      user_id: request.user_id || null,
      status: 'pending'
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