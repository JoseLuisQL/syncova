# SIVAC - Sistema de Gestión de Vacunas - Agent Guidelines

## Build/Lint/Test Commands

### Frontend (React + Vite + TypeScript)
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (Node.js + Express + Prisma + TypeScript)
- `cd backend && npm run dev` - Start backend dev server (port 3001)
- `cd backend && npm run build` - Compile TypeScript to dist/
- `cd backend && npm start` - Run production build
- `cd backend && npm run lint` - Run ESLint on backend
- `cd backend && npm run lint:fix` - Auto-fix ESLint errors
- `cd backend && npm test` - Run Jest tests
- `cd backend && npm run test:watch` - Run tests in watch mode

### Database (Prisma + PostgreSQL)
- `cd backend && npm run db:generate` - Generate Prisma client
- `cd backend && npm run db:push` - Push schema to database
- `cd backend && npm run db:migrate` - Create migration
- `cd backend && npm run db:seed` - Seed database
- `cd backend && npm run db:studio` - Open Prisma Studio GUI
- `cd backend && npm run db:reset` - Reset database

### System Scripts
- `start-system.bat` - Start both frontend and backend (Windows)
- `start-frontend.bat` - Start frontend only
- `start-backend.bat` - Start backend only

## Architecture & Structure

### Monorepo Structure
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL 13+
- **Authentication**: JWT tokens with role-based access control

### Key Directories
- `src/` - Frontend React application
  - `components/` - React components organized by feature
  - `services/` - API client services (axios)
  - `hooks/` - Custom React hooks
  - `contexts/` - React Context providers (Auth, Toast)
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
- `backend/src/` - Backend Express application
  - `controllers/` - Request handlers
  - `services/` - Business logic layer
  - `routes/` - API route definitions
  - `middleware/` - Auth, validation, error handling
  - `types/` - Shared TypeScript types
  - `config/` - Configuration (database, env)
  - `utils/` - Helper functions
- `backend/prisma/` - Database schema and migrations

### Internal APIs
- Base URL: `http://localhost:3001/api` (dev) or auto-detected in production
- Authentication: Bearer token in Authorization header
- All responses follow standardized format: `{ success, message, data, timestamp }`

### Database Models (Prisma)
Key entities: Red, Microred, Establecimiento, Vacuna, Jeringa, LoteVacuna, LoteJeringa, PlanificacionAnual, Movimiento, Vale, Usuario, Alerta, CentroAcopio, ConfiguracionJeringaVacuna

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All strict TypeScript checks active
- **No implicit any** - Always type variables explicitly
- **Interfaces over types** - Use interfaces for object shapes
- **Enums from Prisma** - Use Prisma-generated enums for database values
- **Path aliases**: Use `@/` for imports in backend (e.g., `@/services/`, `@/types/`)

### Naming Conventions
- **Files**: PascalCase for components/services (e.g., `UserService.ts`, `Dashboard.tsx`)
- **Variables/Functions**: camelCase (e.g., `getUserById`, `isActive`)
- **Interfaces**: PascalCase with descriptive names (e.g., `CreateUsuarioDto`, `ServiceResult`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Database fields**: snake_case (Prisma schema)
- **React Components**: PascalCase function components

### Imports Organization
1. External libraries (React, axios, etc.)
2. Internal absolute imports (`@/types`, `@/services`)
3. Relative imports (`./`, `../`)
4. Type-only imports last

### Error Handling
- **Backend**: Use `HttpError` class with status codes, caught by global error handler
- **Prisma errors**: Automatically handled by `errorHandler` middleware with specific error codes
- **Frontend**: Use try-catch with toast notifications for user feedback
- **Service layer**: Return `ServiceResult<T>` with `{ success, data?, error? }`
- **Controllers**: Use `ResponseUtil` helper for consistent responses

### Validation
- **Backend**: Joi schemas for request validation in middleware
- **Frontend**: Form validation before API calls
- **Database**: Prisma schema constraints and enums

### React Patterns
- **Functional components** with hooks (no class components)
- **Custom hooks** for data fetching and state management (e.g., `useVacunas`, `useAuth`)
- **Context** for global state (AuthContext, ToastContext)
- **React Router** for navigation with protected routes
- **Tailwind CSS** for styling (utility-first approach)

### Backend Patterns
- **Layered architecture**: Routes → Controllers → Services → Database
- **Dependency injection**: Services receive Prisma client
- **Async/await**: All async operations use async/await (no callbacks)
- **Express async errors**: Use `express-async-errors` for automatic error handling
- **Middleware chain**: Auth → Validation → Controller → Error Handler

### Security
- JWT authentication with bcrypt password hashing
- Rate limiting on API endpoints
- Helmet for HTTP security headers
- CORS configured for specific origins
- Input validation and sanitization
- Role-based access control (RBAC)

### Performance
- Prisma connection pooling and query optimization
- Frontend code splitting with React lazy loading
- Axios instances with timeout configuration
- Database indexes on frequently queried fields

## Important Notes
- **Backend-first approach**: Implement and test backend endpoints before frontend integration
- **Type safety**: Share types between frontend and backend via `types/index.ts`
- **Professional Excel exports**: Use ExcelJS with corporate styling and templates
- **Bidirectional sync**: Planning and Movements modules sync automatically
- **Auto-save**: Planning module has auto-save functionality
- **Stock validation**: Real-time stock validation before operations
- **Batch operations**: Use sequential processing for stock deductions
- **Error messages**: User-friendly Spanish messages in frontend, detailed logs in backend
- **Database triggers**: Some business logic in PostgreSQL triggers (saldo_anterior automation)
- **Testing**: Write tests for critical business logic (stock, calculations, validations)

