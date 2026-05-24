# 📊 LogAnalyzer-AI

> Intelligent log analysis with real-time pattern detection, error clustering, and AI-driven root cause insights — powered by MiMo V2.5

## Why This Exists

Modern distributed systems generate millions of log lines per hour. When an incident strikes, engineers find themselves drowning in grep commands, scrolling through endless terminal output, and trying to mentally correlate errors across dozens of microservices. The signal-to-noise ratio is brutal — critical error patterns hide behind layers of routine INFO logs and repetitive heartbeat messages.

LogAnalyzer-AI replaces that manual archaeology with intelligent analysis. Powered by MiMo V2.5's pattern recognition, it ingests raw log streams and automatically identifies recurring error signatures, clusters related failures, and surfaces the root cause indicators that human operators often miss. Instead of searching for the needle in the haystack, the haystack organizes itself around the needle.

The platform provides a terminal-native experience that DevOps engineers and SREs actually want to use — complete with syntax highlighting, log-level filtering, and a real-time streaming interface that feels like tailing logs in your favorite terminal, but with AI superpowers layered on top.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LogAnalyzer-AI Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │              │    │              │                           │
│  │  Log Stream  │───▶│   Parser     │                           │
│  │   Ingest     │    │   Engine     │                           │
│  │              │    │              │                           │
│  └──────────────┘    └──────┬───────┘                           │
│                             │                                   │
│                             ▼                                   │
│                      ┌──────────────┐    ┌──────────────┐      │
│                      │   Pattern    │    │              │      │
│                      │  Detector    │───▶│    Alert     │      │
│                      │              │    │  Generator   │      │
│                      └──────────────┘    └──────────────┘      │
│                             │                   │              │
│                             ▼                   ▼              │
│                      ┌──────────────────────────────┐          │
│                      │    Dashboard & Alert Feed     │          │
│                      └──────────────────────────────┘          │
│                                                                 │
│  Input: Raw log lines (multi-format)                            │
│  Output: Clustered patterns + Severity alerts                   │
└─────────────────────────────────────────────────────────────────┘
```

## Token Consumption Model

| Pipeline Stage       | Tokens per Run | Description                                        |
|----------------------|----------------|----------------------------------------------------|
| 📝 Log Parser        | 100K           | Parse multi-format logs, extract structured fields |
| 🔎 Pattern Detector  | 400K           | Cluster errors, detect anomalies, identify trends  |
| 🚨 Alert Generator   | 150K           | Classify severity, generate actionable alerts      |
| **Total**            | **650K**       | End-to-end log analysis pipeline                   |

## Features

- **Real-Time Log Viewer** — Terminal-style display with syntax highlighting, ANSI color support, and live streaming
- **AI Pattern Detection** — Automatically identifies recurring error signatures and anomalous log patterns
- **Error Clustering** — Groups similar errors with frequency analysis and deduplication
- **Multi-Level Filtering** — Filter by ERROR, WARN, INFO, DEBUG, and TRACE with instant search
- **Root Cause Indicators** — AI highlights likely root causes based on temporal correlation and error chains
- **Alert Generation** — Configurable alert thresholds with severity classification (critical/warning/info)
- **Log Format Support** — Parses JSON logs, syslog, Apache/Nginx, custom application formats
- **Classic Terminal Theme** — Green-on-black aesthetic that ops engineers love

## Tech Stack

- **Frontend** — Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- **Styling** — Custom terminal theme with monospace fonts and ANSI color mapping
- **Logic** — Pure client-side parsing and pattern matching, zero dependencies
- **AI Engine** — MiMo V2.5 by Nous Research
- **Deployment** — Static files, works in any modern browser

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nousresearch/LogAnalyzer-AI.git
cd LogAnalyzer-AI

# Open directly in your browser
open index.html

# Or serve locally
python3 -m http.server 8080
# Navigate to http://localhost:8080
```

## Project Structure

```
LogAnalyzer-AI/
├── index.html          # Terminal-themed UI with log viewer panels
├── style.css           # Green-on-black terminal styles & animations
├── app.js              # Log parsing engine & AI pattern detection
└── README.md           # This file
```

---

> Built with MiMo V2.5 — [Nous Research](https://nousresearch.com)
