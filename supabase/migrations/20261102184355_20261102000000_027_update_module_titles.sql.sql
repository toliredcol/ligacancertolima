-- Actualiza únicamente los títulos de los módulos educativos.
-- No se modifican slugs, URLs ni identificadores internos.

UPDATE public.modules
SET title = 'No importa el tamaño, Tócate'
WHERE slug = 'mama';

UPDATE public.modules
SET title = 'Vive a Todo Pulmón'
WHERE slug = 'antitabaco';

UPDATE public.modules
SET title = 'No lo llames Gastritis'
WHERE slug = 'digestivas';

UPDATE public.modules
SET title = 'El Sol No Olvida'
WHERE slug = 'piel';

UPDATE public.modules
SET title = 'Mi Intimidad, Mi Protección'
WHERE slug = 'vph';

UPDATE public.modules
SET title = 'Para Hombres Sin Tabúes'
WHERE slug = 'prostata';
