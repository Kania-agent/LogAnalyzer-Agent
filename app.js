// LogAnalyzer-AI — Full Log File Analyzer
// ============================================================

let allLogs = [];
let filteredLogs = [];
let activeLevels = new Set(['ERROR', 'WARN', 'INFO', 'DEBUG']);

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('fileInput');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  input.addEventListener('change', e => handleFiles(e.target.files));
});

function handleFiles(files) {
  if (!files || !files.length) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    allLogs = parseLogs(text);
    applyFilters();
    updateStats();
    document.getElementById('statsBar').style.display = 'flex';
    document.getElementById('controlsPanel').style.display = 'block';
  };
  reader.readAsText(file);
}

// ---- Log Parsing ----
function parseLogs(text) {
  const lines = text.split('\n');
  const logs = [];
  // Common patterns: [TIMESTAMP] LEVEL message, TIMESTAMP LEVEL message, etc.
  const patterns = [
    /^(\d{4}[-\/]\d{2}[-\/]\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)\s+(.*)$/i,
    /^\[(\d{4}[-\/]\d{2}[-\/]\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]\s*\[(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)\]\s*(.*)$/i,
    /^\[(\d{4}[-\/]\d{2}[-\/]\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]\s*(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)\s*[-:]\s*(.*)$/i,
    /^(\d{4}[-\/]\d{2}[-\/]\d{2}\s+\d{2}:\d{2}:\d{2}(?:,\d+)?)\s+(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)[\s:]+(.*)$/i,
    /^(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)\s+(\d{4}[-\/]\d{2}[-\/]\d{2}[T ]\d{2}:\d{2}:\d{2})\s+(.*)$/i,
  ];

  let unparsed = 0;
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let time, level, message;
        // Check which group is the timestamp
        if (/^(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|TRACE)/i.test(match[1])) {
          level = match[1].toUpperCase();
          time = match[2];
          message = match[3];
        } else {
          time = match[1];
          level = match[2].toUpperCase();
          message = match[3];
        }
        if (level === 'WARNING') level = 'WARN';
        if (level === 'FATAL') level = 'ERROR';
        if (level === 'TRACE') level = 'DEBUG';
        logs.push({
          index: idx,
          timestamp: new Date(time.replace(',', '.')),
          level,
          message: message,
          raw: trimmed
        });
        return;
      }
    }
    // Fallback: unknown format
    logs.push({
      index: idx,
      timestamp: new Date(),
      level: 'INFO',
      message: trimmed,
      raw: trimmed,
      unparsed: true
    });
  });

  // Sort by timestamp
  logs.sort((a, b) => a.timestamp - b.timestamp);
  return logs;
}

// ---- Filtering ----
function toggleLevel(btn) {
  const level = btn.dataset.level;
  if (activeLevels.has(level)) {
    activeLevels.delete(level);
    btn.classList.remove('active');
  } else {
    activeLevels.add(level);
    btn.classList.add('active');
  }
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  filteredLogs = allLogs.filter(log => {
    if (!activeLevels.has(log.level)) return false;
    if (search && !log.message.toLowerCase().includes(search) && !log.raw.toLowerCase().includes(search)) return false;
    return true;
  });
  renderLogEntries();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  applyFilters();
}

// ---- Rendering ----
function renderLogEntries() {
  const container = document.getElementById('logList');
  const search = document.getElementById('searchInput').value;
  if (filteredLogs.length === 0) {
    container.innerHTML = '<p class="placeholder">No log entries match current filters.</p>';
    return;
  }
  // Limit rendering to 2000 for performance
  const renderLogs = filteredLogs.slice(0, 2000);
  let html = '';
  renderLogs.forEach(log => {
    let msgHtml = esc(log.message);
    if (search) {
      const regex = new RegExp(`(${escRegex(search)})`, 'gi');
      msgHtml = msgHtml.replace(regex, '<mark>$1</mark>');
    }
    const timeStr = isNaN(log.timestamp.getTime()) ? 'N/A' : formatTimestamp(log.timestamp);
    html += `<div class="log-entry level-${log.level}">
      <span class="log-time">${timeStr}</span>
      <span class="log-level">${log.level}</span>
      <span class="log-msg">${msgHtml}</span>
    </div>`;
  });
  if (filteredLogs.length > 2000) {
    html += `<p class="placeholder">Showing 2000 of ${filteredLogs.length} entries. Use filters to narrow down.</p>`;
  }
  container.innerHTML = html;
}

function updateStats() {
  const counts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
  allLogs.forEach(log => { if (counts[log.level] !== undefined) counts[log.level]++; });
  document.getElementById('statTotal').textContent = allLogs.length;
  document.getElementById('statError').textContent = counts.ERROR;
  document.getElementById('statWarn').textContent = counts.WARN;
  document.getElementById('statInfo').textContent = counts.INFO;
  document.getElementById('statDebug').textContent = counts.DEBUG;
}

