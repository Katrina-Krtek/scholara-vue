import { ref, watch } from 'vue';

const THEME_KEY = 'scholar-theme';

const themes = {
  'warm-light': {
    label: 'Warm Light',
    '--bg-primary': '#faf7f2',
    '--bg-secondary': '#f0ebe3',
    '--bg-card': '#ffffff',
    '--bg-sidebar': '#f5f0e8',
    '--bg-accent': '#6366f1',
    '--bg-tertiary': '#e8e2d9',
    '--border-color': 'rgba(0,0,0,0.08)',
    '--text-primary': '#1a1a2e',
    '--text-secondary': '#4a4a6a',
    '--text-muted': '#8a8aaa',
    '--text-on-accent': '#ffffff',
    '--accent': '#6366f1',
    '--accent-soft': 'rgba(99,102,241,0.12)',
    '--accent-text': '#4f46e5',
    '--accent-warning': '#f97316',
    '--sidebar-border': 'rgba(0,0,0,0.08)',
    '--input-bg': 'rgba(0,0,0,0.04)',
    '--btn-bg': 'rgba(0,0,0,0.05)',
    '--btn-hover': 'rgba(0,0,0,0.09)',
    '--shadow': '0 2px 12px rgba(0,0,0,0.08)',
  },
  'soft-dark': {
    label: 'Soft Dark',
    '--bg-primary': '#1e1e2e',
    '--bg-secondary': '#181825',
    '--bg-card': '#252537',
    '--bg-sidebar': '#181825',
    '--bg-accent': '#89b4fa',
    '--bg-tertiary': '#313244',
    '--border-color': 'rgba(255,255,255,0.08)',
    '--text-primary': '#cdd6f4',
    '--text-secondary': '#a6adc8',
    '--text-muted': '#6c7086',
    '--text-on-accent': '#1e1e2e',
    '--accent': '#89b4fa',
    '--accent-soft': 'rgba(137,180,250,0.15)',
    '--accent-text': '#89b4fa',
    '--accent-warning': '#fab387',
    '--sidebar-border': 'rgba(255,255,255,0.06)',
    '--input-bg': 'rgba(255,255,255,0.05)',
    '--btn-bg': 'rgba(255,255,255,0.05)',
    '--btn-hover': 'rgba(255,255,255,0.1)',
    '--shadow': '0 2px 12px rgba(0,0,0,0.4)',
  },
  'dark-navy': {
    label: 'Dark Navy',
    '--bg-primary': '#020617',
    '--bg-secondary': '#0f172a',
    '--bg-card': '#0f172a',
    '--bg-sidebar': '#0f172a',
    '--bg-accent': '#6366f1',
    '--bg-tertiary': '#1e293b',
    '--border-color': 'rgba(148,163,184,0.12)',
    '--text-primary': '#f9fafb',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#64748b',
    '--text-on-accent': '#ffffff',
    '--accent': '#6366f1',
    '--accent-soft': 'rgba(99,102,241,0.2)',
    '--accent-text': '#a5b4fc',
    '--accent-warning': '#f97316',
    '--sidebar-border': 'rgba(148,163,184,0.15)',
    '--input-bg': 'rgba(255,255,255,0.06)',
    '--btn-bg': 'rgba(255,255,255,0.05)',
    '--btn-hover': 'rgba(255,255,255,0.1)',
    '--shadow': '0 2px 12px rgba(0,0,0,0.6)',
  },
  'true-light': {
    label: 'True Light',
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8f9fa',
    '--bg-card': '#ffffff',
    '--bg-sidebar': '#f1f3f5',
    '--bg-accent': '#6366f1',
    '--bg-tertiary': '#e9ecef',
    '--border-color': 'rgba(0,0,0,0.1)',
    '--text-primary': '#111827',
    '--text-secondary': '#374151',
    '--text-muted': '#9ca3af',
    '--text-on-accent': '#ffffff',
    '--accent': '#6366f1',
    '--accent-soft': 'rgba(99,102,241,0.1)',
    '--accent-text': '#4f46e5',
    '--accent-warning': '#f97316',
    '--sidebar-border': 'rgba(0,0,0,0.1)',
    '--input-bg': 'rgba(0,0,0,0.04)',
    '--btn-bg': 'rgba(0,0,0,0.04)',
    '--btn-hover': 'rgba(0,0,0,0.08)',
    '--shadow': '0 2px 12px rgba(0,0,0,0.06)',
  },
  'high-contrast': {
    label: 'High Contrast',
    '--bg-primary': '#000000',
    '--bg-secondary': '#0a0a0a',
    '--bg-card': '#111111',
    '--bg-sidebar': '#0a0a0a',
    '--bg-accent': '#ffff00',
    '--bg-tertiary': '#1a1a1a',
    '--border-color': 'rgba(255,255,255,0.3)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#e5e5e5',
    '--text-muted': '#aaaaaa',
    '--text-on-accent': '#000000',
    '--accent': '#ffff00',
    '--accent-soft': 'rgba(255,255,0,0.15)',
    '--accent-text': '#ffff00',
    '--accent-warning': '#ff6600',
    '--sidebar-border': 'rgba(255,255,255,0.2)',
    '--input-bg': 'rgba(255,255,255,0.08)',
    '--btn-bg': 'rgba(255,255,255,0.08)',
    '--btn-hover': 'rgba(255,255,255,0.15)',
    '--shadow': '0 2px 12px rgba(0,0,0,0.8)',
  }
};

const currentTheme = ref(localStorage.getItem(THEME_KEY) || 'warm-light');

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      root.style.setProperty(key, value);
    }
  });
  localStorage.setItem(THEME_KEY, themeName);
  currentTheme.value = themeName;
}

// Apply on load
applyTheme(currentTheme.value);

export function useTheme() {
  watch(currentTheme, (val) => applyTheme(val));

  function setTheme(themeName) {
    applyTheme(themeName);
  }

  return {
    currentTheme,
    themes,
    setTheme
  };
}