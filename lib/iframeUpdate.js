function applyLanguageFilter(lang) {
    document.documentElement.setAttribute('lang', lang);
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.lang) {
        applyLanguageFilter(event.data.lang);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('selectedLang') || 'da';
    applyLanguageFilter(lang);
});

window.addEventListener('message', (event) => {
    // Optionally validate event.origin if cross-origin
    const layout = event.data.layout;
    if (layout === 'side' || layout === 'bottom') {
        document.body.setAttribute('data-layout', layout);
    }
});

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener("click", function(e) {
      const id = this.getAttribute("href").substring(1);
      window.parent.postMessage({ type: "linkClick", id: id }, "*");
    });
  });
});