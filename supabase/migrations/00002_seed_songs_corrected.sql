-- FASE 2: Seed de canciones corregido (Editorial Sommelier)

DO $$ 
BEGIN

-- Limpieza total de datos de prueba previos
DELETE FROM public.user_test_answers;
DELETE FROM public.user_test_sessions;
DELETE FROM public.song_test_questions;
DELETE FROM public.songs;

-- 1. INSERTAR LAS 10 CANCIONES OFICIALES
INSERT INTO public.songs (
    slug, title, artist, quadrant, core_wound, emotional_thesis, 
    energy, intensity, tags, is_free, status, sommelier_phrase
) VALUES 
(
    'antologia-shakira', 'Antología', 'Shakira', 'Te Abraza', 
    'La huella del primer amor', 
    'No habla solo de amor; habla de cómo una persona puede convertirse en territorio emocional de otra.',
    'nostalgia íntima', 9, '{primer amor, memoria, entrega, desaparición afectiva}', true, 'official_sommelier',
    'No amas Antología porque extrañas a alguien. La amas porque todavía necesitas que tu versión más entregada no haya sido en vano.'
),
(
    'just-give-me-a-reason-pink', 'Just Give Me a Reason', 'P!nk', 'Te Abraza', 
    'El intento desesperado de reparar', 
    'No la amas porque todo esté roto; la amas porque todavía crees que una grieta puede convertirse en puente.',
    'reparación emocional', 8, '{reparación, grieta, pareja, esperanza, desgaste}', true, 'official_sommelier',
    'No amas Just Give Me a Reason porque quieres volver. La amas porque todavía crees que una grieta puede ser prueba de que algo sigue vivo.'
),
(
    'the-scientist-coldplay', 'The Scientist', 'Coldplay', 'Te Abraza', 
    'La lógica del arrepentimiento', 
    'No duele por la pérdida; duele porque entiendes tarde lo que antes no supiste cuidar.',
    'arrepentimiento lúcido', 9, '{error, culpa, regreso, conciencia tardía}', true, 'official_sommelier',
    'No amas The Scientist porque quieres empezar de nuevo. La amas porque entiendes tarde lo que antes no supiste cuidar.'
),
(
    'monotonia-shakira', 'Monotonía', 'Shakira', 'Te Abraza', 
    'La muerte lenta por rutina', 
    'No habla de una ruptura explosiva; habla del desgaste silencioso que mata una relación sin hacer ruido.',
    'desgaste afectivo', 8, '{rutina, desgaste, abandono emocional, relación apagada}', true, 'official_sommelier',
    'No amas Monotonía porque alguien falló de golpe. La amas porque sabes que a veces el amor se muere sin hacer escándalo.'
),
(
    'corre-jesse-joy', 'Corre', 'Jesse & Joy', 'Te Abraza', 
    'La dignidad después del abandono', 
    'No es una súplica; es el momento en que alguien deja de perseguir a quien ya se fue emocionalmente.',
    'dignidad dolida', 8, '{dignidad, abandono, límite, cierre}', true, 'official_sommelier',
    'No amas Corre porque quieres que vuelva. La amas porque una parte de ti por fin dejó de correr detrás de quien ya se había ido.'
),
(
    'si-veo-a-tu-mama-bad-bunny', 'Si Veo a Tu Mamá', 'Bad Bunny', 'Te Abraza', 
    'El cierre falso del duelo', 
    'No habla de superar; habla de decir “ya fue” mientras algo adentro sigue esperando.',
    'duelo disfrazado', 7, '{duelo, cierre falso, nostalgia, contradicción}', true, 'official_sommelier',
    'No amas Si Veo a Tu Mamá porque ya cerraste. La amas porque sabes decir “ya fue” mientras algo adentro sigue mirando atrás.'
),
(
    'easy-on-me-adele', 'Easy On Me', 'Adele', 'Te Abraza', 
    'La explicación humana del daño', 
    'No pide absolución; pide que alguien entienda que también estaba aprendiendo a sobrevivir.',
    'vulnerabilidad madura', 8, '{explicación, madurez, culpa, humanidad}', false, 'official_sommelier',
    'No amas Easy On Me porque quieres justificarte. La amas porque necesitas que alguien vea que también estabas aprendiendo a vivir.'
),
(
    'someone-like-you-adele', 'Someone Like You', 'Adele', 'Te Abraza', 
    'La aceptación amarga del reemplazo', 
    'No es solo despedida; es intentar bendecir una vida de la que ya no formas parte.',
    'duelo elegante', 9, '{reemplazo, duelo, aceptación, nostalgia}', false, 'official_sommelier',
    'No amas Someone Like You because soltaste. La amas porque intentas bendecir una historia que todavía te duele no habitar.'
),
(
    'we-found-love-rihanna', 'We Found Love', 'Rihanna ft. Calvin Harris', 'Te Prende', 
    'El amor en tierra infértil', 
    'No habla solo de fiesta; habla de encontrar intensidad en un lugar donde nada podía sostenerse.',
    'euforia tóxica', 8, '{intensidad, caos, deseo, amor imposible}', false, 'official_sommelier',
    'No amas We Found Love porque fue sano. La amas porque hubo luz incluso en un lugar donde nada podía crecer.'
),
(
    'flowers-miley-cyrus', 'Flowers', 'Miley Cyrus', 'Te Eleva', 
    'La autosuficiencia después de la dependencia', 
    'No es solo empoderamiento; es aprender a darte lo que antes mendigabas como prueba de amor.',
    'independencia luminosa', 7, '{autoestima, independencia, cierre, renacimiento}', false, 'official_sommelier',
    'No amas Flowers porque ya no necesitas a nadie. La amas porque estás aprendiendo a no abandonarte por amor.'
);

