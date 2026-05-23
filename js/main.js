/* =============================================
   SOUNDLOG — main.js (Sin datos demo)
   ============================================= */

// ============ CONSTANTES ============
const STORAGE_KEYS = {
  USERS: 'soundlog_users',
  CURRENT_USER: 'soundlog_current_user',
  ALBUMS: 'soundlog_albums',
  REVIEWS: 'soundlog_reviews',
  FORUMS: 'soundlog_forums',
  FORUM_POSTS: 'soundlog_forum_posts',
  FOLLOWS: 'soundlog_follows'
};

// ============ USUARIO ACTUAL ============
let currentUser = null;
let currentForumFilter = 'todos';

// ============ INICIALIZACIÓN ============
function init() {
  // Verificar si hay usuario logueado
  const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  
  if (!savedUser) {
    // No hay sesión, redirigir a login
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '/albumbyalbum/pages/login.html';
    }
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  
  // Inicializar estructura de datos del usuario (VACÍA)
  initUserData();
  
  // Actualizar UI con datos reales del usuario
  updateUI();
  
  // Cargar contenido según la página
  const path = window.location.pathname;
  
  if (path.includes('index.html') || path === '/albumbyalbum/' || path.endsWith('/')) {
    loadFeed();
  } else if (path.includes('perfil.html')) {
    loadProfile();
    loadUserAlbums();
    loadUserReviews();
    loadUserStats();
    loadUserFavorites();
  } else if (path.includes('explorar.html')) {
    loadExplorePage();
  } else if (path.includes('foros.html')) {
    loadForums();
  } else if (path.includes('stats.html')) {
    loadStatsPage();
  }
}

// ============ INICIAR DATOS DEL USUARIO (VACÍOS) ============
function initUserData() {
  // Inicializar álbumes del usuario si no existen
  const allAlbums = localStorage.getItem(STORAGE_KEYS.ALBUMS);
  if (!allAlbums) {
    localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify({}));
  } else {
    // Asegurar que el usuario actual tenga un array
    const albums = JSON.parse(allAlbums);
    if (!albums[currentUser?.id]) {
      albums[currentUser.id] = [];
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    }
  }
  
  // Inicializar reseñas del usuario
  const allReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (!allReviews) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify({}));
  } else {
    const reviews = JSON.parse(allReviews);
    if (!reviews[currentUser?.id]) {
      reviews[currentUser.id] = [];
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    }
  }
  
  // Inicializar foros SOLO UNA VEZ (con datos de ejemplo para la comunidad)
  const allForums = localStorage.getItem(STORAGE_KEYS.FORUMS);
  if (!allForums) {
    const sampleForums = {
      'forum1': {
        id: 'forum1',
        name: 'Rock Alternativo',
        description: 'Discute sobre Radiohead, The Strokes, Arcade Fire y más',
        category: 'rock',
        createdBy: 'system',
        createdByUsername: 'Soundlog',
        createdAt: new Date().toISOString(),
        postsCount: 0
      },
      'forum2': {
        id: 'forum2',
        name: 'Jazz & Soul',
        description: 'Para amantes de Miles Davis, John Coltrane y la buena música',
        category: 'jazz',
        createdBy: 'system',
        createdByUsername: 'Soundlog',
        createdAt: new Date().toISOString(),
        postsCount: 0
      },
      'forum3': {
        id: 'forum3',
        name: 'Post-Rock',
        description: 'Godspeed, Sigur Rós, Explosions in the Sky',
        category: 'postrock',
        createdBy: 'system',
        createdByUsername: 'Soundlog',
        createdAt: new Date().toISOString(),
        postsCount: 0
      }
    };
    localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(sampleForums));
  }
  
  // Inicializar posts de foros
  const allPosts = localStorage.getItem(STORAGE_KEYS.FORUM_POSTS);
  if (!allPosts) {
    localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify({}));
  }
}

