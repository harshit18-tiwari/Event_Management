# College Event Management MERN Stack

This project is a full College Event Management application built with React, Vite, Express, MongoDB, JWT authentication, and Tailwind CSS.

It includes:

- Authentication and role-based access control
- Event management CRUD
- Event registration and participant management
- QR code attendance and check-in

## Project Structure

- `server/` - Express API, MongoDB models, controllers, and routes
- `client/` - React frontend with routing, pages, and reusable UI components

## Requirements

- Node.js 18 or later
- MongoDB running locally or in the cloud

## Setup

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `server/` with values similar to:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college-event-management
JWT_SECRET=your_jwt_secret
QR_TOKEN_SECRET=your_optional_qr_secret
CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside `client/` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`QR_TOKEN_SECRET` is optional. If it is not set, the backend falls back to `JWT_SECRET` for QR token signing.

### 3. Start the backend

```bash
cd server
npm start
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

Open the frontend at `http://localhost:5173`.

## Attendance Flow

- Students register for events and receive a unique QR code for each registration.
- Students can open `My QR Code` from the dashboard to view or download their QR code.
- Coordinators can use the attendance scanner to capture the QR token and mark attendance.
- Coordinators and admins can view attendance reports for events.
- Admins can view the global attendance report.

## Useful Routes

- `/login`
- `/register`
- `/dashboard`
- `/events`
- `/my-events`
- `/attendance/qr`
- `/attendance/history`
- `/attendance/scanner`
- `/attendance/report`

## API Highlights

- `GET /api/attendance/qr/:eventId`
- `POST /api/attendance/checkin`
- `GET /api/attendance/event/:eventId`
- `GET /api/attendance/my-attendance`
- `GET /api/attendance/all`

## Notes

- QR code attendance is only available for registered students.
- Attendance can be recorded once per registration.
- Coordinators can manage attendance only for events they created.
- Admins can manage attendance for all events.
