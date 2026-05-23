// ============================================
// SOUNDLOG — main.js (VERSIÓN FUNCIONAL)
// ============================================

const SUPABASE_URL = 'https://omwdajgpywdwrbiguvfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e4HpONc7gleaNaxEG6TUQ_5t4JbdLa';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

async function init() {
  const savedUser = localStorage.getItem('soundlog_current_user');
  
  if (!savedUser) {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'pages/login.html';
    }
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  
  // Verificar usuario en Supabase
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
  
  // Actualizar UI
  document.querySelectorAll('.username-display').forEach(el => {
    if (el) el.textContent = currentUser.username;
  });
  
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (el) el.textContent = currentUser.avatar || currentUser.username.substring(0,2);
  });
  
  // Cargar contador de álbumes
  const { count } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);
  
  document.querySelectorAll('.album-count').forEach(el => {
    if (el) el.textContent = count || 0;
  });
  
  // Cargar feed
  await loadFeed();
}

async function loadFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  
  const { data, error } = await supabase
    .from('albums')
    .select('*, users:user_id(username, avatar, avatar_color)')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay reseñas aún. ¡Agrega tu primer álbum!</div>';
    return;
  }
  
  let html = '';
  data.forEach(album => {
    const user = album.users || { username: 'Usuario', avatar: 'U', avatar_color: 'purple' };
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5 - album.rating);
    html += `
      <div class="review">
        <div class="review__header">
          <div class="avatar avatar--md avatar--${user.avatar_color}">${user.avatar || user.username.substring(0,2)}</div>
          <div class="review__meta">
            <div class="review__who">
              <strong>${user.username}</strong> <span class="text-muted">escuchó</span>
              <strong>${album.title}</strong> <span class="badge badge--accent">${album.artist}</span>
            </div>
            <div class="stars">${stars}</div>
          </div>
          <div class="review__album-thumb">💿</div>
        </div>
        ${album.review ? `<div class="review__text">${album.review}</div>` : ''}
      </div>
    `;
  });
  container.innerHTML = html;
}

function openAddAlbumModal() {
  alert('Próximamente: podrás agregar álbumes. Por ahora, la conexión a Supabase funciona correctamente.');
}

function logout() {
  localStorage.removeItem('soundlog_current_user');
  window.location.href = 'pages/login.html';
}

// Funciones globales
window.openAddAlbumModal = openAddAlbumModal;
window.logout = logout;

document.addEventListener('DOMContentLoaded', init);
