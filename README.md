# MaraMate

The current app includes a React landing page and sign-up/login screens, plus a
Spring Boot backend for authentication. User accounts are stored through Spring
Data JPA in PostgreSQL; passwords are BCrypt-hashed and login returns a JWT.

## Requirements

- JDK 17 or newer
- Supabase PostgreSQL
- Node.js and npm

## Run locally (Windows PowerShell)

1. In Supabase, open **Project Settings → Database** and copy your database
   password. The project automatically updates the `users` table when the
   backend connects.

2. In a Command Prompt window, go to the project folder and set the connection
   details. Use your actual database password locally; do not include the
   `user=` or `password=` query parameters in `DB_URL`:

   ```cmd
   cd /d "C:\path\to\MARAMATE_PROJECT-main"
   set "DB_URL=jdbc:postgresql://db.vunkvivmdivrycrkwmpd.supabase.co:5432/postgres?sslmode=require"
   set "DB_USERNAME=postgres"
   set "DB_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD"
   .\mvnw.cmd spring-boot:run
   ```

   Replace `C:\path\to\MARAMATE_PROJECT-main` with the actual project folder and
   replace `YOUR_SUPABASE_DATABASE_PASSWORD` with your Supabase database
   password. Keep the password private. The Maven wrapper downloads Maven
   automatically on first use; you do not need to install Maven separately.

   The environment variables override the local defaults in
   `src/main/resources/application.properties`. The default JWT secret is for
   local development only; set `JWT_SECRET` to a private value of at least 32
   characters before deployment. Password recovery sends a one-time link by
   email; configure `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
   `MAIL_SMTP_AUTH`, `MAIL_SMTP_STARTTLS`, `MAIL_FROM`, and `FRONTEND_URL` for
   your SMTP provider. The local SMTP default is `localhost:1025`.

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
- `PUT /api/auth/me` — validate and update the authenticated user's profile.
- `POST /api/auth/change-password` — change a password after verifying the current password.
- `POST /api/auth/forgot-password` — request an expiring password reset link by email.
- `POST /api/auth/reset-password` — set a new password with the single-use token from the email.
