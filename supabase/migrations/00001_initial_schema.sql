-- FASE 1: Esquema inicial para "Sommelier Musical"

-- 1. PROFILES: Extensión de la tabla auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  user_plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. SONGS: Catálogo de piezas musicales
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  quadrant TEXT NOT NULL,
  core_wound TEXT,
  emotional_thesis TEXT,
  energy TEXT,
  intensity INTEGER,
  tags TEXT[] DEFAULT '{}',
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  edited_video_url TEXT,
  sommelier_phrase TEXT,
  status TEXT DEFAULT 'official_sommelier',
  is_free BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 3. SONG TEST QUESTIONS: Preguntas asociadas a cada canción para la cata
CREATE TABLE IF NOT EXISTS public.song_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'single_choice',
  options JSONB DEFAULT '[]',
  weight_map JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.song_test_questions ENABLE ROW LEVEL SECURITY;

-- 4. USER TEST SESSIONS: Resultados de una cata finalizada
CREATE TABLE IF NOT EXISTS public.user_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  total_score INTEGER,
  dominant_pattern TEXT,
  result_title TEXT,
  result_summary TEXT,
  recommended_trilogy JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_test_sessions ENABLE ROW LEVEL SECURITY;

-- 5. USER TEST ANSWERS: Respuestas individuales dentro de una sesión
CREATE TABLE IF NOT EXISTS public.user_test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.user_test_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.song_test_questions(id) ON DELETE CASCADE,
  answer_value TEXT,
  answer_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_test_answers ENABLE ROW LEVEL SECURITY;

-- 6. SONG REQUESTS: Solicitudes de nuevas canciones por el usuario
CREATE TABLE IF NOT EXISTS public.song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_title TEXT NOT NULL,
  requested_artist TEXT,
  requested_url TEXT,
  user_note TEXT,
  status TEXT DEFAULT 'pending',
  generated_song_id UUID REFERENCES public.songs(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- 7. USER CREDITS LOG: Historial de consumo/recarga de créditos
CREATE TABLE IF NOT EXISTS public.user_credits_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_credits_log ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (Row Level Security)

-- Profiles: usuario lee/actualiza solo su perfil
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Songs: lectura pública para canciones oficiales o libres
CREATE POLICY "Official songs are viewable by everyone" ON public.songs FOR SELECT USING (status = 'official_sommelier' OR is_free = true);
CREATE POLICY "Users can see songs they created" ON public.songs FOR SELECT USING (auth.uid() = created_by);

-- Song Questions: lectura pública
CREATE POLICY "Song questions are viewable by everyone" ON public.song_test_questions FOR SELECT USING (true);

-- User Sessions: solo el propio usuario
CREATE POLICY "Users can view their own sessions" ON public.user_test_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.user_test_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Answers: solo el propio usuario (vía su sesión)
CREATE POLICY "Users can view their own answers" ON public.user_test_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_test_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create their own answers" ON public.user_test_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_test_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- Song Requests: solo el propio usuario
CREATE POLICY "Users can view their own requests" ON public.song_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests" ON public.song_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credits Log: solo el propio usuario
CREATE POLICY "Users can view their own credits history" ON public.user_credits_log FOR SELECT USING (auth.uid() = user_id);

-- TRIGGER PARA AUTO-PERFIL
-- Función que se ejecuta al insertar en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para llamar a la función
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
