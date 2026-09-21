# 1. Functional Overview & Business Logic (What the project does)

### Primary Purpose
Casa Nova POS is a modern, high-performance point-of-sale (POS) and inventory management system purpose-built for retail businesses in Syria and adaptable for broader retail environments. Its core purpose is to replace paper-based or legacy desktop systems with a fast, digital, bilingual (Arabic/English), dual-currency (USD/SYP) platform that handles live cashier checkout, multi-currency accounting, real-time inventory tracking, purchase orders, supplier management, and business analytics.

### Core Features
- **Point of Sale (POS) Register:** Lightning-fast product grid, barcode search, cart management, line-item and order-level discounts, and split/flexible payment processing.
- **Dual-Currency & Exchange Rate Engine:** Real-time pricing and costing in both US Dollars (USD) and Syrian Pounds (SYP), governed by a centralized dynamic exchange rate setting.
- **Inventory & Stock Management:** Complete CRUD for products and categories, real-time stock level monitoring, and low-stock threshold alerts (`LOW_STOCK_THRESHOLD`).
- **Purchasing & Supplier Management:** End-to-end purchase order creation, supplier directory management, supplier invoice receiving with automatic weighted-average cost recalculation, and purchase returns.
- **Sales History & Returns:** Comprehensive order tracking, detailed order item inspection, and atomic customer return processing with automatic stock restoration.
- **Consignment Sales:** Dedicated tracking and settlement workflows for consignment inventory.
- **Business Intelligence & Reports:** Daily sales summaries, profit calculations, top-selling products analytics, and date-preset filtering.
- **User Administration:** Role-based access control (Admin vs. Cashier) with secure administrative user management via Supabase Edge Functions.
- **Bilingual & RTL/LTR Interface:** Full Arabic and English language support with automatic layout direction switching.
- **Dark-Mode First Aesthetic:** Optimized for retail counter lighting conditions to reduce eye strain and ensure maximum scannability.

### User Roles & Flows
1. **Cashier:**
   - Logs in via credentials.
   - Navigates to the POS screen (`/pos`).
   - Scans or selects products, adjusts quantities, applies discounts, and completes checkout in cash or card.
   - Views daily sales history or processes customer returns if needed.
2. **Store Owner / Admin:**
   - Accesses the Dashboard (`/`) to monitor daily revenue, profit, low stock alerts, and top products.
   - Manages inventory (`/inventory`) by adding new products, updating dual-currency pricing, and organizing categories.
   - Manages purchasing (`/purchases`) by issuing purchase orders, receiving stock invoices, and managing suppliers.
   - Configures system settings (`/settings`) such as exchange rates and store info.
   - Manages users (`/admin`) to provision cashier accounts and control roles.

### Business Rules
- **Atomic Transactions:** Critical operations (sales checkout, customer returns, stock receiving) must be executed transactionally (via PostgreSQL RPC functions) to prevent partial writes and database desynchronization.
- **Weighted-Average Costing:** When new stock is received via purchase invoices, product inventory cost bases are automatically recalculated using weighted-average formulas.
- **Dual-Currency Synchronization:** All monetary values maintain both USD and SYP representations based on the active store exchange rate configured in settings.
- **Role-Based Authorization:** Administrative actions (user management, settings updates, cost visibility) are restricted to users with the `admin` role enforced by Row Level Security (RLS) and API checks.

# 2. Tech Stack & Tooling

### Frontend & Core Framework
- **Framework:** React 19.2 (utilizing modern React concurrent features and hooks)
- **Language:** TypeScript 6 (Strict mode enabled)
- **Bundler & Build Tool:** Vite 8 with `@vitejs/plugin-react`
- **Routing:** React Router v7 (`react-router-dom`)

### Styling & UI
- **Styling Engine:** Tailwind CSS v4 (CSS-First architecture utilizing `@theme` variables in `src/index.css`)
- **Animations:** Framer Motion 12 for fluid micro-interactions, layout transitions, and card animations
- **Icons:** `@phosphor-icons/react` for consistent, crisp iconography

### State Management & Data Fetching
- **Client/UI State:** Zustand 5 (structured using the Slices Pattern for separation of concerns, e.g., `authSlice`, `uiSlice`, `toastSlice`)
- **Server State & Caching:** TanStack React Query (`@tanstack/react-query` v5) for asynchronous data fetching, background synchronization, and caching

### Forms & Validation
- **Form Management:** React Hook Form (`react-hook-form` v7)
- **Schema Validation:** Zod (`zod` v3) with `@hookform/resolvers`

