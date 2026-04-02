// auth.js — Shared authentication for all DoBiz Africa tools
// Place this file in the root of your app.dobusiness.africa folder

const SUPABASE_URL = 'https://ribrhjtyiovcjofwcewc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYnJoanR5aW92Y2pvZndjZXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTkyNjIsImV4cCI6MjA4ODU3NTI2Mn0.IyKQs_ZS-FBVsed5ET62qyY04tLoAhD3wCXE_HTxKKc';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

let currentUser = null;

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        currentUser = session.user;
        return { loggedIn: true, user: session.user };
    }
    return { loggedIn: false, user: null };
}

// Update UI elements with user info
function updateUserUI() {
    if (currentUser) {
        const name = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
        const initial = name.charAt(0).toUpperCase();
        
        document.querySelectorAll('.user-name').forEach(el => el.textContent = name);
        document.querySelectorAll('.user-avatar').forEach(el => el.textContent = initial);
        document.querySelectorAll('.user-email').forEach(el => el.textContent = currentUser.email);
        
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'flex');
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    } else {
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'flex');
    }
}

// Logout function
async function logout() {
    await sb.auth.signOut();
    currentUser = null;
    updateUserUI();
    window.location.href = '/';
}

// Redirect to login if not authenticated
async function requireAuth() {
    const { loggedIn } = await checkAuth();
    if (!loggedIn) {
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = '/login.html?redirect=' + redirect;
        return false;
    }
    return true;
}

// Initialize auth on page load
async function initAuth() {
    await checkAuth();
    updateUserUI();
    
    sb.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
        } else {
            currentUser = null;
        }
        updateUserUI();
    });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initAuth);