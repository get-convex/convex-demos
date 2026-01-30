
# Convex Demos

## Welcome to Convex

**Convex is the reactive backend-as-a-service for web developers.**

Convex makes it dead simple to store your app's shared state and sync it
everywhere. As a developer, you interact with your shared state using JavaScript
or TypeScript functions and bind that state to your reactive app.

Realtime updates are automatic. Every user everywhere sees the current version
of your state.

Convex is fully serverless and automatically handles caching and scaling.

**Get started at [docs.convex.dev](https://docs.convex.dev)!**

This repo contains demo apps to get you started with the Convex platform.

---

## Using Claude Code with This Repo

This repo has **33 self-contained demo projects**, each in its own directory
with independent `package.json` and `convex/` folders. There is no monorepo
tooling — navigate into a specific project to work with it.

### Key Convex Patterns (with reference demos)

**Schema & Validation** — Define your data model in `convex/schema.ts` using
`defineSchema` and `defineTable` with validators from `convex/values`:

- `relational-data-modeling/convex/schema.ts` — tables, `v.id()` references, secondary indexes
- `args-validation/convex/messages.ts` — arg validators and return type validators on functions
- `zod-validation-ts/convex/messages.ts` — alternative Zod-based validation with `convex-helpers`

**Queries, Mutations, Actions** — Backend logic lives in `convex/*.ts` files,
exported as named functions using builders from `convex/_generated/server`:

- `query({args, handler})` — read-only, reactive, called via `useQuery` on the client
- `mutation({args, handler})` — read-write, transactional, called via `useMutation`
- `action({args, handler})` — for side effects (HTTP fetches, external APIs); cannot access db directly, uses `ctx.runMutation`/`ctx.runQuery` to interact with data
- `internalMutation` / `internalQuery` — not exposed to client, callable via `internal.*` references

See `tutorial/convex/messages.ts` for the simplest example.
See `giphy-action/convex/messages.ts` for action + internalMutation pattern.

**React Client Integration** — Wrap your app in `<ConvexProvider>`, then use hooks:

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const messages = useQuery(api.messages.list);
const send = useMutation(api.messages.send);
```

See `tutorial/src/main.tsx` (provider setup) and `tutorial/src/App.tsx` (hooks usage).

**Search & Vector Search:**

- `search/convex/schema.ts` — `.searchIndex()` for full-text search
- `vector-search/convex/schema.ts` — `.vectorIndex()` for embeddings with filter fields

**File Storage:**

- `file-storage/convex/messages.ts` — `ctx.storage.generateUploadUrl()` and `ctx.storage.getUrl()`

**Scheduling & Cron Jobs:**

- `scheduling/convex/messages.ts` — `ctx.scheduler.runAfter()` for delayed execution
- `cron-jobs/convex/crons.ts` — `cronJobs()` with interval/cron scheduling

**HTTP Endpoints:**

- `http/convex/http.ts` — `httpRouter()` with path and prefix routing

**Pagination:**

- `pagination/convex/messages.ts` — `paginationOptsValidator` and `.paginate()`

**Custom Errors:**

- `custom-errors/convex/messages.ts` — `ConvexError` for structured error data

**Testing:**

- `convex-test/convex/posts.test.ts` — `convex-test` + vitest for testing queries/mutations

**Auth (Clerk):**

- `users-and-clerk/` — Clerk integration
- `users-and-clerk-webhooks/` — Clerk webhook-based user sync

### Project Structure Convention

Each demo follows this structure:

```
project-name/
├── convex/
│   ├── _generated/    # Auto-generated types (don't edit)
│   ├── schema.ts      # Database schema (optional but recommended)
│   ├── tsconfig.json  # Convex-specific TS config
│   └── *.ts           # Your query/mutation/action files
├── src/               # Frontend (React+Vite projects)
│   ├── main.tsx       # ConvexProvider setup
│   └── App.tsx        # UI with useQuery/useMutation hooks
├── package.json
└── vite.config.mts
```

### Dev Workflow

```sh
cd <project-name>
npm install
npm run dev   # runs convex dev + vite dev in parallel
```

The `dev` script uses `npm-run-all --parallel` to start both the Convex backend
(`convex dev` — watches for function changes and pushes to your dev deployment)
and the frontend dev server simultaneously.
