# Karl Erik Ott — Personal Page

Personal brand website for Karl Erik Ott, Software Engineer at Wise. Built as a monorepo with a Next.js frontend and a Spring Boot backend.

Live at: [karlerikott.vercel.app](https://karlerikott.vercel.app)

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Java 21, Spring Boot 3.4, Maven |
| Database | PostgreSQL via Spring Data JPA, hosted on Neon |
| Frontend hosting | Vercel (auto-deploys on push to `main`) |
| Backend hosting | TBD |

## Project Structure

```
personal-page/
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── layout.tsx          # Root layout and metadata
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css
│   ├── components/             # Reusable React components
│   ├── lib/                    # API client utilities
│   ├── next.config.ts          # Proxies /api/* to Spring Boot
│   └── package.json
├── backend/                    # Spring Boot app
│   ├── src/main/java/com/karlerikott/personalpage/
│   │   ├── domain/             # JPA entities
│   │   ├── repository/         # Spring Data repositories
│   │   ├── service/            # Business logic
│   │   └── controller/         # REST controllers (/api/...)
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
└── CLAUDE.md                   # Project conventions for AI-assisted development
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

Create `backend/src/main/resources/application-local.properties` (this file is gitignored — never commit it):

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

The frontend proxies all `/api/*` requests to the backend at `localhost:8080` in development.

## Deployment

- **Frontend**: Vercel, root directory set to `personal-page/frontend`. Redeploys on every push to `main`.
- **Backend**: TBD.
- **Database**: [Neon](https://neon.tech) serverless PostgreSQL.
