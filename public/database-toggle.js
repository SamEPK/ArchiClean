// Database Toggle - Frontend Logic

const APIS = {
  nestjs: { name: 'NestJS', url: 'http://localhost:3000', prefix: '/api' },
  fastify: { name: 'Fastify', url: 'http://localhost:3001', prefix: '/api' }
};

let currentAPI = 'nestjs';
let currentDbType = 'inmemory';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  log('🚀 Database Toggle System initialized', 'info');
  refreshStatus();
});

// Select backend API
function selectBackend(api) {
  currentAPI = api;
  
  // Update UI
  document.getElementById('btnNestJS').classList.toggle('active', api === 'nestjs');
  document.getElementById('btnFastify').classList.toggle('active', api === 'fastify');
  
  const apiInfo = APIS[api];
  document.getElementById('currentApi').textContent = `${apiInfo.name} (${apiInfo.url})`;
  document.getElementById('currentBackend').textContent = apiInfo.name;
  document.getElementById('currentBackend').className = `status-value ${api}`;
  
  log(`🔄 Backend API changed to ${apiInfo.name} (${apiInfo.url})`, 'info');
  
  // Refresh status with new API
  setTimeout(() => refreshStatus(), 500);
}

// Get API base URL
function getApiUrl(path) {
  const api = APIS[currentAPI];
  return `${api.url}${api.prefix}${path}`;
}

// Log message
function log(message, type = 'info') {
  const logContainer = document.getElementById('logContainer');
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = `[${timestamp}] ${message}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Clear logs
function clearLogs() {
  document.getElementById('logContainer').innerHTML = '';
  log('🗑️ Logs cleared', 'info');
}

// Refresh status
async function refreshStatus() {
  log('🔄 Refreshing status...', 'info');
  
  try {
    const response = await fetch(getApiUrl('/system/database/type'));
    const data = await response.json();
    
    if (data.success) {
      currentDbType = data.databaseType;
      updateDatabaseUI(data.databaseType);
      log(`✅ Status refreshed: ${data.databaseType.toUpperCase()}`, 'success');
    } else {
      log(`❌ Failed to refresh status: ${data.message}`, 'error');
    }
    
    // Get system info
    const infoResponse = await fetch(getApiUrl('/system/info'));
    const infoData = await infoResponse.json();
    
    if (infoData.success) {
      const uptime = Math.floor(infoData.system.uptime);
      document.getElementById('systemUptime').textContent = formatUptime(uptime);
      document.getElementById('connectionStatus').textContent = '🟢 Connecté';
    }
  } catch (error) {
    log(`❌ Error refreshing status: ${error.message}`, 'error');
    document.getElementById('connectionStatus').textContent = '🔴 Déconnecté';
  }
}

// Update database UI
function updateDatabaseUI(dbType) {
  const toggle = document.getElementById('dbToggle');
  const slider = document.getElementById('dbToggleSlider');
  const typeElement = document.getElementById('currentDbType');
  
  if (dbType === 'mongodb') {
    toggle.classList.add('active');
    slider.textContent = 'MongoDB';
    typeElement.textContent = 'MongoDB';
    typeElement.className = 'status-value mongodb';
  } else {
    toggle.classList.remove('active');
    slider.textContent = 'InMemory';
    typeElement.textContent = 'InMemory';
    typeElement.className = 'status-value inmemory';
  }
}

// Toggle database
function toggleDatabase() {
  const newType = currentDbType === 'inmemory' ? 'mongodb' : 'inmemory';
  switchDatabase(newType);
}

// Switch to InMemory
function switchToInMemory() {
  switchDatabase('inmemory');
}

// Switch to MongoDB
function switchToMongoDB() {
  switchDatabase('mongodb');
}

// Switch database
async function switchDatabase(newType) {
  log(`🔄 Switching database to ${newType.toUpperCase()}...`, 'info');
  
  try {
    const response = await fetch(getApiUrl('/system/database/switch'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: newType }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentDbType = data.currentType;
      updateDatabaseUI(data.currentType);
      log(`✅ Database switched to ${data.currentType.toUpperCase()}`, 'success');
      
      if (data.warning) {
        log(`⚠️ Warning: ${data.warning}`, 'warning');
      }
      
      // Show detailed info
      if (data.previousType !== data.currentType) {
        log(`📊 Previous: ${data.previousType.toUpperCase()} → Current: ${data.currentType.toUpperCase()}`, 'info');
      }
    } else {
      log(`❌ Failed to switch database: ${data.message}`, 'error');
    }
  } catch (error) {
    log(`❌ Error switching database: ${error.message}`, 'error');
  }
}

// Reset database
async function resetDatabase() {
  const confirmed = confirm(
    '⚠️ ATTENTION ⚠️\n\n' +
    'Cette action va réinitialiser tous les repositories.\n' +
    'Toutes les données en mémoire seront PERDUES.\n\n' +
    'Êtes-vous sûr de vouloir continuer ?'
  );
  
  if (!confirmed) {
    log('❌ Reset cancelled by user', 'warning');
    return;
  }
  
  log('⚠️ Resetting all repositories...', 'warning');
  
  try {
    const response = await fetch(getApiUrl('/system/database/reset'), {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (data.success) {
      log('✅ All repositories have been reset', 'success');
      log('⚠️ ' + data.warning, 'warning');
      
      // Refresh status after reset
      setTimeout(() => refreshStatus(), 1000);
    } else {
      log(`❌ Failed to reset: ${data.message}`, 'error');
    }
  } catch (error) {
    log(`❌ Error resetting database: ${error.message}`, 'error');
  }
}

// Test connection
async function testConnection() {
  log('🔌 Testing connection...', 'info');
  
  try {
    const response = await fetch(getApiUrl('/system/info'));
    const data = await response.json();
    
    if (data.success) {
      log('✅ Connection successful!', 'success');
      log(`📊 Node version: ${data.system.nodeVersion}`, 'info');
      log(`📊 Platform: ${data.system.platform}`, 'info');
      log(`📊 Database: ${data.system.databaseType.toUpperCase()}`, 'info');
      log(`📊 Environment: ${data.system.environment}`, 'info');
      
      // Update memory usage
      const memUsage = data.system.memoryUsage;
      log(`💾 Memory: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, 'info');
    } else {
      log('❌ Connection test failed', 'error');
    }
  } catch (error) {
    log(`❌ Connection error: ${error.message}`, 'error');
    document.getElementById('connectionStatus').textContent = '🔴 Déconnecté';
  }
}

// Format uptime
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes}min ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
