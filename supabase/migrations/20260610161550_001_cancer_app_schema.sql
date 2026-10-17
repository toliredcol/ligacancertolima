
/*
# Liga Contra el Cáncer - Zonal Tolima: Schema Completo

## Descripción General
Schema completo para la aplicación educativa sobre cáncer.

## Tablas Nuevas

1. **modules** - Los 6 módulos educativos (mama, antitabaco, vph, piel, cuello_uterino, prostata)
2. **content_blocks** - Bloques de contenido reutilizables para cada módulo (texto, lista, acordeón, alerta, paso a paso, etc.)
3. **videos** - Videos de YouTube por módulo
4. **resources** - Recursos descargables por módulo
5. **quiz_questions** - Preguntas de quiz por módulo con opciones y respuesta correcta
6. **quiz_completions** - Registro de quizzes completados con nombre del usuario
7. **testimonials** - Testimonios de usuarios (pendientes, aprobados, rechazados)
8. **slider_images** - Imágenes del slider principal de la página de inicio
9. **diploma_config** - Configuración personalizable del diploma/certificado

## Seguridad
- RLS habilitado en todas las tablas
- App de acceso público (sin autenticación de usuario final), usa TO anon, authenticated
- El panel admin usa auth de Supabase
*/

-- ================================================
-- MÓDULOS EDUCATIVOS
-- ================================================
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_modules" ON modules;
CREATE POLICY "public_read_modules" ON modules FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_modules" ON modules;
CREATE POLICY "admin_insert_modules" ON modules FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_modules" ON modules;
CREATE POLICY "admin_update_modules" ON modules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_modules" ON modules;
CREATE POLICY "admin_delete_modules" ON modules FOR DELETE TO authenticated USING (true);

-- ================================================
-- BLOQUES DE CONTENIDO
-- ================================================
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN ('text','list','stat','accordion','alert','steps','divider')),
  title text,
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_content_blocks" ON content_blocks;
CREATE POLICY "public_read_content_blocks" ON content_blocks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_content_blocks" ON content_blocks;
CREATE POLICY "admin_insert_content_blocks" ON content_blocks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_content_blocks" ON content_blocks;
CREATE POLICY "admin_update_content_blocks" ON content_blocks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_content_blocks" ON content_blocks;
CREATE POLICY "admin_delete_content_blocks" ON content_blocks FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_content_blocks_module ON content_blocks(module_id, order_index);

-- ================================================
-- VIDEOS DE YOUTUBE
-- ================================================
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  youtube_id text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_videos" ON videos;
CREATE POLICY "public_read_videos" ON videos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_videos" ON videos;
CREATE POLICY "admin_insert_videos" ON videos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_videos" ON videos;
CREATE POLICY "admin_update_videos" ON videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_videos" ON videos;
CREATE POLICY "admin_delete_videos" ON videos FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_module ON videos(module_id, order_index);

-- ================================================
-- RECURSOS DESCARGABLES
-- ================================================
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  file_type text NOT NULL DEFAULT 'PDF',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_resources" ON resources;
CREATE POLICY "public_read_resources" ON resources FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_resources" ON resources;
CREATE POLICY "admin_insert_resources" ON resources FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_resources" ON resources;
CREATE POLICY "admin_update_resources" ON resources FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_resources" ON resources;
CREATE POLICY "admin_delete_resources" ON resources FOR DELETE TO authenticated USING (true);

-- ================================================
-- PREGUNTAS DE QUIZ
-- ================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_index integer NOT NULL DEFAULT 0,
  explanation text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_quiz_questions" ON quiz_questions;
CREATE POLICY "public_read_quiz_questions" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_quiz_questions" ON quiz_questions;
CREATE POLICY "admin_insert_quiz_questions" ON quiz_questions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_quiz_questions" ON quiz_questions;
CREATE POLICY "admin_update_quiz_questions" ON quiz_questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_quiz_questions" ON quiz_questions;
CREATE POLICY "admin_delete_quiz_questions" ON quiz_questions FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_module ON quiz_questions(module_id, order_index);

-- ================================================
-- COMPLETACIONES DE QUIZ
-- ================================================
CREATE TABLE IF NOT EXISTS quiz_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_quiz_completions" ON quiz_completions;
CREATE POLICY "public_insert_quiz_completions" ON quiz_completions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_quiz_completions" ON quiz_completions;
CREATE POLICY "admin_read_quiz_completions" ON quiz_completions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_delete_quiz_completions" ON quiz_completions;
CREATE POLICY "admin_delete_quiz_completions" ON quiz_completions FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_completions_module ON quiz_completions(module_id);

-- ================================================
-- TESTIMONIOS
-- ================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  story text NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_testimonials" ON testimonials;
CREATE POLICY "public_read_approved_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_testimonials" ON testimonials;
CREATE POLICY "public_insert_testimonials" ON testimonials FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- ================================================
-- SLIDER DE INICIO
-- ================================================
CREATE TABLE IF NOT EXISTS slider_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  subtitle text,
  link_type text NOT NULL DEFAULT 'none' CHECK (link_type IN ('module','section','external','none')),
  link_value text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_slider" ON slider_images;
CREATE POLICY "public_read_slider" ON slider_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_slider" ON slider_images;
CREATE POLICY "admin_insert_slider" ON slider_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_slider" ON slider_images;
CREATE POLICY "admin_update_slider" ON slider_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_slider" ON slider_images;
CREATE POLICY "admin_delete_slider" ON slider_images FOR DELETE TO authenticated USING (true);

-- ================================================
-- CONFIGURACIÓN DEL DIPLOMA
-- ================================================
CREATE TABLE IF NOT EXISTS diploma_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Certificado de Educación en Salud',
  congratulations_text text NOT NULL DEFAULT 'Ha completado exitosamente el módulo educativo sobre',
  signer_name text NOT NULL DEFAULT 'Dr. Director Regional',
  signer_title text NOT NULL DEFAULT 'Liga Contra el Cáncer - Zonal Tolima',
  accent_color text NOT NULL DEFAULT '#C41E3A',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diploma_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_diploma" ON diploma_config;
CREATE POLICY "public_read_diploma" ON diploma_config FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_diploma" ON diploma_config;
CREATE POLICY "admin_insert_diploma" ON diploma_config FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_diploma" ON diploma_config;
CREATE POLICY "admin_update_diploma" ON diploma_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Insert default diploma config
INSERT INTO diploma_config (title, congratulations_text, signer_name, signer_title, accent_color)
SELECT 'Certificado de Educación en Salud',
       'Ha completado exitosamente el módulo educativo sobre',
       'Equipo Liga Contra el Cáncer',
       'Liga Colombiana Contra el Cáncer - Zonal Tolima',
       '#C41E3A'
WHERE NOT EXISTS (SELECT 1 FROM diploma_config);
