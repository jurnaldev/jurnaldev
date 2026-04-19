// This script runs inline before React hydrates to prevent theme flash
export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('jurnal-dev-theme');
    var theme = stored || 'system';
    var resolved;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;
