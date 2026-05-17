# 🏗️ GoalAlign — System Architecture & Data Flow Design

Welcome to the technical architecture documentation for **GoalAlign**, the premium OKR and performance alignment portal designed for the **Atomberg Hackathon 1.0**. 

This document breaks down the multi-tiered system design, the lifecycle sequencing of Goal Sheets, and the relational database schema supporting our secure serverless infrastructure.

---

## 🖥️ 1. System Component Architecture

GoalAlign is designed on a highly responsive, modern multi-tiered serverless architecture using **Next.js 15**, **Prisma ORM**, and **Neon Serverless PostgreSQL**.

```mermaid
graph TD
    %% Styling definitions
    classDef client fill:#1A1F2C,stroke:#00E5FF,stroke-width:2px,color:#FFFFFF;
    classDef app fill:#1E1E2F,stroke:#FF007F,stroke-width:2px,color:#FFFFFF;
    classDef data fill:#112233,stroke:#39FF14,stroke-width:2px,color:#FFFFFF;
    classDef infra fill:#2A1B4E,stroke:#E0B0FF,stroke-width:2px,color:#FFFFFF;

    subgraph Client_Tier ["🖥️ Client Tier (User Browser)"]
        A["Sleek Responsive UI<br/>(Glassmorphic Vanilla CSS)"]:::client
        B["NextAuth Session Provider<br/>(Client Hook: useSession)"]:::client
        C["Client Components<br/>(Dynamic UI / Form Validations)"]:::client
    end

    subgraph App_Tier ["🚀 Application Tier (Vercel Serverless)"]
        D["Next.js App Router<br/>(Server & Client Components)"]:::app
        E["NextAuth Credentials Provider<br/>(Session Encryption & Guards)"]:::app
        F["Server Actions & Actions.ts<br/>(Database Queries & Mutations)"]:::app
        G["CSV Export Engine<br/>(Dynamic Spreadsheet Output)"]:::app
    end

    subgraph Data_Tier ["🗄️ Database & ORM Tier (Neon PostgreSQL)"]
        H["Prisma Client ORM<br/>(Typesafe Query Compilation)"]:::data
        I["Neon Serverless PostgreSQL<br/>(Cloud Cluster)"]:::data
    end

    subgraph CI_CD ["🔄 DevOps & Infrastructure"]
        J["GitHub Repository<br/>(Source Control)"]:::infra
        K["Vercel Build Pipeline<br/>(Automated Build & Deploy)"]:::infra
    end

    %% Flow connections
    A -->|Interacts| C
    C -->|Invokes| F
    B -->|Validates Session| E
    D -->|Renders| A
    F -->|Uses Prisma| H
    H -->|Executes Queries| I
    J -->|Trigger Webhook| K
    K -->|Deploys Bundle| D
```

### Architectural Highlights
* **Edge-Optimized Presentation**: The frontend leverages React Server Components (RSC) to minimize Client Bundle size and render static shells instantly.
* **Secured Context Isolation**: User sessions are handled with cryptographically secure JSON Web Tokens (JWT) using `NextAuth.js`, preventing role-privilege escalation at both UI routing and API Server Action layers.
* **Serverless Data Pipeline**: Rather than spinning up resource-intensive traditional server architectures, database operations occur through stateless Next.js Server Actions connecting dynamically to a pooled serverless Neon PostgreSQL database via a lightweight Prisma ORM compilation.

---

## 🔄 2. Goal Sheets Lifecycle & Sequence Flow

This diagram illustrates the sequence of validation, submission, approval, and feedback workflows when an employee creates their OKRs and aligns them with strategic department objectives.

```mermaid
sequenceDiagram
    autonumber
    actor Employee as 🧑‍💻 Employee
    actor Manager as 🧑‍💼 Manager
    participant App as 🚀 Server Actions (GoalAlign App)
    participant DB as 🗄️ Neon Database

    Note over Employee, DB: Goal Creation & Approval Stage
    Employee->>App: 1. Draft Goal Sheet (Weightages, Thrust Areas, UOMs)
    App->>App: 2. Enforce Validation Rules (Total Wt = 100%, Count <= 8, Wt >= 10%)
    alt Validation Fails
        App-->>Employee: Return Error Response (Block Submission)
    else Validation Passes
        App->>DB: Save Goal Records (Status: draft, progressStatus: not_started)
        App->>DB: Write Audit Log (Action: "GOAL_SHEET_CREATED")
        DB-->>Employee: Confirm Saved Draft
    end

    Employee->>App: 3. Submit Goal Sheet for Approval
    App->>DB: Update Goal Status (Status: pending_approval)
    App->>DB: Write Audit Log (Action: "GOAL_SHEET_SUBMITTED")
    DB-->>Employee: Goal Sheet Locked from editing

    Note over Manager, DB: Review & Check-in Stage
    Manager->>App: 4. Fetch Reporting Employee Goal Sheets
    App->>DB: Query Goals where status = pending_approval & Employee managerId = Manager ID
    DB-->>Manager: Display Goal Sheets dashboard

    alt Manager Rejects (Rework Needed)
        Manager->>App: Rework request with comments
        App->>DB: Update Goal Status (Status: draft)
        App->>DB: Write Audit Log (Action: "GOAL_SHEET_REWORK_REQUESTED")
        DB-->>Employee: Unlock for edits & display Manager comments
    else Manager Approves
        Manager->>App: Approve Goal Sheet
        App->>DB: Update Goal Status (Status: approved, approvedAt: NOW)
        App->>DB: Write Audit Log (Action: "GOAL_SHEET_APPROVED")
        DB-->>Employee: Display Goal Sheet as Active/Locked
    end
```

