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
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(INITIAL_FAVORITES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FOLLOWING)) {
    localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify({
      'user1': ['user2', 'user3'],
      'user2': ['user1', 'user4'],
      'user3': ['user1', 'user2'],
      'user4': ['user2']
    }));
  }

  // Cargar usuario actual
  const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  } else {
    // Login automático como juan_music para demo
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    currentUser = users['juan_music'];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }

  // Actualizar UI con datos del usuario
  updateUserInterface();
  
  // Construir heatmap
  buildHeatmap();
  
  // Cargar feed
  loadFeed();
  
  // Cargar actividad reciente en perfil si estamos en perfil.html
  if (window.location.pathname.includes('perfil.html')) {
    loadProfileActivity();
    loadUserFavorites();
    loadUserReviews();
  }
  
  // Configurar modales
  setupModals();
}

// ============ UI UPDATES ============
function updateUserInterface() {
  if (!currentUser) return;
  
  // Actualizar avatar en navbar
  const avatarElements = document.querySelectorAll('.user-avatar, .avatar[title="Mi perfil"]');
  avatarElements.forEach(el => {
    if (el.classList.contains('avatar')) {
      el.textContent = currentUser.avatar;
      el.className = `avatar avatar--md avatar--${currentUser.avatarColor}`;
      if (el.getAttribute('title') === 'Mi perfil') el.setAttribute('title', currentUser.username);
    }
  });
  
  // Actualizar estadísticas en sidebar
  const albumCountEl = document.querySelector('.stat-mini__num');
  if (albumCountEl) albumCountEl.textContent = currentUser.stats.albums;
  
  // Actualizar nombre en perfil rápido
  const userNameEl = document.querySelector('.flex.items-center.gap-10 .flex-1 div:first-child');
  if (userNameEl && !window.location.pathname.includes('perfil.html')) {
    userNameEl.textContent = currentUser.username;
  }
  
  const albumSubEl = document.querySelector('.flex.items-center.gap-10 .text-sm.text-muted');
  if (albumSubEl) {
    albumSubEl.textContent = `${currentUser.stats.albums} álbumes · ${currentUser.stats.reviews} reseñas`;
  }
}

// ============ FEED ============
function switchTab(btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  const tabText = btn.textContent.trim().toLowerCase();
  if (tabText === 'amigos') currentFeedTab = 'amigos';
  else if (tabText === 'global') currentFeedTab = 'global';
  else if (tabText === 'popular') currentFeedTab = 'popular';
  
  loadFeed();
}

function loadFeed() {
  const feedContainer = document.getElementById('feed-container');
  if (!feedContainer) return;
  
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  const following = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWING) || '{}');
  const currentUserFollowing = following[currentUser?.id] || [];
  
  let filteredReviews = [...reviews];
  
  if (currentFeedTab === 'amigos') {
    filteredReviews = reviews.filter(r => currentUserFollowing.includes(r.userId));
  } else if (currentFeedTab === 'popular') {
    filteredReviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  filteredReviews = filteredReviews.slice(0, 10);
  
  renderFeedItems(feedContainer, filteredReviews, users);
}

