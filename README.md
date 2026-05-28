# College Event Management - Authentication and RBAC (MERN)

Complete authentication and role-based access control system for a College Event Management app using:

- React (Vite)
- React Router DOM
- Axios
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- dotenv

## Roles

- Student
- Coordinator
- Admin

## Authentication Strategy

- JWT generated on login/register
- JWT stored in HTTP-only cookie (`token`)
- Cookie sent with every request via Axios `withCredentials: true`
- Server verifies token using middleware and attaches current user to `req.user`

## Project Structure

```text
Event_Management/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       └── services/
│           └── api.js
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   └── role.middleware.js
│       ├── models/
│       │   └── user.model.js
│       └── routes/
│           └── auth.routes.js
└── README.md
```

## Backend Setup

1. Move to backend:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
copy .env.example .env
```

4. Configure `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

5. Run server:

```bash
npm run dev
```

## Frontend Setup

1. Move to frontend:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
copy .env.example .env
```

4. Configure `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

5. Run client:

```bash
npm run dev
```

## API Endpoints

### Register

- Method: `POST`
- URL: `/api/auth/register`

Request:

```json
{
  "name": "Harshit",
  "email": "harshit@gmail.com",
  "password": "123456",
  "role": "Student",
  "department": "CSE",
  "year": "3"
}
```

### Login

- Method: `POST`
- URL: `/api/auth/login`

Request:

```json
{
  "email": "harshit@gmail.com",
  "password": "123456"
}
```

### Logout

- Method: `POST`
- URL: `/api/auth/logout`

### Current User

- Method: `GET`
- URL: `/api/auth/me`
- Requires valid JWT cookie

## RBAC Usage (Backend)

Use `authMiddleware` first, then `authorizeRoles`:

```js
const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.get("/admin-only", authMiddleware, authorizeRoles("Admin"), handler);
router.get("/manage-events", authMiddleware, authorizeRoles("Admin", "Coordinator"), handler);
```

## Notes

- In development, cookie is `httpOnly`, `sameSite=lax`, and non-secure.
- In production, cookie is `httpOnly`, `sameSite=none`, and `secure=true`.
- Ensure frontend and backend URLs are configured correctly for cookie sharing.
