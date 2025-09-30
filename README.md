# Team Task Manager API – Updated Project Guide

## 1. Project Overview

A **production-ready, API-first task management system** for teams and organizations. Features include:

* User authentication (signup/login)
* Role-based access control (organization & project level)
* Organizations and projects
* Task management with assignment
* Member management at org/project level
* Activity logging
* Real-time notifications (optional)

**Tech Stack**:

* **Backend:** Express.js
* **Database:** MySQL
* **Cache & Pub/Sub:** Redis (optional)
* **Auth:** JWT
* **Logging:** Pino
* **Testing:** Jest + Supertest
* **Containerization:** Docker

---

## 2. Folder Structure

```
team-task-manager/
├── src/
│   ├── config/          # DB & Redis
│   ├── controllers/     # Route handlers
│   ├── services/        # DB operations
│   ├── middlewares/     # Auth, RBAC, error handling
│   ├── routes/          # API endpoints
│   ├── utils/           # Logger, validators
│   ├── app.js
│   └── server.js
├── .env
├── package.json
├── docker-compose.yml
└── README.md
```

---

## 3. Database Schema

### **users**

| Field      | Type         | Notes                     |
| ---------- | ------------ | ------------------------- |
| uuid       | CHAR(36)     | PK, default: uuid()       |
| username   | VARCHAR(255) | Unique                    |
| password   | VARCHAR(255) | Hashed                    |
| full_name  | VARCHAR(255) |                           |
| birthdate  | DATE         |                           |
| gender     | ENUM         | 'male','female'           |
| created_at | TIMESTAMP    | default CURRENT_TIMESTAMP |

---

### **organizations**

| Field      | Type      | Notes                     |
| ---------- | --------- | ------------------------- |
| id         | INT       | PK, AUTO_INCREMENT        |
| name       | VARCHAR   | Unique                    |
| created_by | CHAR(36)  | FK → users(uuid)          |
| created_at | TIMESTAMP | default CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | auto update               |

---

### **organization_members**

| Field                   | Type      | Notes                     |
| ----------------------- | --------- | ------------------------- |
| id                      | INT       | PK, AUTO_INCREMENT        |
| org_id                  | INT       | FK → organizations(id)    |
| user_id                 | CHAR(36)  | FK → users(uuid)          |
| role                    | ENUM      | 'owner','admin','member'  |
| created_at              | TIMESTAMP | default CURRENT_TIMESTAMP |
| UNIQUE(org_id, user_id) |           |                           |

---

### **projects**

| Field       | Type      | Notes                     |
| ----------- | --------- | ------------------------- |
| id          | INT       | PK, AUTO_INCREMENT        |
| org_id      | INT       | FK → organizations(id)    |
| name        | VARCHAR   | Unique per org            |
| description | TEXT      | Optional                  |
| created_by  | CHAR(36)  | FK → users(uuid)          |
| created_at  | TIMESTAMP | default CURRENT_TIMESTAMP |
| updated_at  | TIMESTAMP | auto update               |

---

### **project_members**

| Field                       | Type      | Notes                     |
| --------------------------- | --------- | ------------------------- |
| id                          | INT       | PK, AUTO_INCREMENT        |
| project_id                  | INT       | FK → projects(id)         |
| user_id                     | CHAR(36)  | FK → users(uuid)          |
| role                        | ENUM      | 'admin','member'          |
| created_at                  | TIMESTAMP | default CURRENT_TIMESTAMP |
| UNIQUE(project_id, user_id) |           |                           |

---

### **tasks**

| Field        | Type         | Notes                                             |
| ------------ | ------------ | ------------------------------------------------- |
| id           | INT          | PK, AUTO_INCREMENT                                |
| project_id   | INT          | FK → projects(id)                                 |
| assigned_to  | CHAR(36)     | FK → users(uuid), nullable                        |
| title        | VARCHAR(255) | Unique per project                                |
| description  | TEXT         | Optional                                          |
| status       | ENUM         | 'pending','in-progress','done', default 'pending' |
| priority     | ENUM         | 'low','medium','high', default 'medium'           |
| due_date     | DATETIME     | Optional                                          |
| created_at   | TIMESTAMP    | default CURRENT_TIMESTAMP                         |
| updated_at   | TIMESTAMP    | auto update                                       |
| completed_at | DATETIME     | nullable                                          |

