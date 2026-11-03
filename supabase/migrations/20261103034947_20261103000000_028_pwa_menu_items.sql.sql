/*
# Crear tabla del menú de la PWA

1. Nueva tabla
   - `pwa_menu_items`
     - `id` (uuid, primary key)
     - `label` (text, etiqueta corta, máximo 12 caracteres en la validación de UI)
     - `icon` (text, nombre del ícono de lucide-react)
     - `type` (text: 'ruta_interna' | 'whatsapp' | 'enlace_externo')
     - `target` (text, ruta, enlace externo o texto de mensaje de WhatsApp)
     - `order_index` (integer, orden de aparición)
     - `active` (boolean, si se muestra en la barra)
     - `created_at` (timestamptz)

2. Seguridad
   - RLS habilitado.
   - Lectura pública (anon + authenticated) solo de ítems activos.
   - Escritura (insert/update/delete) solo para administradores mediante
     la función existente `public.is_admin()`.
   - SELECT para administradores también sobre ítems inactivos, para poder
     mostrarlos y gestionarlos en el panel.

3. Datos iniciales
   - Inicio (ruta interna /)
   - WhatsApp (mismo enlace del botón actual)
   - Módulos (ruta interna /modulos)
   - Servicios (ruta interna al portafolio)
*/

CREATE TABLE IF NOT EXISTS public.pwa_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon text NOT NULL DEFAULT 'Circle',
  type text NOT NULL DEFAULT 'ruta_interna',
  target text NOT NULL DEFAULT '/',
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pwa_menu_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pwa_menu_items TO anon, authenticated;

-- Lectura pública de ítems activos
DROP POLICY IF EXISTS "pwa_menu_public_read_active" ON public.pwa_menu_items;
CREATE POLICY "pwa_menu_public_read_active"
ON public.pwa_menu_items FOR SELECT
TO anon, authenticated
USING (active = true);

-- Lectura de todo para administradores (panel de gestión)
DROP POLICY IF EXISTS "pwa_menu_admin_read_all" ON public.pwa_menu_items;
CREATE POLICY "pwa_menu_admin_read_all"
ON public.pwa_menu_items FOR SELECT
TO authenticated
USING (public.is_admin());

-- Escrituras solo para administradores
DROP POLICY IF EXISTS "pwa_menu_admin_insert" ON public.pwa_menu_items;
CREATE POLICY "pwa_menu_admin_insert"
ON public.pwa_menu_items FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pwa_menu_admin_update" ON public.pwa_menu_items;
CREATE POLICY "pwa_menu_admin_update"
ON public.pwa_menu_items FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "pwa_menu_admin_delete" ON public.pwa_menu_items;
CREATE POLICY "pwa_menu_admin_delete"
ON public.pwa_menu_items FOR DELETE
TO authenticated
USING (public.is_admin());

-- Datos iniciales (idempotente por destino/tipo)
INSERT INTO public.pwa_menu_items (label, icon, type, target, order_index, active)
SELECT * FROM (VALUES
  ('Inicio', 'Home', 'ruta_interna', '/', 0, true),
  ('WhatsApp', 'MessageCircle', 'whatsapp', 'https://wa.me/573158137106', 1, true),
  ('Módulos', 'BookOpen', 'ruta_interna', '/modulos', 2, true),
  ('Servicios', 'Briefcase', 'ruta_interna', '/pagina/portafolio-de-servicios', 3, true)
) AS seed(label, icon, type, target, order_index, active)
WHERE NOT EXISTS (SELECT 1 FROM public.pwa_menu_items);
