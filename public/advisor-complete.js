// ========== CONFIGURATION ==========
let advisorToken = localStorage.getItem('advisorToken');
let advisorId = null;

// Check authentication
if (!advisorToken) {
  alert('Vous devez être connecté en tant que conseiller');
  window.location.href = '/web/index.html';
}

// Load advisor info
const advisorInfo = JSON.parse(localStorage.getItem('advisorInfo') || '{}');
advisorId = advisorInfo.id;
document.getElementById('userInfo').textContent = `${advisorInfo.firstName || 'Conseiller'} ${advisorInfo.lastName || ''} (${advisorInfo.email || ''})`;

// ========== UTILS ==========
function logout() {
  localStorage.removeItem('advisorToken');
  localStorage.removeItem('advisorInfo');
  window.location.href = '/web/index.html';
}

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  event.target.classList.add('active');
}

async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (advisorToken) headers['Authorization'] = `Bearer ${advisorToken}`;
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const url = typeof getApiUrl === 'function' ? getApiUrl(path) : (window.location.origin + path);
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

function showResult(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = isError ? 'result error' : 'result success';
  el.textContent = message;
  setTimeout(() => { if (el.className.includes('result')) el.textContent = ''; }, 5000);
}

function showJSON(id, data) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = JSON.stringify(data, null, 2);
}

function showList(id, items, render) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items || items.length === 0) {
    el.innerHTML = '<p style="color: var(--muted); font-size: 12px;">Aucun élément</p>';
    return;
  }
  el.innerHTML = items.map(render).join('');
}

