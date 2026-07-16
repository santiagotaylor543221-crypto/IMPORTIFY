import { renderLanding } from './views/landing.js';
import { renderSimulator } from './views/simulator.js';
import { renderDashboard } from './views/dashboard.js';


const routes = {
  '/': renderLanding,
  '/simulator': renderSimulator,
  '/dashboard': renderDashboard,
};

export function router() {
  const path = window.location.hash.slice(1) || '/';
  const renderView = routes[path] || renderLanding;
  renderView();
  highlightActiveLink(path);
}

function highlightActiveLink(path) {
  document.querySelectorAll('.nav-link').forEach((link) => {
    const isActive = link.dataset.route === path;
    link.classList.toggle('border-teal-300', isActive);
    link.classList.toggle('text-white', isActive);
  });
}

window.addEventListener('hashchange', router);
