/**
 * UI Components Library - ArchiClean Banking App
 *
 * Reusable frontend components following the principle:
 * NO TECHNICAL IDs VISIBLE - Users interact only with visual elements
 */

// ========== GLOBAL STATE MANAGEMENT ==========
let selectedClientId = null;
let currentSection = null;

/**
 * Store selected client ID globally (from dashboard selection)
 */
function setSelectedClient(clientId) {
  selectedClientId = clientId;
  console.log('✅ Selected client:', clientId);

  // Dispatch custom event to notify components
  document.dispatchEvent(new CustomEvent('client-selected', { detail: { clientId } }));
}

/**
 * Get currently selected client ID
 */
function getSelectedClient() {
  return selectedClientId;
}

// ========== DATA TABLE COMPONENT ==========

/**
 * Render a generic data table with action buttons
 *
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions [{ label, field, format? }]
 * @param {Array} actions - Action button definitions [{ label, class, handler }]
 * @returns {string} HTML string for the table
 *
 * @example
 * renderDataTable(
 *   users,
 *   [
 *     { label: 'Name', field: 'firstName' },
 *     { label: 'Email', field: 'email' }
 *   ],
 *   [
 *     { label: 'View', class: 'btn-secondary', handler: 'viewUser' }
 *   ]
 * )
 */
function renderDataTable(data, columns, actions = []) {
  if (!data || data.length === 0) {
    return '<p class="muted">Aucune donnée disponible</p>';
  }

  const headers = columns.map(col => `<th>${col.label}</th>`).join('');
  const rows = data.map(item => {
    const cells = columns.map(col => {
      const value = item[col.field];
      const formatted = col.format ? col.format(value, item) : value;
      return `<td>${formatted !== undefined && formatted !== null ? formatted : '-'}</td>`;
    }).join('');

    const actionButtons = actions.map(action => {
      const onClick = action.handler.includes('(')
        ? action.handler.replace('ID', `'${item.id}'`)
        : `${action.handler}('${item.id}')`;
      return `
        <button class="btn btn-small ${action.class}" onclick="${onClick}">
          ${action.label}
        </button>
      `;
    }).join(' ');

    return `
      <tr>
        ${cells}
        ${actions.length > 0 ? `<td class="actions-cell">${actionButtons}</td>` : ''}
      </tr>
    `;
  }).join('');

  return `
    <table class="data-table">
      <thead>
        <tr>
          ${headers}
          ${actions.length > 0 ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ========== DROPDOWN AUTO-POPULATE ==========

/**
 * Auto-populate a dropdown with data from an API endpoint
 *
 * @param {string} selectId - ID of the select element
 * @param {string} endpoint - API endpoint to fetch data from
 * @param {Function} labelFn - Function to extract label from item
 * @param {Function} valueFn - Function to extract value from item
 *
 * @example
 * await populateDropdown(
 *   'stockSelector',
 *   '/api/stocks',
 *   item => `${item.symbol} - ${item.name}`,
 *   item => item.id
 * )
 */
async function populateDropdown(selectId, endpoint, labelFn, valueFn) {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response formats
    const items = Array.isArray(data)
      ? data
      : (data.items || data.data || data.stocks || data.orders || []);

    const select = document.getElementById(selectId);
    if (!select) {
      console.error(`Select element #${selectId} not found`);
      return;
    }

    select.innerHTML = '<option value="">-- Sélectionner --</option>' +
      items.map(item =>
        `<option value="${valueFn(item)}">${labelFn(item)}</option>`
      ).join('');

    console.log(`✅ Populated dropdown #${selectId} with ${items.length} items`);
  } catch (error) {
    console.error(`❌ Failed to populate dropdown #${selectId}:`, error);
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
  }
}

// ========== LIVE SEARCH WITH DEBOUNCE ==========

/**
 * Setup live search with debouncing
 *
 * @param {string} inputId - ID of the search input element
 * @param {Function} searchFn - Async function to call with search query
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 *
 * @example
 * setupLiveSearch('userSearch', async (query) => {
 *   const response = await fetch(`/api/users/search?q=${query}`);
 *   const users = await response.json();
 *   displayResults(users);
 * });
 */
function setupLiveSearch(inputId, searchFn, delay = 300) {
  let timeout;
  const input = document.getElementById(inputId);

  if (!input) {
    console.error(`Input element #${inputId} not found`);
    return;
  }

  input.addEventListener('input', (e) => {
    clearTimeout(timeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      return;
    }

    timeout = setTimeout(() => {
      searchFn(query).catch(error => {
        console.error('Search error:', error);
      });
    }, delay);
  });

  console.log(`✅ Live search setup for #${inputId}`);
}

