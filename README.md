# 🎯 GoalAlign — Atomberg Goal Alignment Portal

GoalAlign is a premium, high-fidelity goal tracking and OKR alignment portal designed specifically for modern performance management. Developed as a solution for the Atomberg Hackathon, GoalAlign empowers employees to define, align, and track strategic goals while providing managers with a centralized dashboard to review achievements and maintain performance standards.

---

## ✨ Features

### 1. **Executive Dashboard & Real-Time Performance Metrics**
*   **Dynamic Performance Metrics:** Instantly calculates progress completion rates, active goals, and pending approvals.
*   **Precision Performance UI:** Styled with a premium, sleek dark-mode glassmorphic interface inspired by Atomberg's commitment to cutting-edge engineering.
*   **Visual Charts & Micro-Animations:** Fluid state transitions, hover effects, and crisp status cards that keep users engaged.

### 2. **Departmental Goal & OKR Alignment**
*   **Strategic Thrust Area Integration:** Align individual goals directly with high-impact corporate thrust areas (e.g., Engineering Excellence, Product R&D, Operational Speed).
*   **UOM & Measurable Targets:** Set quantitative targets with unique Units of Measurement (UOM) like percentage, units sold, or time-to-market.
*   **Progress Indicators:** Live tracking from *Draft* to *Approved*, alongside granular progress stages (*Not Started*, *In Progress*, *Achieved*).

### 3. **Secure Identity & Session Management**
*   **NextAuth.js Authentication:** Complete session security using NextAuth Credentials Provider.
*   **Manager-Employee Hierarchy:** Restricts views and metrics securely to the signed-in user and their department.
*   **Audit Logging:** Full background tracing of edits, submissions, and approvals to ensure historical compliance.

---

## 🛠️ Tech Stack

*   **Frontend & Routing:** [Next.js 15](https://nextjs.org/) (App Router, Server Components)
*   **Styles & Theming:** Custom Vanilla CSS tailored for performance and responsive layout.
*   **Database ORM:** [Prisma 7](https://www.prisma.io/) (Wasm/TypeScript Client Compiler)
*   **Cloud Database:** [Neon Serverless PostgreSQL](https://neon.tech/)
*   **Driver Adapter:** `@prisma/adapter-pg` + native `pg` client
*   **Authentication:** [NextAuth.js v4](https://next-auth.js.org/)
*   **Programming Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🔑 Demo Accounts for Judges

To make reviewing the project seamless for the judges, copy-pasteable demo accounts are built directly into the login screen:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Employee** | `arjun@company.com` | `password123` | Engineering |
| **Manager** | `priya@company.com` | `password123` | Engineering |
| **HR / Executive** | `neha@company.com` | `password123` | HR & Operations |

---

## 🚀 Local Installation & Setup

If you want to run this application locally, follow these steps:

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and define the following variables:
```env
DATABASE_URL="postgresql://neondb_owner:npg_cVaLP8wC7vMG@ep-plain-cell-aqpiw5bz.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="goalalign-super-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate the Prisma Client
```bash
npx prisma generate
```

### 4. Seed the Database
Populate your PostgreSQL database with the complete hackathon mock dataset:
```bash
node prisma/seed.js
```

### 5. Fire up the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## ☁️ Continuous Deployment to Vercel

GoalAlign is fully production-optimized and ready for Vercel deployment:

1. Push your code to your GitHub Repository.
2. Go to [Vercel](https://vercel.com/) and **Import** the repository.
3. Add `DATABASE_URL` and `NEXTAUTH_SECRET` to the **Environment Variables** panel in Vercel.
4. Click **Deploy**!
