-- Add new app_config keys for slider duration, footer logo, and logo sizes
INSERT INTO app_config (key, value) VALUES
  ('slider_duration',  '5'),
  ('footer_logo_url',  ''),
  ('logo_size',        '100'),
  ('footer_logo_size', '100')
ON CONFLICT (key) DO NOTHING;