// ========== CARD RENDERERS ==========

/**
 * Render a user card with action buttons
 */
function renderUserCard(user, actions = []) {
  const actionButtons = actions.map(action =>
    `<button class="btn btn-small ${action.class}" onclick="${action.handler}('${user.id}')">
      ${action.label}
    </button>`
  ).join(' ');

  return `
    <div class="user-card">
      <div class="user-card-header">
        <h4>${user.firstName} ${user.lastName}</h4>
        ${user.isOnline ? '<span class="badge badge-success">En ligne</span>' : ''}
      </div>
      <p class="muted">${user.email}</p>
      ${actions.length > 0 ? `<div class="user-card-actions">${actionButtons}</div>` : ''}
    </div>
  `;
}

/**
 * Render an order card
 */
function renderOrderCard(order) {
  const statusClass = order.status === 'PENDING' ? 'badge-warning' :
                      order.status === 'EXECUTED' ? 'badge-success' : 'badge-danger';

  return `
    <div class="order-card">
      <div class="order-header">
        <h4>${order.stockSymbol} - ${order.orderType}</h4>
        <span class="badge ${statusClass}">${order.status}</span>
      </div>
      <div class="order-details">
        <p>Quantité: ${order.quantity} | Prix: ${order.price}€</p>
        ${order.createdAt ? `<p class="muted">${new Date(order.createdAt).toLocaleString()}</p>` : ''}
      </div>
      ${order.status === 'PENDING' ? `
        <button class="btn btn-small btn-primary" onclick="executeOrderById('${order.id}', ${order.price})">
          ✅ Exécuter l'ordre
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render a group card
 */
function renderGroupCard(group, isMyGroup = false) {
  return `
    <div class="group-card">
      <div class="group-header">
        <h4>
          ${group.name}
          ${group.isAdmin ? '<span class="badge badge-warning">ADMIN</span>' : ''}
        </h4>
        ${group.visibility ? `<span class="badge badge-secondary">${group.visibility}</span>` : ''}
      </div>
      ${group.description ? `<p>${group.description}</p>` : ''}
      <p class="muted">
        ${group.memberCount ? `${group.memberCount} membres` : ''}
        ${group.creatorName ? ` | Créé par ${group.creatorName}` : ''}
      </p>
      <div class="group-actions">
        ${isMyGroup ? `
          <button class="btn btn-small btn-secondary" onclick="viewGroupMembers('${group.id}')">
            👥 Membres
          </button>
          <button class="btn btn-small btn-danger" onclick="leaveGroupById('${group.id}')">
            🚪 Quitter
          </button>
        ` : `
          <button class="btn btn-small btn-primary" onclick="joinGroupById('${group.id}')">
            ➕ Rejoindre
          </button>
        `}
      </div>
    </div>
  `;
}

// ========== GRID LAYOUT RENDERER ==========

/**
 * Render items in a responsive grid
 */
function renderGrid(items, itemRenderer) {
  if (!items || items.length === 0) {
    return '<p class="muted">Aucun élément à afficher</p>';
  }

  return `
    <div class="grid-container">
      ${items.map(item => itemRenderer(item)).join('')}
    </div>
  `;
}

// ========== LOADING & ERROR STATES ==========

/**
 * Show loading spinner in element
 */
function showLoading(elementId, message = 'Chargement...') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="muted">${message}</p>
      </div>
    `;
  }
}

/**
 * Show error message in element
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="error-container">
        <p class="error">❌ ${message}</p>
      </div>
    `;
  }
}

/**
 * Show success message in element
 */
function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="success-container">
        <p class="success">✅ ${message}</p>
      </div>
    `;
  }
}

// ========== API HELPERS ==========

/**
 * Generic API call with error handling
 */
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ========== FORMAT HELPERS ==========

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date and time
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString('fr-FR');
}

/**
 * Format relative time (e.g., "il y a 2 heures")
 */
function formatRelativeTime(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'à l\'instant';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)}j`;

  return formatDate(date);
}

// ========== SECTION NAVIGATION ==========

/**
 * Dispatch section change event
 */
function navigateToSection(sectionName) {
  currentSection = sectionName;
  document.dispatchEvent(new CustomEvent('section-show', {
    detail: { section: sectionName }
  }));
}

// ========== EXPORT FOR GLOBAL USE ==========
console.log('✅ UI Components Library loaded');