// ============ ACTUALIZAR UI ============
function updateUI() {
  if (!currentUser) return;
  
  // Actualizar nombre en navbar y otros lugares
  const usernameElements = document.querySelectorAll('.username-display');
  usernameElements.forEach(el => {
    if (el) el.textContent = currentUser.username;
  });
  
  // Actualizar avatar
  const avatarElements = document.querySelectorAll('.user-avatar');
  avatarElements.forEach(el => {
    if (el) {
      el.textContent = currentUser.avatar || currentUser.username.substring(0, 2).toUpperCase();
      el.style.background = `rgba(124,106,247,0.2)`;
      el.style.color = `#a89cf9`;
    }
  });
  
  // Actualizar contador de álbumes
  const userAlbums = getUserAlbums();
  const albumCountEl = document.querySelectorAll('.album-count');
  albumCountEl.forEach(el => {
    if (el) el.textContent = userAlbums.length;
  });
  
  const reviewCountEl = document.querySelectorAll('.review-count');
  if (reviewCountEl) {
    const userReviews = getUserReviews();
    reviewCountEl.forEach(el => el.textContent = userReviews.length);
  }
}

// ============ OBTENER DATOS DEL USUARIO ============
function getUserAlbums() {
  const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  return allAlbums[currentUser?.id] || [];
}

function getUserReviews() {
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  return allReviews[currentUser?.id] || [];
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
}

