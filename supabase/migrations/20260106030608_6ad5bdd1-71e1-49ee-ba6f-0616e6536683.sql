-- Insert universities for Senegal
INSERT INTO public.universities (id, name, city, country, flag, type, students_count)
VALUES 
  ('ucad', 'Université Cheikh Anta Diop', 'Dakar', 'Sénégal', '🇸🇳', 'public', '80000+'),
  ('ut', 'Université de Thiès', 'Thiès', 'Sénégal', '🇸🇳', 'public', '15000+')
ON CONFLICT (id) DO NOTHING;