// ========== CONVERSATIONS ==========
async function getOpenConversations() {
  try {
    const data = await api('/advisors/conversations/open');
    const conversations = data.conversations || [];
    showList('res-getOpenConversations', conversations, conv => `
      <div class="list-item">
        <h4>Conversation ${conv.id} <span class="badge badge-warning">${conv.status || 'OPEN'}</span></h4>
        <p><strong>Client:</strong> ${conv.clientId || 'N/A'}</p>
        <p><strong>Messages:</strong> ${conv.messageCount || 0}</p>
        <p><strong>Créée le:</strong> ${conv.createdAt ? new Date(conv.createdAt).toLocaleString() : 'N/A'}</p>
        <button class="btn btn-small btn-success" onclick="assignConversationById('${conv.id}')">Prendre en charge</button>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getOpenConversations').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function replyToConversation() {
  try {
    const convId = document.getElementById('replyConvId').value;
    const content = document.getElementById('replyContent').value;

    await api(`/advisors/conversations/${convId}/reply`, {
      method: 'POST',
      body: { content }
    });

    showResult('res-replyToConversation', 'Réponse envoyée avec succès!');
    document.getElementById('replyContent').value = '';
    getOpenConversations();
  } catch (err) {
    showResult('res-replyToConversation', err.message, true);
  }
}

async function assignConversation() {
  const convId = document.getElementById('assignConvId').value;
  await assignConversationById(convId);
}

async function assignConversationById(convId) {
  try {
    await api(`/advisors/conversations/${convId}/assign`, {
      method: 'POST'
    });

    showResult('res-assignConversation', 'Conversation prise en charge avec succès!');
    getOpenConversations();
  } catch (err) {
    showResult('res-assignConversation', err.message, true);
  }
}

async function transferConversation() {
  try {
    const convId = document.getElementById('transferConvId').value;
    const toAdvisorId = document.getElementById('transferToAdvisorId').value;

    await api(`/advisors/conversations/${convId}/transfer`, {
      method: 'POST',
      body: { toAdvisorId }
    });

    showResult('res-transferConversation', 'Conversation transférée avec succès!');
    getOpenConversations();
  } catch (err) {
    showResult('res-transferConversation', err.message, true);
  }
}

// ========== CREDITS ==========
async function grantCredit() {
  try {
    const data = await api('/advisors/credits', {
      method: 'POST',
      body: {
        clientId: document.getElementById('creditClientId').value,
        amount: parseFloat(document.getElementById('creditAmount').value),
        annualRate: parseFloat(document.getElementById('creditAnnualRate').value),
        insuranceRate: parseFloat(document.getElementById('creditInsuranceRate').value),
        durationMonths: parseInt(document.getElementById('creditDuration').value)
      }
    });

    showResult('res-grantCredit', `Crédit accordé! Mensualité: ${data.credit.monthlyPayment}€`);
  } catch (err) {
    showResult('res-grantCredit', err.message, true);
  }
}

async function listClientCredits() {
  try {
    const clientId = document.getElementById('viewCreditsClientId').value;
    const data = await api(`/advisors/clients/${clientId}/credits`);
    showJSON('res-listClientCredits', data);
  } catch (err) {
    showJSON('res-listClientCredits', { error: err.message });
  }
}

// ========== MESSAGING LEGACY ==========
async function sendMessage() {
  try {
    const data = await api('/messaging/send', {
      method: 'POST',
      body: {
        conversationId: document.getElementById('msgSendConvId').value,
        senderId: document.getElementById('msgSenderId').value,
        content: document.getElementById('msgContent').value
      }
    });

    showResult('res-sendMessage', 'Message envoyé!');
    document.getElementById('msgContent').value = '';
  } catch (err) {
    showResult('res-sendMessage', err.message, true);
  }
}

async function assignMessage() {
  try {
    const data = await api('/messaging/assign', {
      method: 'POST',
      body: {
        convId: document.getElementById('msgAssignConvId').value,
        advisorId: document.getElementById('msgAssignAdvisorId').value
      }
    });

    showResult('res-assignMessage', 'Conversation assignée!');
  } catch (err) {
    showResult('res-assignMessage', err.message, true);
  }
}

async function transferMessage() {
  try {
    const data = await api('/messaging/transfer', {
      method: 'POST',
      body: {
        convId: document.getElementById('msgTransferConvId').value,
        fromAdvisorId: document.getElementById('msgTransferFromId').value,
        toAdvisorId: document.getElementById('msgTransferToId').value
      }
    });

    showResult('res-transferMessage', 'Conversation transférée!');
  } catch (err) {
    showResult('res-transferMessage', err.message, true);
  }
}

async function getOpenMessages() {
  try {
    const data = await api('/messaging/open');
    showJSON('res-getOpenMessages', data);
  } catch (err) {
    showJSON('res-getOpenMessages', { error: err.message });
  }
}

// ========== EXECUTE FUNCTION ==========
function exec(funcName) {
  if (typeof window[funcName] === 'function') {
    window[funcName]();
  } else {
    console.error(`Function ${funcName} not found`);
  }
}

// ========== LOAD CLIENTS ==========
async function loadClients() {
  try {
    // Try to get list of seeded clients from TestDataSeeder
    const response = await fetch(baseUrl + '/clients');
    let clients = [];

    if (response.ok) {
      const data = await response.json();
      clients = data.clients || data || [];
    } else {
      // If no route exists, use the test accounts we know exist
      clients = [
        { id: 'client1@test.com', email: 'client1@test.com', firstName: 'Sophie', lastName: 'Laurent' },
        { id: 'client2@test.com', email: 'client2@test.com', firstName: 'Thomas', lastName: 'Dubois' },
        { id: 'client3@test.com', email: 'client3@test.com', firstName: 'Marie', lastName: 'Rousseau' },
        { id: 'client4@test.com', email: 'client4@test.com', firstName: 'Lucas', lastName: 'Simon' },
        { id: 'client5@test.com', email: 'client5@test.com', firstName: 'Julie', lastName: 'Michel' }
      ];
    }

    // Populate all client dropdowns
    const clientSelects = ['creditClientId', 'viewCreditsClientId'];
    clientSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">-- Sélectionnez un client --</option>';
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id || client.email;
          option.textContent = `${client.firstName || ''} ${client.lastName || ''} (${client.email || client.id})`;
          select.appendChild(option);
        });
      }
    });

    console.log(`✅ ${clients.length} clients chargés dans les menus déroulants`);
  } catch (err) {
    console.error('Erreur lors du chargement des clients:', err);
    // Load default test clients as fallback
    const defaultClients = [
      { id: 'client1@test.com', email: 'client1@test.com', firstName: 'Sophie', lastName: 'Laurent' },
      { id: 'client2@test.com', email: 'client2@test.com', firstName: 'Thomas', lastName: 'Dubois' },
      { id: 'client3@test.com', email: 'client3@test.com', firstName: 'Marie', lastName: 'Rousseau' },
      { id: 'client4@test.com', email: 'client4@test.com', firstName: 'Lucas', lastName: 'Simon' },
      { id: 'client5@test.com', email: 'client5@test.com', firstName: 'Julie', lastName: 'Michel' }
    ];

    const clientSelects = ['creditClientId', 'viewCreditsClientId'];
    clientSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">-- Sélectionnez un client --</option>';
        defaultClients.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          option.textContent = `${client.firstName} ${client.lastName} (${client.email})`;
          select.appendChild(option);
        });
      }
    });
  }
}

// ========== AUTO-LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  getOpenConversations();
});
