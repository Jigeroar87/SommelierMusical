import { QuadrantType } from './data/songs';

export interface Song {
  id: string;
  title: string;
  artist: string;
  slug: string;
  quadrant: string;
  core_wound?: string;
  emotional_thesis?: string;
  energy?: string;
  intensity?: number;
  tags?: string[];
  youtube_url?: string;
  spotify_url?: string;
  apple_music_url?: string;
  edited_video_url?: string;
  sommelier_phrase?: string;
  status: string;
  is_free: boolean;
  created_by?: string;
  created_at: string;
}

export interface SongQuestion {
  id: string;
  song_id: string;
  question_text: string;
  position: number;
  options: string[];
  weight_map: Record<string, number>;
  created_at: string;
}

export interface SongRequest {
  id: string;
  user_id?: string;
  requested_title: string;
  requested_artist: string;
  requested_url?: string;
  user_note?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  is_admin: boolean;
  createdAt: string;
  biography_status: 'pending' | 'completed';
  birthDate?: string;
  onboardingCompleted: boolean;
}

export interface TestAnswer {
  song_id: string;
  score: number; // 1-10
  cuadrante_principal: QuadrantType;
}

export interface TestSession {
  id: string;
  uid: string;
  answers: TestAnswer[];
  dominant_quadrant: QuadrantType;
  score_summary: Record<string, number>;
  created_at: string;
}

export interface Result {
  id: string;
  session_id: string;
  uid: string;
  dominant_quadrant: QuadrantType;
  short_diagnosis: string;
  long_reading: string;
  created_at: string;
}
