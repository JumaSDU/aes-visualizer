# CryptoLearn Backend

Spring Boot 3 / Java 17. In-memory sample data, no database.

## Run

```bash
cd backend
./mvnw spring-boot:run    # or: mvn spring-boot:run
```

Listens on `http://localhost:8080`. CORS open for `http://localhost:3000`.

## Endpoints

- `GET /api/dashboard` — combined payload for the home page
- `GET /api/user/me`
- `GET /api/progress`
- `GET /api/lessons`
- `GET /api/tests`
- `GET /api/flashcards`
- `GET /api/recommendations`