### Internationalization (i18n)
- **i18n Framework:** `i18next` and `react-i18next` with `i18next-browser-languagedetector` supporting English (`en`) and Arabic (`ar`)

### Backend, Database & Edge Functions
- **Backend-as-a-Service (BaaS):** Supabase (`@supabase/supabase-js` v2)
- **Database:** PostgreSQL (with Row Level Security - RLS, stored procedures / RPC functions, and database triggers)
- **Serverless / Edge Functions:** Deno-based Supabase Edge Functions (`manage-users` for secure administrative user operations)

### Testing
- **Unit & Integration Testing:** Vitest (`vitest` v4) with `@testing-library/react` and `jsdom`
- **End-to-End (E2E) Testing:** Playwright (`@playwright/test`)

# 3. Architecture & Design Patterns

### Structural Methodology (Feature-Based Architecture)
The codebase strictly adheres to a **Feature-Based (Feature-Sliced) Architecture**. Rather than grouping files purely by technical role (e.g. all components in one folder, all hooks in another), code is organized around business domain features inside `src/features/`.

Key directory segregation:
- `src/features/[feature-name]/`: Encapsulates feature-specific `components`, `hooks`, `services`, and `store`.
- `src/pages/`: Top-level page views mapped directly to application routes (`src/routes.tsx`).
- `src/store/`: Global Zustand store root combining feature/domain slices (`authSlice`, `uiSlice`).
- `src/types/`: Centralized and isolated TypeScript interface and type definitions.
- `src/lib/`: Shared utilities, database client initialization, and admin API helpers.

### Design Patterns Applied
- **Slices Pattern (Zustand):** Global client state is modularized into independent slices (`authSlice`, `uiSlice`, `toastSlice`) combined into a single root store, preventing a monolithic state structure.
- **Repository / Service Layer Pattern:** Database and API calls are abstracted away from React components into dedicated service modules (e.g., `features/sales/services/api.ts`), ensuring clear separation of concerns.
- **Custom Hooks Pattern:** Data fetching, mutations, and complex reactive logic are encapsulated into reusable custom hooks (e.g., `useProducts`, `usePurchaseOrders`, `useSettingsQuery`) wrapping TanStack React Query.
- **Builder / Factory Patterns:** Used implicitly in building transactional payloads and dynamic query builders for Supabase RPC execution.
- **ErrorBoundary Pattern:** Component-level error catching (`ErrorBoundary.tsx`) to prevent whole-app crashes due to render errors.

### Adherence to SOLID Principles
- **Single Responsibility Principle (SRP):** Each component, hook, and service handles a singular, well-defined domain task (e.g., product validation logic is isolated in `productSchema.ts`).
- **Interface Segregation Principle (ISP):** Types and interfaces are broken down into specific domain files (`sales.ts`, `pos.ts`, `inventory.ts`, `purchases.ts`) rather than a single monolithic definitions file.
- **Dependency Inversion / Injection:** Components depend on abstracted query hooks rather than direct API calls, enabling clean test mocks and decoupled logic.

# 4. Directory Structure

```text
casa-nova-pos/
├── e2e/                      # Playwright End-to-End test suites
├── public/                   # Static assets (manifest.js, PWA service worker, icons, favicon)
├── scripts/                  # Administrative setup and profile initialization scripts
├── supabase/                 # Database migrations, raw SQL scripts, and Supabase Edge Functions
│   ├── functions/            # Deno edge functions (e.g., manage-users)
│   └── migrations/           # Versioned PostgreSQL migration SQL scripts
├── src/                      # Source code root
│   ├── assets/               # Image assets, logos, and graphic vectors
│   ├── features/             # Feature-isolated domain modules
│   │   ├── admin/            # User administration & management
│   │   ├── auth/             # Authentication logic & login flows
│   │   ├── consignment/      # Consignment sales & settlements
│   │   ├── dashboard/        # Dashboard metrics & overview widgets
│   │   ├── inventory/        # Product CRUD, category management, product validations
│   │   ├── pos/              # Point of Sale register, cart management, checkout
│   │   ├── purchases/        # Purchase orders, supplier management, stock receiving, returns
│   │   ├── reports/          # Financial summaries, sales reports, top products
│   │   ├── sales/            # Sales history & customer returns processing
│   │   ├── settings/         # Store configuration & exchange rate settings
│   │   └── shared/           # Reusable shared components, layout helpers, toast notifications
│   ├── i18n/                 # Localization setup and locale JSON dictionaries (ar.json, en.json)
│   ├── layouts/              # App root layout, authentication guards, navigation structures
│   ├── lib/                  # Supabase client initialization, database utilities, constants
│   ├── pages/                # Top-level route components mapping to application views
│   ├── store/                # Global Zustand store root and slices (authSlice, uiSlice)
│   ├── test/                 # Test setup configuration for Vitest and Testing Library
│   ├── types/                # Centralized domain TypeScript interfaces and database schemas
│   ├── index.css             # Tailwind CSS v4 entry point with design tokens and theme variables
│   ├── main.tsx              # Application entry point mounting React root
│   └── routes.tsx            # React Router route definitions and lazy-loaded page mappings
├── AI_RULES.md               # Strict coding and architectural guidelines for AI agents
├── DESIGN.md                 # Design system and visual styling guidelines
├── PRODUCT.md                # Product requirements and user domain definitions
├── PROJECT_ANALYSIS.md       # Comprehensive architectural audit and remediation notes
├── package.json              # Project dependencies, scripts, and metadata
└── vite.config.ts            # Vite bundler configuration
```

