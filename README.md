# vantage.ai

```text
      __   __ ___  _  _ ___ ___  ____ ____    ____ _ 
      \ \ / /|__ | |\ |  |  |__] | __ |___    |__| | 
       \ V / |___| | \|  |  |    |__] |___    |  | | 
                                                     
```

### Next-Generation AI Spend Control, Telemetry & Backend Proxy Governance

[![Status](https://img.shields.io/badge/status-production_ready-10b981.svg?style=flat-square)](#)
[![Live App](https://img.shields.io/badge/hosting-vantage--ai--app.web.app-0f62fe.svg?style=flat-square&logo=firebase)](https://vantage-ai-app.web.app)
[![Architecture](https://img.shields.io/badge/architecture-Cloud_Function_Proxy-8b5cf6.svg?style=flat-square)](#)
[![Security](https://img.shields.io/badge/firestore_rules-strict_read_only-ef4444.svg?style=flat-square)](#)

---

**Vantage AI** is an enterprise AI FinOps & Governance platform designed to monitor, budget, and control multi-provider LLM spending across engineering, marketing, data, and video teams.

Built with a **zero-mock data engine**, **Cloud Function backend proxy architecture**, and **strict Firestore security rules**, Vantage AI ensures that no client application ever handles raw API keys or computes unverified client-side metrics.

---

## 🏛️ Architecture Overview

```mermaid
flowchart TD
    Client["Client Web SPA (Vantage Frontend)"]
    Proxy["Firebase Cloud Function Proxy (/api/aiProxy)"]
    DB[("Firebase Firestore (Strict Security Rules)")]
    OpenAI["OpenAI API (api.openai.com)"]
    Anthropic["Anthropic API (api.anthropic.com)"]
    GitHub["GitHub API (api.github.com)"]

    Client -->|1. Submit Prompt & Workspace ID| Proxy
    Proxy -->|2. Check Workspace & Employee Budget| DB
    DB -- "Spent < Budget" --> Proxy
    Proxy -->|3. Call LLM with Hidden Server Key| OpenAI
    Proxy -->|3. Call LLM with Hidden Server Key| Anthropic
    OpenAI -->|4. Return Response & True Usage| Proxy
    Anthropic -->|4. Return Response & True Usage| Proxy
    Proxy -->|5. Write Immutable Telemetry Record| DB
    Proxy -->|6. Return Completion & True Token Counts| Client
```

---

## 🔒 Security & Database Governance Architecture

```mermaid
flowchart LR
    subgraph ClientSDK["Client SDK Access (Browser)"]
        ReadTelemetry["Read Telemetry Ledger"]
        ReadEmployees["Read Employee Spend Totals"]
        BlockedWrite["Write / Update Token Costs (BLOCKED)"]
    end

    subgraph SecurityRules["Firestore Security Rules (firestore.rules)"]
        AuthCheck{"Is Member Authenticated?"}
        AllowRead["allow read: if isWorkspaceMember()"]
        DenyWrite["allow write: if false"]
    end

    subgraph AdminSDK["Backend Server Access (Cloud Functions)"]
        AdminWrite["Firebase Admin SDK (Bypasses Rules)"]
    end

    ReadTelemetry --> AuthCheck
    ReadEmployees --> AuthCheck
    AuthCheck -- Pass --> AllowRead
    BlockedWrite --> DenyWrite
    AdminWrite -->|Write Immutable Telemetry & Update Spend| DB[("Firestore Database")]
```

---

## ⚡ Key Capabilities & Features

### 1. 🛡️ Server-Side Cloud Function LLM Proxy (`/api/aiProxy`)
- **Zero Exposed API Keys:** API keys remain strictly stored in server environments (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`). The client SPA never handles raw keys.
- **Pre-Flight Budget Enforcement:** The proxy verifies the employee's cumulative monthly spend against their budget cap in Firestore before issuing any LLM request.
- **Hard Cap Blocking:** If `spent >= budget`, the proxy aborts execution with HTTP `403` and logs a `Hard Cap` policy trigger.
- **True Token Extraction:** Extracts exact `prompt_tokens` and `completion_tokens` directly from raw HTTP responses, calculates exact cost in INR (`₹`), and updates Firestore via Admin SDK.

### 2. 🔐 Strict Firestore Security Policy (`firestore.rules`)
- **Read-Only Workspace Access:** Workspace members receive read-only access to their specific workspace telemetry documents (`workspaces/{workspaceId}/telemetry/{id}`).
- **Client Write Lockdown:** All `create`, `update`, and `delete` operations from client SDKs are strictly blocked (`allow write: if false;`). Only backend Cloud Functions can write telemetry records.

### 3. 🎯 Real Data Integration Engine (`live-provider-sync.js`)
- **Zero Mock Policy:** Every displayed record carries its verified `confidenceTier` (`live` vs. `unmapped`) and ISO `syncedAt` timestamp.
- **Live Endpoint Verification:** Performs active health checks against `https://api.openai.com/v1/models`, `https://api.anthropic.com/v1/models`, and `https://api.github.com/user`.
- **Unmapped State Handling:** Unmapped providers explicitly render **`Not mapped`** badges—never zero or fabricated fallbacks.

### 4. 📄 Print-Ready 3-Sheet Corporate PDF Generator (`pdf-export.js`)
- **Classic High-Contrast Black & White Accents:** Sleek, corporate black-and-white header bands, section strips, and grid borders paired with semantic status indicators (`NORMAL` green, `WARNING` amber, `HARD CAP` red).
- **Zero Text Overlapping Guarantee:** Precise coordinate math ensures header text, metadata boxes, tables, tax computations, and signature cards never collide across pages.
- **Sheet 1:** Official Tax Invoice & Executive Summary.
- **Sheet 2:** Departmental FinOps Allocation & Model Unit Economics.
- **Sheet 3:** Raw Telemetry Ledger & Agentic Audit Log (`182mm` exact table width, 0% page overflow).

### 5. ⚡ WebGL & GPU Performance Manager
- **192-Frame Canvas Scroll Engine:** Hardware-accelerated hero sequence running smoothly at 60 FPS.
- **Pause-on-Blur Resource Manager:** Automatically suspends the Spline WebGL rendering loop when the user switches browser tabs or blurs the window, preserving system & GPU resources.

---

## 🔄 Real-Time Telemetry Ingestion & Policy State Machine

```mermaid
stateDiagram-v2
    [*] --> IngestRequest: Prompt Sent to /api/aiProxy
    IngestRequest --> QueryBudget: Check Employee Spend in Firestore
    
    state BudgetEvaluation {
        QueryBudget --> NormalState: Usage < 80% Budget
        QueryBudget --> WarningState: 80% <= Usage < 100%
        QueryBudget --> HardCapState: Usage >= 100% Budget
    }

    HardCapState --> RejectRequest: Return HTTP 403 (Hard Cap Triggered)
    RejectRequest --> [*]

    NormalState --> ExecuteLLM: Call OpenAI / Anthropic API
    WarningState --> ExecuteLLM: Call OpenAI / Anthropic API (Dispatch Warning Alert)

    ExecuteLLM --> ExtractTokens: Parse Raw Prompt & Completion Tokens
    ExtractTokens --> WriteTelemetry: Write Immutable Record to Firestore
    WriteTelemetry --> ReturnClient: Return Response & True Token Breakdown
    ReturnClient --> [*]
```

---

## 📄 Multi-Sheet PDF Export Workflow

```mermaid
flowchart TD
    Trigger["Click 'Export PDF Report' or Ctrl+Shift+P"] --> Modal["Open PDF Options Modal"]
    Modal --> Options["User Configures Period, Entity & CFO Signatory Name"]
    Options --> Confirm["Click 'Download PDF'"]
    Confirm --> Engine["Execute PDF Engine (pdf-export.js)"]
    
    subgraph PDFGeneration["jsPDF 3-Sheet Document Assembly"]
        Sheet1["Sheet 1: Official Tax Invoice & Executive Summary"]
        Sheet2["Sheet 2: Departmental FinOps & Model Economics"]
        Sheet3["Sheet 3: Itemised Telemetry Ledger (182mm Exact Width)"]
    end

    Engine --> Sheet1
    Sheet1 --> Sheet2
    Sheet2 --> Sheet3
    Sheet3 --> Save["Execute Native doc.save() Direct Browser Download"]
    Save --> Done["File Saved: Vantage_Billing_Packet_July_2026.pdf"]
```

---

## 📂 Repository Structure

```text
vantage-ai/
├── index.html               # Main SPA Interface (Dashboard, Telemetry Ledger, Modals)
├── styles.css               # Design System, HSL Color Tokens, Bento Grid & Micro-Animations
├── app.js                   # Application Controller, Routing, Alert Logs, Chart Engine
├── live-provider-sync.js    # Real Data Integration Engine & Backend Proxy Dispatcher
├── pdf-export.js            # 3-Sheet Executive PDF Generator (Black & White Corporate Theme)
├── firestore.rules          # Strict Firestore Security Rules (Client Read-Only)
├── firebase.json            # Firebase Hosting Configuration, Cache Headers & Function Rewrites
├── functions/
│   ├── index.js             # Firebase Cloud Function Backend LLM Proxy (/api/aiProxy)
│   └── package.json         # Server-side Cloud Functions Dependencies
└── README.md                # Technical Documentation & Architecture Manual
```

---

## 🚀 Quick Start & Deployment

### 1. Run Locally
Serve the static frontend with any static HTTP server:
```bash
npx serve .
```
Or using Python:
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### 2. Deploy Cloud Functions & Hosting to Firebase
Ensure you are logged in via Firebase CLI:
```bash
firebase login
```
Deploy hosting and security rules:
```bash
firebase deploy --only hosting,firestore:rules --project vantage-ai-perf-2026
```
Deploy backend proxy Cloud Functions:
```bash
firebase deploy --only functions --project vantage-ai-perf-2026
```

---

## 🌐 Live Production Target

- **Production URL:** [https://vantage-ai-app.web.app](https://vantage-ai-app.web.app)
- **Firebase Project:** `vantage-ai-perf-2026`
- **Hosted Site Target:** `vantage-ai-app`
