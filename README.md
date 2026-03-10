# SMART EVENT BOOKING SYSTEM

A complete full-stack web app for discovering events, booking tickets, and managing events with real-time seat updates.

## 1) Folder Structure

```bash
event-booking-system
│
├── server
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── bookingController.js
│   │   └── eventController.js
│   ├── routes
│   │   ├── bookingRoutes.js
│   │   └── eventRoutes.js
│   ├── models
│   │   ├── bookingModel.js
│   │   └── eventModel.js
│   ├── package.json
│   └── server.js
│
├── client
│   ├── public
│   ├── src
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── Footer.jsx
│   │   ├── context
│   │   │   └── SocketContext.jsx
│   │   ├── services
│   │   │   └── api.js
│   │   ├── styles
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── schema.sql
├── event_booking.sql
├── .env.example
└── README.md
```

## 2) Backend Code (Node + Express + MySQL + Socket.IO)

### Features
- CRUD APIs for events
- Search + filter support (`search`, `location`, `date` query params)
- Booking API with transactional seat decrement
- Real-time seat availability and temporary seat locking with Socket.IO

### API Endpoints

#### Event APIs
- `POST /api/events` — create event (**admin key required**)
- `GET /api/events` — list events with optional filters
- `GET /api/events/:id` — event details
- `PUT /api/events/:id` — update event (**admin key required**)
- `DELETE /api/events/:id` — delete event (**admin key required**)

#### Booking APIs
- `POST /api/bookings` — create booking and update seat availability
- `GET /api/bookings` — list bookings (admin key required)

#### Realtime WebSocket Events
- `lockSeat` / `releaseSeat` (client → server) for temporary seat locks
- `seatLockResult` (server → requesting client) lock success/failure
- `seatLockUpdated` (server → all clients) effective real-time availability
- `seatUpdated` (server → all clients) confirmed DB seat updates after bookings

## 3) Frontend Code (React + Tailwind + Framer Motion)

### Pages
- **Home**: full-screen hero, gradient/parallax background, animated highlight blocks
- **Events**: search/filter UI, modern event cards, live seat updates
- **EventDetails**: event info, Google Maps embed, ticket category selector, total price
- **Checkout**: animated form + booking request + seat lock handshake + confetti success + downloadable QR ticket
- **AdminDashboard**: create/update/delete events and view bookings

### Core UX Elements
- Smooth scrolling
- Gradient-heavy modern visual design
- Motion-based interactions using Framer Motion
- Realtime seat updates using Socket.IO client
- PWA installable build with service worker and offline caching support

## 4) SQL Schema

Use either `schema.sql` or `event_booking.sql`:

```bash
mysql -u root -p < event_booking.sql
```

## 5) Example Environment Variables

Copy `.env.example` values into your runtime env:

### Server
- `PORT`
- `CLIENT_URL`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_API_KEY`

### Client
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_ADMIN_API_KEY`

## 6) Setup Instructions


### Quick start (single repo root)

```bash
npm run install:all
npm run dev:server
npm run dev:client
```

### Backend

```bash
cd server
npm install
npm test
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Open: `http://localhost:5173`

## 7) Deployment Instructions

### Deploy Backend on Render
1. Create new **Web Service** and point to repository.
2. Set Root Directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example` server block.
6. Ensure your MySQL instance is publicly accessible (or use managed MySQL).

### Deploy Frontend on Vercel
1. Import repository in Vercel.
2. Set Root Directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env vars:
   - `VITE_API_BASE_URL=https://<your-render-service>/api`
   - `VITE_SOCKET_URL=https://<your-render-service>`
6. Deploy.

## Notes
- Seed sample events manually with `POST /api/events` from admin workflow.
- Socket.IO emits `seatUpdated` after every successful booking.


## Reliability Improvements Included
- Booking flow uses row-level locking (`SELECT ... FOR UPDATE`) before seat decrement to reduce oversell risk under concurrency.
- Server-side validation for event payloads and booking fields prevents invalid seat/price and malformed request writes.
- Frontend now surfaces API errors on Events, Event Details, Checkout, and Admin Dashboard pages for easier debugging.


## Troubleshooting
- If `npm install` fails with proxy-related errors, clear proxy env vars and retry:
  `env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm install`
- If `nodemon: not found`, dependencies are not installed yet. Run install in `server/` first.
- Ensure MySQL is running and `DB_*` values are valid before starting backend.


## Admin API Access
- Protected admin endpoints require header: `x-admin-key: <ADMIN_API_KEY>`.
- Frontend Admin Dashboard reads this from `VITE_ADMIN_API_KEY`.


## Automated Tests
- Backend unit tests run with Node test runner: `cd server && npm test`
- Includes seat lock service behavior checks (lock limits, effective availability, release behavior).
