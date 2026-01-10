// ========== CONFIGURATION ==========
let userToken = localStorage.getItem('userToken');
let userId = null;

// Check authentication
if (!userToken) {
  alert('Vous devez être connecté');
  window.location.href = '/web/index.html';
}

// Load user info
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
userId = userInfo.id;
document.getElementById('userInfo').textContent = `${userInfo.firstName || 'User'} ${userInfo.lastName || ''} (${userInfo.email || ''})`;

// ========== UTILS ==========
function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
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
  if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
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

// ========== PROFILE ==========
async function getProfile() {
  try {
    const data = await api('/users/profile');
    showJSON('res-getProfile', data);
  } catch (err) {
    showJSON('res-getProfile', { error: err.message });
  }
}

async function updateProfile() {
  try {
    const body = {};
    const firstName = document.getElementById('updateFirstName').value;
    const lastName = document.getElementById('updateLastName').value;
    const bio = document.getElementById('updateBio').value;
    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (bio) body.bio = bio;

    const data = await api('/users/profile', { method: 'PUT', body });
    showResult('res-updateProfile', 'Profil mis à jour avec succès!');
  } catch (err) {
    showResult('res-updateProfile', err.message, true);
  }
}

async function searchUsers() {
  try {
    const query = document.getElementById('searchQuery').value;
    const data = await api(`/users/search?query=${encodeURIComponent(query)}`);
    showList('res-searchUsers', data.users, user => `
      <div class="list-item">
        <h4>${user.firstName} ${user.lastName}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-searchUsers').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getPublicProfiles() {
  try {
    const data = await api('/users/public?skip=0&limit=20');
    showList('res-getPublicProfiles', data.profiles, user => `
      <div class="list-item">
        <h4>${user.firstName} ${user.lastName}</h4>
        <p><strong>Bio:</strong> ${user.bio || 'Aucune bio'}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getPublicProfiles').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getUserById() {
  try {
    const id = document.getElementById('getUserId').value;
    const data = await api(`/users/${id}`);
    showJSON('res-getUserById', data);
  } catch (err) {
    showJSON('res-getUserById', { error: err.message });
  }
}

// ========== ACCOUNTS ==========
async function createAccount() {
  try {
    const data = await api(`/clients/${userId}/accounts`, {
      method: 'POST',
      body: {
        accountName: document.getElementById('accountName').value,
        initialBalance: parseFloat(document.getElementById('initialBalance').value) || 0
      }
    });
    showResult('res-createAccount', 'Compte créé: ' + (data.account?.iban || 'OK'));
    getAccounts();
  } catch (err) {
    showResult('res-createAccount', err.message, true);
  }
}

async function getAccounts() {
  try {
    const data = await api(`/clients/${userId}/accounts?includeInactive=true`);
    showList('res-getAccounts', data.accounts, acc => `
      <div class="list-item">
        <h4>${acc.accountName} <span class="badge ${acc.isActive ? 'badge-success' : 'badge-danger'}">${acc.isActive ? 'Actif' : 'Inactif'}</span></h4>
        <p><strong>ID:</strong> ${acc.id}</p>
        <p><strong>IBAN:</strong> ${acc.iban}</p>
        <p><strong>Solde:</strong> ${acc.balance} ${acc.currency}</p>
        <p><strong>Créé le:</strong> ${new Date(acc.createdAt).toLocaleDateString()}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getAccounts').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

// ========== SAVINGS ==========
async function openSavings() {
  try {
    const data = await api('/savings', {
      method: 'POST',
      body: {
        clientId: userId,
        sourceAccountId: document.getElementById('savingsSourceAccountId').value,
        initialAmount: parseFloat(document.getElementById('savingsAmount').value)
      }
    });
    showResult('res-openSavings', 'Compte d\'épargne ouvert avec succès!');
  } catch (err) {
    showResult('res-openSavings', err.message, true);
  }
}

async function applyInterest() {
  try {
    const data = await api('/savings/apply-interest', { method: 'POST', body: {} });
    showResult('res-applyInterest', data.message || 'Intérêts appliqués!');
  } catch (err) {
    showResult('res-applyInterest', err.message, true);
  }
}

// ========== STOCKS ==========
async function getStocks() {
  try {
    const data = await api('/stocks');
    const stocks = data.stocks || data || [];
    showList('res-getStocks', stocks, stock => `
      <div class="list-item">
        <h4>${stock.symbol} - ${stock.name} <span class="badge ${stock.isAvailable ? 'badge-success' : 'badge-danger'}">${stock.isAvailable ? 'Dispo' : 'Indispo'}</span></h4>
        <p><strong>Entreprise:</strong> ${stock.companyName}</p>
        <p><strong>ID:</strong> ${stock.id}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getStocks').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getAvailableStocks() {
  try {
    const data = await api('/stocks/available');
    const stocks = data.stocks || data || [];
    showList('res-getAvailableStocks', stocks, stock => `
      <div class="list-item">
        <h4>${stock.symbol} - ${stock.name}</h4>
        <p><strong>Entreprise:</strong> ${stock.companyName}</p>
        <p><strong>ID:</strong> ${stock.id}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getAvailableStocks').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getStockById() {
  try {
    const id = document.getElementById('stockId').value;
    const data = await api(`/stocks/${id}`);
    showJSON('res-getStockById', data);
  } catch (err) {
    showJSON('res-getStockById', { error: err.message });
  }
}

// ========== ORDERS ==========
async function placeOrder() {
  try {
    const data = await api('/orders', {
      method: 'POST',
      body: {
        clientId: userId,
        stockSymbol: document.getElementById('orderSymbol').value,
        orderType: document.getElementById('orderType').value,
        quantity: parseInt(document.getElementById('orderQuantity').value),
        price: parseFloat(document.getElementById('orderPrice').value)
      }
    });
    showResult('res-placeOrder', 'Ordre placé avec succès!');
  } catch (err) {
    showResult('res-placeOrder', err.message, true);
  }
}

async function executeOrder() {
  try {
    const orderId = document.getElementById('executeOrderId').value;
    const data = await api(`/orders/${orderId}/execute`, {
      method: 'POST',
      body: {
        executionPrice: parseFloat(document.getElementById('executePrice').value)
      }
    });
    showResult('res-executeOrder', 'Ordre exécuté avec succès!');
  } catch (err) {
    showResult('res-executeOrder', err.message, true);
  }
}

async function getStockPrice() {
  try {
    const stockId = document.getElementById('priceStockId').value;
    const data = await api(`/orders/stock/${stockId}/price`);
    showJSON('res-getStockPrice', data);
  } catch (err) {
    showJSON('res-getStockPrice', { error: err.message });
  }
}

// ========== PORTFOLIO ==========
async function getPortfolio() {
  try {
    const data = await api(`/portfolio/${userId}`);
    showJSON('res-getPortfolio', data);
  } catch (err) {
    showJSON('res-getPortfolio', { error: err.message });
  }
}

// ========== TRANSACTIONS ==========
async function deposit() {
  try {
    const data = await api('/transactions/deposit', {
      method: 'POST',
      body: {
        accountId: document.getElementById('depositAccountId').value,
        amount: parseFloat(document.getElementById('depositAmount').value),
        description: document.getElementById('depositDescription').value
      }
    });
    showResult('res-deposit', 'Dépôt effectué avec succès!');
  } catch (err) {
    showResult('res-deposit', err.message, true);
  }
}

async function withdraw() {
  try {
    const data = await api('/transactions/withdraw', {
      method: 'POST',
      body: {
        accountId: document.getElementById('withdrawAccountId').value,
        amount: parseFloat(document.getElementById('withdrawAmount').value),
        description: document.getElementById('withdrawDescription').value
      }
    });
    showResult('res-withdraw', 'Retrait effectué avec succès!');
  } catch (err) {
    showResult('res-withdraw', err.message, true);
  }
}

async function transfer() {
  try {
    const data = await api('/transactions/transfer', {
      method: 'POST',
      body: {
        fromAccountId: document.getElementById('transferFromId').value,
        toAccountId: document.getElementById('transferToId').value,
        amount: parseFloat(document.getElementById('transferAmount').value),
        description: document.getElementById('transferDescription').value
      }
    });
    showResult('res-transfer', 'Transfert effectué avec succès!');
  } catch (err) {
    showResult('res-transfer', err.message, true);
  }
}

async function getHistory() {
  try {
    const accountId = document.getElementById('historyAccountId').value;
    const limit = document.getElementById('historyLimit').value;
    const data = await api(`/transactions/account/${accountId}?limit=${limit}`);
    showJSON('res-getHistory', data);
  } catch (err) {
    showJSON('res-getHistory', { error: err.message });
  }
}

// ========== SOCIAL ==========
async function sendFriendRequest() {
  try {
    const data = await api('/realtime/friendships/request', {
      method: 'POST',
      body: {
        requesterId: userId,
        addresseeId: document.getElementById('friendRequestId').value
      }
    });
    showResult('res-sendFriendRequest', 'Demande d\'ami envoyée!');
  } catch (err) {
    showResult('res-sendFriendRequest', err.message, true);
  }
}

async function getPendingRequests() {
  try {
    const data = await api(`/realtime/friendships/pending/${userId}`);
    showList('res-getPendingRequests', data.requests, req => `
      <div class="list-item">
        <h4>Demande <span class="badge badge-warning">${req.status}</span></h4>
        <p><strong>De:</strong> ${req.requesterId}</p>
        <p><strong>À:</strong> ${req.addresseeId}</p>
        <p><strong>ID:</strong> ${req.id}</p>
        <button class="btn btn-small btn-primary" onclick="acceptFriendRequest('${req.id}')">Accepter</button>
        <button class="btn btn-small btn-danger" onclick="rejectFriendRequest('${req.id}')">Rejeter</button>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getPendingRequests').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function acceptFriendRequest(friendshipId) {
  try {
    await api(`/realtime/friendships/${friendshipId}/accept`, {
      method: 'PUT',
      body: { userId }
    });
    alert('Demande acceptée!');
    getPendingRequests();
  } catch (err) {
    alert('Erreur: ' + err.message);
  }
}

async function rejectFriendRequest(friendshipId) {
  try {
    await api(`/realtime/friendships/${friendshipId}/reject`, {
      method: 'PUT',
      body: { userId }
    });
    alert('Demande rejetée!');
    getPendingRequests();
  } catch (err) {
    alert('Erreur: ' + err.message);
  }
}

async function getFriends() {
  try {
    const data = await api(`/realtime/friendships/friends/${userId}`);
    showList('res-getFriends', data.friends, friend => `
      <div class="list-item">
        <h4>Ami ${friend.id}</h4>
        <p><strong>Statut:</strong> ${friend.status}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getFriends').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function blockUser() {
  try {
    const data = await api('/realtime/friendships/block', {
      method: 'POST',
      body: {
        blockerId: userId,
        targetId: document.getElementById('blockUserId').value
      }
    });
    showResult('res-blockUser', 'Utilisateur bloqué!');
  } catch (err) {
    showResult('res-blockUser', err.message, true);
  }
}

async function unblockUser() {
  try {
    const data = await api('/realtime/friendships/unblock', {
      method: 'POST',
      body: {
        requesterId: userId,
        targetId: document.getElementById('unblockUserId').value
      }
    });
    showResult('res-unblockUser', 'Utilisateur débloqué!');
  } catch (err) {
    showResult('res-unblockUser', err.message, true);
  }
}

async function removeFriend() {
  try {
    const data = await api('/realtime/friendships/remove', {
      method: 'POST',
      body: {
        userId: userId,
        friendId: document.getElementById('removeFriendId').value
      }
    });
    showResult('res-removeFriend', 'Ami retiré!');
    getFriends();
  } catch (err) {
    showResult('res-removeFriend', err.message, true);
  }
}

async function sendPrivateMessage() {
  try {
    const data = await api('/realtime/messages/send', {
      method: 'POST',
      body: {
        senderId: userId,
        receiverId: document.getElementById('pmReceiverId').value,
        content: document.getElementById('pmContent').value
      }
    });
    showResult('res-sendPrivateMessage', 'Message envoyé!');
    document.getElementById('pmContent').value = '';
  } catch (err) {
    showResult('res-sendPrivateMessage', err.message, true);
  }
}

async function getConversation() {
  try {
    const otherUserId = document.getElementById('convOtherId').value;
    const limit = document.getElementById('convLimit').value;
    const data = await api(`/realtime/messages/conversation/${userId}/${otherUserId}?limit=${limit}`);
    showList('res-getConversation', data.messages, msg => `
      <div class="list-item">
        <p><strong>${msg.senderId === userId ? 'Moi' : 'Autre'}:</strong> ${msg.content}</p>
        <p style="font-size: 11px; color: var(--muted);">${new Date(msg.timestamp).toLocaleString()}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getConversation').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getUnreadCount() {
  try {
    const data = await api(`/realtime/messages/unread/${userId}`);
    showResult('res-getUnreadCount', `Messages non lus: ${data.count || 0}`);
  } catch (err) {
    showResult('res-getUnreadCount', err.message, true);
  }
}

async function markAsRead() {
  try {
    const messageId = document.getElementById('markReadMessageId').value;
    const data = await api(`/realtime/messages/${messageId}/read`, {
      method: 'PUT',
      body: { userId }
    });
    showResult('res-markAsRead', 'Message marqué comme lu!');
  } catch (err) {
    showResult('res-markAsRead', err.message, true);
  }
}

// ========== GROUPS ==========
async function createGroup() {
  try {
    const data = await api('/realtime/groups', {
      method: 'POST',
      body: {
        creatorId: userId,
        name: document.getElementById('groupName').value,
        description: document.getElementById('groupDescription').value,
        visibility: document.getElementById('groupVisibility').value
      }
    });
    showResult('res-createGroup', 'Groupe créé: ' + (data.group?.name || 'OK'));
  } catch (err) {
    showResult('res-createGroup', err.message, true);
  }
}

async function joinGroup() {
  try {
    const groupId = document.getElementById('joinGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/join`, {
      method: 'POST',
      body: { userId }
    });
    showResult('res-joinGroup', 'Groupe rejoint!');
  } catch (err) {
    showResult('res-joinGroup', err.message, true);
  }
}

async function leaveGroup() {
  try {
    const groupId = document.getElementById('leaveGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/leave`, {
      method: 'POST',
      body: { userId }
    });
    showResult('res-leaveGroup', 'Groupe quitté!');
  } catch (err) {
    showResult('res-leaveGroup', err.message, true);
  }
}

async function inviteToGroup() {
  try {
    const groupId = document.getElementById('inviteGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/invite`, {
      method: 'POST',
      body: {
        inviterId: userId,
        inviteeId: document.getElementById('inviteUserId').value
      }
    });
    showResult('res-inviteToGroup', 'Invitation envoyée!');
  } catch (err) {
    showResult('res-inviteToGroup', err.message, true);
  }
}

async function sendGroupMessage() {
  try {
    const groupId = document.getElementById('groupMsgGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/messages`, {
      method: 'POST',
      body: {
        senderId: userId,
        content: document.getElementById('groupMsgContent').value
      }
    });
    showResult('res-sendGroupMessage', 'Message envoyé!');
    document.getElementById('groupMsgContent').value = '';
  } catch (err) {
    showResult('res-sendGroupMessage', err.message, true);
  }
}

async function getGroupMessages() {
  try {
    const groupId = document.getElementById('groupMsgsGroupId').value;
    const limit = document.getElementById('groupMsgsLimit').value;
    const data = await api(`/realtime/groups/${groupId}/messages?userId=${userId}&limit=${limit}`);
    showList('res-getGroupMessages', data.messages, msg => `
      <div class="list-item">
        <p><strong>${msg.senderId}:</strong> ${msg.content}</p>
        <p style="font-size: 11px; color: var(--muted);">${new Date(msg.timestamp).toLocaleString()}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getGroupMessages').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function getGroupMembers() {
  try {
    const groupId = document.getElementById('groupMembersGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/members?requesterId=${userId}`);
    showList('res-getGroupMembers', data.members, member => `
      <div class="list-item">
        <h4>${member.userId} <span class="badge badge-info">${member.role}</span></h4>
        <p><strong>Statut:</strong> ${member.status}</p>
      </div>
    `);
  } catch (err) {
    document.getElementById('res-getGroupMembers').innerHTML = `<p style="color: var(--danger);">Erreur: ${err.message}</p>`;
  }
}

async function promoteMember() {
  try {
    const groupId = document.getElementById('promoteGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/promote`, {
      method: 'POST',
      body: {
        requesterId: userId,
        memberId: document.getElementById('promoteMemberId').value
      }
    });
    showResult('res-promoteMember', 'Membre promu!');
  } catch (err) {
    showResult('res-promoteMember', err.message, true);
  }
}

async function banMember() {
  try {
    const groupId = document.getElementById('banGroupId').value;
    const data = await api(`/realtime/groups/${groupId}/ban`, {
      method: 'POST',
      body: {
        requesterId: userId,
        memberId: document.getElementById('banMemberId').value
      }
    });
    showResult('res-banMember', 'Membre banni!');
  } catch (err) {
    showResult('res-banMember', err.message, true);
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

// ========== AUTO-LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  getProfile();
  getAccounts();
});
