# SMGPUB Enterprise Platform & Consumer Music Suite

An enterprise-grade, full-stack consumer music platform and publishing administration ecosystem developed for **Summers Media Group (SMGPUB)**. The platform seamlessly bridges creative execution (algorithmic chord and MIDI generation) with the business side of music (e-commerce beat licensing, offline-first mobile sync, Stripe checkout automation, and tiered publishing administration).

---

## 🚀 Key Features & Architecture

* **Algorithmic MIDI Generator Engine:** Node.js backend service that instantly synthesizes professional chord progressions and MIDI matrices tailored to specific genres (Funk, Lo-Fi, Trap) and moods.
* **Consumer Beat Store:** High-performance web storefront (`smgpub.com`) optimized for Vercel deployment, featuring 30-second audio stream previews, master stem packaging, and secure Stripe payment buttons.
* **Offline-First Mobile Sync:** Cross-platform React Native / Expo local SQLite service that caches creative projects locally and utilizes `is_dirty` flags for batch synchronization with PostgreSQL.
* **Publishing Administration Tiers:** Multi-tier management framework (Tier 1 Basic, Tier 2 Co-Publishing, and Tier 3 Global Admin) handling mechanical/performance royalties, PRO registrations (ASCAP, BMI, PRS), and TV/film cue sheet submissions.
* **Automated Stripe Fulfillments:** Real-time webhook verification router (`/v1/webhook`) that automatically logs transactions and dispatches secure digital downloads and license agreements upon purchase confirmation.

---

## 🛠️ Technology Stack

* **Frontend (Web):** Next.js, React, Tailwind CSS
* **Backend API:** Node.js, Express, Stripe Webhooks
* **Database:** PostgreSQL (Cloud primary), SQLite (Mobile local cache)
* **Mobile Client:** React Native, Expo, SQLite
* **Infrastructure & DevOps:** Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD Pipeline

---

## 📁 Repository Structure

```text
smgpub-enterprise-platform/
├── .github/workflows/deploy.yml       # CI/CD zero-downtime deployment pipeline
├── backend/                           # Node.js Express server & Stripe webhook handler
├── web/                               # Next.js web application & dashboard suite
├── beatstore/                         # Static storefront for smgpub.com / [www.smgpub.com](https://www.smgpub.com)
├── mobile_rnv/                        # React Native / Expo local SQLite cache service
├── database/                          # PostgreSQL relational schema initialization
├── legal/                             # EULA tiers, split sheet agreements, and sync addendums
├── nginx.conf                         # Reverse proxy configuration
├── docker-compose.yml                 # Local container orchestration stack
└── README.md                          # Project documentation