-- 2. INSERTAR 5 PREGUNTAS POR CADA CANCIÓN
INSERT INTO public.song_test_questions (song_id, question_text, position, options, weight_map)
SELECT 
    id, 
    '¿Qué parte de la letra resuena más con tu presente?' as question_text, 
    1 as position,
    '["El inicio del ciclo", "El nudo del conflicto", "La resolución final", "El silencio que queda"]'::jsonb,
    '{"El inicio del ciclo": 2, "El nudo del conflicto": 5, "La resolución final": 8, "El silencio que queda": 10}'::jsonb
FROM public.songs;

INSERT INTO public.song_test_questions (song_id, question_text, position, options, weight_map)
SELECT 
    id, 
    'Si tu herida tuviera una voz, ¿cómo describirías el tono de esta canción?' as question_text, 
    2 as position,
    '["Un susurro", "Un grito", "Una confesión", "Un eco"]'::jsonb,
    '{"Un susurro": 3, "Un grito": 10, "Una confesión": 7, "Un eco": 5}'::jsonb
FROM public.songs;

INSERT INTO public.song_test_questions (song_id, question_text, position, options, weight_map)
SELECT 
    id, 
    'Al escuchar este ritmo, ¿qué sensación física predomina?' as question_text, 
    3 as position,
    '["Calor en el pecho", "Gravedad en los pies", "Velo en los ojos", "Pulso acelerado"]'::jsonb,
    '{"Calor en el pecho": 6, "Gravedad en los pies": 9, "Velo en los ojos": 4, "Pulso acelerado": 8}'::jsonb
FROM public.songs;

INSERT INTO public.song_test_questions (song_id, question_text, position, options, weight_map)
SELECT 
    id, 
    '¿A qué etapa de tu biografía te transporta esta pieza?' as question_text, 
    4 as position,
    '["Infancia", "Primeros pasos", "Caída libre", "Renacimiento"]'::jsonb,
    '{"Infancia": 2, "Primeros pasos": 5, "Caída libre": 8, "Renacimiento": 10}'::jsonb
FROM public.songs;

INSERT INTO public.song_test_questions (song_id, question_text, position, options, weight_map)
SELECT 
    id, 
    '¿Cuál es la intención que percibes detrás de este arreglo musical?' as question_text, 
    5 as position,
    '["Reparar", "Ignorar", "Sostener", "Provocar"]'::jsonb,
    '{"Reparar": 10, "Ignorar": 2, "Sostener": 8, "Provocar": 5}'::jsonb
FROM public.songs;

END $$;
