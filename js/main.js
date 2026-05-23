/* =============================================
   SOUNDLOG — main.js (Versión Supabase)
   ============================================= */

// === CONFIGURACIÓN DE SUPABASE ===
const SUPABASE_URL = 'https://omwdajgpywdwrbiguvfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e4HpONc7gleaNaxEG6FTUQ_5t4JbdLa';

// Inicializar cliente de Supabase
let supabase = null;
try {
  if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase conectado correctamente');
  } else {
    console.error('❌ Supabase no está cargado. Asegúrate de incluir el script en tu HTML');
  }
} catch (e) {
  console.error('❌ Error al conectar Supabase:', e);
}

let currentUser = null;
let currentForumFilter = 'todos';
let currentFeedTab = 'global';

// ============ INICIALIZACIÓN ============
async function init() {
  // Verificar si hay usuario en localStorage (sesión)
  const savedUser = localStorage.getItem('soundlog_current_user');
  
  if (!savedUser) {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'pages/login.html';
    }
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  
  if (!supabase) {
    console.error('Supabase no disponible');
    return;
  }
  
  // Verificar que el usuario existe en Supabase
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  
  if (error || !data) {
    localStorage.removeItem('soundlog_current_user');
    window.location.href = 'pages/login.html';
    return;
  }
  
  currentUser = data;
  updateUI();
  
  const path = window.location.pathname;
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
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

function updateUI() {
  if (!currentUser) return;
  
  document.querySelectorAll('.username-display').forEach(el => {
    if (el) el.textContent = currentUser.username;
  });
  
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (el) {
      el.textContent = currentUser.avatar || currentUser.username.substring(0,2).toUpperCase();
      el.style.background = 'rgba(124,106,247,0.2)';
      el.style.color = '#a89cf9';
    }
  });
  
  loadAlbumCount();
}

async function loadAlbumCount() {
  if (!supabase) return;
  
  const { count, error } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);
  
  if (!error) {
    document.querySelectorAll('.album-count').forEach(el => {
      if (el) el.textContent = count || 0;
    });
    const sidebarAlbumCount = document.getElementById('sidebar-album-count');
    if (sidebarAlbumCount) sidebarAlbumCount.textContent = count || 0;
  }
}

// ============ ÁLBUMES ============
async function submitAlbum() {
  const title = document.getElementById('albumTitle')?.value.trim();
  const artist = document.getElementById('albumArtist')?.value.trim();
  const year = document.getElementById('albumYear')?.value;
  const genre = document.getElementById('albumGenre')?.value;
  const rating = parseInt(document.getElementById('albumRating')?.value);
  const review = document.getElementById('albumReview')?.value.trim();
  const listenDate = document.getElementById('listenDate')?.value;
  
  if (!title || !artist) {
    showToast('Completa título y artista', 'error');
    return;
  }
  
  if (!supabase) {
    showToast('Error de conexión con la base de datos', 'error');
    return;
  }
  
  const { error } = await supabase
    .from('albums')
    .insert([{
      user_id: currentUser.id,
      title: title,
      artist: artist,
      year: year || null,
      genre: genre || null,
      rating: rating,
      review: review || '',
      listen_date: listenDate || new Date().toISOString().split('T')[0]
    }]);
  
  if (error) {
    showToast('Error al guardar: ' + error.message, 'error');
    console.error(error);
  } else {
    showToast(`"${title}" agregado`, 'success');
    closeModal('addAlbumModal');
    resetAlbumForm();
    loadAlbumCount();
    if (window.location.pathname.includes('perfil.html')) {
      loadUserAlbums();
      loadUserReviews();
      loadUserStats();
      loadUserFavorites();
    } else if (window.location.pathname.includes('stats.html')) {
      loadStatsPage();
    } else {
      loadFeed();
    }
  }
}

async function deleteAlbum(albumId) {
  if (!confirm('¿Eliminar este álbum?')) return;
  
  if (!supabase) return;
  
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId)
    .eq('user_id', currentUser.id);
  
  if (error) {
    showToast('Error al eliminar', 'error');
  } else {
    showToast('Eliminado', 'success');
    loadAlbumCount();
    if (window.location.pathname.includes('perfil.html')) {
      loadUserAlbums();
      loadUserReviews();
      loadUserStats();
      loadUserFavorites();
    }
  }
}