// ============ AÑADIR ÁLBUM ============
function openAddAlbumModal() {
  const modal = document.getElementById('addAlbumModal');
  if (modal) modal.classList.add('active');
  resetAlbumForm();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function resetAlbumForm() {
  const titleInput = document.getElementById('albumTitle');
  const artistInput = document.getElementById('albumArtist');
  const yearInput = document.getElementById('albumYear');
  const genreInput = document.getElementById('albumGenre');
  const ratingSelect = document.getElementById('albumRating');
  const reviewText = document.getElementById('albumReview');
  const dateInput = document.getElementById('listenDate');
  
  if (titleInput) titleInput.value = '';
  if (artistInput) artistInput.value = '';
  if (yearInput) yearInput.value = '';
  if (genreInput) genreInput.value = '';
  if (ratingSelect) ratingSelect.value = '5';
  if (reviewText) reviewText.value = '';
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

function submitAlbum() {
  const title = document.getElementById('albumTitle')?.value.trim();
  const artist = document.getElementById('albumArtist')?.value.trim();
  const year = document.getElementById('albumYear')?.value;
  const genre = document.getElementById('albumGenre')?.value;
  const rating = parseInt(document.getElementById('albumRating')?.value);
  const review = document.getElementById('albumReview')?.value.trim();
  const listenDate = document.getElementById('listenDate')?.value;
  
  if (!title || !artist) {
    showToast('Por favor ingresa el título y artista del álbum', 'error');
    return;
  }
  
  const newAlbum = {
    id: Date.now().toString(),
    title: title,
    artist: artist,
    year: year || null,
    genre: genre || null,
    rating: rating,
    review: review || '',
    listenDate: listenDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  
  // Guardar en álbumes del usuario
  const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  if (!allAlbums[currentUser.id]) allAlbums[currentUser.id] = [];
  allAlbums[currentUser.id].unshift(newAlbum);
  localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(allAlbums));
  
  // Guardar como reseña también
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  if (!allReviews[currentUser.id]) allReviews[currentUser.id] = [];
  allReviews[currentUser.id].unshift({
    id: Date.now().toString(),
    albumTitle: title,
    artist: artist,
    rating: rating,
    text: review,
    createdAt: new Date().toISOString(),
    listenDate: listenDate
  });
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
  
  showToast(`¡"${title}" ha sido agregado a tu colección!`, 'success');
  closeModal('addAlbumModal');
  
  // Recargar la página actual
  if (window.location.pathname.includes('perfil.html')) {
    loadUserAlbums();
    loadUserReviews();
    loadUserStats();
  } else if (window.location.pathname.includes('stats.html')) {
    loadStatsPage();
  }
  updateUI();
}

// ============ PERFIL ============
function loadProfile() {
  if (!currentUser) return;
  
  const usernameEl = document.getElementById('profile-username');
  const bioEl = document.getElementById('profile-bio');
  const albumsEl = document.getElementById('profile-albums');
  const reviewsEl = document.getElementById('profile-reviews');
  const followingEl = document.getElementById('profile-following');
  const followersEl = document.getElementById('profile-followers');
  const totalAlbumsStat = document.getElementById('totalAlbumsStat');
  const avgRatingEl = document.getElementById('avgRating');
  
  if (usernameEl) usernameEl.textContent = currentUser.username;
  if (bioEl) bioEl.textContent = currentUser.bio || 'Añade una descripción a tu perfil';
  
  const userAlbums = getUserAlbums();
  const userReviews = getUserReviews();
  
  if (albumsEl) albumsEl.textContent = userAlbums.length;
  if (reviewsEl) reviewsEl.textContent = userReviews.length;
  if (followingEl) followingEl.textContent = currentUser.followingCount || 0;
  if (followersEl) followersEl.textContent = currentUser.followersCount || 0;
  if (totalAlbumsStat) totalAlbumsStat.textContent = userAlbums.length;
  
  if (avgRatingEl && userAlbums.length > 0) {
    const avg = userAlbums.reduce((sum, a) => sum + a.rating, 0) / userAlbums.length;
    avgRatingEl.textContent = avg.toFixed(1);
  } else if (avgRatingEl) {
    avgRatingEl.textContent = '--';
  }
}

function loadUserAlbums() {
  const container = document.getElementById('user-albums-container');
  if (!container) return;
  
  const albums = getUserAlbums();
  
  if (albums.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-album"></i>
        <p>Todavía no has agregado ningún álbum</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">
          <i class="ti ti-plus"></i> Agregar mi primer álbum
        </button>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:16px;">';
  albums.forEach(album => {
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5 - album.rating);
    html += `
      <div class="card card--hover" style="text-align:center; padding:12px; cursor:pointer;" onclick="showAlbumDetail('${album.id}')">
        <div style="font-size:48px; margin-bottom:8px;">${getAlbumEmoji(album.title)}</div>
        <div class="text-sm font-medium" style="font-weight:600;">${album.title.length > 20 ? album.title.substring(0,17)+'...' : album.title}</div>
        <div class="text-xs text-muted">${album.artist}</div>
        ${album.year ? `<div class="text-xs text-muted">${album.year}</div>` : ''}
        <div class="stars mt-6" style="justify-content:center;">${stars}</div>
        <div class="text-xs text-muted mt-4">${formatDate(album.listenDate)}</div>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}

function loadUserReviews() {
  const container = document.getElementById('user-reviews-container');
  if (!container) return;
  
  const reviews = getUserReviews();
  
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-edit"></i>
        <p>No has escrito ninguna reseña aún</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">
          <i class="ti ti-plus"></i> Escribir primera reseña
        </button>
      </div>
    `;
    return;
  }
  
  let html = '';
  reviews.forEach(review => {
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
            <div class="stars">${stars}</div>
            <div class="text-xs text-hint mt-2">Escuchado: ${formatDate(review.listenDate)}</div>
          </div>
        </div>
        ${review.text ? `<div class="review__text">${review.text}</div>` : ''}
        <div class="review__actions">
          <button class="review__action" onclick="deleteAlbum('${review.id}')">
            <i class="ti ti-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadUserFavorites() {
  const albums = getUserAlbums();
  
  if (albums.length === 0) {
    const favAlbumsGrid = document.getElementById('fav-albums-grid');
    if (favAlbumsGrid) favAlbumsGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No hay favoritos aún</div>';
    return;
  }
  
  // Top 5 álbumes mejor calificados como "favoritos"
  const topAlbums = [...albums].sort((a,b) => b.rating - a.rating).slice(0, 5);
  const favAlbumsGrid = document.getElementById('fav-albums-grid');
  if (favAlbumsGrid) {
    let html = '';
    topAlbums.forEach(album => {
      html += `
        <div class="fav-item">
          ${getAlbumEmoji(album.title)}
          <div class="fav-item__label">${album.title.length > 15 ? album.title.substring(0,12)+'...' : album.title}</div>
        </div>
      `;
    });
    favAlbumsGrid.innerHTML = html;
  }
  
  // Top 5 artistas
  const artistCount = {};
  albums.forEach(album => {
    artistCount[album.artist] = (artistCount[album.artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const favArtistsGrid = document.getElementById('fav-artists-grid');
  if (favArtistsGrid) {
    let html = '';
    topArtists.forEach(([artist]) => {
      html += `
        <div class="fav-item">
          ${getArtistEmoji(artist)}
          <div class="fav-item__label">${artist.length > 15 ? artist.substring(0,12)+'...' : artist}</div>
        </div>
      `;
    });
    favArtistsGrid.innerHTML = html || '<div class="empty-state" style="grid-column:1/-1;">No hay favoritos aún</div>';
  }
  
  // Top géneros
  const genreCount = {};
  albums.forEach(album => {
    if (album.genre) genreCount[album.genre] = (genreCount[album.genre] || 0) + 1;
  });
  const topGenres = Object.entries(genreCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const favGenresContainer = document.getElementById('fav-genres-container');
  if (favGenresContainer) {
    let html = '';
    topGenres.forEach(([genre]) => {
      html += `<span class="badge badge--accent">${genre}</span>`;
    });
    favGenresContainer.innerHTML = html || '<span class="text-muted text-sm">No hay géneros favoritos</span>';
  }
}

function loadUserStats() {
  const albums = getUserAlbums();
  const statsContainer = document.getElementById('user-stats-container');
  if (!statsContainer) return;
  
  if (albums.length === 0) {
    statsContainer.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-chart-bar"></i>
        <p>Agrega álbumes para ver tus estadísticas</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar álbum</button>
      </div>
    `;
    return;
  }
  
  // Géneros
  const genreCount = {};
  albums.forEach(a => { if (a.genre) genreCount[a.genre] = (genreCount[a.genre] || 0) + 1; });
  const topGenres = Object.entries(genreCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
  
  let genreHtml = '';
  topGenres.forEach(([genre, count]) => {
    const percentage = (count / albums.length) * 100;
    genreHtml += `
      <div class="flex items-center gap-12 mb-8">
        <div style="width:100px;">${genre}</div>
        <div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div>
        <div class="text-muted">${count}</div>
      </div>
    `;
  });
  
  // Artistas top
  const artistCount = {};
  albums.forEach(a => { artistCount[a.artist] = (artistCount[a.artist] || 0) + 1; });
  const topArtistsStats = Object.entries(artistCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
  
  let artistHtml = '';
  topArtistsStats.forEach(([artist, count], idx) => {
    artistHtml += `
      <div class="sidebar-item">
        <span style="font-weight:600; width:24px;">${idx + 1}</span>
        <div class="sidebar-item__info">
          <div class="sidebar-item__name">${artist}</div>
          <div class="sidebar-item__sub">${count} álbum${count !== 1 ? 'es' : ''}</div>
        </div>
      </div>
    `;
  });
  
  statsContainer.innerHTML = `
    <div class="mb-16">
      <div class="section-label">🎸 Géneros favoritos</div>
      ${genreHtml || '<div class="text-muted text-sm">No hay datos de géneros</div>'}
    </div>
    <div>
      <div class="section-label">🎤 Artistas más escuchados</div>
      ${artistHtml || '<div class="text-muted text-sm">No hay datos de artistas</div>'}
    </div>
  `;
}

function deleteAlbum(albumId) {
  if (confirm('¿Eliminar este álbum de tu colección?')) {
    const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
    allAlbums[currentUser.id] = allAlbums[currentUser.id].filter(a => a.id !== albumId);
    localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(allAlbums));
    
    const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
    allReviews[currentUser.id] = allReviews[currentUser.id].filter(r => r.id !== albumId);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
    
    showToast('Álbum eliminado', 'success');
    loadUserAlbums();
    loadUserReviews();
    loadUserStats();
    loadUserFavorites();
    updateUI();
  }
}

// ============ FEED ============
let currentFeedTab = 'global';

function switchTab(btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  const tabText = btn.textContent.trim().toLowerCase();
  if (tabText === 'global') currentFeedTab = 'global';
  else if (tabText === 'populares') currentFeedTab = 'populares';
  
  loadFeed();
}

function loadFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  const users = getAllUsers();
  
  let allReviewsList = [];
  for (const userId in allReviews) {
    const user = Object.values(users).find(u => u.id === userId);
    if (user && allReviews[userId]) {
      allReviews[userId].forEach(review => {
        allReviewsList.push({
          ...review,
          userId: userId,
          username: user.username,
          userAvatar: user.avatar,
          userColor: user.avatarColor
        });
      });
    }
  }
  
  if (currentFeedTab === 'populares') {
    allReviewsList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    allReviewsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  allReviewsList = allReviewsList.slice(0, 20);
  
  if (allReviewsList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-music"></i>
        <p>No hay reseñas de otros usuarios aún</p>
        <p class="text-xs text-muted mt-8">¡Sé el primero en agregar un álbum!</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  allReviewsList.forEach(review => {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    html += `
      <div class="review">
        <div class="review__header">
          <div class="avatar avatar--md avatar--${review.userColor || 'purple'}">${review.userAvatar || review.username.substring(0,2).toUpperCase()}</div>
          <div class="review__meta">
            <div class="review__who">
              <strong>${review.username}</strong>
              <span class="text-muted">escuchó</span>
              <strong>${review.albumTitle}</strong>
              <span class="badge badge--accent">${review.artist}</span>
            </div>
            <div class="flex items-center gap-8">
              <div class="stars">${stars}</div>
              <span class="text-xs text-hint">${getTimeAgo(new Date(review.createdAt))}</span>
            </div>
          </div>
          <div class="review__album-thumb">${getAlbumEmoji(review.albumTitle)}</div>
        </div>
        ${review.text ? `<div class="review__text">${review.text}</div>` : ''}
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ============ EXPLORAR ============
function loadExplorePage() {
  loadExploreAlbums();
}

function loadExploreAlbums() {
  const container = document.getElementById('explore-container');
  if (!container) return;
  
  const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  
  // Recolectar todos los álbumes de todos los usuarios
  const albumMap = new Map();
  
  for (const userId in allAlbums) {
    if (allAlbums[userId] && Array.isArray(allAlbums[userId])) {
      allAlbums[userId].forEach(album => {
        const key = `${album.title}|${album.artist}`;
        if (!albumMap.has(key)) {
          albumMap.set(key, {
            title: album.title,
            artist: album.artist,
            genre: album.genre,
            count: 1,
            ratings: [album.rating]
          });
        } else {
          const existing = albumMap.get(key);
          existing.count++;
          existing.ratings.push(album.rating);
        }
      });
    }
  }
  
  const popularAlbums = Array.from(albumMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
  
  if (popularAlbums.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-compass"></i>
        <p>Todavía no hay álbumes registrados por otros usuarios</p>
        <button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agrega tu primer álbum</button>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:16px;">';
  popularAlbums.forEach(album => {
    const avgRating = album.ratings.reduce((a,b) => a+b, 0) / album.ratings.length;
    const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
    html += `
      <div class="card card--hover" style="text-align:center; padding:16px; cursor:pointer;" onclick="quickAddAlbum('${album.title.replace(/'/g, "\\'")}', '${album.artist.replace(/'/g, "\\'")}')">
        <div style="font-size:56px; margin-bottom:8px;">${getAlbumEmoji(album.title)}</div>
        <div class="font-weight-600" style="font-weight:600; font-size:0.9rem;">${album.title.length > 25 ? album.title.substring(0,22)+'...' : album.title}</div>
        <div class="text-sm text-muted">${album.artist}</div>
        <div class="stars mt-6" style="justify-content:center;">${stars}</div>
        <div class="text-xs text-muted mt-4">${album.count} usuario${album.count !== 1 ? 's' : ''}</div>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}

function quickAddAlbum(title, artist) {
  const titleInput = document.getElementById('albumTitle');
  const artistInput = document.getElementById('albumArtist');
  if (titleInput) titleInput.value = title;
  if (artistInput) artistInput.value = artist;
  openAddAlbumModal();
}

// ============ FOROS ============
function loadForums() {
  const container = document.getElementById('forums-container');
  if (!container) return;
  
  const forums = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUMS) || '{}');
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_POSTS) || '{}');
  
  let forumsList = Object.values(forums);
  
  if (currentForumFilter !== 'todos') {
    forumsList = forumsList.filter(f => f.category === currentForumFilter);
  }
  
  if (forumsList.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="ti ti-message-circle"></i><p>No hay foros disponibles</p></div>';
    return;
  }
  
  let html = '';
  forumsList.forEach(forum => {
    const forumPosts = Object.values(posts).filter(p => p.forumId === forum.id);
    html += `
      <div class="card mb-16" onclick="openForum('${forum.id}')" style="cursor:pointer;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="margin-bottom:4px;">${getCategoryIcon(forum.category)} ${forum.name}</h3>
            <p class="text-sm text-muted">${forum.description}</p>
            <div class="flex gap-12 mt-8">
              <span class="text-xs text-muted"><i class="ti ti-message"></i> ${forumPosts.length} publicaciones</span>
              <span class="badge badge--muted">${forum.category}</span>
            </div>
          </div>
          <i class="ti ti-chevron-right" style="color:var(--text-muted);"></i>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function filterForums(category, btn) {
  currentForumFilter = category;
  
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  loadForums();
}

function openForum(forumId) {
  const forums = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUMS) || '{}');
  const forum = forums[forumId];
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_POSTS) || '{}');
  const forumPosts = Object.values(posts).filter(p => p.forumId === forumId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  let postsHtml = '';
  if (forumPosts.length === 0) {
    postsHtml = '<div class="empty-state"><i class="ti ti-message"></i><p>Todavía no hay publicaciones. ¡Sé el primero!</p></div>';
  } else {
    forumPosts.forEach(post => {
      postsHtml += `
        <div class="review">
          <div class="review__header">
            <div class="avatar avatar--sm avatar--purple">${post.username?.substring(0,2).toUpperCase() || 'U'}</div>
            <div class="review__meta">
              <div class="review__who">
                <strong>${post.username || 'Usuario'}</strong>
                <span class="text-xs text-hint">${getTimeAgo(new Date(post.createdAt))}</span>
              </div>
              <div class="review__text" style="margin-top:8px;">${post.content}</div>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  const modalHtml = `
    <div class="modal active" id="forumModal" style="display:flex;">
      <div class="modal__content" style="max-width:600px; width:90%;">
        <div class="modal__header">
          <h3>${forum.name}</h3>
          <span class="modal__close" onclick="closeModal('forumModal')">&times;</span>
        </div>
        <div class="modal__body" style="max-height:60vh; overflow-y:auto;">
          <div class="mb-16">
            <p class="text-sm text-muted">${forum.description}</p>
            <span class="badge badge--muted">${getCategoryIcon(forum.category)} ${forum.category}</span>
          </div>
          <div class="section-label mb-8">💬 PUBLICACIONES</div>
          ${postsHtml}
          <div class="form-group mt-16">
            <label>Escribe algo...</label>
            <textarea id="newPostContent" rows="3" placeholder="Comparte tu opinión..."></textarea>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" onclick="closeModal('forumModal')">Cancelar</button>
          <button class="btn btn--primary" onclick="submitForumPost('${forumId}')">Publicar</button>
        </div>
      </div>
    </div>
  `;
  
  const existingModal = document.getElementById('forumModal');
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitForumPost(forumId) {
  const content = document.getElementById('newPostContent')?.value.trim();
  if (!content) {
    showToast('Escribe algo para publicar', 'error');
    return;
  }
  
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_POSTS) || '{}');
  const newPost = {
    id: Date.now().toString(),
    forumId: forumId,
    userId: currentUser.id,
    username: currentUser.username,
    content: content,
    createdAt: new Date().toISOString(),
    replies: []
  };
  
  posts[newPost.id] = newPost;
  localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
  
  showToast('Publicación creada', 'success');
  closeModal('forumModal');
  loadForums();
}

function openCreateForumModal() {
  const modal = document.getElementById('createForumModal');
  if (modal) modal.classList.add('active');
}

function createForum() {
  const name = document.getElementById('forumName')?.value.trim();
  const description = document.getElementById('forumDescription')?.value.trim();
  const category = document.getElementById('forumCategory')?.value;
  
  if (!name) {
    showToast('Ingresa un nombre para el foro', 'error');
    return;
  }
  
  const forums = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUMS) || '{}');
  const newForum = {
    id: 'forum_' + Date.now(),
    name: name,
    description: description || 'Sin descripción',
    category: category || 'general',
    createdBy: currentUser.id,
    createdByUsername: currentUser.username,
    createdAt: new Date().toISOString(),
    postsCount: 0
  };
  
  forums[newForum.id] = newForum;
  localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(forums));
  
  showToast('Foro creado exitosamente', 'success');
  closeModal('createForumModal');
  loadForums();
  
  if (document.getElementById('forumName')) document.getElementById('forumName').value = '';
  if (document.getElementById('forumDescription')) document.getElementById('forumDescription').value = '';
}

// ============ STATS ============
function loadStatsPage() {
  const albums = getUserAlbums();
  
  const totalAlbumsEl = document.getElementById('totalAlbums');
  const avgRatingEl = document.getElementById('avgRating');
  const streakDaysEl = document.getElementById('streakDays');
  
  if (totalAlbumsEl) totalAlbumsEl.textContent = albums.length;
  
  if (albums.length === 0) {
    if (avgRatingEl) avgRatingEl.textContent = '--';
    if (streakDaysEl) streakDaysEl.textContent = '0';
    
    const ratingDistEl = document.getElementById('rating-distribution');
    if (ratingDistEl) ratingDistEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes para ver estadísticas</p></div>';
    
    const genresEl = document.getElementById('genres-container');
    if (genresEl) genresEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes para ver estadísticas</p></div>';
    
    const decadesEl = document.getElementById('decades-container');
    if (decadesEl) decadesEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes para ver estadísticas</p></div>';
    
    const monthlyEl = document.getElementById('monthly-activity');
    if (monthlyEl) monthlyEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes para ver estadísticas</p></div>';
    return;
  }
  
  // Calificación promedio
  const avg = albums.reduce((sum, a) => sum + a.rating, 0) / albums.length;
  if (avgRatingEl) avgRatingEl.textContent = avg.toFixed(1);
  
  // Racha
  const sortedDates = albums.map(a => a.listenDate).filter(d => d).sort();
  let streak = 0;
  if (sortedDates.length > 0) {
    streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (new Date(sortedDates[i]) - new Date(sortedDates[i-1])) / (1000 * 60 * 60 * 24);
      if (diff <= 1) streak++;
      else break;
    }
  }
  if (streakDaysEl) streakDaysEl.textContent = streak;
  
  // Distribución de calificaciones
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  albums.forEach(a => ratingDist[a.rating]++);
  const maxRating = Math.max(...Object.values(ratingDist));
  
  let ratingHtml = '';
  for (let i = 5; i >= 1; i--) {
    const percentage = maxRating > 0 ? (ratingDist[i] / maxRating) * 100 : 0;
    ratingHtml += `
      <div class="flex items-center gap-12 mb-8">
        <div style="width:60px;"><span class="star">${'★'.repeat(i)}</span></div>
        <div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div>
        <div style="width:50px; text-align:right;" class="text-muted">${ratingDist[i]}</div>
      </div>
    `;
  }
  const ratingDistEl = document.getElementById('rating-distribution');
  if (ratingDistEl) ratingDistEl.innerHTML = ratingHtml;
  
  // Géneros
  const genres = {};
  albums.forEach(a => { if (a.genre) genres[a.genre] = (genres[a.genre] || 0) + 1; });
  const sortedGenres = Object.entries(genres).sort((a,b) => b[1] - a[1]);
  let genreHtml = '';
  sortedGenres.forEach(([genre, count]) => {
    const percentage = (count / albums.length) * 100;
    genreHtml += `
      <div class="flex items-center gap-12 mb-8">
        <div style="width:120px;">${genre}</div>
        <div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div>
        <div style="width:60px; text-align:right;" class="text-muted">${count}</div>
      </div>
    `;
  });
  const genresEl = document.getElementById('genres-container');
  if (genresEl) genresEl.innerHTML = genreHtml || '<div class="text-muted">No hay datos de géneros</div>';
  
  // Décadas
  const decades = {};
  albums.forEach(a => {
    if (a.year) {
      const decade = Math.floor(a.year / 10) * 10;
      decades[decade] = (decades[decade] || 0) + 1;
    }
  });
  const sortedDecades = Object.entries(decades).sort((a,b) => b[0] - a[0]);
  let decadeHtml = '';
  sortedDecades.forEach(([decade, count]) => {
    const percentage = (count / albums.length) * 100;
    decadeHtml += `
      <div class="flex items-center gap-12 mb-8">
        <div style="width:80px;">${decade}s</div>
        <div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div>
        <div style="width:60px; text-align:right;" class="text-muted">${count}</div>
      </div>
    `;
  });
  const decadesEl = document.getElementById('decades-container');
  if (decadesEl) decadesEl.innerHTML = decadeHtml || '<div class="text-muted">No hay datos de años</div>';
  
  // Actividad mensual
  const monthly = {};
  albums.forEach(a => {
    if (a.listenDate) {
      const month = a.listenDate.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    }
  });
  const months = Object.keys(monthly).sort();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  let activityHtml = '<div class="flex gap-16 wrap" style="justify-content:center;">';
  months.forEach(month => {
    const [year, m] = month.split('-');
    activityHtml += `
      <div style="text-align:center; min-width:60px;">
        <div style="font-size:28px; font-weight:600;">${monthly[month]}</div>
        <div class="text-xs text-muted">${monthNames[parseInt(m)-1]} ${year}</div>
      </div>
    `;
  });
  activityHtml += '</div>';
  const monthlyEl = document.getElementById('monthly-activity');
  if (monthlyEl) monthlyEl.innerHTML = activityHtml || '<div class="text-muted">No hay datos mensuales</div>';
}

// ============ UTILITIES ============
function getAlbumEmoji(title) {
  const emojiMap = {
    'In Rainbows': '🌊', 'OK Computer': '🎹', 'Kid A': '🔮', 'Amnesiac': '📖',
    'The Bends': '🎸', 'A Moon Shaped Pool': '🌙', 'Kind of Blue': '💙',
    'Bitches Brew': '🍺', 'Dark Side of the Moon': '🌙', 'Wish You Were Here': '🏊',
    'Animals': '🐷', 'The Wall': '🧱', 'Nevermind': '🤘', 'Ten': '🙏',
    'Loveless': '💜', 'Is This It': '🎸', 'Turn On the Bright Lights': '💡'
  };
  return emojiMap[title] || '💿';
}

function getArtistEmoji(artist) {
  const emojiMap = {
    'Radiohead': '🎸', 'Miles Davis': '🎷', 'Joni Mitchell': '🎹',
    'Godspeed You!': '🔮', 'The Strokes': '🎸', 'Frank Ocean': '🌊'
  };
  return emojiMap[artist] || '🎤';
}

function getCategoryIcon(category) {
  const icons = {
    rock: '🎸', jazz: '🎷', postrock: '🏔️', pop: '🎤', electronic: '🎹', metal: '🤘', general: '💬'
  };
  return icons[category] || '💬';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `hace ${weeks} sem`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes`;
  return `hace ${Math.floor(days / 365)} año`;
}

function showToast(message, type) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="ti ti-${type === 'success' ? 'check' : 'alert-circle'}"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = '/albumbyalbum/pages/login.html';
}

// Funciones globales
window.openAddAlbumModal = openAddAlbumModal;
window.closeModal = closeModal;
window.submitAlbum = submitAlbum;
window.switchTab = switchTab;
window.switchProfileTab = switchProfileTab;
window.deleteAlbum = deleteAlbum;
window.filterForums = filterForums;
window.openForum = openForum;
window.openCreateForumModal = openCreateForumModal;
window.createForum = createForum;
window.submitForumPost = submitForumPost;
window.quickAddAlbum = quickAddAlbum;
window.logout = logout;
window.editProfile = editProfile;
window.saveProfile = saveProfile;
window.loadStatsPage = loadStatsPage;

// Necesario para perfil.html
function switchProfileTab(btn, tabId) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  const tabs = ['actividad', 'albums', 'reseñas', 'favoritos', 'stats'];
  tabs.forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    if (el) el.style.display = (id === tabId) ? 'block' : 'none';
  });
  
  if (tabId === 'reseñas') loadUserReviews();
  if (tabId === 'albums') loadUserAlbums();
  if (tabId === 'favoritos') loadUserFavorites();
  if (tabId === 'stats') loadUserStats();
}

function editProfile() {
  const modal = document.getElementById('editProfileModal');
  const bioTextarea = document.getElementById('editBio');
  if (bioTextarea) bioTextarea.value = currentUser?.bio || '';
  if (modal) modal.classList.add('active');
}

function saveProfile() {
  const newBio = document.getElementById('editBio')?.value;
  if (currentUser && newBio !== undefined) {
    currentUser.bio = newBio;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    if (users[currentUser.username]) {
      users[currentUser.username].bio = newBio;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    const bioEl = document.getElementById('profile-bio');
    if (bioEl) bioEl.textContent = newBio || 'Añade una descripción a tu perfil';
    showToast('Perfil actualizado', 'success');
    closeModal('editProfileModal');
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', init);
