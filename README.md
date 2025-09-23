<<<<<<< HEAD
# Team Task Manager API
=======
# Team Task Manager API - Project Guide
>>>>>>> 0bcda5d (commit 2)

## 1. Project Overview

This is a **production-ready, API-first task management system** for teams. Features include user authentication, role-based access control, teams, projects, tasks, activity logging, and real-time notifications.

Tech Stack:

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
│   ├── config/
│   │   ├── db.js                # MySQL connection
│   │   └── redis.js             # Redis connection (optional)
│   │
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   │
│   ├── services/                # Service layer for DB operations
│   │   ├── authService.js
│   │   ├── teamService.js
│   │   ├── projectService.js
│   │   └── taskService.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # RBAC
│   │   ├── errorMiddleware.js   # Global error handler
│   │   └── rateLimiter.js       # Optional login limit
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── utils/
│   │   ├── logger.js            # Pino setup
│   │   └── validators.js        # Joi schemas
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # App entry point
│
├── .env
├── package.json
├── docker-compose.yml
└── README.md
```

---

## 3. Database Schema (MySQL)

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

### `teams` Table

| Field       | Type         | Notes                      |
| ----------- | ------------ | -------------------------- |
| id          | INT          | PK, AUTO\_INCREMENT        |
| name        | VARCHAR(255) | Unique per user            |
| created\_by | CHAR(36)     | FK → users(uuid)           |
| created\_at | TIMESTAMP    | Default CURRENT\_TIMESTAMP |
| updated\_at | TIMESTAMP    | Auto update                |

---

### `projects` Table

| Field       | Type         | Notes                      |
| ----------- | ------------ | -------------------------- |
| id          | INT          | PK, AUTO\_INCREMENT        |
| team\_id    | INT          | FK → teams(id)             |
| name        | VARCHAR(255) | Unique per team            |
| description | TEXT         | Optional                   |
| created\_at | TIMESTAMP    | Default CURRENT\_TIMESTAMP |
| updated\_at | TIMESTAMP    | Auto update                |

---

### `tasks` Table

| Field         | Type                                 | Notes                      |
| ------------- | ------------------------------------ | -------------------------- |
| id            | INT                                  | PK, AUTO\_INCREMENT        |
| project\_id   | INT                                  | FK → projects(id)          |
| assigned\_to  | CHAR(36)                             | FK → users(uuid), nullable |
| title         | VARCHAR(255)                         | Must be unique per project |
| description   | TEXT                                 | Optional                   |
| status        | ENUM('pending','in-progress','done') | Default 'pending'          |
| priority      | ENUM('low','medium','high')          | Default 'medium'           |
| due\_date     | DATETIME                             | Optional                   |
| created\_at   | TIMESTAMP                            | Default CURRENT\_TIMESTAMP |
| updated\_at   | TIMESTAMP                            | Auto update                |
| completed\_at | DATETIME                             | Nullable                   |

---

## 4. API Endpoints & Routes

### Auth

| Method | Path          | Description              | Access |
| ------ | ------------- | ------------------------ | ------ |
| POST   | /auth/signup  | Register new user        | Public |
| POST   | /auth/login   | Login with username/pass | Public |
| POST   | /auth/refresh | Refresh JWT token        | Auth   |

### Teams

| Method | Path        | Description       | Access     |
| ------ | ----------- | ----------------- | ---------- |
| POST   | /teams      | Create new team   | Admin/User |
| GET    | /teams      | List user’s teams | Auth       |
| GET    | /teams/\:id | Get team details  | Auth       |
| DELETE | /teams/\:id | Delete team       | Admin only |

### Projects

| Method | Path                 | Description            | Access     |
| ------ | -------------------- | ---------------------- | ---------- |
| POST   | /teams/\:id/projects | Create project in team | Admin/User |
| GET    | /teams/\:id/projects | List team projects     | Auth       |
| PATCH  | /projects/\:id       | Update project         | Admin/User |
| DELETE | /projects/\:id       | Delete project         | Admin only |

### Tasks

| Method | Path                 | Description         | Access     |
| ------ | -------------------- | ------------------- | ---------- |
| POST   | /projects/\:id/tasks | Create task         | Auth       |
| GET    | /projects/\:id/tasks | List tasks          | Auth       |
| PATCH  | /tasks/\:id          | Update task details | Auth       |
| PATCH  | /tasks/\:id/status   | Update task status  | Auth       |
| DELETE | /tasks/\:id          | Delete task         | Admin/User |

---

## 5. Recommended Implementation Order

1. **Project Setup**

   * Initialize Node.js project
   * Setup `.env`
   * Install dependencies: express, mysql2, bcrypt, joi, pino, jsonwebtoken, dotenv, cors, helmet

2. **Database Setup**

   * Design schema in MySQL
   * Test DB connection (`db.js`)

3. **Logging**

   * Setup Pino global logger
   * Create `logger.js` in utils

4. **Auth**

   * Signup/Login endpoints
   * JWT authentication
   * Role middleware (`roleMiddleware.js`)

5. **Teams**

   * CRUD APIs for teams
   * Assign creator as admin
   * Logging team creation

6. **Projects**

   * CRUD APIs for projects within a team
   * Validation + logging

7. **Tasks**

   * CRUD APIs for tasks
   * Assign tasks to team members
   * Status updates, priority, due date
   * Filtering and sorting

8. **Activity Logs**

   * Middleware or service to record actions
   * Admin endpoint to view logs

9. **Real-time Notifications (optional)**

   * Setup `socket.io`
   * Notify team members when tasks are assigned or updated

10. **Production Readiness**

    * Error handling middleware
    * Security middleware: helmet, cors, rate limiting
    * Swagger docs
    * Dockerize app + DB

11. **Testing**

    * Write unit tests for services
    * Integration tests for routes

---

## 6. Recommended Technologies & Packages

| Purpose               | Package(s)                |
| --------------------- | ------------------------- |
| Express Server        | express                   |
| MySQL Connection      | mysql2                    |
| Validation            | joi                       |
| Authentication        | jsonwebtoken              |
| Password Hashing      | bcrypt                    |
| Logging               | pino, pino-pretty         |
| Environment Variables | dotenv                    |
| Security              | helmet, cors              |
| Rate Limiting         | express-rate-limit, redis |
| Testing               | jest, supertest           |
| Dockerization         | docker, docker-compose    |

---

## 7. Notes

* Use **services** for DB operations and **controllers** for request handling.
* Always **remove sensitive fields** (password, tokens) before sending JSON responses.
* Keep **logging verbose in dev** and concise in production.
* Enforce **RBAC** consistently using `roleMiddleware`.
* Use **transactions** for critical operations involving multiple tables.

<<<<<<< HEAD
=======

>>>>>>> 0bcda5d (commit 2)


