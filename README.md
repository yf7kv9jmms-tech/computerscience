# GitHub Pages Proxy

A client-side proxy interface that runs on GitHub Pages static hosting. This tool allows you to make HTTP requests through a CORS proxy service to bypass browser cross-origin restrictions.

## ⚠️ Important Limitations

**This is NOT a true proxy server.** GitHub Pages only serves static files and cannot run server-side code [^3^]. This solution:

- Hosts the UI on GitHub Pages
- Requires an external CORS proxy service to actually fetch data
- Cannot bypass CORS without a proxy due to browser security policies [^8^]

## How It Works

1. Your browser sends requests to a CORS proxy service
2. The proxy service forwards requests to the target URL
3. The proxy service adds CORS headers to the response
4. Your browser receives the proxied response

## Setup Instructions

### 1. Create GitHub Repository

1. Go to GitHub and create a new repository.
2. Make it **Public** (required for GitHub Pages on free accounts)
3. Clone it locally:
```bash
git clone https://github.com/your-username/your-username.github.io.git

