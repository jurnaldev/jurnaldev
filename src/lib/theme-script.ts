// This script runs inline before React hydrates to prevent theme flash
export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('jurnal-dev-theme');
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var resolved;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  } catch(e) {}
})();
`
