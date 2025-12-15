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
npx prisma migrate dev --name init
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

### **Troubleshooting**
- If migrations fail, ensure the database is reachable and the `DATABASE_URL` is correct.
- If Nest fails to start, verify Node and pnpm versions and reinstall with `pnpm install`.
- On Windows, if Docker port 5432 is in use, stop other Postgres services or change the published port.


# Assumptions
- There is an external micro-service/API that handles the wallet registry on a fina
ncial platform (e.g banking service and payment gateway)
- Users have completed all authentication and authorization processes needed for wallet operations.
- The database is used for the application's state and does not represent any wallet registry.