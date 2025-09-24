# Team Project Management API

## 1. Project Overview

This is a **production-ready, API-first project management system** for organizations and teams.
Features include:

* **Organizations**: group users and manage projects inside an org.
* **Projects**: created under an org, with project-specific memberships.
* **Tasks**: assignable, with priority, status, due dates.
* **Comments & Mentions**: collaborate by commenting on tasks and mentioning users (`@username`).
* **Invitations**: invite users to organizations via email.
* **Notifications**: real-time updates (via WebSockets/Redis pub-sub).
* **RBAC**: role-based access at organization, project, and task levels.

### Tech Stack

* **Backend:** Express.js
* **Database:** MySQL
* **Cache & Pub/Sub:** Redis (optional, for notifications/rate limiting)
* **Auth:** JWT
* **Logging:** Pino
* **Testing:** Jest + Supertest
* **Containerization:** Docker

---

## 2. Folder Structure

```
project-management-api/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orgController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── commentController.js
│   │   └── inviteController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── orgService.js
│   │   ├── projectService.js
│   │   ├── taskService.js
│   │   ├── commentService.js
│   │   └── inviteService.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orgRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── commentRoutes.js
│   │   └── inviteRoutes.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── validators.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
├── docker-compose.yml
└── README.md
```

---

## 3. Database Schema (MySQL)

### `users`

### `users` Table

| Field       | Type                            | Notes                          |
| ----------- | ------------------------------- | ------------------------------ |
| uuid        | CHAR(36)                        | PK, default: uuid()            |
| username    | VARCHAR(255)                    | Unique                         |
| password    | VARCHAR(255)                    | Hashed with bcrypt             |
| full\_name  | VARCHAR(255)                    |                                |
| birthdate   | DATE                            |                                |
| gender      | ENUM('male','female')           |                                |
| role        | ENUM('user','admin','readonly') | Default: 'user'                |
| created\_at | TIMESTAMP                       | Default CURRENT\_TIMESTAMP     |
| updated\_at | TIMESTAMP                       | Auto update CURRENT\_TIMESTAMP |


---

### `organizations`

| Field       | Type         | Notes                      |
| ----------- | ------------ | -------------------------- |
| id          | INT          | PK, AUTO\_INCREMENT        |
| name        | VARCHAR(255) | Unique                     |
| created\_by | CHAR(36)     | FK → users(uuid)           |
| created\_at | TIMESTAMP    | Default CURRENT\_TIMESTAMP |
| updated\_at | TIMESTAMP    | Auto update                |

---

### `organization_members`

| Field      | Type                                      | Notes                      |
| ---------- | ----------------------------------------- | -------------------------- |
| id         | INT                                       | PK                         |
| org\_id    | INT                                       | FK → organizations(id)     |
| user\_id   | CHAR(36)                                  | FK → users(uuid)           |
| role       | ENUM('owner','admin','member','readonly') | Default member             |
| joined\_at | TIMESTAMP                                 | Default CURRENT\_TIMESTAMP |

---

### `projects`

| Field       | Type         | Notes                      |
| ----------- | ------------ | -------------------------- |
| id          | INT          | PK, AUTO\_INCREMENT        |
| org\_id     | INT          | FK → organizations(id)     |
| name        | VARCHAR(255) | Unique per org             |
| description | TEXT         | Optional                   |
| created\_at | TIMESTAMP    | Default CURRENT\_TIMESTAMP |
| updated\_at | TIMESTAMP    | Auto update                |

---

### `project_members`

| Field       | Type                                   | Notes               |
| ----------- | -------------------------------------- | ------------------- |
| id          | INT                                    | PK                  |
| project\_id | INT                                    | FK → projects(id)   |
| user\_id    | CHAR(36)                               | FK → users(uuid)    |
| role        | ENUM('manager','contributor','viewer') | Default contributor |

---

### `tasks`

| Field         | Type                                 | Notes                      |
| ------------- | ------------------------------------ | -------------------------- |
| id            | INT                                  | PK, AUTO\_INCREMENT        |
| project\_id   | INT                                  | FK → projects(id)          |
| assigned\_to  | CHAR(36)                             | FK → users(uuid), nullable |
| title         | VARCHAR(255)                         | Unique per project         |
| description   | TEXT                                 | Optional                   |
| status        | ENUM('pending','in-progress','done') | Default 'pending'          |
| priority      | ENUM('low','medium','high')          | Default 'medium'           |
| due\_date     | DATETIME                             | Optional                   |
| created\_at   | TIMESTAMP                            | Default CURRENT\_TIMESTAMP |
| updated\_at   | TIMESTAMP                            | Auto update                |
| completed\_at | DATETIME                             | Nullable                   |

---

### `task_comments`