async function loadUserAlbums() {
  const container = document.getElementById('user-albums-container');
  if (!container) return;
  
  if (!supabase) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-album"></i><p>Error de conexión</p></div>`;
    return;
  }
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-album"></i><p>No hay álbumes</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primero</button></div>`;
    return;
  }
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:16px;">';
  data.forEach(album => {
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5-album.rating);
    html += `<div class="card card--hover" style="text-align:center; padding:12px;"><div style="font-size:48px;">${getAlbumEmoji(album.title)}</div><div class="text-sm font-weight-600">${album.title}</div><div class="text-xs text-muted">${album.artist}</div><div class="stars mt-6" style="justify-content:center;">${stars}</div><div class="text-xs text-muted mt-2">${formatDate(album.listen_date)}</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function loadUserReviews() {
  const container = document.getElementById('user-reviews-container');
  if (!container) return;
  
  if (!supabase) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-edit"></i><p>Sin reseñas</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Escribir primera</button></div>`;
    return;
  }
  
  let html = '';
  data.forEach(album => {
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5-album.rating);
    html += `<div class="review"><div class="review__header"><div class="review__album-thumb">${getAlbumEmoji(album.title)}</div><div class="review__meta"><div class="review__who"><strong>${album.title}</strong> <span class="text-muted">·</span> <span class="text-muted">${album.artist}</span></div><div class="stars">${stars}</div><div class="text-xs text-hint mt-1">${formatDate(album.listen_date)}</div></div></div>${album.review ? `<div class="review__text">${album.review}</div>` : ''}<div class="review__actions"><button class="review__action" onclick="deleteAlbum('${album.id}')"><i class="ti ti-trash"></i> Eliminar</button></div></div>`;
  });
  container.innerHTML = html;
}

async function loadUserFavorites() {
  if (!supabase) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('rating', { ascending: false })
    .limit(5);
  
  const favAlbumsGrid = document.getElementById('fav-albums-grid');
  if (favAlbumsGrid) {
    if (error || !data || data.length === 0) {
      favAlbumsGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Sin favoritos</div>';
    } else {
      favAlbumsGrid.innerHTML = data.map(a => `<div class="fav-item">${getAlbumEmoji(a.title)}<div class="fav-item__label">${a.title}</div></div>`).join('');
    }
  }
}

async function loadUserStats() {
  const container = document.getElementById('user-stats-container');
  if (!container) return;
  
  if (!supabase) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('genre, artist, rating')
    .eq('user_id', currentUser.id);
  
  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-chart-bar"></i><p>Agrega álbumes</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar</button></div>`;
    return;
  }
  
  const genreCount = {};
  data.forEach(a => { if(a.genre) genreCount[a.genre] = (genreCount[a.genre]||0)+1; });
  const topGenres = Object.entries(genreCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  
  let genreHtml = '';
  topGenres.forEach(([g,c]) => {
    const pct = (c/data.length)*100;
    genreHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:100px;">${g}</div><div class="progress-bar flex-1"><div class="progress-fill" style="width:${pct}%;"></div></div><div class="text-muted">${c}</div></div>`;
  });
  
  const artistCount = {};
  data.forEach(a => artistCount[a.artist] = (artistCount[a.artist]||0)+1);
  const topArtists = Object.entries(artistCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  
  let artistHtml = '';
  topArtists.forEach(([a,c],i) => {
    artistHtml += `<div class="sidebar-item"><span style="width:24px;">${i+1}</span><div class="sidebar-item__info"><div class="sidebar-item__name">${a}</div><div class="sidebar-item__sub">${c} álbum(es)</div></div></div>`;
  });
  
  container.innerHTML = `<div class="mb-16"><div class="section-label">🎸 Géneros favoritos</div>${genreHtml || '<div class="text-muted">Sin datos</div>'}</div><div><div class="section-label">🎤 Artistas más escuchados</div>${artistHtml || '<div class="text-muted">Sin datos</div>'}</div>`;
}

// ============ FEED GLOBAL ============
async function loadFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  
  if (!supabase) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-music"></i><p>Error de conexión</p></div>`;
    return;
  }
  
  let query = supabase
    .from('albums')
    .select(`
      *,
      users:user_id (username, avatar, avatar_color)
    `)
    .order('created_at', { ascending: false });
  
  if (currentFeedTab === 'popular') {
    query = query.order('rating', { ascending: false });
  }
  
  const { data, error } = await query.limit(30);
  
  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-music"></i><p>No hay reseñas aún</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primera</button></div>`;
    return;
  }
  
  let html = '';
  data.forEach(album => {
    const user = album.users || { username: 'Usuario', avatar: 'U', avatar_color: 'purple' };
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5-album.rating);
    html += `<div class="review"><div class="review__header"><div class="avatar avatar--md avatar--${user.avatar_color || 'purple'}">${user.avatar || user.username.substring(0,2)}</div><div class="review__meta"><div class="review__who"><strong>${user.username}</strong> <span class="text-muted">escuchó</span> <strong>${album.title}</strong> <span class="badge badge--accent">${album.artist}</span></div><div class="flex items-center gap-8"><div class="stars">${stars}</div><span class="text-xs text-hint">${getTimeAgo(new Date(album.created_at))}</span></div></div><div class="review__album-thumb">${getAlbumEmoji(album.title)}</div></div>${album.review ? `<div class="review__text">${album.review}</div>` : ''}</div>`;
  });
  container.innerHTML = html;
}

