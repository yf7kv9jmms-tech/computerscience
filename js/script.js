// GitHub Pages Proxy - Client-side logic
// Updated with school-friendly proxy options

// SCHOOL-FRIENDLY PROXY LIST
// Replace 'your-worker.workers.dev' with your actual Cloudflare Worker domain
const SCHOOL_FRIENDLY_PROXIES = [
  { name: 'My Cloudflare Worker', url: 'https://nameless-wildflower-03d8.larkenhagorgus.workers.dev' },
  { name: 'AllOrigins (Public)', url: 'https://api.allorigins.win/raw?url=' },
  { name: 'CORSProxy.io', url: 'https://corsproxy.io/?' },
  { name: 'No Proxy (Direct)', url: '' }
];

class GitHubPagesProxy {
  constructor() {
    this.history = JSON.parse(localStorage.getItem('proxyHistory') || '[]');
    this.initEventListeners();
    this.populateProxySelector(); // NEW: Load school-friendly proxies
    this.renderHistory();
  }

  initEventListeners() {
    document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());
    document.getElementById('method').addEventListener('change', (e) => this.toggleBody(e.target.value));
    document.getElementById('proxySelect').addEventListener('change', (e) => this.handleProxyChange(e.target.value));
    document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
    
    // Enter key support
    document.getElementById('url').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendRequest();
    });
  }

  // NEW: Dynamically populate proxy dropdown
  populateProxySelector() {
    const select = document.getElementById('proxySelect');
    select.innerHTML = ''; // Clear existing options
    
    SCHOOL_FRIENDLY_PROXIES.forEach(proxy => {
      const option = document.createElement('option');
      option.value = proxy.url;
      option.textContent = proxy.name;
      select.appendChild(option);
    });
  }

  toggleBody(method) {
    const bodySection = document.getElementById('bodySection');
    bodySection.style.display = ['POST', 'PUT', 'PATCH'].includes(method) ? 'block' : 'none';
  }

  handleProxyChange(value) {
    const customProxyInput = document.getElementById('customProxy');
    customProxyInput.style.display = value === 'custom' ? 'block' : 'none';
  }

  getProxyUrl() {
    const useProxy = document.getElementById('useProxy').checked;
    if (!useProxy) return '';

    const proxySelect = document.getElementById('proxySelect').value;
    if (proxySelect === 'custom') {
      return document.getElementById('customProxy').value;
    }
    return proxySelect;
  }

  async sendRequest() {
    const method = document.getElementById('method').value;
    const url = document.getElementById('url').value;
    const useProxy = document.getElementById('useProxy').checked;
    const proxyUrl = this.getProxyUrl();
    
    if (!url) {
      this.showStatus('Please enter a URL', 'error');
      return;
    }

    if (useProxy && !proxyUrl) {
      this.showStatus('Please select or enter a proxy URL', 'error');
      return;
    }

    // Construct target URL
    let targetUrl = url;
    if (useProxy) {
      if (proxyUrl.includes('allorigins')) {
        targetUrl = `${proxyUrl}${encodeURIComponent(url)}`;
      } else {
        targetUrl = `${proxyUrl}${url}`;
      }
    }

    // Parse custom headers
    let headers = {};
    const headersText = document.getElementById('headers').value;
    if (headersText) {
      try {
        headers = JSON.parse(headersText);
      } catch (e) {
        this.showStatus('Invalid JSON in headers', 'error');
        return;
      }
    }

    // Add default headers for non-proxy requests
    if (!useProxy) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method: method,
      headers: headers
    };

    // Add body for POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyText = document.getElementById('body').value;
      if (bodyText) {
        try {
          JSON.parse(bodyText);
          options.body = bodyText;
        } catch (e) {
          options.body = bodyText;
        }
      }
    }

    // Disable button during request
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
      console.log('Fetching:', targetUrl, options);
      const response = await fetch(targetUrl, options);
      
      const responseText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      
      let displayData;
      if (contentType.includes('application/json')) {
        try {
          displayData = JSON.stringify(JSON.parse(responseText), null, 2);
        } catch {
          displayData = responseText;
        }
      } else {
        displayData = responseText;
      }

      this.showResponse(response.status, response.statusText, displayData);
      this.addToHistory(method, url, response.status);
      this.showStatus(`Success: ${response.status}`, 'success');

    } catch (error) {
      console.error('Request failed:', error);
      this.showStatus(`Error: ${error.message}`, 'error');
      this.showResponse(0, 'Network Error', error.message);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Request';
    }
  }

  showResponse(status, statusText, data) {
    const statusEl = document.getElementById('status');
    const responseEl = document.getElementById('response');
    
    statusEl.textContent = `${status} ${statusText}`;
    statusEl.className = status >= 200 && status < 300 ? 'status success' : 'status error';
    
    responseEl.textContent = data;
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'status';
    }, 5000);
  }

  addToHistory(method, url, status) {
    const historyItem = {
      method,
      url,
      status,
      timestamp: new Date().toISOString()
    };
    
    this.history.unshift(historyItem);
    this.history = this.history.slice(0, 10);
    
    localStorage.setItem('proxyHistory', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    this.history.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.method}</strong> ${item.url} - <span class="status-${item.status}">${item.status}</span>`;
      li.title = `${item.method} ${item.url}`;
      
      li.addEventListener('click', () => {
        document.getElementById('url').value = item.url;
        document.getElementById('method').value = item.method;
      });
      
      historyList.appendChild(li);
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('proxyHistory');
    this.renderHistory();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GitHubPagesProxy();
});
