-- FASE 2: Seed de canciones y preguntas emocionales para "Sommelier Musical"

-- Función auxiliar para insertar canciones y preguntas de forma segura
DO $$
DECLARE
    song_record RECORD;
    v_song_id UUID;
BEGIN

-- 1. SEED DE CANCIONES (10 canciones oficiales)
-- Usamos un array de records simulado o simplemente inserts individuales con ON CONFLICT
INSERT INTO public.songs (slug, title, artist, quadrant, youtube_url, status, is_free, sommelier_phrase)
VALUES 
('hello-adele', 'Hello', 'Adele', 'abraza', 'https://www.youtube.com/watch?v=YQHsXMglC9A', 'official_sommelier', true, 'Un perdón que resuena en el vacío de lo que ya no está.'),
('despacito-luis-fonsi', 'Despacito', 'Luis Fonsi ft. Daddy Yankee', 'prende', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'official_sommelier', true, 'El pulso que reconoce el deseo antes que la palabra.'),
('uptown-funk-bruno-mars', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 'eleva', 'https://www.youtube.com/watch?v=OPf0YbXqDm0', 'official_sommelier', true, 'Una explosión de brillo que reclama tu presencia en el ahora.'),
('believer-imagine-dragons', 'Believer', 'Imagine Dragons', 'revela', 'https://www.youtube.com/watch?v=7wtfhZwyrcc', 'official_sommelier', true, 'La belleza encontrada en las grietas de la propia resistencia.'),
('perfect-ed-sheeran', 'Perfect', 'Ed Sheeran', 'abraza', 'https://www.youtube.com/watch?v=2Vv-BfVoq4g', 'official_sommelier', true, 'Un refugio compartido donde el tiempo decide detenerse.'),
('fix-you-coldplay', 'Fix You', 'Coldplay', 'abraza', 'https://www.youtube.com/watch?v=k4V3Mo61fJM', 'official_sommelier', true, 'La promesa de que ninguna luz se apaga del todo en la oscuridad.'),
('happy-pharrell', 'Happy', 'Pharrell Williams', 'eleva', 'https://www.youtube.com/watch?v=ZbZSe6N_BXs', 'official_sommelier', true, 'Un estado de gracia que ignora la gravedad del mundo exterior.'),
('provenza-karol-g', 'Provenza', 'Karol G', 'prende', 'https://www.youtube.com/watch?v=ca48oMV59LU', 'official_sommelier', true, 'La nostalgia del verano que se siente como un nuevo comienzo.'),
('bohemian-rhapsody-queen', 'Bohemian Rhapsody', 'Queen', 'revela', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', 'official_sommelier', true, 'El caos operístico que define la complejidad de la identidad.'),
('titi-me-pregunto-bad-bunny', 'Tití Me Preguntó', 'Bad Bunny', 'prende', 'https://www.youtube.com/watch?v=Cr8K8NQ2f6A', 'official_sommelier', true, 'Un torbellino de calle y verdad que celebra la libertad del pulso.')
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    quadrant = EXCLUDED.quadrant,
    youtube_url = EXCLUDED.youtube_url,
    sommelier_phrase = EXCLUDED.sommelier_phrase;

-- 2. SEED DE PREGUNTAS (5 por canción)
-- Iteramos sobre las canciones recién insertadas para añadir sus preguntas
-- Nota: Limpiamos preguntas anteriores para este seed para asegurar frescura

FOR song_record IN SELECT id, slug FROM public.songs WHERE status = 'official_sommelier' LOOP
    
    -- Borramos preguntas existentes para este song_id para evitar duplicados en el seed
    DELETE FROM public.song_test_questions WHERE song_id = song_record.id;

    -- Pregunta 1: Textura
    INSERT INTO public.song_test_questions (song_id, question_text, options, weight_map, position)
    VALUES (
        song_record.id,
        '¿Qué textura tiene el recuerdo que esta melodía invoca?',
        '["Seda", "Madera", "Arena", "Cristal"]'::jsonb,
        '{"Seda": 2, "Madera": 5, "Arena": 8, "Cristal": 10}'::jsonb,
        1
    );

    -- Pregunta 2: Paladar Emocional
    INSERT INTO public.song_test_questions (song_id, question_text, options, weight_map, position)
    VALUES (
        song_record.id,
        'En el paladar de tu alma, ¿cuál es la nota predominante de esta pieza?',
        '["Dulce", "Amarga", "Salada", "Especiada"]'::jsonb,
        '{"Dulce": 3, "Amarga": 9, "Salada": 6, "Especiada": 10}'::jsonb,
        2
    );

    -- Pregunta 3: Clima / Atmósfera
    INSERT INTO public.song_test_questions (song_id, question_text, options, weight_map, position)
    VALUES (
        song_record.id,
        'Si esta canción fuera un clima que pudieras habitar, ¿en cuál te quedarías?',
        '["Luz de tarde dorada", "Lluvia tras el cristal", "Sol de mediodía", "Tormenta en mar abierto"]'::jsonb,
        '{"Luz de tarde dorada": 5, "Lluvia tras el cristal": 2, "Sol de mediodía": 10, "Tormenta en mar abierto": 8}'::jsonb,
        3
    );

    -- Pregunta 4: Resonancia Corporal
    INSERT INTO public.song_test_questions (song_id, question_text, options, weight_map, position)
    VALUES (
        song_record.id,
        '¿En qué parte de tu cuerpo resuena el primer impacto de esta obra?',
        '["En el centro del pecho", "En las plantas de los pies", "En la punta de los dedos", "En la base de la garganta"]'::jsonb,
        '{"En el centro del pecho": 4, "En las plantas de los pies": 10, "En la punta de los dedos": 8, "En la base de la garganta": 6}'::jsonb,
        4
    );

    -- Pregunta 5: Aura / Color
    INSERT INTO public.song_test_questions (song_id, question_text, options, weight_map, position)
    VALUES (
        song_record.id,
        '¿Qué color define el aura de esta interpretación para ti en este momento?',
        '["Azul profundo", "Rojo vibrante", "Dorado solar", "Violeta místico"]'::jsonb,
        '{"Azul profundo": 2, "Rojo vibrante": 10, "Dorado solar": 8, "Violeta místico": 5}'::jsonb,
        5
    );

END LOOP;

END $$;
