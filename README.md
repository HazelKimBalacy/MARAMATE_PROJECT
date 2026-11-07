# MaraMate

The current app includes a React landing page and sign-up/login screens, plus a
Spring Boot backend for authentication. User accounts are stored through Spring
Data JPA in MySQL; passwords are BCrypt-hashed and login returns a JWT.

## Requirements

- JDK 17
- MySQL 8
- Node.js and npm

## Run locally (Windows PowerShell)

1. Start the MySQL service, then create the database if needed:

   ```sql
   CREATE DATABASE IF NOT EXISTS maramate;
   ```

   The backend can also create the database on startup when the configured MySQL
   account has permission to create databases. JPA creates/updates the `users`
   table from the `User` entity.

2. In a PowerShell window, configure the database account if it is not MySQL's
   local `root` account with an empty password, then start the backend:

   ```powershell
   $env:DB_URL = "jdbc:mysql://localhost:3306/maramate?createDatabaseIfNotExist=true&serverTimezone=Asia/Manila"
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = "your-mysql-password"
   .\gradlew.bat bootRun
   ```

   `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` override the local defaults in
   `src/main/resources/application.properties`. Keep real credentials out of
   source control. The default JWT secret is for local development only; set
   `JWT_SECRET` to a private value of at least 32 characters before deployment.

3. In a second PowerShell window, start the frontend:

   ```powershell
   Set-Location frontend
   npm.cmd install
   npm.cmd run dev
   ```

   Open <http://localhost:5173>. Vite forwards `/api` requests to the backend at
   <http://localhost:8080>.

## Authentication API

- `POST /api/auth/register` — create a moviegoer or organizer account. Organizer
  accounts start as `PENDING`.
- `POST /api/auth/login` — authenticate and receive a JWT.
- `GET /api/auth/me` — get the authenticated user's profile; send the token as
  `Authorization: Bearer <token>`.
