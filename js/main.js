/* =============================================
   SOUNDLOG — main.js (Versión Funcional sin Now Playing falso)
   ============================================= */

// ============ DATA STORE (localStorage) ============
const STORAGE_KEYS = {
  USERS: 'soundlog_users',
  REVIEWS: 'soundlog_reviews',
  LISTS: 'soundlog_lists',
  FOLLOWING: 'soundlog_following',
  ACTIVITY: 'soundlog_activity',
  FAVORITES: 'soundlog_favorites',
  CURRENT_USER: 'soundlog_current_user'
};

// Datos iniciales de usuarios
const INITIAL_USERS = {
  'juan_music': {
    id: 'user1',
    username: 'juan_music',
    displayName: 'Juan Music',
    email: 'juan@example.com',
    bio: 'Melómano empedernido. Vivo entre el post-rock y el jazz. Lima, Perú. Creo que OK Computer es el mejor álbum de todos los tiempos y no me disculpo por eso.',
    avatar: 'JM',
    avatarColor: 'purple',
    joinedAt: '2024-01-15',
    stats: { albums: 342, reviews: 58, following: 127, followers: 89 }
  },
  'ana_melodies': {
    id: 'user2',
    username: 'ana_melodies',
    displayName: 'Ana Melodies',
    email: 'ana@example.com',
    bio: 'Amante del indie y el dream pop. Barcelona.',
    avatar: 'AM',
    avatarColor: 'coral',
    joinedAt: '2024-02-20',
    stats: { albums: 215, reviews: 42, following: 89, followers: 156 }
  },
  'carlos_rock': {
    id: 'user3',
    username: 'carlos_rock',
    displayName: 'Carlos Rock',
    email: 'carlos@example.com',
    bio: 'Rock clásico y metal progresivo. CDMX.',
    avatar: 'CR',
    avatarColor: 'teal',
    joinedAt: '2024-01-30',
    stats: { albums: 423, reviews: 87, following: 203, followers: 245 }
  },
  'valeria_pop': {
    id: 'user4',
    username: 'valeria_pop',
    displayName: 'Valeria Pop',
    email: 'valeria@example.com',
    bio: 'Pop alternativo y R&B. Buenos Aires.',
    avatar: 'VP',
    avatarColor: 'pink',
    joinedAt: '2024-03-10',
    stats: { albums: 178, reviews: 31, following: 112, followers: 98 }
  }
};

// Datos iniciales de reseñas
const INITIAL_REVIEWS = [
  {
    id: 'rev1',
    userId: 'user2',
    albumTitle: 'In Rainbows',
    artist: 'Radiohead',
    rating: 5,
    text: 'Una obra maestra atemporal. "Reckoner" y "House of Cards" siguen siendo dos de las canciones más emotivas que he escuchado. Radiohead en su momento más vulnerable y más brillante.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 24,
    comments: 5
  },
  {
    id: 'rev2',
    userId: 'user3',
    type: 'list',
    title: 'Álbumes de los 2000s que me marcaron',
    albums: ['Is This It', 'Turn On the Bright Lights', 'Elephant', 'Kid A', 'Funeral'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 11
  },
  {
    id: 'rev3',
    userId: 'user4',
    albumTitle: 'Blonde',
    artist: 'Frank Ocean',
    rating: 4,
    text: '',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    comments: 2
  },
  {
    id: 'rev4',
    userId: 'user1',
    albumTitle: 'Lift Your Skinny Fists Like Antennas to Heaven',
    artist: 'Godspeed You! Black Emperor',
    rating: 5,
    text: 'Un viaje emocional de 80 minutos. El post-rock en su forma más pura y ambiciosa.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 31,
    comments: 12
  },
  {
    id: 'rev5',
    userId: 'user2',
    albumTitle: 'Kind of Blue',
    artist: 'Miles Davis',
    rating: 5,
    text: 'El jazz no empieza ni termina aquí, pero si tuvieras que escuchar un solo disco en tu vida, este sería el candidato.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 56,
    comments: 8
  }
];

// Datos iniciales de actividad (escuchas recientes - datos demo)
const INITIAL_ACTIVITY = [
  { userId: 'user1', track: 'Paranoid Android', album: 'OK Computer', artist: 'Radiohead', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { userId: 'user1', track: 'Reckoner', album: 'In Rainbows', artist: 'Radiohead', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { userId: 'user1', track: 'Blue in Green', album: 'Kind of Blue', artist: 'Miles Davis', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { userId: 'user1', track: 'Motion Picture Soundtrack', album: 'Kid A', artist: 'Radiohead', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { userId: 'user2', track: 'Everything In Its Right Place', album: 'Kid A', artist: 'Radiohead', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { userId: 'user3', track: 'So What', album: 'Kind of Blue', artist: 'Miles Davis', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
];

// Datos iniciales de favoritos
const INITIAL_FAVORITES = {
  'user1': {
    albums: ['In Rainbows', 'OK Computer', 'Kind of Blue', 'Lift Your Skinny Fists', 'Blue'],
    artists: ['Radiohead', 'Miles Davis', 'Joni Mitchell', 'Godspeed You!', 'Talk Talk'],
    genres: ['Post-rock', 'Jazz', 'Rock alternativo', 'Ambient', 'Folk', 'Electrónica']
  },
  'user2': {
    albums: ['Kid A', 'Is This It', 'Turn On the Bright Lights'],
    artists: ['Radiohead', 'The Strokes', 'Interpol'],
    genres: ['Indie rock', 'Post-punk revival', 'Electrónica']
  },
  'user3': {
    albums: ['Master of Puppets', 'Rust in Peace', 'The Dark Side of the Moon'],
    artists: ['Metallica', 'Megadeth', 'Pink Floyd'],
    genres: ['Metal', 'Rock progresivo', 'Hard rock']
  },
  'user4': {
    albums: ['Blonde', 'Channel Orange', 'Ctrl'],
    artists: ['Frank Ocean', 'SZA', 'Solange'],
    genres: ['R&B', 'Pop alternativo', 'Neo-soul']
  }
};

// Usuario actualmente logueado
let currentUser = null;
let currentFeedTab = 'amigos';

// ============ INICIALIZACIÓN ============
function init() {
  // Inicializar localStorage con datos por defecto si está vacío
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    localStorage
