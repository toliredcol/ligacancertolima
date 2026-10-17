UPDATE diploma_config
SET signer_title = REPLACE(signer_title, 'Seccional Tolima', 'Zonal Tolima')
WHERE signer_title LIKE '%Seccional Tolima%';
