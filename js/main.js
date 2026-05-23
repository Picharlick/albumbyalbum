/* =============================================
   SOUNDLOG — main.js
   Con tabs de feed (Amigos, Global, Popular) y validación de contraseña
   ============================================= */

const STORAGE_KEYS = {
  USERS: 'soundlog_users',
  CURRENT_USER: 'soundlog_current_user',
  ALBUMS: 'soundlog_albums',
  REVIEWS: 'soundlog_reviews',
  FORUMS: 'soundlog_forums',
  FORUM_POSTS: 'soundlog_forum_posts',
  FOLLOWS: 'soundlog_follows'
};

let currentUser = null;
let currentForumFilter = 'todos';
let currentFeedTab = 'global'; // 'amigos', 'global', 'popular'

// --- LIMPIEZA DE DATOS DEMO ---
function cleanDemoData() {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users['juan_music']) {
    delete users['juan_music'];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  const current = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (current) {
    try {
      const curr = JSON.parse(current);
      if (curr.username === 'juan_music' || !users[curr.username]) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch(e) {}
  }
}

// --- INICIALIZACIÓN ---
function init() {
  cleanDemoData();
  const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!savedUser) {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '/albumbyalbum/pages/login.html';
    }
    return;
  }
  currentUser = JSON.parse(savedUser);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (!users[currentUser.username]) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = '/albumbyalbum/pages/login.html';
    return;
  }
  initUserData();
  updateUI();
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

function initUserData() {
  let albums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  if (!albums[currentUser.id]) albums[currentUser.id] = [];
  localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  let reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  if (!reviews[currentUser.id]) reviews[currentUser.id] = [];
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  let follows = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWS) || '{}');
  if (!follows[currentUser.id]) follows[currentUser.id] = [];
  localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));
  if (!localStorage.getItem(STORAGE_KEYS.FORUMS)) {
    const sampleForums = {
      forum1: { id: 'forum1', name: 'Rock Alternativo', description: 'Radiohead, Strokes, Arcade Fire', category: 'rock', createdBy: 'system', createdByUsername: 'Soundlog', createdAt: new Date().toISOString(), postsCount: 0 },
      forum2: { id: 'forum2', name: 'Jazz & Soul', description: 'Miles Davis, Coltrane', category: 'jazz', createdBy: 'system', createdByUsername: 'Soundlog', createdAt: new Date().toISOString(), postsCount: 0 },
      forum3: { id: 'forum3', name: 'Post-Rock', description: 'Godspeed, Sigur Rós', category: 'postrock', createdBy: 'system', createdByUsername: 'Soundlog', createdAt: new Date().toISOString(), postsCount: 0 }
    };
    localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(sampleForums));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORUM_POSTS)) {
    localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify({}));
  }
}

function updateUI() {
  if (!currentUser) return;
  document.querySelectorAll('.username-display').forEach(el => el.textContent = currentUser.username);
  document.querySelectorAll('.user-avatar').forEach(el => {
    el.textContent = currentUser.avatar || currentUser.username.substring(0,2).toUpperCase();
    el.style.background = 'rgba(124,106,247,0.2)';
    el.style.color = '#a89cf9';
  });
  const albums = getUserAlbums();
  document.querySelectorAll('.album-count').forEach(el => el.textContent = albums.length);
  document.querySelectorAll('.review-count').forEach(el => el.textContent = getUserReviews().length);
  
  const sidebarAlbumCount = document.getElementById('sidebar-album-count');
  if (sidebarAlbumCount) sidebarAlbumCount.textContent = albums.length;
}

function getUserAlbums() {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  return all[currentUser?.id] || [];
}

function getUserReviews() {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  return all[currentUser?.id] || [];
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
}

function getUserFollows() {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWS) || '{}');
  return all[currentUser?.id] || [];
}

