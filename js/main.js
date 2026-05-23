const SUPABASE_URL = 'https://omwdajgpywdwrbiguvfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e4HpONc7gleaNaxEG6FTUQ_5t4JbdLa';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// Función auxiliar para redirigir al login de forma inteligente
function irAlLogin() {
  const enPages = window.location.pathname.includes('/pages/');
  window.location.href = enPages ? 'login.html' : 'pages/login.html';
}

async function init() {
  const savedUser = localStorage.getItem('soundlog_current_user');
  
  if (!savedUser) {
    irAlLogin();
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  
  const { data, error } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
  
  if (error || !data) {
    localStorage.removeItem('soundlog_current_user');
    irAlLogin();
    return;
  }
  
  currentUser = data;
  
  document.querySelectorAll('.username-display').forEach(el => el.textContent = currentUser.username);
  document.querySelectorAll('.user-avatar').forEach(el => el.textContent = currentUser.avatar || currentUser.username.substring(0,2));
  
  const { count } = await supabase.from('albums').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
  document.querySelectorAll('.album-count').forEach(el => el.textContent = count || 0);
  
  await loadFeed();
}

async function loadFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  
  const { data, error } = await supabase.from('albums').select('*, users:user_id(username, avatar, avatar_color)').order('created_at', { ascending: false }).limit(20);
  
  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay reseñas aún</div>';
    return;
  }
  
  let html = '';
  data.forEach(album => {
    const user = album.users || { username: 'Usuario', avatar: 'U', avatar_color: 'purple' };
    const stars = '★'.repeat(album.rating) + '☆'.repeat(5 - album.rating);
    html += `<div class="review"><div class="review__header"><div class="avatar avatar--md avatar--${user.avatar_color}">${user.avatar || user.username.substring(0,2)}</div><div class="review__meta"><div class="review__who"><strong>${user.username}</strong> escuchó <strong>${album.title}</strong> <span class="badge badge--accent">${album.artist}</span></div><div class="stars">${stars}</div></div><div class="review__album-thumb">💿</div></div>${album.review ? `<div class="review__text">${album.review}</div>` : ''}</div>`;
  });
  container.innerHTML = html;
}

async function submitAlbum() {
  const title = document.getElementById('albumTitle').value.trim();
  const artist = document.getElementById('albumArtist').value.trim();
  const rating = parseInt(document.getElementById('albumRating').value);
  const review = document.getElementById('albumReview').value.trim();
  
  if (!title || !artist) { alert('Completa título y artista'); return; }
  
  const { error } = await supabase.from('albums').insert([{ user_id: currentUser.id, title, artist, rating, review, listen_date: new Date().toISOString().split('T')[0] }]);
  
  if (error) { alert('Error: ' + error.message); } 
  else { alert('Álbum agregado'); closeModal('addAlbumModal'); location.reload(); }
}

function openAddAlbumModal() { document.getElementById('addAlbumModal').classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function logout() { 
  localStorage.removeItem('soundlog_current_user'); 
  irAlLogin(); 
}

window.openAddAlbumModal = openAddAlbumModal;
window.closeModal = closeModal;
window.submitAlbum = submitAlbum;
window.logout = logout;

document.addEventListener('DOMContentLoaded', init);