function renderFeedItems(container, reviews, users) {
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-music-off"></i>
        <p>No hay actividad reciente en este feed</p>
        <p class="text-xs text-muted mt-8">Sigue a más usuarios o revisa el feed global</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  reviews.forEach(review => {
    const user = Object.values(users).find(u => u.id === review.userId);
    const timeAgo = getTimeAgo(new Date(review.createdAt));
    
    if (review.type === 'list') {
      html += `
        <div class="review">
          <div class="review__header">
            <a href="/albumbyalbum/pages/perfil.html?user=${user?.username}" class="avatar avatar--md avatar--${user?.avatarColor || 'purple'}">${user?.avatar || 'U'}</a>
            <div class="review__meta">
              <div class="review__who">
                <strong>${user?.username || 'Usuario'}</strong>
                <span class="text-muted">creó una lista</span>
                <strong>"${review.title}"</strong>
              </div>
              <span class="text-xs text-hint">${timeAgo}</span>
            </div>
          </div>
          <div class="flex gap-6 wrap mb-8">
            ${review.albums.slice(0, 4).map(album => `<span class="badge badge--muted">🎸 ${album}</span>`).join('')}
            ${review.albums.length > 4 ? `<span class="badge badge--muted">+${review.albums.length - 4} más</span>` : ''}
          </div>
          <div class="review__actions">
            <button class="review__action" onclick="toggleLike('${review.id}')">
              <i class="ti ti-heart"></i> <span>${review.likes || 0}</span>
            </button>
            <button class="review__action">
              <i class="ti ti-eye"></i> Ver lista completa
            </button>
          </div>
        </div>
      `;
    } else {
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      html += `
        <div class="review">
          <div class="review__header">
            <a href="/albumbyalbum/pages/perfil.html?user=${user?.username}" class="avatar avatar--md avatar--${user?.avatarColor || 'purple'}">${user?.avatar || 'U'}</a>
            <div class="review__meta">
              <div class="review__who">
                <strong>${user?.username || 'Usuario'}</strong>
                <span class="text-muted">reseñó</span>
                <strong>${review.albumTitle}</strong>
                <span class="badge badge--accent">${review.artist}</span>
              </div>
              <div class="flex items-center gap-8">
                <div class="stars">${stars.split('').map(s => `<span class="star${s === '☆' ? '--empty' : ''}">${s}</span>`).join('')}</div>
                <span class="text-xs text-hint">${timeAgo}</span>
              </div>
            </div>
            <div class="review__album-thumb">${getAlbumEmoji(review.albumTitle)}</div>
          </div>
          ${review.text ? `<div class="review__text">${review.text}</div>` : ''}
          <div class="review__actions">
            <button class="review__action" onclick="toggleLike('${review.id}')">
              <i class="ti ti-heart"></i> <span>${review.likes || 0}</span>
            </button>
            <button class="review__action" onclick="openCommentModal('${review.id}')">
              <i class="ti ti-message-circle"></i> ${review.comments || 0} comentarios
            </button>
            <button class="review__action">
              <i class="ti ti-bookmark"></i> Guardar
            </button>
          </div>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

// ============ REVIEW FUNCTIONS ============
function toggleLike(reviewId) {
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1) {
    reviews[reviewIndex].likes = (reviews[reviewIndex].likes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    showToast('👍 Le diste like a esta reseña', 'success');
    loadFeed();
  }
}

function openAddReviewModal() {
  const modal = document.getElementById('addReviewModal');
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
  
  // Limpiar formulario
  if (modalId === 'addReviewModal') {
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
  }
}

function submitReview() {
  const albumTitle = document.getElementById('reviewAlbumTitle')?.value;
  const artist = document.getElementById('reviewArtist')?.value;
  const rating = document.querySelectorAll('.rating-star.active').length;
  const text = document.getElementById('reviewText')?.value;
  
  if (!albumTitle || !artist || rating === 0) {
    showToast('Por favor completa todos los campos y selecciona una calificación', 'error');
    return;
  }
  
  const newReview = {
    id: 'rev' + Date.now(),
    userId: currentUser.id,
    albumTitle: albumTitle,
    artist: artist,
    rating: rating,
    text: text || '',
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0
  };
  
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  reviews.unshift(newReview);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  
  // Actualizar estadísticas del usuario
  currentUser.stats.reviews++;
  currentUser.stats.albums++;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  
  // Actualizar en la lista de usuarios
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[currentUser.username]) {
    users[currentUser.username].stats = currentUser.stats;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  
  showToast('¡Reseña publicada con éxito!', 'success');
  closeModal('addReviewModal');
  loadFeed();
  
  // Limpiar formulario
  document.getElementById('reviewAlbumTitle').value = '';
  document.getElementById('reviewArtist').value = '';
  document.getElementById('reviewText').value = '';
  document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
}

function setupRatingStars() {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      stars.forEach((s, i) => {
        if (i <= index) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });
}

function openCommentModal(reviewId) {
  showToast('Funcionalidad de comentarios próximamente', 'info');
}

// ============ PERFIL ============
function loadProfileActivity() {
  const recentContainer = document.querySelector('.recent-tracks-container');
  if (!recentContainer) return;
  
  const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
  const userActivities = activities.filter(a => a.userId === currentUser.id).slice(0, 5);
  
  if (userActivities.length === 0) {
    recentContainer.innerHTML = '<div class="empty-state"><i class="ti ti-headphones"></i><p>No hay actividad reciente</p><p class="text-xs text-muted">Las canciones que escuches aparecerán aquí</p></div>';
    return;
  }
  
  let html = '';
  userActivities.forEach((activity, index) => {
    html += `
      <div class="recent-track">
        <span class="track-num">${index + 1}</span>
        <div class="track-thumb">${getTrackEmoji(activity.track)}</div>
        <div class="track-info">
          <div class="track-title">${activity.track}</div>
          <div class="track-artist">${activity.artist} · ${activity.album}</div>
        </div>
        <span class="track-time">${getTimeAgo(new Date(activity.timestamp))}</span>
      </div>
    `;
  });
  
  recentContainer.innerHTML = html;
}

function loadUserFavorites() {
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  const userFavs = favorites[currentUser.id] || { albums: [], artists: [], genres: [] };
  
  // Álbumes favoritos
  const albumGrid = document.querySelector('.fav-grid:first-child');
  if (albumGrid) {
    if (userFavs.albums.length === 0) {
      albumGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1; padding:20px;"><i class="ti ti-album"></i><p class="text-xs">No hay álbumes favoritos</p></div>';
    } else {
      let html = '';
      userFavs.albums.slice(0, 5).forEach(album => {
        html += `
          <div class="fav-item">
            ${getAlbumEmoji(album)}
            <div class="fav-item__label">${album}</div>
          </div>
        `;
      });
      albumGrid.innerHTML = html;
    }
  }
  
  // Artistas favoritos
  const artistGrid = document.querySelectorAll('.fav-grid')[1];
  if (artistGrid) {
    if (userFavs.artists.length === 0) {
      artistGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1; padding:20px;"><i class="ti ti-microphone"></i><p class="text-xs">No hay artistas favoritos</p></div>';
    } else {
      let html = '';
      userFavs.artists.slice(0, 5).forEach(artist => {
        html += `
          <div class="fav-item">
            ${getArtistEmoji(artist)}
            <div class="fav-item__label">${artist}</div>
          </div>
        `;
      });
      artistGrid.innerHTML = html;
    }
  }
  
  // Géneros favoritos
  const genresContainer = document.querySelector('.favorite-genres-container');
  if (genresContainer) {
    if (userFavs.genres.length === 0) {
      genresContainer.innerHTML = '<span class="text-muted text-sm">No hay géneros favoritos</span>';
    } else {
      let html = '';
      userFavs.genres.forEach(genre => {
        html += `<span class="badge badge--accent">${genre}</span>`;
      });
      genresContainer.innerHTML = html;
    }
  }
}

function switchProfileTab(btn, tabId) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  const tabs = ['actividad', 'albums', 'favoritos', 'listas', 'reseñas'];
  tabs.forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    if (el) el.style.display = (id === tabId) ? 'block' : 'none';
  });
  
  if (tabId === 'reseñas') loadUserReviews();
  if (tabId === 'albums') loadUserAlbums();
}

function loadUserReviews() {
  const reviewsContainer = document.getElementById('user-reviews-container');
  if (!reviewsContainer) return;
  
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  const userReviews = reviews.filter(r => r.userId === currentUser.id && r.type !== 'list');
  
  if (userReviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-edit"></i>
        <p>No has escrito ninguna reseña aún</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddReviewModal()">Escribir primera reseña</button>
      </div>
    `;
    return;
  }
  
  let html = '';
  userReviews.forEach(review => {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    html += `
      <div class="review">
        <div class="review__header">
          <div class="review__album-thumb">${getAlbumEmoji(review.albumTitle)}</div>
          <div class="review__meta">
            <div class="review__who">
              <strong>${review.albumTitle}</strong>
              <span class="text-muted">·</span>
              <span class="text-muted">${review.artist}</span>
            </div>
            <div class="stars">${stars.split('').map(s => `<span class="star${s === '☆' ? '--empty' : ''}">${s}</span>`).join('')}</div>
            <div class="text-xs text-hint">${getTimeAgo(new Date(review.createdAt))}</div>
          </div>
        </div>
        ${review.text ? `<div class="review__text">${review.text}</div>` : ''}
        <div class="review__actions">
          <button class="review__action"><i class="ti ti-heart"></i> ${review.likes || 0}</button>
          <button class="review__action"><i class="ti ti-edit"></i> Editar</button>
          <button class="review__action" onclick="deleteReview('${review.id}')"><i class="ti ti-trash"></i> Eliminar</button>
        </div>
      </div>
    `;
  });
  
  reviewsContainer.innerHTML = html;
}

function loadUserAlbums() {
  const albumsContainer = document.getElementById('user-albums-container');
  if (!albumsContainer) return;
  
  const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  const userReviews = reviews.filter(r => r.userId === currentUser.id && r.type !== 'list');
  
  if (userReviews.length === 0) {
    albumsContainer.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-album"></i>
        <p>No has registrado ningún álbum aún</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddReviewModal()">Agregar primer álbum</button>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px,1fr)); gap:12px;">';
  userReviews.forEach(review => {
    html += `
      <div class="card card--hover" style="text-align:center; padding:12px;">
        <div style="font-size:32px; margin-bottom:6px;">${getAlbumEmoji(review.albumTitle)}</div>
        <div class="text-sm font-medium" style="font-weight:500;">${review.albumTitle}</div>
        <div class="text-xs text-muted">${review.artist}</div>
        <div class="stars justify-content-center mt-4">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      </div>
    `;
  });
  html += '</div>';
  
  albumsContainer.innerHTML = html;
}

function deleteReview(reviewId) {
  if (confirm('¿Eliminar esta reseña?')) {
    let reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    reviews = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    
    currentUser.stats.reviews--;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    showToast('Reseña eliminada', 'success');
    loadUserReviews();
    loadFeed();
  }
}

// ============ HEATMAP ============
function buildHeatmap() {
  const container = document.getElementById('heatmap');
  if (!container) return;
  
  const weeks = 26;
  const days = 7;
  
  // Obtener actividad del usuario para el heatmap
  const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
  const userActivities = activities.filter(a => a.userId === currentUser?.id);
  
  // Crear un mapa de actividad por día (simplificado para demo)
  const activityMap = {};
  userActivities.forEach(activity => {
    const date = new Date(activity.timestamp).toDateString();
    activityMap[date] = (activityMap[date] || 0) + 1;
  });
  
  container.innerHTML = '';
  
  const today = new Date();
  
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      
      // Calcular fecha para esta celda
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - ((weeks - w - 1) * 7 + (6 - d)));
      const dateKey = cellDate.toDateString();
      
      const activityCount = activityMap[dateKey] || 0;
      
      let level = 0;
      if (activityCount >= 4) level = 4;
      else if (activityCount >= 3) level = 3;
      else if (activityCount >= 2) level = 2;
      else if (activityCount >= 1) level = 1;
      
      if (level > 0) cell.classList.add(`l${level}`);
      container.appendChild(cell);
    }
  }
}

