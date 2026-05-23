const SUPABASE_URL = 'https://omwdajgpywdwrbiguvfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e4HpONc7gleaNaxEG6FTUQ_5t4JbdLa';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

async function checkAuth() {
    const savedUser = localStorage.getItem('soundlog_current_user');
    if (!savedUser) {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/albumbyalbum/pages/login.html';
        }
        return;
    }
    currentUser = JSON.parse(savedUser);
}

function logout() {
    localStorage.removeItem('soundlog_current_user');
    window.location.href = '/albumbyalbum/pages/login.html';
}

document.addEventListener('DOMContentLoaded', checkAuth);

window.supabase = supabase;
window.currentUser = currentUser;
window.logout = logout;
