# Library Management System

A robust, enterprise-grade full-stack Library Management System built with **React**, **Express**, and **MySQL**. The application provides end-to-end catalog administration, real-time inventory tracking, circulation ledger transactions, and role-based access control.

---

## System Capabilities

- **Executive Dashboard:** Live metrics for unique catalog titles, available shelf copies, low-stock warnings, and recorded circulation events.
- **Catalog Management:** Full CRUD operations for books, search-by-keyword, genre filtering, ISBN validation, and dynamic inventory status tracking.
- **Circulation & Transactions:** Real-time recording of book borrowing (stock deduction), returns (stock restoration), and procurement restocking within an atomic database transaction.
- **User Directory & RBAC:** Role-based access control supporting `Administrator`, `Librarian`, and `Student Member` accounts.
- **Secure Authentication:** JWT-based session security with bcrypt password hashing.
- **Responsive Interface:** Modern, clean, professional enterprise UI built for mobile, tablet, and desktop viewports.

---

## Prerequisites

- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or higher)

---

## Getting Started

### 1. Database Setup

1. Open MySQL Workbench or your terminal:
   ```sql
   mysql -u root -p < database.sql
   ```
   Or execute the SQL commands found in `database.sql`.

### 2. Backend Configuration & Startup

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_management
JWT_SECRET=your_secure_jwt_secret_key
```

Seed an initial administrator account:
```bash
node src/seedAdmin.js "System Administrator" ADMIN001 Password123
```

Start the API service:
```bash
npm run dev
```

- API Base URL: `http://localhost:5001/api`
- Health Check: `http://localhost:5001/api/health`

### 3. Frontend Setup & Startup

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

Access the web portal at: `http://localhost:5173`

---

## Role Permissions Matrix

| Capability | Administrator | Librarian | Student Member |
|---|:---:|:---:|:---:|
| View Dashboard & Metrics | Yes | Yes | Yes |
| Browse Book Catalog | Yes | Yes | Yes |
| Search & Filter Books | Yes | Yes | Yes |
| Add / Edit / Remove Books | Yes | No | No |
| Issue / Return Transactions | Yes (Any User) | Yes (Self) | Yes (Self) |
| Restock Inventory | Yes | Yes | No |
| User Account Administration | Yes | No | No |

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues JWT token |
| `GET` | `/api/books` | Authenticated | Retrieves all registered book titles |
| `POST` | `/api/books` | Admin | Registers a new book in the catalog |
| `PUT` | `/api/books/:id` | Admin | Updates an existing book record |
| `DELETE`| `/api/books/:id` | Admin | Deletes a book record (must have no active history) |
| `GET` | `/api/transactions` | Authenticated | Lists all circulation transaction records |
| `POST` | `/api/transactions` | Authenticated | Records a borrow, return, or restock transaction |
| `GET` | `/api/users` | Admin | Lists all user accounts |
| `POST` | `/api/users` | Admin | Provisions a new member or staff user |
| `PUT` | `/api/users/:id` | Admin | Updates user information and/or password |
| `DELETE`| `/api/users/:id` | Admin | Removes a user account |
"# BookNest" 