function followUser(userId) {
  const follows = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWS) || '{}');
  if (!follows[currentUser.id]) follows[currentUser.id] = [];
  if (!follows[currentUser.id].includes(userId)) {
    follows[currentUser.id].push(userId);
    localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));
  }
}

function unfollowUser(userId) {
  const follows = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWS) || '{}');
  if (follows[currentUser.id]) {
    follows[currentUser.id] = follows[currentUser.id].filter(id => id !== userId);
    localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));
  }
}

// ============ FEED CON TABS ============
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
  const container = document.getElementById('feed-container');
  if (!container) return;
  
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  const users = getAllUsers();
  const follows = getUserFollows();
  
  let list = [];
  for (let uid in allReviews) {
    const user = Object.values(users).find(u => u.id === uid);
    if (user && allReviews[uid]) {
      allReviews[uid].forEach(r => {
        list.push({ ...r, userId: uid, username: user.username, userAvatar: user.avatar, userColor: user.avatarColor });
      });
    }
  }
  
  // Filtrar según el tab activo
  if (currentFeedTab === 'amigos') {
    list = list.filter(r => follows.includes(r.userId));
  } else if (currentFeedTab === 'popular') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  list = list.slice(0, 30);
  
  if (!list.length) {
    let emptyMessage = '';
    if (currentFeedTab === 'amigos') {
      emptyMessage = 'No hay reseñas de amigos. Sigue a más usuarios para ver su actividad.';
    } else {
      emptyMessage = 'No hay reseñas aún. ¡Sé el primero en agregar un álbum!';
    }
    container.innerHTML = `<div class="empty-state"><i class="ti ti-music"></i><p>${emptyMessage}</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primer álbum</button></div>`;
    return;
  }
  
  let html = '';
  list.forEach(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
    html += `<div class="review"><div class="review__header"><div class="avatar avatar--md avatar--${r.userColor||'purple'}">${r.userAvatar||r.username.substring(0,2)}</div><div class="review__meta"><div class="review__who"><strong>${r.username}</strong> <span class="text-muted">escuchó</span> <strong>${r.albumTitle}</strong> <span class="badge badge--accent">${r.artist}</span></div><div class="flex items-center gap-8"><div class="stars">${stars}</div><span class="text-xs text-hint">${getTimeAgo(new Date(r.createdAt))}</span></div></div><div class="review__album-thumb">${getAlbumEmoji(r.albumTitle)}</div></div>${r.text ? `<div class="review__text">${r.text}</div>` : ''}</div>`;
  });
  container.innerHTML = html;
}

// ============ FUNCIONES DE ÁLBUMES ============
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
  const inputs = ['albumTitle','albumArtist','albumYear','albumGenre','albumReview'];
  inputs.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const rating = document.getElementById('albumRating');
  if (rating) rating.value = '5';
  const date = document.getElementById('listenDate');
  if (date) date.value = new Date().toISOString().split('T')[0];
}

function submitAlbum() {
  const title = document.getElementById('albumTitle')?.value.trim();
  const artist = document.getElementById('albumArtist')?.value.trim();
  const year = document.getElementById('albumYear')?.value;
  const genre = document.getElementById('albumGenre')?.value;
  const rating = parseInt(document.getElementById('albumRating')?.value);
  const review = document.getElementById('albumReview')?.value.trim();
  const listenDate = document.getElementById('listenDate')?.value;
  if (!title || !artist) { showToast('Completa título y artista', 'error'); return; }
  const newAlbum = {
    id: Date.now().toString(),
    title, artist, year: year || null, genre: genre || null,
    rating, review: review || '',
    listenDate: listenDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  if (!allAlbums[currentUser.id]) allAlbums[currentUser.id] = [];
  allAlbums[currentUser.id].unshift(newAlbum);
  localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(allAlbums));
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  if (!allReviews[currentUser.id]) allReviews[currentUser.id] = [];
  allReviews[currentUser.id].unshift({
    id: newAlbum.id, albumTitle: title, artist, rating, text: review,
    createdAt: newAlbum.createdAt, listenDate: newAlbum.listenDate
  });
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
  showToast(`"${title}" agregado`, 'success');
  closeModal('addAlbumModal');
  if (window.location.pathname.includes('perfil.html')) {
    loadUserAlbums(); loadUserReviews(); loadUserStats(); loadUserFavorites();
  } else if (window.location.pathname.includes('stats.html')) {
    loadStatsPage();
  } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/albumbyalbum/') {
    loadFeed();
  }
  updateUI();
}

