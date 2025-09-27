export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  type: 'public' | 'private';
}

export const senegalUniversities: University[] = [
  // Universités publiques du Sénégal
  {
    id: 'ucad',
    name: 'Université Cheikh Anta Diop',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'ugb',
    name: 'Université Gaston Berger',
    city: 'Saint-Louis',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'uasz',
    name: 'Université Assane Seck de Ziguinchor',
    city: 'Ziguinchor',
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
  },
  {
    id: 'uidt',
    name: 'Université Iba Der Thiam de Thiès',
    city: 'Thiès',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'bambey',
    name: 'Université Alioune Diop de Bambey',
    city: 'Bambey',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'sine-saloum',
    name: 'Université du Sine Saloum El-Hâdj Ibrahima NIASS',
    city: 'Kaolack',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'virtuelle',
    name: 'Université Virtuelle du Sénégal',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'esp',
    name: 'École Supérieure Polytechnique',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
    {
    id: 'ept',
    name: 'École Polytechnique de Thiès',
    city: 'Thiès',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'enstp',
    name: 'École Nationale Supérieure de Technologie et des Postes',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'enam',
    name: 'École Nationale d\'Administration et de Magistrature',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'enea',
    name: 'École Nationale d\'Économie Appliquée',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'fastef',
    name: 'Faculté des Sciences et Technologies de l\'Éducation et de la Formation',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'isra',
    name: 'Institut Sénégalais de Recherches Agricoles',
    city: 'Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    type: 'public'
  },
  {
    id: 'ism',
    name: 'Institut Supérieur de Management',
    city: 'Dakar',
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