// ============ EXPLORAR ============
async function loadExplorePage() {
  const container = document.getElementById('explore-container');
  if (!container) return;
  
  if (!supabase) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('title, artist, genre, rating')
    .limit(50);
  
  if (error || !data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-compass"></i><p>Sin álbumes populares</p><button class="btn btn--primary btn--sm mt-8" onclick="openAddAlbumModal()">Agregar primero</button></div>`;
    return;
  }
  
  // Agrupar por título/artista
  const map = new Map();
  data.forEach(album => {
    const key = `${album.title}|${album.artist}`;
    if (!map.has(key)) {
      map.set(key, { title: album.title, artist: album.artist, genre: album.genre, count: 1, ratings: [album.rating] });
    } else {
      const ex = map.get(key);
      ex.count++;
      ex.ratings.push(album.rating);
    }
  });
  
  const popular = Array.from(map.values()).sort((a,b) => b.count - a.count).slice(0, 30);
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:16px;">';
  popular.forEach(p => {
    const avg = p.ratings.reduce((s,v)=>s+v,0)/p.ratings.length;
    const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg));
    html += `<div class="card card--hover" style="text-align:center; padding:16px; cursor:pointer;" onclick="quickAddAlbum('${escapeHtml(p.title)}','${escapeHtml(p.artist)}')"><div style="font-size:56px;">${getAlbumEmoji(p.title)}</div><div class="font-weight-600">${p.title}</div><div class="text-sm text-muted">${p.artist}</div><div class="stars mt-6" style="justify-content:center;">${stars}</div><div class="text-xs text-muted mt-4">${p.count} usuario(s)</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============ PERFIL ============
async function loadProfile() {
  if (!currentUser) return;
  
  const usernameEl = document.getElementById('profile-username');
  const bioEl = document.getElementById('profile-bio');
  const albumsEl = document.getElementById('profile-albums');
  const reviewsEl = document.getElementById('profile-reviews');
  const totalAlbumsStat = document.getElementById('totalAlbumsStat');
  const avgRatingEl = document.getElementById('avgRating');
  
  if (usernameEl) usernameEl.textContent = currentUser.username;
  if (bioEl) bioEl.textContent = currentUser.bio || 'Añade una descripción a tu perfil';
  
  if (!supabase) return;
  
  const { count: albumCount } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);
  
  const { count: reviewCount } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id)
    .not('review', 'is', null);
  
  if (albumsEl) albumsEl.textContent = albumCount || 0;
  if (reviewsEl) reviewsEl.textContent = reviewCount || 0;
  if (totalAlbumsStat) totalAlbumsStat.textContent = albumCount || 0;
  
  if (albumCount > 0 && avgRatingEl) {
    const { data } = await supabase
      .from('albums')
      .select('rating')
      .eq('user_id', currentUser.id);
    
    if (data && data.length > 0) {
      const avg = data.reduce((sum, a) => sum + a.rating, 0) / data.length;
      avgRatingEl.textContent = avg.toFixed(1);
    }
  }
}

// ============ FOROS ============
async function loadForums() {
  const container = document.getElementById('forums-container');
  if (!container) return;
  
  if (!supabase) return;
  
  let query = supabase.from('forums').select('*');
  if (currentForumFilter !== 'todos') {
    query = query.eq('category', currentForumFilter);
  }
  
  const { data, error } = await query;
  
  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay foros</div>';
    return;
  }
  
  let html = '';
  for (const forum of data) {
    const { count: postCount } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true })
      .eq('forum_id', forum.id);
    
    html += `<div class="card mb-16" onclick="openForum('${forum.id}')" style="cursor:pointer;"><div style="display:flex; justify-content:space-between;"><div><h3>${getCategoryIcon(forum.category)} ${forum.name}</h3><p class="text-sm text-muted">${forum.description}</p><div class="flex gap-12 mt-8"><span class="text-xs text-muted"><i class="ti ti-message"></i> ${postCount || 0} publicaciones</span><span class="badge badge--muted">${forum.category}</span></div></div><i class="ti ti-chevron-right"></i></div></div>`;
  }
  container.innerHTML = html;
}

async function openForum(forumId) {
  if (!supabase) return;
  
  const { data: forum } = await supabase
    .from('forums')
    .select('*')
    .eq('id', forumId)
    .single();
  
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('forum_id', forumId)
    .order('created_at', { ascending: false });
  
  let postsHtml = !posts || posts.length === 0 ? '<div class="empty-state">Sin publicaciones. Sé el primero.</div>' : '';
  if (posts) {
    posts.forEach(p => {
      postsHtml += `<div class="review"><div class="review__header"><div class="avatar avatar--sm avatar--purple">${(p.username||'U').substring(0,2)}</div><div class="review__meta"><div class="review__who"><strong>${p.username||'Usuario'}</strong> <span class="text-xs text-hint">${getTimeAgo(new Date(p.created_at))}</span></div><div class="review__text" style="margin-top:8px;">${escapeHtml(p.content)}</div></div></div></div>`;
    });
  }
  
  const modalHtml = `<div class="modal active" id="forumModal" style="display:flex;"><div class="modal__content" style="max-width:600px;"><div class="modal__header"><h3>${forum.name}</h3><span class="modal__close" onclick="closeModal('forumModal')">&times;</span></div><div class="modal__body" style="max-height:60vh; overflow-y:auto;"><div class="mb-16"><p class="text-muted">${forum.description}</p><span class="badge badge--muted">${forum.category}</span></div><div class="section-label">Publicaciones</div>${postsHtml}<div class="form-group mt-16"><textarea id="newPostContent" rows="3" placeholder="Escribe algo..."></textarea></div></div><div class="modal__footer"><button class="btn btn--secondary" onclick="closeModal('forumModal')">Cancelar</button><button class="btn btn--primary" onclick="submitForumPost('${forumId}')">Publicar</button></div></div></div>`;
  
  const old = document.getElementById('forumModal');
  if (old) old.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function submitForumPost(forumId) {
  const content = document.getElementById('newPostContent')?.value.trim();
  if (!content) { showToast('Escribe algo', 'error'); return; }
  
  if (!supabase) return;
  
  const { error } = await supabase
    .from('forum_posts')
    .insert([{
      forum_id: forumId,
      user_id: currentUser.id,
      username: currentUser.username,
      content: content
    }]);
  
  if (error) {
    showToast('Error al publicar', 'error');
  } else {
    showToast('Publicación creada', 'success');
    closeModal('forumModal');
    loadForums();
  }
}

async function createForum() {
  const name = document.getElementById('forumName')?.value.trim();
  const description = document.getElementById('forumDescription')?.value.trim();
  const category = document.getElementById('forumCategory')?.value;
  
  if (!name) { showToast('Ingresa un nombre', 'error'); return; }
  
  if (!supabase) return;
  
  const { error } = await supabase
    .from('forums')
    .insert([{
      name: name,
      description: description || 'Sin descripción',
      category: category || 'general',
      created_by: currentUser.id,
      created_by_username: currentUser.username
    }]);
  
  if (error) {
    showToast('Error al crear foro', 'error');
  } else {
    showToast('Foro creado', 'success');
    closeModal('createForumModal');
    loadForums();
  }
}

// ============ STATS ============
async function loadStatsPage() {
  if (!supabase) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('rating, genre, year, listen_date')
    .eq('user_id', currentUser.id);
  
  const totalAlbumsEl = document.getElementById('totalAlbums');
  const avgRatingEl = document.getElementById('avgRating');
  const streakDaysEl = document.getElementById('streakDays');
  
  if (totalAlbumsEl) totalAlbumsEl.textContent = data?.length || 0;
  
  if (!data || data.length === 0) {
    if (avgRatingEl) avgRatingEl.textContent = '--';
    if (streakDaysEl) streakDaysEl.textContent = '0';
    const ratingDistEl = document.getElementById('rating-distribution');
    if (ratingDistEl) ratingDistEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    const genresEl = document.getElementById('genres-container');
    if (genresEl) genresEl.innerHTML = '<div class="empty-state"><p>Agrega álbumes</p></div>';
    return;
  }
  
  const avg = data.reduce((sum, a) => sum + a.rating, 0) / data.length;
  if (avgRatingEl) avgRatingEl.textContent = avg.toFixed(1);
  
  const ratingDist = {1:0,2:0,3:0,4:0,5:0};
  data.forEach(a => ratingDist[a.rating]++);
  const maxRating = Math.max(...Object.values(ratingDist));
  
  let ratingHtml = '';
  for (let i = 5; i >= 1; i--) {
    const percentage = maxRating > 0 ? (ratingDist[i] / maxRating) * 100 : 0;
    ratingHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:60px;"><span class="star">${'★'.repeat(i)}</span></div><div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div><div style="width:50px;" class="text-muted">${ratingDist[i]}</div></div>`;
  }
  const ratingDistEl = document.getElementById('rating-distribution');
  if (ratingDistEl) ratingDistEl.innerHTML = ratingHtml;
  
  const genres = {};
  data.forEach(a => { if (a.genre) genres[a.genre] = (genres[a.genre] || 0) + 1; });
  const sortedGenres = Object.entries(genres).sort((a,b) => b[1] - a[1]);
  let genreHtml = '';
  sortedGenres.forEach(([genre, count]) => {
    const percentage = (count / data.length) * 100;
    genreHtml += `<div class="flex items-center gap-12 mb-8"><div style="width:120px;">${genre}</div><div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${percentage}%;"></div></div><div style="width:60px;" class="text-muted">${count}</div></div>`;
  });
  const genresEl = document.getElementById('genres-container');
  if (genresEl) genresEl.innerHTML = genreHtml || '<div class="text-muted">Sin datos</div>';
}