function deleteAlbum(albumId) {
  if (!confirm('¿Eliminar este álbum?')) return;
  let allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  allAlbums[currentUser.id] = allAlbums[currentUser.id].filter(a => a.id !== albumId);
  localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(allAlbums));
  let allReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '{}');
  allReviews[currentUser.id] = allReviews[currentUser.id].filter(r => r.id !== albumId);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
  showToast('Eliminado', 'success');
  loadUserAlbums(); loadUserReviews(); loadUserStats(); loadUserFavorites(); updateUI();
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
  
  const albums = getUserAlbums();
  const reviews = getUserReviews();
  
  if (albumsEl) albumsEl.textContent = albums.length;
  if (reviewsEl) reviewsEl.textContent = reviews.length;
  if (followingEl) followingEl.textContent = currentUser.followingCount || 0;
  if (followersEl) followersEl.textContent = currentUser.followersCount || 0;
  if (totalAlbumsStat) totalAlbumsStat.textContent = albums.length;
  
  if (avgRatingEl && albums.length > 0) {
    const avg = albums.reduce((sum, a) => sum + a.rating, 0) / albums.length;
    avgRatingEl.textContent = avg.toFixed(1);
  } else if (avgRatingEl) {
    avgRatingEl.textContent = '--';
  }
}

function loadUserAlbums() {
  const container = document.getElementById('user-albums-container');
  if (!container) return;
  const albums = getUserAlbums();
  if (!albums.length) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-album"></i><p>No hay álbumes</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primero</button></div>`;
    return;
  }
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:16px;">';
  albums.forEach(a => {
    const stars = '★'.repeat(a.rating) + '☆'.repeat(5-a.rating);
    html += `<div class="card card--hover" style="text-align:center; padding:12px;"><div style="font-size:48px;">${getAlbumEmoji(a.title)}</div><div class="text-sm font-weight-600">${a.title}</div><div class="text-xs text-muted">${a.artist}</div><div class="stars mt-6" style="justify-content:center;">${stars}</div><div class="text-xs text-muted mt-2">${formatDate(a.listenDate)}</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function loadUserReviews() {
  const container = document.getElementById('user-reviews-container');
  if (!container) return;
  const reviews = getUserReviews();
  if (!reviews.length) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-edit"></i><p>Sin reseñas</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Escribir primera</button></div>`;
    return;
  }
  let html = '';
  reviews.forEach(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
    html += `<div class="review"><div class="review__header"><div class="review__album-thumb">${getAlbumEmoji(r.albumTitle)}</div><div class="review__meta"><div class="review__who"><strong>${r.albumTitle}</strong> <span class="text-muted">·</span> <span class="text-muted">${r.artist}</span></div><div class="stars">${stars}</div><div class="text-xs text-hint mt-1">${formatDate(r.listenDate)}</div></div></div>${r.text ? `<div class="review__text">${r.text}</div>` : ''}<div class="review__actions"><button class="review__action" onclick="deleteAlbum('${r.id}')"><i class="ti ti-trash"></i> Eliminar</button></div></div>`;
  });
  container.innerHTML = html;
}