// ---- Timeline Visualization ----
function renderTimeline() {
  if (allLogs.length === 0) return;
  const canvas = document.getElementById('timelineCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 300 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '300px';
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 300;

  ctx.clearRect(0, 0, W, H);

  const validLogs = allLogs.filter(l => !isNaN(l.timestamp.getTime()));
  if (validLogs.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No timestamped log entries found', W / 2, H / 2);
    return;
  }

  const minTime = validLogs[0].timestamp.getTime();
  const maxTime = validLogs[validLogs.length - 1].timestamp.getTime();
  const timeRange = Math.max(maxTime - minTime, 1);

  // Bucket into time intervals
  const numBuckets = Math.min(100, Math.max(20, Math.floor(W / 12)));
  const bucketSize = timeRange / numBuckets;
  const buckets = [];
  for (let i = 0; i < numBuckets; i++) {
    buckets.push({ ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 });
  }
  validLogs.forEach(log => {
    let idx = Math.floor((log.timestamp.getTime() - minTime) / bucketSize);
    if (idx >= numBuckets) idx = numBuckets - 1;
    if (buckets[idx][log.level] !== undefined) buckets[idx][log.level]++;
  });

  const maxCount = Math.max(1, ...buckets.map(b => b.ERROR + b.WARN + b.INFO + b.DEBUG));
  const chartPad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - chartPad.left - chartPad.right;
  const chartH = H - chartPad.top - chartPad.bottom;
  const barW = chartW / numBuckets;

  // Draw grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = chartPad.top + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(chartPad.left, y);
    ctx.lineTo(W - chartPad.right, y);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxCount * (5 - i) / 5), chartPad.left - 6, y + 3);
  }

  // Draw stacked bars
  const colors = { DEBUG: '#a78bfa', INFO: '#60a5fa', WARN: '#fbbf24', ERROR: '#f87171' };
  buckets.forEach((bucket, i) => {
    const x = chartPad.left + i * barW;
    let cumY = chartPad.top + chartH;
    ['DEBUG', 'INFO', 'WARN', 'ERROR'].forEach(level => {
      const count = bucket[level];
      if (count === 0) return;
      const h = (count / maxCount) * chartH;
      ctx.fillStyle = colors[level];
      ctx.fillRect(x + 1, cumY - h, barW - 2, h);
      cumY -= h;
    });
  });

  // Draw time axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const t = minTime + (timeRange / 5) * i;
    const x = chartPad.left + (chartW / 5) * i;
    const d = new Date(t);
    ctx.fillText(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, H - 10);
  }

  // Legend
  document.getElementById('timelineLegend').innerHTML = ['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level =>
    `<span class="legend-item"><span class="legend-dot" style="background:${colors[level]}"></span>${level}</span>`
  ).join('');
}

// ---- Pattern Detection ----
function renderPatterns() {
  const panel = document.getElementById('patternsPanel');
  if (allLogs.length === 0) {
    panel.innerHTML = '<p class="placeholder">Upload a log file to detect patterns.</p>';
    return;
  }

  // Message frequency analysis — group by similar messages
  const messageGroups = {};
  allLogs.forEach(log => {
    // Normalize message: replace numbers, UUIDs, IPs, hex, etc.
    const normalized = log.message
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<UUID>')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<IP>')
      .replace(/\b\d+\b/g, '<N>')
      .replace(/\b0x[0-9a-fA-F]+\b/g, '<HEX>')
      .replace(/\/[\w/.-]+/g, '<PATH>');
    if (!messageGroups[normalized]) messageGroups[normalized] = { count: 0, level: log.level, sample: log.message, timestamps: [] };
    messageGroups[normalized].count++;
    if (messageGroups[normalized].timestamps.length < 10) messageGroups[normalized].timestamps.push(log.timestamp);
  });

  // Sort by frequency
  const sorted = Object.entries(messageGroups).sort((a, b) => b[1].count - a[1].count).slice(0, 20);
  const maxFreq = sorted.length > 0 ? sorted[0][1].count : 1;

  // Error frequency analysis
  const hourlyErrors = {};
  allLogs.filter(l => l.level === 'ERROR').forEach(log => {
    if (isNaN(log.timestamp.getTime())) return;
    const hour = log.timestamp.toISOString().slice(0, 13);
    hourlyErrors[hour] = (hourlyErrors[hour] || 0) + 1;
  });

  let html = '';

  // Top repeated messages
  html += '<div class="pattern-section"><h3>🔄 Most Repeated Messages</h3>';
  sorted.forEach(([msg, data]) => {
    const pct = (data.count / maxFreq * 100).toFixed(0);
    const levelColor = { ERROR: '#f87171', WARN: '#fbbf24', INFO: '#60a5fa', DEBUG: '#a78bfa' }[data.level] || '#60a5fa';
    html += `<div class="pattern-item">
      <span class="pattern-count">${data.count}</span>
      <span class="pattern-text" title="${esc(data.sample)}">${esc(msg.substring(0, 100))}</span>
      <div class="pattern-bar"><div class="pattern-bar-fill" style="width:${pct}%;background:${levelColor}"></div></div>
      <span style="color:${levelColor};font-size:11px;font-weight:600">${data.level}</span>
    </div>`;
  });
  html += '</div>';

  // Hourly error distribution
  const hours = Object.entries(hourlyErrors).sort((a, b) => a[0].localeCompare(b[0]));
  if (hours.length > 0) {
    const maxH = Math.max(...hours.map(h => h[1]));
    html += '<div class="pattern-section"><h3>⏰ Error Distribution by Hour</h3>';
    hours.forEach(([hour, count]) => {
      const pct = (count / maxH * 100).toFixed(0);
      html += `<div class="pattern-item">
        <span class="pattern-count" style="background:#f87171">${count}</span>
        <span class="pattern-text">${hour}:00</span>
        <div class="pattern-bar"><div class="pattern-bar-fill" style="width:${pct}%;background:#f87171"></div></div>
      </div>`;
    });
    html += '</div>';
  }

  // Peak activity times
  const timeFreq = {};
  allLogs.forEach(log => {
    if (isNaN(log.timestamp.getTime())) return;
    const min = log.timestamp.toISOString().slice(0, 14) + '0';
    timeFreq[min] = (timeFreq[min] || 0) + 1;
  });
  const topTimes = Object.entries(timeFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (topTimes.length > 0) {
    const maxT = topTimes[0][1];
    html += '<div class="pattern-section"><h3>🔥 Peak Activity Windows (5-min intervals)</h3>';
    topTimes.forEach(([time, count]) => {
      const pct = (count / maxT * 100).toFixed(0);
      html += `<div class="pattern-item">
        <span class="pattern-count" style="background:#2563eb">${count}</span>
        <span class="pattern-text">${time.replace('T', ' ')}</span>
        <div class="pattern-bar"><div class="pattern-bar-fill" style="width:${pct}%;background:#2563eb"></div></div>
      </div>`;
    });
    html += '</div>';
  }

  panel.innerHTML = html;
}

