import { QuadrantType } from './data/songs';

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