function loadUserFavorites() {
  const albums = getUserAlbums();
  const favAlbumsGrid = document.getElementById('fav-albums-grid');
  if (favAlbumsGrid) {
    if (!albums.length) { favAlbumsGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Sin favoritos</div>'; }
    else {
      const top = [...albums].sort((a,b)=>b.rating-a.rating).slice(0,5);
      favAlbumsGrid.innerHTML = top.map(a => `<div class="fav-item">${getAlbumEmoji(a.title)}<div class="fav-item__label">${a.title}</div></div>`).join('');
    }
  }
  const favArtistsGrid = document.getElementById('fav-artists-grid');
  if (favArtistsGrid) {
    const count = {};
    albums.forEach(a => count[a.artist] = (count[a.artist]||0)+1);
    const top = Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,5);
    favArtistsGrid.innerHTML = top.length ? top.map(([artist]) => `<div class="fav-item">${getArtistEmoji(artist)}<div class="fav-item__label">${artist}</div></div>`).join('') : '<div class="empty-state" style="grid-column:1/-1;">Sin artistas</div>';
  }
  const favGenres = document.getElementById('fav-genres-container');
  if (favGenres) {
    const count = {};
    albums.forEach(a => { if(a.genre) count[a.genre] = (count[a.genre]||0)+1; });
    const top = Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,5);
    favGenres.innerHTML = top.length ? top.map(([g]) => `<span class="badge badge--accent">${g}</span>`).join('') : '<span class="text-muted">Sin géneros</span>';
  }
}

