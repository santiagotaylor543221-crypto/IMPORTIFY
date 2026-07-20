import { renderLanding }   from './views/landing.js';
import { renderSimulator } from './views/simulator.js';
import { renderDashboard } from './views/dashboard.js';

const routes = {
  '/':          renderLanding,
  '/simulator': renderSimulator,
  '/dashboard': renderDashboard,
};

export function router() {
  const path = window.location.hash.slice(1) || '/';
  const render = routes[path] || renderLanding;
  render();
  highlightNav(path);
}

function highlightNav(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const active = link.dataset.route === path;
    link.classList.toggle('border-teal-300', active);
    link.classList.toggle('text-white', active);
    link.classList.toggle('border-transparent', !active);
  });
}

window.addEventListener('hashchange', router);
