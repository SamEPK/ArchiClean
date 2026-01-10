// ========== CONFIGURATION ==========
const baseUrl = window.location.origin;

// ========== UTILS ==========
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  event.target.classList.add('active');
}

async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(baseUrl + path, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = text;
  }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

function showResult(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = isError ? 'result error' : 'result success';
  el.textContent = message;
  setTimeout(() => {
    if (el.className.includes('result')) el.textContent = '';
  }, 5000);
}

// ========== EVENT TRANSLATION ==========
const eventTypeTranslations = {
  'CreditGranted': 'Crédit accordé',
  'OrderExecuted': 'Ordre exécuté',
  'OrderPlaced': 'Ordre placé',
  'FundsTransferred': 'Virement effectué',
  'AccountCreated': 'Compte créé',
  'SavingsInterestApplied': 'Intérêts appliqués',
  'ConversationAssigned': 'Conversation attribuée',
};

function translateEventType(technicalType) {
  return eventTypeTranslations[technicalType] || technicalType;
}

function formatEventData(eventType, data) {
  // Format data based on event type to show only user-relevant info
  switch (eventType) {
    case 'CreditGranted':
      return `Montant: ${data.amount}€ | Taux: ${data.annualRate}% | Durée: ${data.durationMonths} mois`;

    case 'OrderExecuted':
    case 'OrderPlaced':
      return `${data.stockSymbol || data.stockId} × ${data.quantity} | Prix: ${data.executedPrice || data.price}€`;

    case 'FundsTransferred':
      return `Montant: ${data.amount}€ | ${data.fromAccount ? 'De: ' + data.fromAccount : ''} ${data.toAccount ? 'Vers: ' + data.toAccount : ''}`;

    case 'AccountCreated':
      return `Type: ${data.accountType || 'Compte bancaire'} | Devise: ${data.currency || 'EUR'}`;

    case 'ConversationAssigned':
      return `Conseiller: ${data.advisorName || 'N/A'}`;

    default:
      // For unknown types, extract key numeric/string values, hide IDs
      const relevantKeys = Object.keys(data).filter(key =>
        !key.toLowerCase().includes('id') &&
        (typeof data[key] === 'number' || typeof data[key] === 'string')
      );
      return relevantKeys.map(key => `${key}: ${data[key]}`).join(' | ') || 'Événement système';
  }
}

function formatStateObject(stateObj) {
  if (!stateObj || Object.keys(stateObj).length === 0) {
    return '<p class="muted">État vide</p>';
  }

  // Format the state object in a user-friendly way
  const lines = [];

  if (stateObj.amount !== undefined) {
    lines.push(`<div class="profile-item"><strong>Montant:</strong> ${stateObj.amount}€</div>`);
  }
  if (stateObj.annualRate !== undefined) {
    lines.push(`<div class="profile-item"><strong>Taux annuel:</strong> ${stateObj.annualRate}%</div>`);
  }
  if (stateObj.durationMonths !== undefined) {
    lines.push(`<div class="profile-item"><strong>Durée:</strong> ${stateObj.durationMonths} mois</div>`);
  }
  if (stateObj.monthlyPayment !== undefined) {
    lines.push(`<div class="profile-item"><strong>Mensualité:</strong> ${stateObj.monthlyPayment.toFixed(2)}€</div>`);
  }
  if (stateObj.status !== undefined) {
    lines.push(`<div class="profile-item"><strong>Statut:</strong> <span class="badge badge-${stateObj.status === 'ACTIVE' ? 'success' : 'warning'}">${stateObj.status}</span></div>`);
  }
  if (stateObj.eventType !== undefined) {
    lines.push(`<div class="profile-item"><strong>Type:</strong> ${translateEventType(stateObj.eventType)}</div>`);
  }

  // If no specific fields matched, show a generic message
  if (lines.length === 0) {
    lines.push('<p class="muted">État reconstitué disponible</p>');
  }

  return lines.join('');
}

// ========== SECTION 1: HTTP ADAPTER ==========
async function refreshAdapterStatus() {
  try {
    const data = await api('/api/system/adapter-status');

    document.getElementById('adapterBadge').textContent = data.adapter.toUpperCase();
    document.getElementById('uptime').textContent = data.uptimeFormatted || data.uptime + 's';
    document.getElementById('platform').textContent = data.platform || 'N/A';

    const switchBtn = document.querySelector('button[onclick="switchAdapter()"]');
    if (switchBtn) {
      const targetAdapter = data.adapter === 'express' ? 'Fastify' : 'Express';
      switchBtn.textContent = `🔄 Changer vers ${targetAdapter}`;
    }
  } catch (err) {
    console.error('Error fetching adapter status:', err);
  }
}

