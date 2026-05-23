// ============================================
// SOUNDLOG - VERSIÓN DE DIAGNÓSTICO
// ============================================

const SUPABASE_URL = 'https://omwdajgpywdwrbiguvfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e4HpONc7gleaNaxEG6FTUQ_5t4JbdLa';

console.log('🚀 Iniciando app...');
console.log('Supabase URL:', SUPABASE_URL);

// Verificar que Supabase está cargado
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase NO está cargado. Revisa que el script esté en tu HTML');
  document.body.innerHTML = '<div style="color:red; padding:20px;">Error: Supabase no cargado. Revisa la consola.</div>';
} else {
  console.log('✅ Supabase cargado correctamente');
}

const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STORAGE_KEYS = { CURRENT_USER: 'soundlog_current_user' };

let currentUser = null;

async function init() {
  console.log('🔄 Inicializando...');
  
  const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  console.log('Usuario guardado:', savedUser ? 'Sí' : 'No');
  
  if (!savedUser) {
    if (!window.location.pathname.includes('login.html')) {
      console.log('🔴 Redirigiendo a login');
      window.location.href = 'pages/login.html';
    }
    return;
  }
  
  currentUser = JSON.parse(savedUser);
  console.log('Usuario actual:', currentUser?.username);
  
  // Actualizar UI
  document.querySelectorAll('.username-display').forEach(el => {
    if (el) el.textContent = currentUser?.username || 'Usuario';
  });
  
  document.querySelectorAll('.user-avatar').forEach(el => {
    if (el) {
      el.textContent = currentUser?.avatar || currentUser?.username?.substring(0,2) || 'U';
    }
  });
  
  // Cargar contador de álbumes
  if (supabase && currentUser) {
    const { count, error } = await supabase
      .from('albums')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    
    if (!error) {
      document.querySelectorAll('.album-count').forEach(el => {
        if (el) el.textContent = count || 0;
      });
    }
  }
  
  console.log('✅ Inicialización completa');
}

// Funciones básicas
function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'pages/login.html';
}

function openAddAlbumModal() {
  alert('Funcionalidad en desarrollo. Por ahora, registra álbumes desde la versión anterior.');
}

// Exponer funciones
window.logout = logout;
window.openAddAlbumModal = openAddAlbumModal;

// Iniciar
document.addEventListener('DOMContentLoaded', init);
