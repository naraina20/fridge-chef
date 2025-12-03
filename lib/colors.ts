export const darkTheme = {
  // used in _layout.tsx / index.tsx current dark values
  background: '#0f172a',        // main app background (index container)
  screenBackground: '#020617',  // header / tab bar background
  surface: '#111827',           // card / surface / borders
  headerBorder: '#111827',
  text: '#f9fafb',              // primary text (titles)
  textSecondary: '#e5e7eb',     // secondary text (subtitles, helpers)
  inactive: '#9ca3af',          // inactive tab/text
  primary: '#f97316',           // brand / icon / tint
  accent: '#ec4899',
  error: '#ef4444',
  offlineBg: '#111827',
  offlineTitle: '#fef3c7',
  offlineText: '#e5e7eb',
};

export const lightTheme = {
  // light-mode equivalents tuned for contrast against darkTheme
  background: '#ffffff',        // main app background
  screenBackground: '#ffffff',  // header / tab bar background
  surface: '#f8fafc',           // subtle surface color
  headerBorder: '#e5e7eb',      // header / tab border
  text: '#0f172a',              // primary text (dark/navy)
  textSecondary: '#6b7280',     // secondary text (muted)
  inactive: '#9ca3af',          // inactive tab/text (keeps same tone)
  primary: '#f97316',           // keep brand color for consistency
  accent: '#ec4899',
  error: '#ef4444',
  offlineBg: '#fff7ed',         // gentle warning background for offline
  offlineTitle: '#92400e',
  offlineText: '#5b616b',
};