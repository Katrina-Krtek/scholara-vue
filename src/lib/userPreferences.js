const USERNAME_KEY = 'scholarory_username';
const FULL_WIDTH_KEY = 'scholarory-full-width';

export function getStoredUsername() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(name) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERNAME_KEY, name);
}

export function getFullWidth() {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(FULL_WIDTH_KEY);
  if (v === null) return true; // default to full-width
  return v === 'true';
}

export function setFullWidth(val) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FULL_WIDTH_KEY, String(val));
}
const CITATION_STYLE_KEY = 'scholarory_citation_style'

export function getCitationStyle() {
  return localStorage.getItem(CITATION_STYLE_KEY) || 'turabian'
}

export function setCitationStyle(styleId) {
  localStorage.setItem(CITATION_STYLE_KEY, styleId)
}