# 5. Data Flow & State Management

### Life Cycle of Data
1. **User Action / Input:** User interacts with UI components (e.g., adding an item to the POS cart, submitting a product form).
2. **Local Validation:** React Hook Form combined with Zod schemas validates input data on the client side before submission.
3. **Mutation / Query Execution:** TanStack React Query mutations (`useMutation`) or queries (`useQuery`) execute asynchronous operations against Supabase or database RPC functions.
4. **Optimistic Updates & Invalidation:** Upon successful mutation, React Query invalidates affected query cache keys (e.g., `products`, `sales-orders`, `dashboard`), triggering background refetches to ensure UI consistency.
5. **Global UI State:** Client-only UI states (such as sidebar toggle state, active modals, theme settings, or toast notifications) are managed via Zustand stores (`uiSlice`, `toastSlice`).
6. **Authentication State:** User session state, roles, and profile info are synchronized through Supabase Auth listeners and managed via `authSlice`.

### Data Fetching & Caching Mechanisms
- **TanStack React Query:** Configured with robust defaults, stale-time management, and error handling. Timeout wrappers (`withTimeout`) are applied to network calls to prevent indefinite hanging on poor network connections.
- **Database Transactions (RPC):** Critical multi-step workflows (such as completing a sale, processing customer returns, or receiving stock) utilize PostgreSQL stored procedures / RPC functions (`complete_sale`, `create_return`, `receive_stock`) ensuring ACID compliance and atomic database rollbacks.

# 6. Key Entities & Database Schemas

The PostgreSQL database managed via Supabase contains the following core tables, interfaces, and RPC functions:

### Core Data Models & TypeScript Types (`src/types/`)
- `Product`: Inventory item containing id, name, sku, category_id, price_usd, price_syp, cost_usd, cost_syp, stock, min_stock, etc.
- `SaleOrder` / `SaleOrderItem`: Transaction header and line items recording quantities, prices, currency, and discounts.
- `PurchaseOrder` / `PurchaseOrderItem`: Supplier ordering and invoice tracking entities.
- `Return` / `PurchaseReturn`: Customer and supplier return records.
- `UserProfile`: User metadata linking auth UUIDs to roles (`admin`, `cashier`).
- `StoreSettings`: Global configuration including exchange rate and store metadata.

### Core Database Tables (Supabase / PostgreSQL)
- `settings`: Global store settings and exchange rates.
- `categories`: Product categories hierarchy.
- `products`: Product catalog with dual pricing and inventory levels.
- `suppliers`: Supplier directory.
- `purchase_orders` & `purchase_order_items`: Purchasing workflow records.
- `sales_orders` & `sales_order_items`: Checkout transaction records.
- `returns`: Customer sales returns.
- `purchase_returns`: Supplier returns.
- `purchase_needs`: Inventory replenishment requirements.
- `profiles`: User roles and permissions.

### Key RPC Functions (Stored Procedures)
- `complete_sale(...)`: Atomic point-of-sale processing (inventory decrement + sales recording).
- `create_return(...)`: Atomic customer return processing and stock restoration.
- `receive_stock(...)`: Weighted-average cost recalculation and stock receiving.
- `is_admin()`: Security definer function for RLS policy verification.

# 7. Development & Setup Notes

### Environment Variables (`.env`)
Required environment variables (keys only, no sensitive values):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous public API key

### Essential Build & Development Scripts (`package.json`)
- `npm run dev`: Starts the local Vite development server.
- `npm run build`: Type-checks (`tsc -b`) and builds the production bundle (`vite build`).
- `npm run lint`: Runs ESLint code quality checks.
- `npm run test`: Executes unit and integration test suites via Vitest (`vitest run`).
- `npm run test:e2e`: Runs Playwright end-to-end tests.
