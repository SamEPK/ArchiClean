// Backend Toggle - Shared functionality across all dashboards
const BACKENDS = {
  nestjs: { name: 'NestJS', port: 3000, color: 'nestjs', apiPrefix: '' },
  fastify: { name: 'Fastify', port: 3001, color: 'fastify', apiPrefix: '/api' }
};

let currentBackend = localStorage.getItem('selectedBackend') || 'nestjs';

function updateBackendUI() {
  const backend = BACKENDS[currentBackend];
  const toggle = document.getElementById('backendToggle');
  const nameEl = document.getElementById('backendName');
  const portEl = document.getElementById('backendPort');

  if (!toggle || !nameEl || !portEl) return;

  toggle.className = currentBackend === 'fastify' ? 'toggle-switch active' : 'toggle-switch';
  nameEl.textContent = backend.name;
  nameEl.className = 'backend-name ' + backend.color;
  portEl.textContent = ':' + backend.port;

  // Update base URL display if exists
  const baseUrlEl = document.getElementById('baseUrl');
  if (baseUrlEl) {
    baseUrlEl.textContent = `http://localhost:${backend.port}`;
  }

  console.log(`🔄 Backend switched to: ${backend.name} (port ${backend.port})`);
}

function toggleBackend() {
  currentBackend = currentBackend === 'nestjs' ? 'fastify' : 'nestjs';
  localStorage.setItem('selectedBackend', currentBackend);
  updateBackendUI();
  
  // Reload page to apply new backend
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

function getApiUrl(path) {
  const backend = BACKENDS[currentBackend];
  const prefix = backend.apiPrefix;
  
  // Remove leading slash from path if exists
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // For Fastify, add /api prefix to certain routes
  let finalPath = cleanPath;
  if (currentBackend === 'fastify') {
    // Routes that need /api prefix in Fastify
    const needsPrefix = ['/auth/', '/clients/', '/transactions/', '/stocks/', '/orders/', '/portfolio/', '/savings/'];
    const needsApiPrefix = needsPrefix.some(route => cleanPath.startsWith(route));
    
    if (needsApiPrefix && !cleanPath.startsWith('/api/')) {
      finalPath = '/api' + cleanPath;
    }
  }
  
  return `http://localhost:${backend.port}${finalPath}`;
}

function getCurrentBackend() {
  return BACKENDS[currentBackend];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateBackendUI();
});

// CSS for toggle (can be injected or added to page)
const toggleStyles = `
.backend-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  background: var(--panel, #0f172a);
  border: 1px solid var(--border, rgba(148, 163, 184, 0.25));
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
}
.backend-toggle-label {
  font-size: 13px;
  color: var(--muted, #94a3b8);
  font-weight: 600;
}
.toggle-switch {
  position: relative;
  width: 56px;
  height: 28px;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.3s;
}
.toggle-switch.active {
  background: linear-gradient(135deg, var(--accent, #38bdf8), var(--accent-2, #34d399));
}
.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 12px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.toggle-switch.active .toggle-slider {
  transform: translateX(28px);
}
.backend-name {
  font-size: 13px;
  font-weight: 700;
  min-width: 60px;
}
.backend-name.nestjs {
  color: #e0234e;
}
.backend-name.fastify {
  color: var(--accent, #38bdf8);
}
.backend-port {
  font-size: 11px;
  color: var(--muted, #94a3b8);
  margin-left: 4px;
}
`;

// Inject styles if not already present
if (!document.getElementById('backend-toggle-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'backend-toggle-styles';
  styleEl.textContent = toggleStyles;
  document.head.appendChild(styleEl);
}

// HTML template for toggle
const toggleHTML = `
<div class="backend-toggle">
  <span class="backend-toggle-label">Backend:</span>
  <span class="backend-name" id="backendName">NestJS</span>
  <div class="toggle-switch" id="backendToggle" onclick="toggleBackend()">
    <div class="toggle-slider"></div>
  </div>
  <span class="backend-port" id="backendPort">:3000</span>
</div>
`;

// Auto-inject toggle if element with id 'backend-toggle-container' exists
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('backend-toggle-container');
  if (container) {
    container.innerHTML = toggleHTML;
    updateBackendUI();
  }
});