// ============ UTILITIES ============
function getAlbumEmoji(title) {
  const emojiMap = {
    'In Rainbows': '🌊', 'OK Computer': '🎹', 'Kid A': '🔮',
    'Kind of Blue': '💙', 'Dark Side of the Moon': '🌙'
  };
  return emojiMap[title] || '💿';
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
  return `hace ${Math.floor(days / 7)} sem`;
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
  localStorage.removeItem('soundlog_current_user');
  window.location.href = 'pages/login.html';
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

function quickAddAlbum(title, artist) {
  const t = document.getElementById('albumTitle');
  const a = document.getElementById('albumArtist');
  if (t) t.value = title;
  if (a) a.value = artist;
  openAddAlbumModal();
}

function switchTab(btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const tabText = btn.textContent.trim().toLowerCase();
  currentFeedTab = tabText === 'amigos' ? 'amigos' : (tabText === 'popular' ? 'popular' : 'global');
  loadFeed();
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
    showToast('Perfil actualizado', 'success');
    closeModal('editProfileModal');
    const bioEl = document.getElementById('profile-bio');
    if (bioEl) bioEl.textContent = newBio || 'Añade una descripción a tu perfil';
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', init);

// Exponer funciones globales
window.openAddAlbumModal = openAddAlbumModal;
window.closeModal = closeModal;
window.submitAlbum = submitAlbum;
window.deleteAlbum = deleteAlbum;
window.logout = logout;
window.switchTab = switchTab;
window.switchProfileTab = switchProfileTab;
window.editProfile = editProfile;
window.saveProfile = saveProfile;
window.openForum = openForum;
window.createForum = createForum;
window.filterForums = (category, btn) => {
  currentForumFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadForums();
};
window.openCreateForumModal = () => {
  const modal = document.getElementById('createForumModal');
  if (modal) modal.classList.add('active');
};
window.quickAddAlbum = quickAddAlbum;
