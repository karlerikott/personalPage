# Personal Page — Project Instructions

## Owner
Karl Erik Ott, Software Engineer

## Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Java 21, Spring Boot 3.5, Maven (via wrapper)
- **Database**: PostgreSQL (Spring Data JPA / Hibernate)
- **API**: REST — Next.js proxies `/api/*` to Spring Boot on `localhost:8080`

## Monorepo layout
```
personal-page/
  frontend/   ← Next.js app
  backend/    ← Spring Boot app (com.karlerikott.personalpage)
  CLAUDE.md
```

## Conventions
- TypeScript strict mode; no `any`
- Tailwind utility classes only — no custom CSS unless unavoidable
- Spring Boot: use constructor injection (no `@Autowired` on fields)
- Spring Boot: use `@RestController` + `@RequestMapping("/api/...")`
- JPA entities in `domain` package, repositories in `repository`, services in `service`, controllers in `controller`
- All API responses wrapped in a standard envelope: `{ data, error }`

## Running locally
```bash
# Frontend (after npm install)
cd frontend && npm run dev       # http://localhost:3000

# Backend
cd backend && ./mvnw spring-boot:run   # http://localhost:8080
```

## Environment variables
- Frontend: `.env.local` (never commit)
- Backend: `src/main/resources/application-local.properties` (never commit)
  - `spring.datasource.url`
  - `spring.datasource.username`
  - `spring.datasource.password`