// ============ SPOTIFY CONNECT (real) ============
function connectSpotify() {
  // Para producción: implementar OAuth real con Spotify
  // Por ahora, mostrar mensaje informativo
  showToast('Conectar con Spotify requerirá configuración OAuth. ¿Quieres implementarlo?', 'info');
  console.log('Spotify OAuth pendiente de implementar. Client ID necesario.');
}

// ============ UTILITY FUNCTIONS ============
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Hace unos segundos';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} minuto${minutes === 1 ? '' : 's'}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} día${days === 1 ? '' : 's'}`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks} semana${weeks === 1 ? '' : 's'}`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
  
  const years = Math.floor(days / 365);
  return `Hace ${years} año${years === 1 ? '' : 's'}`;
}

function getAlbumEmoji(albumTitle) {
  const emojiMap = {
    'In Rainbows': '🌊',
    'OK Computer': '🎹',
    'Kind of Blue': '🌙',
    'Lift Your Skinny Fists Like Antennas to Heaven': '🏔️',
    'Blue': '🌿',
    'Kid A': '🔮',
    'Blonde': '🌿',
    'Master of Puppets': '🤘',
    'Rust in Peace': '⚡',
    'The Dark Side of the Moon': '🌙',
    'Channel Orange': '🍊',
    'Ctrl': '🎧'
  };
  return emojiMap[albumTitle] || '💿';
}

