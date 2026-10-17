
-- Base URL for all uploaded content images
-- https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/

-- === VPH module image blocks ===
-- order_index 1: ¿Qué es el VPH?
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-cuello-vph-contenido-01.jpg","alt":"¿Qué es el VPH?"}]}'
WHERE id = '6f974f75-0b28-4cc7-8b1b-08b5ddff7ee8';

-- order_index 3: Vacuna contra el VPH
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-cuello-vph-contenido-02.jpg","alt":"Vacuna contra el VPH"}]}'
WHERE id = '6370723f-92fd-45ae-9a56-a497ae80c9c4';

-- order_index 5: Importancia de la Vacuna
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-cuello-vph-contenido-03.jpg","alt":"Importancia de la Vacuna contra el VPH"}]}'
WHERE id = '0aa9c20e-d23b-4839-87a6-45a153af55a7';

-- order_index 7: Detección Temprana VPH
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-cuello-vph-contenido-04.jpg","alt":"Detección Temprana del VPH"}]}'
WHERE id = '8f029ad3-1ab8-4e97-af17-f5c079bb27e8';

-- === PROSTATA module image blocks ===
-- order_index 1: Factores de Riesgo Próstata
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-contenido-01.jpg","alt":"Factores de Riesgo de Cáncer de Próstata"}]}'
WHERE id = '9e0a711c-7b4a-4c62-bdc4-e9b19ef032cc';

-- order_index 3: Alimentación y Riesgo
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-contenido-02.jpg","alt":"Alimentación y Riesgo de Cáncer de Próstata"}]}'
WHERE id = '9aa36951-9bca-49e6-b34d-6a57f8f7425b';

-- order_index 5: Exámenes de Detección
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-contenido-03.jpg","alt":"Exámenes de Detección de Cáncer de Próstata"}]}'
WHERE id = '9a235bc5-7487-48a5-b74a-2fdbf946b7c4';

-- order_index 7: Diagnóstico Próstata
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-contenido-04.jpg","alt":"Diagnóstico de Cáncer de Próstata"}]}'
WHERE id = '6dbf3f74-57fd-4ace-bddf-55b579087dd1';

-- order_index 8: Galería de Infografías Próstata
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-infografia-01.png","alt":"Infografía Cáncer de Próstata 1"},{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-prostata-infografia-02.png","alt":"Infografía Cáncer de Próstata 2"}]}'
WHERE id = 'dc280b25-09eb-4996-a1b1-b6173681f33b';

-- === MAMA module gallery block ===
-- order_index 8: Galería de Infografías Mama
UPDATE content_blocks SET content = '{"images":[{"src":"https://jgivnuglxyvnyclaombk.supabase.co/storage/v1/object/public/content-images/cancer-mama-infografia-01.jpg","alt":"Infografía Cáncer de Mama"}]}'
WHERE id = 'c8359fba-91b5-4d15-b18d-92e974702623';