---

## 🗄️ 3. Database Entity-Relationship Diagram (ERD)

The PostgreSQL schema compiled with Prisma enforces structural relationships ensuring high compliance, auditable history, and quick querying speeds.

```mermaid
erDiagram
    USER {
        String id PK "Primary Key (CUID)"
        String name "Full Name"
        String email UK "Unique Login Email"
        String password "Hashed Password String"
        String role "employee / manager / hr_exec"
        String department "Strategic Business Unit"
        String managerId FK "Self-Relation pointing to User.id"
        DateTime createdAt "Account Creation Timestamp"
    }
    GOAL {
        String id PK "Primary Key (CUID)"
        String userId FK "Author of the Goal"
        String title "Objective Headline"
        String description "Details/Thrust Alignment"
        String thrustArea "Strategic Thrust Category"
        String uom "Unit of Measure (Min/Max/Timeline/Zero)"
        Float target "Target Value to attain"
        Float weightage "Goal Weightage (10% to 80%)"
        String status "draft / pending_approval / approved"
        String progressStatus "not_started / in_progress / completed / at_risk"
        Boolean isShared "Pushed shared goal indicator"
        String sharedFromId "Reference to original parent Goal"
        DateTime createdAt "Creation Timestamp"
        DateTime approvedAt "Approval Timestamp"
        DateTime updatedAt "Last Edit Timestamp"
    }
    CHECKIN {
        String id PK "Primary Key (CUID)"
        String goalId FK "Target Goal"
        String userId FK "Submitting Employee"
        String quarter "Q1 / Q2 / Q3 / Q4"
        Float actualAchievement "Actual Recorded Achievements"
        String progressStatus "Current Progress Status"
        String managerComment "L1 Manager Feedback Notes"
        DateTime createdAt "Submission Timestamp"
        DateTime updatedAt "Last Review Timestamp"
    }
    AUDITLOG {
        String id PK "Primary Key (CUID)"
        String goalId FK "Reference to Affected Goal (Optional)"
        String userId FK "Actor executing the action"
        String action "Action Title (e.g. GOAL_REWORK)"
        String details "Descriptive JSON/text change details"
        DateTime createdAt "Timestamp of Event"
    }

    USER ||--o{ USER : "manager of (reports)"
    USER ||--o{ GOAL : "creates"
    USER ||--o{ CHECKIN : "submits"
    USER ||--o{ AUDITLOG : "triggers"
    GOAL ||--o{ CHECKIN : "has quarterly checkins"
    GOAL ||--o{ AUDITLOG : "audited under"
```

---

## 🏆 Unstop Submission Copy-Paste Template

> [!TIP]
> Copy the contents below and compile it directly into a PDF/DOCX (or paste into your submission file) to create an extremely professional project delivery package for the Atomberg Hackathon judges!

***

# Project Submission: GoalAlign — Atomberg Goal Tracking Portal

## 🔗 Live Application Link
👉 **[GoalAlign Live Production Web Portal](https://atomberg-hackathon-vo5y08ai0-vishwassachan684-arts-projects.vercel.app)**

## 💻 Source Code Repository
👉 **[GoalAlign GitHub Code Repository](https://github.com/vishwassachan684-art/Atomberg-Hackathon)** *(Contains complete deployment pipeline config, Prisma schema, and customized styling engine)*

---

## 🔑 Judge Login Credentials
To help review the application end-to-end, copy-pasteable judge accounts are available directly inside the secure login terminal:

| Role | Test Account Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee** | `arjun@company.com` | `password123` | Drafts goals, check-ins, inputs achievements, runs calculations. |
| **Manager** | `priya@company.com` | `password123` | Reviews reporting sheets, approves/rereoutes goals, writes feedback. |
| **HR / Executive** | `neha@company.com` | `password123` | SBU overview, audit trails, generates CSV compliance spreadsheet. |

---

## 🏗️ Technical Architecture & Key Solutions

### 1. Unified SBU Objective-Goal Alignment
* **Strategic Thrust Areas**: Direct individual-to-corporate alignment mapping (e.g. *Engineering Excellence*, *Product R&D*, *Operational Speed*).
* **Smart Progress Score Algorithm**: Exact dynamic mapping calculations built inside our computation logic to handle modern target definitions automatically:
  * **Min (Higher is better)**: Score = (Actual / Target) * 100
  * **Max (Lower is better)**: Score = (Target / Actual) * 100 if Actual > Target
  * **Timeline (On Time = 100%)**: Standard binary score tracking against time bounds.
  * **Zero Target (Zero is ideal)**: Strict compliance metrics scoring.

### 2. Comprehensive Compliance Engine
* Enforces validation constraints dynamically upon submission: total weightage must exactly sum to **100%**, individual goals weightage must span between **10%** and **80%**, and no employee can exceed a **maximum of 8 goals** per cycle.

### 3. Bulletproof Audit Logs & HR Governance
* Full record persistence documenting state changes, manager actions, rework updates, and timestamps.
* Downloadable CSV data reports containing full SBU-aligned analytics built dynamically via standard client stream triggers.