function loadUserStats() {
  const container = document.getElementById('user-stats-container');
  if (!container) return;
  const albums = getUserAlbums();
  if (!albums.length) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-chart-bar"></i><p>Agrega álbumes</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar</button></div>`;
    return;
  }
  const genreCount = {};
  albums.forEach(a => { if(a.genre) genreCount[a.genre] = (genreCount[a.genre]||0)+1; });
  const topGenres = Object.entries(genreCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  let genreHtml = '';
  topGenres.forEach(([g,c]) => {
    const pct = (c/albums.length)*100;
    genreHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:100px;">${g}</div><div class="progress-bar flex-1"><div class="progress-fill" style="width:${pct}%;"></div></div><div class="text-muted">${c}</div></div>`;
  });
  const artistCount = {};
  albums.forEach(a => artistCount[a.artist] = (artistCount[a.artist]||0)+1);
  const topArtists = Object.entries(artistCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  let artistHtml = '';
  topArtists.forEach(([a,c],i) => {
    artistHtml += `<div class="sidebar-item"><span style="width:24px;">${i+1}</span><div class="sidebar-item__info"><div class="sidebar-item__name">${a}</div><div class="sidebar-item__sub">${c} álbum(es)</div></div></div>`;
  });
  container.innerHTML = `<div class="mb-16"><div class="section-label">🎸 Géneros favoritos</div>${genreHtml || '<div class="text-muted">Sin datos</div>'}</div><div><div class="section-label">🎤 Artistas más escuchados</div>${artistHtml || '<div class="text-muted">Sin datos</div>'}</div>`;
}

// ============ EXPLORAR ============
function loadExplorePage() {
  const container = document.getElementById('explore-container');
  if (!container) return;
  const allAlbums = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '{}');
  const map = new Map();
  for (let uid in allAlbums) {
    if (allAlbums[uid] && Array.isArray(allAlbums[uid])) {
      allAlbums[uid].forEach(a => {
        const key = `${a.title}|${a.artist}`;
        if (!map.has(key)) map.set(key, { title: a.title, artist: a.artist, genre: a.genre, count: 1, ratings: [a.rating] });
        else { const ex = map.get(key); ex.count++; ex.ratings.push(a.rating); }
      });
    }
  }
  const popular = Array.from(map.values()).sort((a,b)=>b.count-a.count).slice(0,30);
  if (!popular.length) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-compass"></i><p>Sin álbumes populares</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primero</button></div>`;
    return;
  }
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:16px;">';
  popular.forEach(p => {
    const avg = p.ratings.reduce((s,v)=>s+v,0)/p.ratings.length;
    const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg));
    html += `<div class="card card--hover" style="text-align:center; padding:16px; cursor:pointer;" onclick="quickAddAlbum('${escapeHtml(p.title)}','${escapeHtml(p.artist)}')"><div style="font-size:56px;">${getAlbumEmoji(p.title)}</div><div class="font-weight-600">${p.title}</div><div class="text-sm text-muted">${p.artist}</div><div class="stars mt-6" style="justify-content:center;">${stars}</div><div class="text-xs text-muted mt-4">${p.count} usuario(s)</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function quickAddAlbum(title, artist) {
  const t = document.getElementById('albumTitle');
  const a = document.getElementById('albumArtist');
  if (t) t.value = title;
  if (a) a.value = artist;
  openAddAlbumModal();
}

// ============ FOROS ============
function loadForums() {
  const container = document.getElementById('forums-container');
  if (!container) return;
  const forums = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUMS) || '{}');
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM_POSTS) || '{}');
  let list = Object.values(forums);
  if (currentForumFilter !== 'todos') list = list.filter(f => f.category === currentForumFilter);
  if (!list.length) { container.innerHTML = '<div class="empty-state">No hay foros</div>'; return; }
  let html = '';
  list.forEach(f => {
    const postCount = Object.values(posts).filter(p => p.forumId === f.id).length;
    html += `<div class="card mb-16" onclick="openForum('${f.id}')" style="cursor:pointer;"><div style="display:flex; justify-content:space-between;"><div><h3>${getCategoryIcon(f.category)} ${f.name}</h3><p class="text-sm text-muted">${f.description}</p><div class="flex gap-12 mt-8"><span class="text-xs text-muted"><i class="ti ti-message"></i> ${postCount} publicaciones</span><span class="badge badge--muted">${f.category}</span></div></div><i class="ti ti-chevron-right"></i></div></div>`;
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
  const forumPosts = Object.values(posts).filter(p => p.forumId === forumId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  let postsHtml = forumPosts.length ? '' : '<div class="empty-state">Sin publicaciones. Sé el primero.</div>';
  forumPosts.forEach(p => {
    postsHtml += `<div class="review"><div class="review__header"><div class="avatar avatar--sm avatar--purple">${(p.username||'U').substring(0,2)}</div><div class="review__meta"><div class="review__who"><strong>${p.username||'Usuario'}</strong> <span class="text-xs text-hint">${getTimeAgo(new Date(p.createdAt))}</span></div><div class="review__text" style="margin-top:8px;">${escapeHtml(p.content)}</div></div></div></div>`;
  });
  const modalHtml = `<div class="modal active" id="forumModal" style="display:flex;"><div class="modal__content" style="max-width:600px;"><div class="modal__header"><h3>${forum.name}</h3><span class="modal__close" onclick="closeModal('forumModal')">&times;</span></div><div class="modal__body" style="max-height:60vh; overflow-y:auto;"><div class="mb-16"><p class="text-muted">${forum.description}</p><span class="badge badge--muted">${forum.category}</span></div><div class="section-label">Publicaciones</div>${postsHtml}<div class="form-group mt-16"><textarea id="newPostContent" rows="3" placeholder="Escribe algo..."></textarea></div></div><div class="modal__footer"><button class="btn btn--secondary" onclick="closeModal('forumModal')">Cancelar</button><button class="btn btn--primary" onclick="submitForumPost('${forumId}')">Publicar</button></div></div></div>`;
  const old = document.getElementById('forumModal');
  if (old) old.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitForumPost(forumId) {
  const content = document.getElementById('newPostContent')?.value.trim();
  if (!content) { showToast('Escribe algo', 'error'); return; }
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
  if (!name) { showToast('Ingresa un nombre', 'error'); return; }
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
  showToast('Foro creado', 'success');
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
  if (!albums.length) {
    if (avgRatingEl) avgRatingEl.textContent = '--';
    if (streakDaysEl) streakDaysEl.textContent = '0';
    const ratingDistEl = document.getElementById('rating-distribution');
    if (ratingDistEl) ratingDistEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    const genresEl = document.getElementById('genres-container');
    if (genresEl) genresEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    const decadesEl = document.getElementById('decades-container');
    if (decadesEl) decadesEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    const monthlyEl = document.getElementById('monthly-activity');
    if (monthlyEl) monthlyEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    return;
  }
  const avg = albums.reduce((sum, a) => sum + a.rating, 0) / albums.length;
  if (avgRatingEl) avgRatingEl.textContent = avg.toFixed(1);
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
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  albums.forEach(a => ratingDist[a.rating]++);
  const maxRating = Math.max(...Object.values(ratingDist));
  let ratingHtml = '';
  for (let i = 5; i >= 1; i--) {
    const percentage = maxRating > 0 ? (ratingDist[i] / maxRating) * 100 : 0;
    ratingHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:60px;"><span class="star">${'★'.repeat(i)}</span></div><div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div><div style="width:50px;" class="text-muted">${ratingDist[i]}</div></div>`;
  }
  const ratingDistEl = document.getElementById('rating-distribution');
  if (ratingDistEl) ratingDistEl.innerHTML = ratingHtml;
  const genres = {};
  albums.forEach(a => { if (a.genre) genres[a.genre] = (genres[a.genre] || 0) + 1; });
  const sortedGenres = Object.entries(genres).sort((a,b) => b[1] - a[1]);
  let genreHtml = '';
  sortedGenres.forEach(([genre, count]) => {
    const percentage = (count / albums.length) * 100;
    genreHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:120px;">${genre}</div><div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div><div style="width:60px;" class="text-muted">${count}</div></div>`;
  });
  const genresEl = document.getElementById('genres-container');
  if (genresEl) genresEl.innerHTML = genreHtml || '<div class="text-muted">Sin datos</div>';
  const decades = {};
  albums.forEach(a => { if (a.year) { const decade = Math.floor(a.year / 10) * 10; decades[decade] = (decades[decade] || 0) + 1; } });
  const sortedDecades = Object.entries(decades).sort((a,b) => b[0] - a[0]);
  let decadeHtml = '';
  sortedDecades.forEach(([decade, count]) => {
    const percentage = (count / albums.length) * 100;
    decadeHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:80px;">${decade}s</div><div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div><div style="width:60px;" class="text-muted">${count}</div></div>`;
  });
  const decadesEl = document.getElementById('decades-container');
  if (decadesEl) decadesEl.innerHTML = decadeHtml || '<div class="text-muted">Sin datos</div>';
  const monthly = {};
  albums.forEach(a => { if (a.listenDate) { const month = a.listenDate.substring(0, 7); monthly[month] = (monthly[month] || 0) + 1; } });
  const months = Object.keys(monthly).sort();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  let activityHtml = '<div class="flex gap-16 wrap" style="justify-content:center;">';
  months.forEach(month => {
    const [year, m] = month.split('-');
    activityHtml += `<div style="text-align:center; min-width:60px;"><div style="font-size:28px; font-weight:600;">${monthly[month]}</div><div class="text-xs text-muted">${monthNames[parseInt(m)-1]} ${year}</div></div>`;
  });
  activityHtml += '</div>';
  const monthlyEl = document.getElementById('monthly-activity');
  if (monthlyEl) monthlyEl.innerHTML = activityHtml || '<div class="text-muted">Sin datos</div>';
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
  const icons = { rock: '🎸', jazz: '🎷', postrock: '🏔️', pop: '🎤', electronic: '🎹', metal: '🤘', general: '💬' };
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

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

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

// Funciones globales
window.openAddAlbumModal = openAddAlbumModal;
window.closeModal = closeModal;
window.submitAlbum = submitAlbum;
window.switchTab = switchTab;
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
window.switchProfileTab = switchProfileTab;

// Inicializar
document.addEventListener('DOMContentLoaded', init);
