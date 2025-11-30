export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  type: 'public' | 'private';
}

export const senegalUniversities: University[] = [
  {
    id: 'ucad',
    name: 'Université Cheikh Anta Diop',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'ut',
    name: 'Université de Thiès',
    city: 'Thiès',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  }
];

export const userTypes = [
  { value: 'client', label: 'Client (Étudiant/Personnel)' },
  { value: 'fournisseur', label: 'Fournisseur' }
];

export const getUniversityById = (id: string): University | undefined => {
  return senegalUniversities.find(university => university.id === id);
};

export const getUniversitiesByCity = (city: string): University[] => {
  return senegalUniversities.filter(university =>
    university.city.toLowerCase().includes(city.toLowerCase())
  );
};