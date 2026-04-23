export type QuadrantType = 'abraza' | 'prende' | 'eleva' | 'revela';

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  youtube_video_id: string;
  youtube_thumbnail_url: string;
  cuadrante_principal: QuadrantType;
  descripcion_breve: string;
  estado: 'active' | 'inactive';
}

export const QUADRANTS_DATA = {
  abraza: {
    name: 'Te Abraza',
    emoji: '🫂',
    color: '#4f46e5',
    description: 'Sostiene tu nostalgia, valida tu herida y acompaña tu intimidad.',
    universe: ['amor', 'ruptura', 'nostalgia', 'apego', 'validación']
  },
  prende: {
    name: 'Te Prende',
    emoji: '🔥',
    color: '#ef4444',
    description: 'Activa el cuerpo, el deseo y la calle. Energía roja y picardía.',
    universe: ['ritmo', 'cuerpo', 'deseo', 'seducción', 'calle']
  },
  eleva: {
    name: 'Te Eleva',
    emoji: '✨',
    color: '#f59e0b',
    description: 'Himnos que te levantan y expanden. Celebración y energía solar.',
    universe: ['himnos', 'hype', 'expansión', 'celebración', 'ascenso']
  },
  revela: {
    name: 'Te Revela',
    emoji: '🔮',
    color: '#8b5cf6',
    description: 'Cuestiona tu identidad y revela tu verdad profunda y legado.',
    universe: ['identidad', 'legado', 'verdad', 'crisis', 'profundidad']
  }
};

export const SEED_SONGS: Song[] = [
  {
    id: '1',
    title: 'Hello',
    artist: 'Adele',
    youtube_url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    youtube_video_id: 'YQHsXMglC9A',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
    cuadrante_principal: 'abraza',
    descripcion_breve: 'Una pieza de perdón y nostalgia profunda.',
    estado: 'active'
  },
  {
    id: '2',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    youtube_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtube_video_id: 'kJQP7kiw5Fk',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    cuadrante_principal: 'prende',
    descripcion_breve: 'La esencia del ritmo y el deseo contemporáneo.',
    estado: 'active'
  },
  {
    id: '3',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    youtube_url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0',
    youtube_video_id: 'OPf0YbXqDm0',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
    cuadrante_principal: 'eleva',
    descripcion_breve: 'Celebración pura y energía colectiva expansiva.',
    estado: 'active'
  },
  {
    id: '4',
    title: 'Believer',
    artist: 'Imagine Dragons',
    youtube_url: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
    youtube_video_id: '7wtfhZwyrcc',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/7wtfhZwyrcc/maxresdefault.jpg',
    cuadrante_principal: 'revela',
    descripcion_breve: 'Una confrontación épica con el dolor y la identidad.',
    estado: 'active'
  },
  {
    id: '5',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    youtube_url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    youtube_video_id: '2Vv-BfVoq4g',
    youtube_thumbnail_url: 'https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg',
    cuadrante_principal: 'abraza',
    descripcion_breve: 'Compañerismo íntimo y validación emocional clásica.',
    estado: 'active'
  }
];
