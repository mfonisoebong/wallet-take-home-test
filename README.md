## **Setup**
- **Prerequisites:** Node.js 18+ (or 20+), pnpm 9+, PostgreSQL 14+ (local or Docker).
- **Install:** Run `pnpm install` to install dependencies.
- **Configure env:** Create a `.env` file at the project root with `DATABASE_URL`.
- **Migrate DB:** Apply Prisma migrations and generate client.
- **Run:** Start the NestJS server in watch mode.
- **Test:** Run unit and e2e tests.

### **1. Prerequisites**
- **Node.js:** Install from https://nodejs.org (LTS recommended). Verify with:

```bash
node -v
pnpm -v
```

- **pnpm:** Install globally if missing:

```bash
npm i -g pnpm@latest
```

- **PostgreSQL:** You can use a local install or Docker. Example Docker command:

```bash
docker run --name wallet-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=wallet_db -p 5432:5432 -d postgres:16
```

### **2. Install dependencies**

```bash
pnpm install
```

### **3. Environment variables**
Create a file named `.env` in the project root with your PostgreSQL connection string. Examples:

- Local PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wallet_db?schema=public"
```

- Docker container (as created above):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wallet_db?schema=public"
```

### **4. Database setup**
Apply migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Optional: open Prisma Studio to inspect data:

```bash
pnpm studio
```

### **5. Run the server**
Start the NestJS app in watch mode:

```bash
pnpm start:dev
```

The app starts on http://localhost:3000 by default.

### **6. Testing & linting**
- Unit tests:

```bash
pnpm test
```

- E2E tests:

```bash
pnpm test:e2e
```

- Lint & format:

```bash
pnpm lint
pnpm format
```

### **Idempotency for fund/transfer**
- Both `POST /wallet/fund` and `POST /wallet/transfer` support idempotency via the `Idempotency-Key` request header.
- Repeated calls with the same `Idempotency-Key` and identical payload return the cached response; different payloads with the same key return `409`.

Setup steps (after pulling these changes):

```bash
# Ensure DATABASE_URL is set and DB is reachable
npx prisma migrate dev --name add_idempotency_model
npx prisma generate
```

Usage example:

```bash
curl -X POST http://localhost:3000/wallet/fund \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 8b3a1c2d-7e5f-4f7a-9c2a-1f2e3d4c5b6a' \
  -d '{"walletId":"<WALLET_ID>","amount":50}'

# Retrying the same request with the same key returns the same response
```

### **Troubleshooting**
- If migrations fail, ensure the database is reachable and the `DATABASE_URL` is correct.
- If Nest fails to start, verify Node and pnpm versions and reinstall with `pnpm install`.
- On Windows, if Docker port 5432 is in use, stop other Postgres services or change the published port.


# Assumptions
- There is an external micro-service/API that handles the wallet registry on a fina
ncial platform (e.g banking service and payment gateway)
- Users have completed all authentication and authorization processes needed for wallet operations.
- The database is used for the application's state and does not represent any wallet registry.

# How would the system scale in production

To make sure that the system scales properly in production, use the following strategies:

1. **Load Balancing:**
  - Deploying load balancing technology will ensure that incoming network traffic is evenly distributed among the available application instances, resulting in higher uptime and faster response times.

2. **Database Optimization:**
  - Implement caching stategies using services like Redis to prevent redundant database queries

3. **Horizontal Scaling:**
  - Add more instances of the application server when demain increases

4. **Asynchronous Processing:**
  - Utilize message queues (e.g., RabbitMQ, Kafka) for handling background tasks and processing workloads asynchronously.

5. **Monitoring and Auto-scaling:**
  - Implement monitoring tools to track performance metrics and set up auto-scaling policies to adjust resources based on traffic patterns.

6. **API Rate Limiting:**
  - Rate limiting would be implemented to prevent abuse of the API endpoints