// ---- Error Clustering ----
function renderClusters() {
  const panel = document.getElementById('clustersPanel');
  const errorLogs = allLogs.filter(l => l.level === 'ERROR');
  if (errorLogs.length === 0) {
    panel.innerHTML = '<p class="placeholder">No ERROR entries to cluster.</p>';
    return;
  }

  // Cluster errors by normalized message
  const clusters = {};
  errorLogs.forEach(log => {
    const normalized = log.message
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<UUID>')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<IP>')
      .replace(/\b\d+\b/g, '<N>')
      .replace(/\/[\w/.-]+/g, '<PATH>');
    if (!clusters[normalized]) clusters[normalized] = [];
    clusters[normalized].push(log);
  });

  // Sort clusters by size
  const sorted = Object.entries(clusters).sort((a, b) => b[1].length - a[1].length);

  let html = `<p style="color:#94a3b8;margin-bottom:16px;font-size:13px">${errorLogs.length} ERROR entries grouped into ${sorted.length} cluster(s)</p>`;

  sorted.forEach(([pattern, logs], idx) => {
    if (idx >= 30) return; // Limit display
    const first = logs[0];
    const timeRange = logs.length > 1
      ? `${formatTimestamp(logs[0].timestamp)} → ${formatTimestamp(logs[logs.length - 1].timestamp)}`
      : formatTimestamp(first.timestamp);

    let occHtml = '';
    logs.slice(0, 5).forEach(l => {
      occHtml += `<div class="cluster-occurrence">
        <span style="color:#64748b;min-width:150px;font-family:monospace;font-size:11px">${formatTimestamp(l.timestamp)}</span>
        <span style="color:#f87171;font-size:11px;font-family:monospace">${esc(l.message.substring(0, 120))}</span>
      </div>`;
    });
    if (logs.length > 5) occHtml += `<div style="color:#64748b;font-size:11px;padding:4px 0">... and ${logs.length - 5} more</div>`;

    html += `<div class="cluster-item">
      <div class="cluster-header">
        <span style="font-size:13px;font-weight:600">Cluster #${idx + 1}</span>
        <span class="cluster-count">${logs.length} occurrences</span>
      </div>
      <div class="cluster-message">${esc(pattern.substring(0, 200))}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">⏱ ${timeRange}</div>
      <div class="cluster-occurrences">${occHtml}</div>
    </div>`;
  });

  panel.innerHTML = html;
}

// ---- View Switching ----
function switchView(view, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tabs-toolbar .tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  btn.classList.add('active');

  if (view === 'timeline') renderTimeline();
  if (view === 'patterns') renderPatterns();
  if (view === 'clusters') renderClusters();
}

// ---- Export ----
function exportLogs() {
  const data = filteredLogs.map(log => {
    const timeStr = isNaN(log.timestamp.getTime()) ? 'N/A' : log.timestamp.toISOString();
    return `[${timeStr}] ${log.level} ${log.message}`;
  }).join('\n');
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `filtered_logs_${new Date().toISOString().slice(0, 10)}.log`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  allLogs = [];
  filteredLogs = [];
  document.getElementById('logList').innerHTML = '<p class="placeholder">Upload a log file to begin analysis.</p>';
  document.getElementById('statsBar').style.display = 'none';
  document.getElementById('controlsPanel').style.display = 'none';
  document.getElementById('fileInput').value = '';
}

// ---- Utilities ----
function formatTimestamp(d) {
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