| Field       | Type      | Notes                      |
| ----------- | --------- | -------------------------- |
| id          | INT       | PK                         |
| task\_id    | INT       | FK → tasks(id)             |
| user\_id    | CHAR(36)  | FK → users(uuid)           |
| content     | TEXT      | Supports `@mentions`       |
| created\_at | TIMESTAMP | Default CURRENT\_TIMESTAMP |

---

### `task_mentions`

| Field         | Type     | Notes                   |
| ------------- | -------- | ----------------------- |
| id            | INT      | PK                      |
| comment\_id   | INT      | FK → task\_comments(id) |
| mentioned\_id | CHAR(36) | FK → users(uuid)        |

---

### `invites`

| Field       | Type                                 | Notes                      |
| ----------- | ------------------------------------ | -------------------------- |
| id          | INT                                  | PK                         |
| email       | VARCHAR(255)                         | User being invited         |
| org\_id     | INT                                  | FK → organizations(id)     |
| invited\_by | CHAR(36)                             | FK → users(uuid)           |
| token       | VARCHAR(255)                         | Random string              |
| status      | ENUM('pending','accepted','expired') |                            |
| created\_at | TIMESTAMP                            | Default CURRENT\_TIMESTAMP |
| expires\_at | TIMESTAMP                            |                            |

---

## 4. API Endpoints & Routes

### Auth

| Method | Path          | Description              | Access |
| ------ | ------------- | ------------------------ | ------ |
| POST   | /auth/signup  | Register new user        | Public |
| POST   | /auth/login   | Login with username/pass | Public |
| POST   | /auth/refresh | Refresh JWT token        | Auth   |

---

### Organizations

| Method | Path               | Description         | Access     |
| ------ | ------------------ | ------------------- | ---------- |
| POST   | /orgs              | Create new org      | Auth       |
| GET    | /orgs              | List user’s orgs    | Auth       |
| GET    | /orgs/\:id         | Get org details     | Org member |
| DELETE | /orgs/\:id         | Delete org          | Org owner  |
| POST   | /orgs/\:id/members | Add member (invite) | Org admin  |
| GET    | /orgs/\:id/members | List org members    | Org member |

---

### Projects

| Method | Path                   | Description           | Access          |
| ------ | ---------------------- | --------------------- | --------------- |
| POST   | /orgs/\:id/projects    | Create project in org | Org member      |
| GET    | /orgs/\:id/projects    | List org projects     | Org member      |
| GET    | /projects/\:id         | Get project details   | Project member  |
| PATCH  | /projects/\:id         | Update project        | Project manager |
| DELETE | /projects/\:id         | Delete project        | Project manager |
| POST   | /projects/\:id/members | Add user to project   | Project manager |
| GET    | /projects/\:id/members | List project members  | Project member  |

---

### Tasks

| Method | Path                 | Description         | Access           |
| ------ | -------------------- | ------------------- | ---------------- |
| POST   | /projects/\:id/tasks | Create task         | Project member   |
| GET    | /projects/\:id/tasks | List tasks          | Project member   |
| GET    | /tasks/\:id          | Get task details    | Project member   |
| PATCH  | /tasks/\:id          | Update task details | Assignee/Manager |
| PATCH  | /tasks/\:id/status   | Update task status  | Assignee/Manager |
| DELETE | /tasks/\:id          | Delete task         | Project manager  |

---

### Comments & Mentions

| Method | Path                 | Description                 | Access         |
| ------ | -------------------- | --------------------------- | -------------- |
| POST   | /tasks/\:id/comments | Add comment (with mentions) | Project member |
| GET    | /tasks/\:id/comments | List task comments          | Project member |

---

### Invitations

| Method | Path                    | Description           | Access    |
| ------ | ----------------------- | --------------------- | --------- |
| POST   | /orgs/\:id/invites      | Send invite to email  | Org admin |
| GET    | /invites/\:token        | Validate invite token | Public    |
| POST   | /invites/\:token/accept | Accept invite         | Public    |

---

## 5. Recommended Implementation Order

1. **Already done:** Auth + `users` table.
2. **Organizations**: orgs + org\_members + RBAC.
3. **Projects**: CRUD + project\_members.
4. **Tasks**: CRUD, assign users.
5. **Comments & Mentions**: build task\_comments + task\_mentions.
6. **Invitations**: invite system (generate token, store, later email).
7. **Notifications**: Redis pub/sub + WebSocket for task events.
8. **Activity Logs**: record all actions (optional).
9. **Polish for Production**: error handling, rate limiting, Swagger docs, Docker.
10. **Testing**: unit + integration tests.

---

## 6. Notes

* Keep sensitive fields (passwords, tokens) out of responses.
* Use **services** for DB ops, **controllers** for request handling.
* Enforce **RBAC** at both org and project levels.
* Use transactions for multi-table ops (e.g., invite + member creation).
* Logging: verbose in dev, concise in prod.

---