async function refreshDatabaseStatus() {
  try {
    const data = await api('/api/system/database-status');

    document.getElementById('dbType').textContent = data.databaseType === 'mongodb' ? 'MongoDB' : 'In-Memory';
    document.getElementById('dbStatus').textContent = data.connected ? '✅ Connecté' : '⚠️ Déconnecté';

    const switchBtn = document.querySelector('button[onclick="switchDatabase()"]');
    if (switchBtn) {
      const targetDb = data.databaseType === 'mongodb' ? 'In-Memory' : 'MongoDB';
      switchBtn.textContent = `🔄 Changer vers ${targetDb}`;
    }
  } catch (err) {
    console.error('Error fetching database status:', err);
    document.getElementById('dbType').textContent = 'Erreur';
    document.getElementById('dbStatus').textContent = '❌ Non disponible';
  }
}

async function switchDatabase() {
  try {
    const currentType = document.getElementById('dbType').textContent;
    const targetType = currentType.includes('MongoDB') ? 'memory' : 'mongodb';

    showResult('res-dbSwitch', 'Changement de base de données en cours...', false);

    const data = await api('/api/system/switch-database', {
      method: 'POST',
      body: { databaseType: targetType }
    });

    if (data.success) {
      showResult('res-dbSwitch', `${data.message} 🔄 Rechargez la page pour appliquer les changements.`, false);
      setTimeout(() => refreshDatabaseStatus(), 2000);
    } else {
      showResult('res-dbSwitch', data.message, true);
    }
  } catch (err) {
    showResult('res-dbSwitch', err.message, true);
  }
}

async function switchAdapter() {
  try {
    const currentAdapter = document.getElementById('adapterBadge').textContent.toLowerCase();
    const targetAdapter = currentAdapter === 'express' ? 'fastify' : 'express';

    showResult('res-adapterSwitch', 'Changement d\'adaptateur en cours...', false);

    const data = await api('/api/system/switch-adapter', {
      method: 'POST',
      body: { adapter: targetAdapter }
    });

    if (data.success) {
      showResult('res-adapterSwitch', `${data.message} 🚀 Rechargez la page après le redémarrage.`, false);
      setTimeout(() => refreshAdapterStatus(), 2000);
    } else {
      showResult('res-adapterSwitch', data.message, true);
    }
  } catch (err) {
    showResult('res-adapterSwitch', err.message, true);
  }
}

async function runBenchmark() {
  try {
    showResult('res-adapterSwitch', 'Benchmark en cours (100 itérations)...', false);

    const data = await api('/api/system/benchmark', { method: 'POST' });

    const resultDiv = document.getElementById('res-benchmark');
    if (!resultDiv) {
      const newDiv = document.createElement('div');
      newDiv.id = 'res-benchmark';
      newDiv.className = 'result success';
      document.getElementById('res-adapterSwitch').parentNode.appendChild(newDiv);
    }

    document.getElementById('res-benchmark').innerHTML = `
      <strong>📊 Résultats du Benchmark</strong><br>
      Adaptateur: <strong>${data.adapter}</strong><br>
      Latence moyenne: <strong>${data.avgLatency}ms</strong><br>
      Min: ${data.minLatency}ms | Max: ${data.maxLatency}ms<br>
      Itérations: ${data.iterations}
    `;
    document.getElementById('res-benchmark').className = 'result success';
  } catch (err) {
    showResult('res-adapterSwitch', err.message, true);
  }
}

// ========== SECTION 2: CQRS ==========
async function loadClientsForDropdowns() {
  try {
    const data = await api('/api/dashboard/clients');
    const clients = data.clients || [];

    const dropdowns = ['creditClientId', 'orderClientId', 'portfolioClientId'];
    dropdowns.forEach(dropdownId => {
      const select = document.getElementById(dropdownId);
      if (select) {
        select.innerHTML = '<option value="">-- Sélectionnez un client --</option>';
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          option.textContent = `${client.firstName} ${client.lastName} (${client.email})`;
          select.appendChild(option);
        });
      }
    });
  } catch (err) {
    console.error('Error loading clients:', err);
  }
}

