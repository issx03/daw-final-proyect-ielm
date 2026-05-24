# 📋 Trellix — Fullstack Kanban Board Application

A high-performance Kanban board application built with a Clean Architecture, atomic state management, and a fault-tolerant backend. This project serves as the final academic work for the Web Application Design (DAW) degree.

---

## ⚡ Quick Start (3 Steps)

Spin up the entire local infrastructure (Frontend, Backend, Reverse Proxy, and Database) in seconds:

1. **Start all services:**
   ```bash
   docker compose up -d --build
   ```
2. **Verify database initialization and migrations:**
   ```bash
   docker compose logs -f db-init
   ```
3. **Access the application:**
   * **Web Application (Frontend):** [http://localhost](http://localhost) (Nginx automatically routes traffic).
   * **Interactive API Documentation (Swagger UI):** [http://localhost/docs](http://localhost/docs).

---

## 🏗️ Core Technology Stack & Architecture

* **Frontend:** React + Zustand (Atomic state management for $O(1)$ re-renders) + `@dnd-kit` (Custom Drag & Drop) + TailwindCSS (Glassmorphism layout).
* **Backend:** FastAPI (Python) + SQLAlchemy 2.0 (Modern SQL Toolkit/ORM) + Pydantic v2 (Strict data validation and secure DTO schemas) + PyJWT.
* **Database:** MariaDB (10.5) managed with Alembic for controlled DDL migration versioning.
* **Infrastructure:** Docker Compose (DRY multi-node orchestration using YAML anchors) + Nginx (Reverse proxy & load balancer using `least_conn`).

---

## 📂 Documentation Directory

All extensive engineering analyses, security audits, and formal academic reports are fully documented and available inside the `/docs` directory. This folder includes:

* **🛡️ Architectural Audit:** A comprehensive defense of every engineering decision (e.g., Zustand vs. React Context re-render costs, secure profile DTOs to prevent IDOR, Alembic migration strategies, and a rigorous technical Q&A bank).
* **🚀 Deployment Guide:** Step-by-step production deployment walkthrough including Nginx security hardening, SSL, and MariaDB backup strategies.
* **💼 Final Report:** The formal academic thesis and comprehensive system documentation.
* **⚠️ Incident Management:** Production incident logs, root cause analyses (RCA), and mitigation protocols.

---

## 🧪 Running Tests in Development

### 🐍 Backend Tests (Pytest)
```bash
docker compose exec -e PYTHONPATH=/app backend pytest tests/ -v
```

### ⚛️ Frontend Tests (Vitest)
```bash
docker compose exec frontend npm test
```
