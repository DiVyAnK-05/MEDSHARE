/**
 * MedShare - Client-side Auth & Navigation State
 */
import { API } from './api.js';
import { initMobileMenu } from './ui.js';

let cachedUser = null;

export async function getCurrentUser() {
  if (cachedUser) return cachedUser;

  try {
    const res = await API.auth.getMe();
    if (res.success && res.data?.user) {
      cachedUser = res.data.user;
      return cachedUser;
    }
  } catch (err) {
    cachedUser = null;
  }
  return null;
}

export function clearUserCache() {
  cachedUser = null;
}

export async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser();

  if (!user) {
    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/pages/login.html?redirect=${currentUrl}`;
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert(`Access restricted. Your account role (${user.role}) is not authorized to access this page.`);
    window.location.href = '/pages/dashboard.html';
    return null;
  }

  return user;
}

export async function handleLogout() {
  try {
    await API.auth.logout();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    clearUserCache();
    window.location.href = '/index.html';
  }
}

/**
 * Updates navbar dynamic links depending on logged-in state (Ladder Sidebar Layout)
 */
export function setupNavbar(user) {
  initMobileMenu();
  const authContainer = document.getElementById('navbar-auth-actions');
  const navMenu = document.getElementById('main-nav-links');

  // 1. Populate Ladder Navigation Items
  if (navMenu) {
    const currentPath = window.location.pathname.toLowerCase();

    const ladderItems = [
      { href: '/index.html', label: 'Home Overview', icon: '🏠', active: currentPath === '/' || currentPath.endsWith('/index.html') },
      { href: '/pages/browse.html', label: 'Find Medicine', icon: '🔍', active: currentPath.includes('/browse.html') || currentPath.includes('/medicine-detail.html') },
      { href: '/pages/donate.html', label: 'Donate Medicine', icon: '➕', active: currentPath.includes('/donate.html') },
      { href: '/pages/dashboard.html', label: 'User Dashboard', icon: '📊', active: currentPath.includes('/dashboard.html') },
      { href: '/pages/ngo-partners.html', label: 'NGO Partners', icon: '🏥', active: currentPath.includes('/ngo-partners.html') },
      { href: '/pages/safety.html', label: 'Safety Rules', icon: '🛡️', active: currentPath.includes('/safety.html') },
      { href: '/pages/verification.html', label: 'How It Works', icon: '📋', active: currentPath.includes('/verification.html') },
      { href: '/pages/about.html', label: 'About Us', icon: 'ℹ️', active: currentPath.includes('/about.html') },
      { href: '/pages/contact.html', label: 'Contact Team', icon: '📬', active: currentPath.includes('/contact.html') }
    ];

    navMenu.innerHTML = `
      <div class="ladder-nav-header">
        <span>Navigation</span>
      </div>
      ${ladderItems.map(item => `
        <a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}">
          <span class="ladder-icon">${item.icon}</span>
          <span class="ladder-label">${item.label}</span>
        </a>
      `).join('')}
    `;
  }

  // 2. Populate Auth Actions Area (at the bottom of the ladder)
  if (!authContainer) return;

  if (user) {
    // Clean name of any "(Demo)" or "(Role)" tags
    const cleanName = user.name
      .replace(/\s*\((Lead Creator & )?Admin\)/gi, '')
      .replace(/\s*\(Co-Creator & Admin\)/gi, '')
      .replace(/\s*\(Demo\)/gi, '')
      .replace(/\s*\(Student Donor\)/gi, '')
      .replace(/\s*\(Receiver\)/gi, '')
      .replace(/\s*\(NGO Rep\)/gi, '')
      .trim();

    // Authenticated state
    const initials = cleanName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'US';

    const roleBadge = user.role === 'admin' 
      ? '<span class="badge badge-amber" style="font-size:10px; padding:2px 8px;">ADMIN</span>' 
      : `<span class="badge badge-verified" style="font-size:10px; padding:2px 8px; text-transform:uppercase;">${user.role}</span>`;

    const cleanLocality = (user.locality || 'Ghaziabad')
      .replace(/\s*\(Muradnagar,\s*Ghaziabad\)/gi, '')
      .replace(/KIET Campus\s*\(?/gi, '')
      .replace(/\)?/gi, '')
      .trim() || 'Ghaziabad';

    authContainer.innerHTML = `
      <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--color-medical-teal); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0;">
            ${initials}
          </div>
          <div style="overflow:hidden; line-height:1.2;">
            <div style="font-weight:700; font-size:13px; color:#ffffff; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
              ${cleanName}
            </div>
            <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
              ${roleBadge}
              <span style="font-size:10px; color:#8BA0AA; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">📍 ${cleanLocality}</span>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
          ${user.role === 'admin' ? `
            <a href="/pages/admin.html" class="btn btn-secondary btn-sm btn-full" style="background:#0B1F2A; color:#FFB224; border-color:#FFB224; font-size:11px; padding:6px 10px; justify-content:flex-start;">
              <span>🛡️</span> Admin Portal
            </a>
          ` : ''}
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <a href="/pages/profile.html" class="btn btn-secondary btn-sm" style="font-size:11px; color:#cbd5e1; border-color:rgba(255,255,255,0.15); padding:6px 8px;">
              Profile
            </a>
            <a href="/pages/settings.html" class="btn btn-secondary btn-sm" style="font-size:11px; color:#cbd5e1; border-color:rgba(255,255,255,0.15); padding:6px 8px;">
              Settings
            </a>
          </div>
          <button id="logout-menu-btn" class="btn btn-secondary btn-sm btn-full" style="color:var(--color-danger); border-color:rgba(239,68,68,0.3); font-size:11px; padding:6px 10px; margin-top:2px;">
            Log Out
          </button>
        </div>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-menu-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  } else {
    // Guest state
    authContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:10px; font-weight:700; color:#8BA0AA; text-transform:uppercase; letter-spacing:0.5px;">Account</div>
        <a href="/pages/login.html" class="btn btn-secondary btn-sm btn-full" style="color:#ffffff; border-color:rgba(255,255,255,0.25);">
          Log In
        </a>
        <a href="/pages/signup.html" class="btn btn-primary btn-sm btn-full">
          Create Account
        </a>
      </div>
    `;
  }
}
