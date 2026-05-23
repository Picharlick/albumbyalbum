/* =============================================
   SOUNDLOG — main.js
   Lógica de UI base (sin backend)
   ============================================= */

/* ---- Feed tabs ---- */
function switchTab(btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

/* ---- Like toggle ---- */
function toggleLike(btn) {
  const icon  = btn.querySelector('i');
  const count = btn.querySelector('span');
  const liked = btn.dataset.liked === 'true';

  btn.dataset.liked = !liked;
  icon.style.color  = liked ? '' : 'var(--accent-light)';
  count.textContent = liked
    ? parseInt(count.textContent) - 1
    : parseInt(count.textContent) + 1;
}

/* ---- Heatmap generator ---- */
function buildHeatmap() {
  const container = document.getElementById('heatmap');
  if (!container) return;

  const levels = ['', 'l1', 'l2', 'l3', 'l4'];
  const weeks  = 26;
  const days   = 7;

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      const rand = Math.random();
      if      (rand > 0.85) cell.classList.add('l4');
      else if (rand > 0.65) cell.classList.add('l3');
      else if (rand > 0.45) cell.classList.add('l2');
      else if (rand > 0.30) cell.classList.add('l1');
      container.appendChild(cell);
    }
  }
}

/* ---- Spotify connect (placeholder) ----
   En producción: usar OAuth 2.0 PKCE con la Spotify API.
   Endpoints clave:
     - /v1/me/player/currently-playing  → "Escuchando ahora"
     - /v1/me/player/recently-played    → Canciones recientes
     - /v1/me/top/artists?time_range=short_term → Top artistas semana
     - /v1/me/top/artists?time_range=medium_term → Top artistas mes
*/
function connectSpotify() {
  const CLIENT_ID    = 'TU_SPOTIFY_CLIENT_ID';
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/callback');
  const SCOPES = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
  ].join('%20');

  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
  window.location.href = url;
}

/* ---- Apple Music connect (placeholder) ----
   Requiere MusicKit JS (developer.apple.com/musickit)
   y Apple Developer account ($99/año).
*/
async function connectAppleMusic() {
  if (!window.MusicKit) {
    console.warn('MusicKit JS no cargado.');
    return;
  }
  const music = MusicKit.getInstance();
  await music.authorize();
  const recentSongs = await music.api.recentlyPlayed();
  console.log('Apple Music recientes:', recentSongs);
}

/* ---- Inicialización ---- */
document.addEventListener('DOMContentLoaded', () => {
  buildHeatmap();
});