async function executeGrantCredit() {
  try {
    const clientId = document.getElementById('creditClientId').value;
    if (!clientId) {
      showResult('res-grantCredit', 'Veuillez sélectionner un client', true);
      return;
    }

    const data = await api('/api/dashboard/commands/grant-credit', {
      method: 'POST',
      body: {
        clientId,
        amount: parseFloat(document.getElementById('creditAmount').value),
        annualRate: parseFloat(document.getElementById('creditAnnualRate').value),
        insuranceRate: parseFloat(document.getElementById('creditInsuranceRate').value),
        durationMonths: parseInt(document.getElementById('creditDuration').value)
      }
    });

    if (data.success) {
      showResult('res-grantCredit', `✅ Crédit accordé! Mensualité: ${data.credit.monthlyPayment}€`, false);
      // Get client name from dropdown
      const clientSelect = document.getElementById('creditClientId');
      const clientName = clientSelect.options[clientSelect.selectedIndex].text;
      addOperationLog('Crédit accordé', `Client: ${clientName}, Montant: ${data.credit.amount}€`);
      refreshPortfolio();
    } else {
      showResult('res-grantCredit', data.message, true);
    }
  } catch (err) {
    showResult('res-grantCredit', err.message, true);
  }
}

async function executePlaceOrder() {
  try {
    const clientId = document.getElementById('orderClientId').value;
    if (!clientId) {
      showResult('res-placeOrder', 'Veuillez sélectionner un client', true);
      return;
    }

    const data = await api('/api/dashboard/commands/place-order', {
      method: 'POST',
      body: {
        clientId,
        stockSymbol: document.getElementById('orderStockSymbol').value,
        quantity: parseInt(document.getElementById('orderQuantity').value),
        orderType: 'BUY'
      }
    });

    if (data.success) {
      showResult('res-placeOrder', '✅ ' + data.message, false);
      addOperationLog('Ordre placé', `${data.order.stockSymbol} x${data.order.quantity}`);
    } else {
      showResult('res-placeOrder', data.message, true);
    }
  } catch (err) {
    showResult('res-placeOrder', err.message, true);
  }
}

