# Karl Erik Ott — Personal Page

Personal brand website for Karl Erik Ott, Software Engineer. Built as a monorepo with a Next.js frontend and a Spring Boot backend.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Java 21, Spring Boot 3.4, Maven |
| Database | PostgreSQL (Neon) via Spring Data JPA |
| Hosting | Vercel (frontend), TBD (backend) |

## Project Structure

```
personal-page/
├── frontend/          # Next.js app
│   ├── app/           # App Router pages and layouts
│   ├── components/    # Reusable React components
│   └── lib/           # API client utilities
├── backend/           # Spring Boot app
│   └── src/main/java/com/karlerikott/personalpage/
│       ├── domain/    # JPA entities
│       ├── repository/
│       ├── service/
│       └── controller/
└── CLAUDE.md          # Project conventions for AI-assisted development
```

## Getting Started

### Prerequisites

- Node.js 18+
- Java 21

### Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### Backend

Create `backend/src/main/resources/application-local.properties`:

```properties
spring.datasource.url=jdbc:postgresql://<host>/<db>?sslmode=require
spring.datasource.username=<user>
spring.datasource.password=<password>
```

Then run:

```bash
cd backend
./mvnw spring-boot:run    # http://localhost:8080
```

The frontend proxies all `/api/*` requests to the backend at `localhost:8080`.

## Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com). Set root directory to `personal-page/frontend`. Redeploys automatically on push to `main`.
- **Backend**: TBD.
- **Database**: Hosted on [Neon](https://neon.tech) (serverless PostgreSQL).
