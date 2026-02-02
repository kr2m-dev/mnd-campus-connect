-- Ajouter les universités sénégalaises manquantes
INSERT INTO universities (id, name, city, country, flag, type) VALUES
('ensa', 'École Nationale Supérieure d''Agriculture (ENSA)', 'Thiès', 'Sénégal', '🇸🇳', 'public'),
('uam', 'Université Amadou Mahtar Mbow (UAM)', 'Dakar', 'Sénégal', '🇸🇳', 'public'),
('ugb', 'Université Gaston Berger (UGB)', 'Saint-Louis', 'Sénégal', '🇸🇳', 'public'),
('uab', 'Université Alioune Diop de Bambey', 'Bambey', 'Sénégal', '🇸🇳', 'public'),
('uasz', 'Université Assane Seck de Ziguinchor (UASZ)', 'Ziguinchor', 'Sénégal', '🇸🇳', 'public')
ON CONFLICT (id) DO NOTHING;