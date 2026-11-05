/*
# Corregir nombre de institución en el diploma

1. Cambio
- Actualiza `signer_title` de `diploma_config` de
  "Liga Colombiana Contra el Cáncer - Zonal Tolima" a
  "Liga Contra el Cáncer - Zonal Tolima" (con tilde en "Cáncer").

2. Notas
- Solo afecta la línea de cargo/institución del diploma.
- Es idempotente: se limita a los registros que aún conservan el texto anterior.
- No elimina ni renombra columnas ni pierde datos.
*/

UPDATE diploma_config
SET signer_title = 'Liga Contra el Cáncer - Zonal Tolima'
WHERE signer_title = 'Liga Colombiana Contra el Cáncer - Zonal Tolima';

UPDATE diploma_config
SET signer_title = 'Liga Contra el Cáncer - Zonal Tolima'
WHERE signer_title = 'Liga Colombiana Contra el Cáncer - Zonal Tolima'
  AND NOT EXISTS (
    SELECT 1 FROM diploma_config c
    WHERE c.signer_title = 'Liga Contra el Cáncer - Zonal Tolima'
  );
