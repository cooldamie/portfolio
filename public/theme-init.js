// Runs in <head> before first paint. Applies a saved light/dark choice; otherwise the
// page follows the system setting through CSS alone.
(function () {
  try {
    var theme = window.localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch {
    // Storage can be blocked (private mode, strict settings). The system setting still applies.
  }
})();
