/**
 * MedShare - UI Utilities & Accessibility Engine
 */

// Toast notification helper
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-notification-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span style="font-size: 18px; line-height: 1;">${icon}</span>
    <div style="flex-grow: 1; font-size: 14px; font-weight: 500;">${message}</div>
    <button type="button" style="background:none; border:none; cursor:pointer; font-size: 16px; color:#888;" aria-label="Dismiss notification">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Modal helper
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Find first focusable element
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) {
    focusable[0].focus();
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Apply accessibility settings to <body>
export function applyAccessibilitySettings(settings = {}) {
  const body = document.body;

  // Text size
  body.classList.remove('text-size-large', 'text-size-xlarge');
  if (settings.textSize === 'large') {
    body.classList.add('text-size-large');
  } else if (settings.textSize === 'x-large') {
    body.classList.add('text-size-xlarge');
  }

  // High contrast
  if (settings.highContrast) {
    body.classList.add('high-contrast');
  } else {
    body.classList.remove('high-contrast');
  }

  // Reduced motion
  if (settings.reducedMotion) {
    body.classList.add('reduced-motion');
  } else {
    body.classList.remove('reduced-motion');
  }
}

// Init mobile navigation drawer
export function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('mobile-drawer-open');
      const isExpanded = document.body.classList.contains('mobile-drawer-open');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('mobile-drawer-open')) {
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.contains(e.target)) {
          document.body.classList.remove('mobile-drawer-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}
