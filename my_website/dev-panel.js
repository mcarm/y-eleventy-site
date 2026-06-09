const http = require('http');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 3333;
let eleventyProcess = null;
let decapProcess = null;
let mp3DupeProcess = null;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website - Dev Panel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .panel {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      width: 400px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 0.875rem;
      margin-bottom: 30px;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      padding: 15px;
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
    }
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ef4444;
      transition: background 0.3s;
    }
    .status-dot.running { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
    .status-dot.mp3-running { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
    .status-text { font-size: 0.875rem; }
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    button {
      padding: 14px 20px;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    button:hover { transform: translateY(-2px); }
    button:active { transform: translateY(0); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-start { background: #22c55e; color: #fff; }
    .btn-start:hover { background: #16a34a; }
    .btn-stop { background: #ef4444; color: #fff; }
    .btn-stop:hover { background: #dc2626; }
    .btn-open { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
    .btn-open:hover { background: rgba(255,255,255,0.2); }
    .nav-buttons {
      display: none;
      gap: 12px;
    }
    .nav-buttons.visible {
      display: flex;
    }
    .btn-nav {
      flex: 1;
      background: rgba(59, 130, 246, 0.2);
      color: #fff;
      border: 1px solid rgba(59, 130, 246, 0.4);
    }
    .btn-nav:hover { background: rgba(59, 130, 246, 0.4); }
    .btn-publish { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; }
    .btn-publish:hover { background: linear-gradient(135deg, #7c3aed, #4f46e5); }
    .btn-close { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1); font-size: 0.875rem; }
    .btn-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 20px 0;
    }
    .log {
      margin-top: 20px;
      padding: 15px;
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.75rem;
      max-height: 150px;
      overflow-y: auto;
      color: rgba(255,255,255,0.7);
    }
    .log-entry { margin-bottom: 4px; }
    .log-entry.error { color: #ef4444; }
    .log-entry.success { color: #22c55e; }
  </style>
</head>
<body>
  <div class="panel">
    <h1>🚀 My Website</h1>
    <p class="subtitle">Eleventy Dev Server Control Panel</p>
    
    <div class="status">
      <div class="status-dot" id="statusDot"></div>
      <span class="status-text" id="statusText">Checking...</span>
    </div>
    
    <div class="buttons">
      <button class="btn-start" id="startBtn" onclick="startServer()">
        ▶ Start Dev Server
      </button>
      <button class="btn-stop" id="stopBtn" onclick="stopServer()">
        ◼ Stop Server
      </button>
      <div class="nav-buttons" id="navButtons">
        <button class="btn-nav" onclick="openFrontPage()">
          🏠 Front Page
        </button>
        <button class="btn-nav" onclick="openAdmin()">
          ⚙️ Admin
        </button>
      </div>
      <div class="divider"></div>
      <div class="status" style="margin-bottom: 12px;">
        <div class="status-dot" id="mp3StatusDot"></div>
        <span class="status-text" id="mp3StatusText">MP3 Finder: Stopped</span>
      </div>
      <button class="btn-mp3" id="mp3StartBtn" onclick="startMp3Finder()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;">
        🎵 Start MP3 Duplicate Finder
      </button>
      <button class="btn-stop" id="mp3StopBtn" onclick="stopMp3Finder()">
        ◼ Stop MP3 Finder
      </button>
      <button class="btn-open" id="mp3OpenBtn" onclick="openMp3Finder()" style="display: none;">
        🔗 Open MP3 Finder UI
      </button>
      <div class="divider"></div>
      <button class="btn-publish" onclick="publish()">
        📤 Build & Push to GitHub
      </button>
      <div class="divider"></div>
      <button class="btn-close" onclick="closePanel()">
        ✕ Close Panel
      </button>
    </div>
    
    <div class="log" id="log"></div>
  </div>

  <script>
    let isRunning = false;
    
    function log(msg, type = '') {
      const logEl = document.getElementById('log');
      const entry = document.createElement('div');
      entry.className = 'log-entry ' + type;
      entry.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }
    
    function updateUI(running) {
      isRunning = running;
      document.getElementById('statusDot').className = 'status-dot' + (running ? ' running' : '');
      document.getElementById('statusText').textContent = running ? 'Server running on :8080' : 'Server stopped';
      document.getElementById('startBtn').disabled = running;
      document.getElementById('stopBtn').disabled = !running;
      document.getElementById('navButtons').className = 'nav-buttons' + (running ? ' visible' : '');
    }
    
    async function checkStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        updateUI(data.running);
        updateMp3UI(data.mp3Running);
      } catch (e) {
        log('Error checking status', 'error');
      }
    }
    
    function updateMp3UI(running) {
      document.getElementById('mp3StatusDot').className = 'status-dot' + (running ? ' mp3-running' : '');
      document.getElementById('mp3StatusText').textContent = running ? 'MP3 Finder: Running on :7860' : 'MP3 Finder: Stopped';
      document.getElementById('mp3StartBtn').disabled = running;
      document.getElementById('mp3StopBtn').disabled = !running;
      document.getElementById('mp3OpenBtn').style.display = running ? 'flex' : 'none';
    }
    
    async function startMp3Finder() {
      log('Starting MP3 Duplicate Finder...');
      try {
        const res = await fetch('/api/mp3/start', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          log('MP3 Finder started!', 'success');
          updateMp3UI(true);
        } else {
          log('Failed: ' + data.error, 'error');
        }
      } catch (e) {
        log('Error: ' + e.message, 'error');
      }
    }
    
    async function stopMp3Finder() {
      log('Stopping MP3 Duplicate Finder...');
      try {
        const res = await fetch('/api/mp3/stop', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          log('MP3 Finder stopped', 'success');
          updateMp3UI(false);
        }
      } catch (e) {
        log('Error: ' + e.message, 'error');
      }
    }
    
    function openMp3Finder() {
      window.open('http://localhost:7860', '_blank');
    }
    
    async function startServer() {
      log('Starting server...');
      try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          log('Server started!', 'success');
          updateUI(true);
        } else {
          log('Failed: ' + data.error, 'error');
        }
      } catch (e) {
        log('Error: ' + e.message, 'error');
      }
    }
    
    async function stopServer() {
      log('Stopping server...');
      try {
        const res = await fetch('/api/stop', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          log('Server stopped', 'success');
          updateUI(false);
        }
      } catch (e) {
        log('Error: ' + e.message, 'error');
      }
    }
    
    function openFrontPage() {
      window.open('http://localhost:8080', '_blank');
    }
    
    function openAdmin() {
      window.open('http://localhost:8080/admin/', '_blank');
    }
    
    async function closePanel() {
      log('Shutting down...');
      try {
        await fetch('/api/shutdown', { method: 'POST' });
      } catch (e) {}
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-family:sans-serif"><p>Panel closed. You can close this tab.</p></div>';
    }
    
    async function publish() {
      if (!confirm('This will build and push to GitHub. Continue?')) return;
      log('Building site...');
      try {
        const res = await fetch('/api/publish', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          log('Published successfully!', 'success');
        } else {
          log('Failed: ' + data.error, 'error');
        }
      } catch (e) {
        log('Error: ' + e.message, 'error');
      }
    }
    
    checkStatus();
    setInterval(checkStatus, 5000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
    return;
  }
  
  if (url.pathname === '/api/status') {
    res.end(JSON.stringify({ running: eleventyProcess !== null, mp3Running: mp3DupeProcess !== null }));
    return;
  }
  
  if (url.pathname === '/api/start' && req.method === 'POST') {
    if (eleventyProcess) {
      res.end(JSON.stringify({ success: false, error: 'Already running' }));
      return;
    }
    const eleventyPath = require.resolve('@11ty/eleventy/cmd');
    eleventyProcess = spawn(process.execPath, [eleventyPath, '--serve'], {
      cwd: __dirname,
      stdio: 'ignore',
      detached: false
    });
    eleventyProcess.on('close', () => { eleventyProcess = null; });
    
    const decapPath = require.resolve('decap-server');
    decapProcess = spawn(process.execPath, [decapPath], {
      cwd: __dirname,
      stdio: 'ignore',
      detached: false
    });
    decapProcess.on('close', () => { decapProcess = null; });
    
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  if (url.pathname === '/api/stop' && req.method === 'POST') {
    if (eleventyProcess) {
      eleventyProcess.kill();
      eleventyProcess = null;
    }
    if (decapProcess) {
      decapProcess.kill();
      decapProcess = null;
    }
    exec('pkill -f "eleventy"');
    exec('pkill -f "decap-server"');
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  if (url.pathname === '/api/publish' && req.method === 'POST') {
    const eleventyPath = require.resolve('@11ty/eleventy/cmd');
    exec(`node "${eleventyPath}" && git add -A && git commit -m "build: update site" && git push origin main`, 
      { cwd: __dirname },
      (error, stdout, stderr) => {
        if (error) {
          res.end(JSON.stringify({ success: false, error: stderr || error.message }));
        } else {
          res.end(JSON.stringify({ success: true, output: stdout }));
        }
      }
    );
    return;
  }
  
  if (url.pathname === '/api/mp3/start' && req.method === 'POST') {
    if (mp3DupeProcess) {
      res.end(JSON.stringify({ success: false, error: 'Already running' }));
      return;
    }
    const mp3Path = path.resolve(__dirname, '../../Windsurf_utilities_2026/mp3_dupe_finder');
    mp3DupeProcess = spawn('uv', ['run', 'python', 'app.py'], {
      cwd: mp3Path,
      stdio: 'ignore',
      detached: false
    });
    mp3DupeProcess.on('close', () => { mp3DupeProcess = null; });
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  if (url.pathname === '/api/mp3/stop' && req.method === 'POST') {
    if (mp3DupeProcess) {
      mp3DupeProcess.kill();
      mp3DupeProcess = null;
    }
    exec('pkill -f "mp3_dupe_finder"');
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  if (url.pathname === '/api/shutdown' && req.method === 'POST') {
    if (eleventyProcess) eleventyProcess.kill();
    if (decapProcess) decapProcess.kill();
    if (mp3DupeProcess) mp3DupeProcess.kill();
    exec('pkill -f "eleventy"');
    exec('pkill -f "decap-server"');
    exec('pkill -f "mp3_dupe_finder"');
    res.end(JSON.stringify({ success: true }));
    setTimeout(() => process.exit(0), 500);
    return;
  }
  
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev Panel running at http://localhost:${PORT}\n`);
  console.log('Open this URL in your browser to control your dev server.\n');
});