---

## 4. API Endpoints & Suggested Order

---

## **1. Users (Auth)**

| Method | Path          | Description              | Access |
| ------ | ------------- | ------------------------ | ------ |
| POST   | /auth/signup  | Register new user        | Public |
| POST   | /auth/login   | Login with username/pass | Public |
| POST   | /auth/refresh | Refresh JWT token        | Auth   |

---

## **2. Organizations**

| Method | Path         | Description                                            | Access                |
| ------ | ------------ | ------------------------------------------------------ | --------------------- |
| POST   | /orgs        | Create a new organization                              | Auth                  |
| GET    | /orgs        | List all organizations the user is a member of         | Auth                  |
| GET    | /orgs/:orgId | Get organization details, including members + projects | Auth (only if member) |
| PATCH  | /orgs/:orgId | Update organization info (name, etc.)                  | Owner/Admin           |
| DELETE | /orgs/:orgId | Delete organization                                    | Owner/Admin           |

---

## **3. Organization Members**

| Method | Path                         | Description             | Access      |
| ------ | ---------------------------- | ----------------------- | ----------- |
| POST   | /orgs/:orgId/members         | Add a user to an org    | Owner/Admin |
| DELETE | /orgs/:orgId/members/:userId | Remove a user from org  | Owner/Admin |
| GET    | /orgs/:orgId/members         | List all members of org | Auth        |

---

## **4. Projects**

| Method | Path                  | Description                         | Access          |
| ------ | --------------------- | ----------------------------------- | --------------- |
| POST   | /orgs/:orgId/projects | Create a project in an organization | Owner/Admin     |
| GET    | /orgs/:orgId/projects | List all projects in an org         | Org members     |
| GET    | /projects/:projectId  | Get project details                 | Project members |
| PATCH  | /projects/:projectId  | Update project info                 | Project Admin   |
| DELETE | /projects/:projectId  | Delete a project                    | Project Admin   |

---

## **5. Project Members**

| Method | Path                                 | Description              | Access          |
| ------ | ------------------------------------ | ------------------------ | --------------- |
| POST   | /projects/:projectId/members         | Add a user to project    | Project Admin   |
| DELETE | /projects/:projectId/members/:userId | Remove user from project | Project Admin   |
| GET    | /projects/:projectId/members         | List all members         | Project members |

---

## **6. Tasks**

| Method | Path                       | Description             | Access                        |
| ------ | -------------------------- | ----------------------- | ----------------------------- |
| POST   | /projects/:projectId/tasks | Create a task           | Project members               |
| GET    | /projects/:projectId/tasks | List tasks in a project | Project members               |
| GET    | /tasks/:taskId             | Get task details        | Assigned user/Project members |
| PATCH  | /tasks/:taskId             | Update task details     | Assigned user/Project members |
| PATCH  | /tasks/:taskId/status      | Update task status      | Assigned user/Project members |
| DELETE | /tasks/:taskId             | Delete a task           | Assigned user/Project Admin   |

---

## 5. Recommended API Implementation & Testing Order

1. Users → signup/login
2. Organizations → create/list
3. Organization members → add/remove
4. Projects → create/list
5. Project members → add/remove
6. Tasks → create/list/update/delete
7. Expanded **GET /orgs/:id** → now includes members and projects

---

## 6. Notes & Best Practices

* **Services** handle DB operations; controllers handle HTTP responses.
* **Always check membership** before returning org/project/task details.
* **User roles** in org and projects enforce RBAC.
* **Remove sensitive fields** (passwords, tokens) from responses.
* **Transactions** for critical multi-table operations.
* **Logging** via Pino for debug and production.

---