async function refreshPortfolio() {
  const clientId = document.getElementById('portfolioClientId').value;
  if (!clientId) {
    document.getElementById('portfolioDisplay').innerHTML = '<p class="muted">Sélectionnez un client pour voir son portfolio</p>';
    return;
  }

  try {
    const data = await api(`/api/dashboard/queries/portfolio/${clientId}`);

    if (data.success) {
      const { client, accounts, credits, orders, summary } = data;
      document.getElementById('portfolioDisplay').innerHTML = `
        <div class="profile-section">
          <h4>📊 Résumé</h4>
          <div class="profile-item">
            <strong>Solde total:</strong> ${summary.totalBalance.toFixed(2)} €
          </div>
          <div class="profile-item">
            <strong>Comptes:</strong> ${summary.accountsCount} |
            <strong>Crédits:</strong> ${summary.creditsCount} |
            <strong>Ordres:</strong> ${summary.ordersCount}
          </div>
        </div>

        ${accounts.length > 0 ? `
        <div class="profile-section">
          <h4>💳 Comptes Bancaires</h4>
          ${accounts.map(acc => `
            <div class="profile-item">
              ${acc.accountName}: <strong>${acc.balance.toFixed(2)} ${acc.currency}</strong>
              <span class="badge badge-${acc.isActive ? 'success' : 'danger'}">${acc.isActive ? 'Actif' : 'Inactif'}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${credits.length > 0 ? `
        <div class="profile-section">
          <h4>💰 Crédits</h4>
          ${credits.map(credit => `
            <div class="profile-item">
              Montant: <strong>${credit.amount} €</strong> |
              Taux: ${credit.annualRate}% |
              Mensualité: ${credit.monthlyPayment.toFixed(2)} €
            </div>
          `).join('')}
        </div>
        ` : ''}
      `;
    } else {
      document.getElementById('portfolioDisplay').innerHTML = `<p class="muted error">${data.message}</p>`;
    }
  } catch (err) {
    document.getElementById('portfolioDisplay').innerHTML = `<p class="muted error">${err.message}</p>`;
  }
}

function addOperationLog(type, details) {
  const container = document.getElementById('lastOperations');
  if (!container) return;

  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = 'profile-item';
  logEntry.innerHTML = `
    <span class="event-type">${type}</span><br>
    <span class="muted">${details}</span>
    <span class="event-timestamp">${timestamp}</span>
  `;

  container.insertBefore(logEntry, container.firstChild);

  // Keep only last 5 entries
  while (container.children.length > 5) {
    container.removeChild(container.lastChild);
  }
}

// ========== SECTION 3: EVENT SOURCING ==========
async function loadAllEvents() {
  try {
    document.getElementById('eventContextInfo').style.display = 'none';
    const data = await api('/api/dashboard/events');

    if (data.success) {
      renderEventTimeline(data.events);
    }
  } catch (err) {
    document.getElementById('eventsTimeline').innerHTML = `<p class="muted error">${err.message}</p>`;
  }
}

async function loadClientEvents() {
  if (!selectedClientId) {
    alert('Veuillez d\'abord sélectionner un client dans la section "Clients"');
    return;
  }

  try {
    // Get client info for display
    const clientData = await api(`/api/dashboard/clients/${selectedClientId}/profile`);
    const clientName = clientData.client ? `${clientData.client.firstName} ${clientData.client.lastName}` : 'Client sélectionné';

    document.getElementById('eventContextInfo').innerHTML = `
      📋 Affichage des événements pour : <strong>${clientName}</strong>
    `;
    document.getElementById('eventContextInfo').style.display = 'block';

    // For now, load all events and filter client-side (backend can be enhanced later)
    const data = await api('/api/dashboard/events');

    if (data.success) {
      // Filter events that contain the clientId in their data
      const clientEvents = data.events.filter(event => {
        const eventData = JSON.stringify(event.data).toLowerCase();
        return eventData.includes(selectedClientId.toLowerCase());
      });

      renderEventTimeline(clientEvents);
    }
  } catch (err) {
    document.getElementById('eventsTimeline').innerHTML = `<p class="muted error">${err.message}</p>`;
  }
}

function renderEventTimeline(events) {
  const timeline = document.getElementById('eventsTimeline');

  if (events.length === 0) {
    timeline.innerHTML = '<p class="muted">Aucun événement trouvé</p>';
    return;
  }

  timeline.innerHTML = events.map(event => {
    const translatedType = translateEventType(event.type);
    const formattedData = formatEventData(event.type, event.data);

    return `
      <div class="event-item">
        <div>
          <span class="event-type">📌 ${translatedType}</span>
          <span class="event-timestamp">${new Date(event.timestamp).toLocaleString()}</span>
        </div>
        <div class="event-details">${formattedData}</div>
      </div>
    `;
  }).join('');
}

async function rebuildStateForSelectedClient() {
  if (!selectedClientId) {
    alert('Veuillez d\'abord sélectionner un client dans la section "Clients"');
    return;
  }

  try {
    // Get client info for display
    const clientData = await api(`/api/dashboard/clients/${selectedClientId}/profile`);
    const clientName = clientData.client ? `${clientData.client.firstName} ${clientData.client.lastName}` : 'Client sélectionné';

    // Note: Backend needs enhancement to support clientId-based rebuild
    // For now, we'll use a credit stream if available
    // FUTURE: Add GET /api/dashboard/client-streams/:clientId to get all streams for a client

    // Temporary: Try to find a credit stream for this client
    const eventsData = await api('/api/dashboard/events');
    const clientEvents = eventsData.events.filter(event => {
      const eventData = JSON.stringify(event.data).toLowerCase();
      return eventData.includes(selectedClientId.toLowerCase());
    });

    if (clientEvents.length === 0) {
      document.getElementById('rebuildResult').innerHTML = `
        <div class="result error">
          Aucun événement trouvé pour ${clientName}. Impossible de reconstruire l'état.
        </div>
      `;
      return;
    }

    // Use the streamId of the first event (typically a credit or order)
    const streamId = clientEvents[0].streamId;

    const data = await api(`/api/dashboard/rebuild-state/${streamId}`, { method: 'POST' });

    const resultDiv = document.getElementById('rebuildResult');
    if (data.success) {
      const stateDescription = formatStateObject(data.after);

      resultDiv.innerHTML = `
        <div class="result success">
          <strong>✅ État reconstitué pour ${clientName}</strong><br>
          ${data.eventsCount} événement(s) appliqué(s)
        </div>
        <div class="rebuild-comparison">
          <div class="rebuild-box">
            <h4>État Initial</h4>
            <p class="muted">Vide (aucune donnée)</p>
          </div>
          <div class="rebuild-box">
            <h4>État Reconstitué ✨</h4>
            ${stateDescription}
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<div class="result error">${data.message}</div>`;
    }
  } catch (err) {
    document.getElementById('rebuildResult').innerHTML = `<div class="result error">${err.message}</div>`;
  }
}

// ========== SECTION 4: CLIENTS ==========
let selectedClientId = null;

async function loadClientsTable() {
  try {
    const data = await api('/api/dashboard/clients');

    if (data.success) {
      const table = document.getElementById('clientsTable');
      table.innerHTML = `
        <div class="client-row header">
          <div>Nom</div>
          <div>Email</div>
          <div>Solde Total</div>
          <div>Comptes</div>
        </div>
        ${data.clients.map(client => `
          <div class="client-row" onclick="selectClient('${client.id}')">
            <div>${client.firstName} ${client.lastName}</div>
            <div>${client.email}</div>
            <div>${client.totalBalance.toFixed(2)} €</div>
            <div>${client.accountsCount}</div>
          </div>
        `).join('')}
      `;
    }
  } catch (err) {
    document.getElementById('clientsTable').innerHTML = `<p class="muted error">${err.message}</p>`;
  }
}

async function selectClient(clientId) {
  selectedClientId = clientId;

  // Highlight selected row
  document.querySelectorAll('.client-row').forEach(row => row.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // Load client profile
  try {
    const data = await api(`/api/dashboard/clients/${clientId}/profile`);

    if (data.success) {
      const { client, accounts, credits, summary } = data;
      document.getElementById('clientProfile').innerHTML = `
        <h3>Profil de ${client.firstName} ${client.lastName}</h3>

        <div class="profile-section">
          <h4>📋 Informations</h4>
          <div class="profile-item">
            <strong>Email:</strong> ${client.email}<br>
            <strong>Téléphone:</strong> ${client.phoneNumber || 'N/A'}<br>
            <strong>Email confirmé:</strong> <span class="badge badge-${client.isEmailConfirmed ? 'success' : 'warning'}">${client.isEmailConfirmed ? 'Oui' : 'Non'}</span>
          </div>
        </div>

        <div class="profile-section">
          <h4>📊 Résumé Financier</h4>
          <div class="profile-item">
            <strong>Solde total:</strong> ${summary.totalBalance.toFixed(2)} €<br>
            <strong>Comptes bancaires:</strong> ${summary.accountsCount}<br>
            <strong>Crédits en cours:</strong> ${summary.creditsCount}<br>
            <strong>Total crédits:</strong> ${summary.totalCredits.toFixed(2)} €
          </div>
        </div>

        ${accounts.length > 0 ? `
        <div class="profile-section">
          <h4>💳 Comptes Bancaires</h4>
          ${accounts.map(acc => `
            <div class="profile-item">
              <strong>${acc.accountName}</strong><br>
              IBAN: ${acc.iban}<br>
              Solde: <strong>${acc.balance.toFixed(2)} ${acc.currency}</strong>
              <span class="badge badge-${acc.isActive ? 'success' : 'danger'}">${acc.isActive ? 'Actif' : 'Inactif'}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${credits.length > 0 ? `
        <div class="profile-section">
          <h4>💰 Crédits</h4>
          ${credits.map(credit => `
            <div class="profile-item">
              Montant: <strong>${credit.amount} €</strong><br>
              Taux annuel: ${credit.annualRate}% | Assurance: ${credit.insuranceRate}%<br>
              Durée: ${credit.durationMonths} mois | Mensualité: <strong>${credit.monthlyPayment.toFixed(2)} €</strong><br>
              Restant: ${credit.remainingAmount.toFixed(2)} €
            </div>
          `).join('')}
        </div>
        ` : ''}
      `;
    }
  } catch (err) {
    document.getElementById('clientProfile').innerHTML = `<p class="muted error">${err.message}</p>`;
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  refreshAdapterStatus();
  refreshDatabaseStatus();
  loadClientsForDropdowns();
  loadAllEvents();
  loadClientsTable();

  // Auto-refresh adapter and database status every 30 seconds
  setInterval(() => {
    refreshAdapterStatus();
    refreshDatabaseStatus();
  }, 30000);
});