function getTrackEmoji(track) {
  const emojiMap = {
    'Paranoid Android': '🎸',
    'Reckoner': '🌊',
    'Blue in Green': '🎷',
    'Motion Picture Soundtrack': '🔮',
    'Everything In Its Right Place': '🎹',
    'So What': '🎺'
  };
  return emojiMap[track] || '🎵';
}

function getArtistEmoji(artist) {
  const emojiMap = {
    'Radiohead': '🎸',
    'Miles Davis': '🎷',
    'Joni Mitchell': '🎹',
    'Godspeed You!': '🔮',
    'Talk Talk': '🎤',
    'Metallica': '🤘',
    'Megadeth': '⚡',
    'Pink Floyd': '🌈',
    'Frank Ocean': '🌊',
    'SZA': '🎧'
  };
  return emojiMap[artist] || '🎤';
}

function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  const icon = type === 'success' ? 'ti-check' : (type === 'error' ? 'ti-alert-circle' : 'ti-info-circle');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="ti ${icon}"></i> ${message}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function setupModals() {
  // Cerrar modal al hacer clic fuera
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Configurar estrellas de calificación si existen
  setupRatingStars();
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = '/albumbyalbum/pages/login.html';
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  init();
  
  // Exponer funciones globalmente
  window.switchTab = switchTab;
  window.toggleLike = toggleLike;
  window.connectSpotify = connectSpotify;
  window.openAddReviewModal = openAddReviewModal;
  window.closeModal = closeModal;
  window.submitReview = submitReview;
  window.switchProfileTab = switchProfileTab;
  window.deleteReview = deleteReview;
  window.logout = logout;
});
