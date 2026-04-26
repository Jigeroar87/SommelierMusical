# Guía de Integración n8n: Flujo de Solicitud de Canciones (Automatización)

Esta guía detalla cómo configurar un workflow en n8n para procesar automáticamente las solicitudes de canciones (`song_requests`) usando Gemini y guardando los resultados en Supabase.

---

## 1. Arquitectura del Flujo

1.  **Activación**: Cron (cada 5-15 min) o Webhook de Supabase.
2.  **Lectura**: Obtener una solicitud con `status = 'pending'`.
3.  **Bloqueo**: Cambiar `status = 'processing'` para evitar duplicación.
4.  **Generación AI**: Consultar a Gemini con el Título/Artista para obtener la "Lectura Sommelier".
5.  **Persistencia Canción**: Insertar en la tabla `songs`.
6.  **Persistencia Preguntas**: Insertar en `song_test_questions`.
7.  **Cierre**: Cambiar `status = 'completed'` y vincular el `generated_song_id`.
8.  **Manejo Errores**: Cambiar `status = 'failed'` y guardar el mensaje de error si algo falla.

---

## 2. Configuración en n8n

### Variables Requeridas
*   `SUPABASE_URL`: Tu Project URL de Supabase.
*   `SUPABASE_SERVICE_ROLE_KEY`: **¡CRÍTICO!** Usa la Service Role Key para saltar el RLS. Nunca la expongas en el frontend.
*   `GEMINI_API_KEY`: Para el nodo de Google Gemini.

### Seguridad
> [!CAUTION]
> El frontend de la aplicación web usa la `anon_key`. El workflow de n8n DEBE usar la `service_role_key`. No compartas estas llaves ni las subas a repositorios públicos.

---

## 3. Consultas SQL (Nodos Supabase / Postgres)

### A. Obtener y Bloquear Solicitud (Prevenir Condiciones de Carrera)
Uso recomendado de una función en Supabase para asegurar que solo un worker tome la solicitud:

```sql
-- Ejecutar en el SQL Editor de Supabase una sola vez
CREATE OR REPLACE FUNCTION process_next_song_request()
RETURNS SETOF song_requests AS $$
BEGIN
  RETURN QUERY
  UPDATE song_requests
  SET status = 'processing', updated_at = now()
  WHERE id = (
    SELECT id
    FROM song_requests
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql;
```

**Desde n8n**: Llamar a la función vía RPC o usar SQL simple:
`SELECT * FROM public.process_next_song_request();`

### B. Insertar Canción Generada
Si la canción ya existe por `slug`, actualizamos los campos editoriales.

```sql
INSERT INTO public.songs (
  title, artist, slug, quadrant, core_wound, 
  emotional_thesis, energy, intensity, tags, 
  sommelier_phrase, status, is_free
) 
VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'generated_basic', false
)
ON CONFLICT (slug) 
DO UPDATE SET 
  sommelier_phrase = EXCLUDED.sommelier_phrase,
  core_wound = EXCLUDED.core_wound,
  quadrant = EXCLUDED.quadrant,
  updated_at = now()
RETURNING id;
```

### C. Insertar Preguntas del Test
Se deben insertar 5 preguntas. Se recomienda borrar previas si la canción es `generated_basic`.

```sql
-- Primero (opcional si quieres refrescar)
DELETE FROM public.song_test_questions WHERE song_id = $1;

-- Luego Insertar (Loop en n8n por cada pregunta)
INSERT INTO public.song_test_questions (
  song_id, question_text, position, options, weight_map
)
VALUES ($1, $2, $3, $4, $5);
```

---

## 4. Prompt y Formato para Gemini

### Instrucción de Sistema (System Prompt)
Eres el **Sommelier Musical**. Tu misión es analizar la psicología profunda de una canción.
No eres una IA genérica. Tu tono es: **Emocional, técnico-musical y elegante.**

**Regla de Oro Editorial:**
La frase sommelier SIEMPRE debe seguir esta estructura:
*"No amas esta canción porque [Razón superficial]. La amas porque [Revelación psicológica profunda]."*

### Formato de Salida Esperado (JSON)
Debes devolver **únicamente** un JSON válido con esta estructura:

```json
{
  "title": "Nombre de la Canción",
  "artist": "Artista",
  "slug": "slug-url-amigable",
  "quadrant": "Te Abraza | Te Prende | Te Eleva | Te Revela",
  "core_wound": "Descripción de la herida emocional que sana o toca",
  "emotional_thesis": "Breve explicación de por qué esta canción resuena",
  "energy": "Ethereal | Raw | Kinetic | Dark",
  "intensity": 85,
  "tags": ["nostalgia", "fuerza"],
  "sommelier_phrase": "No amas esta canción porque es bailable. La amas porque valida tu derecho a estar furioso mientras sonríes.",
  "test_questions": [
    {
      "position": 1,
      "question_text": "¿Qué sientes en el minuto 2:30?",
      "options": ["Paz", "Esteria", "Fugas", "Deseo"],
      "weight_map": { "Paz": 2, "Esteria": 8, "Fugas": 5, "Deseo": 10 }
    }
    // ... Generar 5 preguntas
  ]
}
```

---

## 5. Pasos del Workflow en n8n

1.  **Schedule / Cron**: Cada 10 minutos.
2.  **Supabase Node (Query)**: Ejecuta `SELECT * FROM process_next_song_request()`.
3.  **IF (Hay resultados)**:
    *   **Google Gemini Node**: Toma `requested_title` y `requested_artist`. Pide el análisis JSON.
    *   **Supabase Node (Insert/Upsert Song)**: Crea/actualiza la canción. Obtiene el `song_id`.
    *   **Supabase Node (Delete Old Questions)**: Borra preguntas viejas de ese `song_id`.
    *   **Loop / Split in Batches**: Por cada item en `test_questions`.
        *   **Supabase Node (Insert Question)**: Inserta cada pregunta.
    *   **Supabase Node (Finalize Request)**: 
        `UPDATE song_requests SET status = 'completed', generated_song_id = '...' WHERE id = '...';`
4.  **Error Handling (On Fail)**:
    *   **Supabase Node (Update Failed)**:
        `UPDATE song_requests SET status = 'failed', error_message = '{{$error.message}}' WHERE id = '...';`

---

## 6. Advertencias
1.  **Límites de Gemini**: Asegúrate de manejar el rate limit si procesas muchas canciones juntas.
2.  **Validación de Slug**: Asegúrate de que n8n genere un slug consistente (o usa una función en Supabase para generarlo automáticamente desde el título).
