# Team Task Management Web Application

This is a Full-Stack Team Task Management application built for Ethara.AI assessment.

🚀 **LIVE DEPLOYMENT**: [https://etharaai-assignment-team-task-manager-production.up.railway.app](https://etharaai-assignment-team-task-manager-production.up.railway.app)

## Tech Stack
* **Framework**: Next.js 15 (App Router)
* **Database**: Prisma ORM with PostgreSQL (configured for Railway) / SQLite (used locally by default for ease of testing)
* **Authentication**: NextAuth.js (Credentials Provider)
* **Styling**: Premium Custom CSS (Glassmorphism, Animations)

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your_super_secret_string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup**
   Push the Prisma schema to the database and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Railway Deployment Instructions

1. **Create a Railway Account**: Go to [Railway.app](https://railway.app/) and sign in.
2. **New Project**: Click "New Project" -> "Deploy from GitHub repo" and select this repository.
3. **Add Database**: Inside the project dashboard, click "New" -> "Database" -> "Add PostgreSQL".
4. **Environment Variables**:
   * Go to the Web App service -> "Variables" tab.
   * Add `DATABASE_URL`: Set its value to the connection URL provided by your Railway Postgres database (e.g., `postgresql://...`).
   * Add `NEXTAUTH_SECRET`: Set to a strong random string (e.g., generated via `openssl rand -base64 32`).
   * Add `NEXTAUTH_URL`: Set to your production domain (the URL Railway generates for your app).
5. **Database Migration**:
   * In the Railway Web App service, go to "Settings" -> "Build Command" and set it to:
     ```bash
     npx prisma db push && npm run build
     ```
   * *Note: `prisma db push` is used here instead of `migrate deploy` for simplicity in this assessment, as we are deploying the schema directly.*
6. **Deploy**: Railway will automatically build and deploy your application. Once finished, click on the generated domain to access your live app.

## Features Included
* **Secure Authentication**: Signup and Login with Bcrypt password hashing.
* **Role-Based Access**: Project creators are automatically Admins. Admins can add members and delete projects/tasks. Members can view and update tasks.
* **Interactive Kanban Board**: Visualize tasks across To Do, In Progress, and Done statuses.
* **Real-time Dashboard Metrics**: Aggregate stats on tasks by status, user distribution, and overdue items.
* **Premium UI**: Vibrant color gradients, glassmorphism panels, smooth micro-animations, and a Jarvis-inspired tech aesthetic.

## Usage & Testing

To quickly test the application, a database seed script is provided that generates a demo project (`PROJECT_NEXUS_ALPHA`), populates it with a Kanban board full of tasks, and creates test accounts for both Admin and User roles.

**1. Generate Demo Data**
If you haven't already, run the seed script to populate the database:
```bash
node seed.js
```

**2. Test Accounts**

**👑 Root Admin Account**
- **Email**: `admin@ethara.ai`
- **Password**: `password123`
- *Capabilities*: The Admin acts as the Project Creator. They have exclusive access to click **"INITIALIZE NODE"** (Create Project), **"ADD OP"** (Add Members to a project), and **"INIT TASK"** (Create new tasks). They can also edit the core details of tasks (title, description, due date) and permanently purge projects or tasks.

**👤 Field Operator Account (Standard User)**
- **Email**: `user@ethara.ai`
- **Password**: `password123`
- *Capabilities*: The Standard User cannot create projects, modify the team roster, or create new tasks. Their primary workflow is to access assigned projects, view the Kanban board, and use the status dropdown menu on each task card to update task states from `TODO` -> `IN_PROGRESS` -> `DONE` to report their progress.

**3. Recommended Testing Flow**
1. Log in as the **Root Admin**.
2. Navigate to **DATA_NODES** (Projects). You will see the populated demo project.
3. Open the project. Create a new task by clicking **"INIT TASK"**. Assign it to `user@ethara.ai`.
4. Log out.
5. Log in as the **Field Operator**.
6. Open the same project. You will notice the "INIT TASK" and "ADD OP" buttons are hidden.
7. Find the task you just assigned, and change its status to `DONE`.
