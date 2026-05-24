/* LogAnalyzer-AI — App Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Clock
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Tabs
    document.querySelectorAll('.term-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.term-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.term-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Log data
    const logMessages = [
        { level: 'info', msg: '[Server] Application started on port 8080' },
        { level: 'info', msg: '[Database] Connected to PostgreSQL 15.2 at db.prod.internal:5432' },
        { level: 'info', msg: '[Cache] Redis cluster initialized with 3 nodes' },
        { level: 'debug', msg: '[Router] Registered 42 API endpoints' },
        { level: 'info', msg: '[Auth] JWT validation middleware loaded' },
        { level: 'warn', msg: '[Memory] Heap usage at 72% — approaching threshold' },
        { level: 'error', msg: '[HTTP 500] NullPointerException at UserService.java:142' },
        { level: 'info', msg: '[Request] GET /api/v2/users — 200 OK (23ms)' },
        { level: 'info', msg: '[Request] POST /api/v2/orders — 201 Created (45ms)' },
        { level: 'error', msg: '[HTTP 500] NullPointerException at UserService.java:142' },
        { level: 'debug', msg: '[Query] SELECT * FROM users WHERE id = ? — 3ms' },
        { level: 'warn', msg: '[RateLimit] Client 192.168.1.105 exceeded limit (1000 req/min)' },
        { level: 'info', msg: '[Request] GET /api/v2/products — 200 OK (12ms)' },
        { level: 'error', msg: '[Timeout] Connection to payment-gateway.prod:443 timed out after 30s' },
        { level: 'error', msg: '[HTTP 500] NullPointerException at UserService.java:142' },
        { level: 'info', msg: '[Queue] Processed 248 messages from order_queue' },
        { level: 'debug', msg: '[Session] Created session for user_id=4521' },
        { level: 'warn', msg: '[Disk] /var/log partition at 85% capacity' },
        { level: 'info', msg: '[HealthCheck] All services healthy — uptime: 99.97%' },
        { level: 'error', msg: '[Timeout] Connection to payment-gateway.prod:443 timed out after 30s' },
        { level: 'info', msg: '[Request] PUT /api/v2/users/4521 — 200 OK (31ms)' },
        { level: 'error', msg: '[NullPointerException] at com.app.service.UserService.processOrder(UserService.java:142)' },
        { level: 'debug', msg: '[Metrics] CPU: 45%, MEM: 72%, DISK: 68%' },
        { level: 'info', msg: '[WebSocket] 12 active connections' },
        { level: 'warn', msg: '[GC] Full GC pause: 890ms — exceeds 500ms threshold' },
        { level: 'error', msg: '[Timeout] Connection to payment-gateway.prod:443 timed out after 30s' },
        { level: 'info', msg: '[Scheduler] Cron job cleanup executed — removed 1247 expired records' },
        { level: 'error', msg: '[NullPointerException] at com.app.service.UserService.processOrder(UserService.java:142)' },
        { level: 'debug', msg: '[Cache] Cache hit ratio: 87.3% (24832/28439)' },
        { level: 'info', msg: '[Request] DELETE /api/v2/sessions/expired — 200 OK (156ms)' },
    ];

    const logEntries = [];
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 1);

    logMessages.forEach((log, i) => {
        const t = new Date(baseTime.getTime() + i * 12000);
        const timeStr = t.toTimeString().slice(0, 8) + '.' + String(Math.floor(Math.random() * 999)).padStart(3, '0');
        logEntries.push({ ...log, time: timeStr });
    });

    let currentFilter = 'all';
    let searchText = '';

    function formatLogEntry(entry) {
        const levelClass = entry.level;
        const timeHtml = `<span class="log-entry timestamp">[${entry.time}]</span>`;
        const msgHtml = `<span class="log-entry ${levelClass}">[${entry.level.toUpperCase().padEnd(5)}] ${entry.msg}</span>`;
        return `<div class="log-entry">${timeHtml} ${msgHtml}</div>`;
    }

    function renderLogs() {
        const container = document.getElementById('log-container');
        const filtered = logEntries.filter(e => {
            if (currentFilter !== 'all' && e.level !== currentFilter) return false;
            if (searchText && !e.msg.toLowerCase().includes(searchText.toLowerCase())) return false;
            return true;
        });
        container.innerHTML = filtered.map(formatLogEntry).join('');
        document.getElementById('log-count').textContent = `${filtered.length} lines`;
        container.scrollTop = container.scrollHeight;
    }

    renderLogs();

    // Filter
    document.getElementById('log-filter').addEventListener('input', (e) => {
        searchText = e.target.value;
        renderLogs();
    });

    // Level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.level;
            renderLogs();
        });
    });

    // Simulate live log entries
    setInterval(() => {
        const templates = [
            { level: 'info', msg: `[Request] GET /api/v2/status — 200 OK (${Math.floor(Math.random() * 50 + 5)}ms)` },
            { level: 'debug', msg: `[Query] SELECT count(*) FROM orders WHERE status='active' — ${Math.floor(Math.random() * 10 + 1)}ms` },
            { level: 'warn', msg: `[Memory] Heap usage at ${Math.floor(Math.random() * 15 + 70)}% — monitoring` },
            { level: 'info', msg: `[Queue] Processed ${Math.floor(Math.random() * 100 + 50)} messages from event_queue` },
            { level: 'error', msg: `[Timeout] Connection to downstream-service:${Math.floor(Math.random() * 1000 + 8000)} timed out` },
        ];
        const tmpl = templates[Math.floor(Math.random() * templates.length)];
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
        logEntries.push({ ...tmpl, time: timeStr });
        if (logEntries.length > 200) logEntries.shift();
        renderLogs();
    }, 3000);

    // Patterns
    const patterns = [
        { name: 'NullPointerException at UserService.java:142', freq: 47, severity: 'high', example: 'NullPointerException at com.app.service.UserService.processOrder', pct: 92 },
        { name: 'Payment Gateway Timeout', freq: 23, severity: 'high', example: 'Connection to payment-gateway.prod:443 timed out after 30s', pct: 78 },
        { name: 'Rate Limit Exceeded', freq: 15, severity: 'medium', example: 'Client * exceeded limit (1000 req/min)', pct: 55 },
        { name: 'Memory Threshold Warning', freq: 12, severity: 'medium', example: 'Heap usage at 72-85% — approaching threshold', pct: 45 },
        { name: 'Disk Space Warning', freq: 8, severity: 'low', example: '/var/log partition at 85% capacity', pct: 30 },
        { name: 'GC Pause Exceeds Threshold', freq: 6, severity: 'low', example: 'Full GC pause: 890ms — exceeds 500ms threshold', pct: 22 },
    ];

    const patternsGrid = document.getElementById('patterns-grid');
    patternsGrid.innerHTML = patterns.map(p => `
        <div class="pattern-card ${p.severity}">
            <div class="pattern-header">
                <span class="pattern-name">[${p.severity.toUpperCase()}] ${p.name}</span>
                <span class="pattern-freq">${p.freq} occurrences</span>
            </div>
            <div class="pattern-example">$ ${p.example}</div>
            <div class="pattern-bar">
                <div class="pattern-bar-fill" style="width: ${p.pct}%"></div>
            </div>
        </div>
    `).join('');

    // Error Clusters
    const clusters = [
        {
            type: 'NullPointerException',
            color: '#ff3333',
            count: 47,
            messages: [
                'NullPointerException at UserService.java:142',
                'NullPointerException at OrderProcessor.java:89',
                'NullPointerException at AuthMiddleware.java:34',
            ],
            timeline: [1,1,0,1,1,1,0,0,1,1,1,1,0,1,0,0,1,1,1,0,1,1,0,1]
        },
        {
            type: 'Connection Timeout',
            color: '#ffb000',
            count: 23,
            messages: [
                'Connection to payment-gateway.prod:443 timed out',
                'Connection to shipping-api.internal:8443 timed out',
                'Connection to notification-svc:5000 timed out',
            ],
            timeline: [0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0]
        },
        {
            type: 'Rate Limiting',
            color: '#00ffff',
            count: 15,
            messages: [
                'Client 192.168.1.105 exceeded rate limit',
                'Client 10.0.0.42 exceeded rate limit',
            ],
            timeline: [0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1]
        },
        {
            type: 'Out of Memory',
            color: '#ff3333',
            count: 8,
            messages: [
                'java.lang.OutOfMemoryError: Java heap space',
                'java.lang.OutOfMemoryError: GC overhead limit exceeded',
            ],
            timeline: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0]
        }
    ];

    const clustersContainer = document.getElementById('clusters-container');
    clustersContainer.innerHTML = clusters.map(c => {
        const ticks = c.timeline.map(t => `<div class="cluster-tick ${t ? 'active' : ''}${c.timeline.indexOf(t) >= c.timeline.length - 4 && t ? ' recent' : ''}"></div>`).join('');
        const msgs = c.messages.map(m => `<div class="cluster-msg">• ${m}</div>`).join('');
        return `
            <div class="cluster-card">
                <div class="cluster-header">
                    <span class="cluster-type" style="color: ${c.color}">${c.type}</span>
                    <span class="cluster-count">${c.count}x</span>
                </div>
                ${msgs}
                <div class="cluster-timeline">${ticks}</div>
            </div>
        `;
    }).join('');

    const totalErrors = clusters.reduce((s, c) => s + c.count, 0);
    document.getElementById('cluster-stats').innerHTML = `
        <span class="prompt-label">[stats]</span> Total errors: <span style="color:var(--term-red)">${totalErrors}</span> across <span style="color:var(--term-amber)">${clusters.length}</span> clusters — 
        Most frequent: <span style="color:${clusters[0].color}">${clusters[0].type}</span> (${clusters[0].count}x)
    `;

    // Command input
    document.getElementById('command-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = e.target.value.trim();
            if (cmd === 'clear') {
                document.getElementById('log-container').innerHTML = '';
            } else if (cmd === 'stats') {
                document.querySelector('.term-tab[data-tab="clusters"]').click();
            } else if (cmd === 'patterns') {
                document.querySelector('.term-tab[data-tab="patterns"]').click();
            }
            e.target.value = '';
        }
    });
});
