# Campus Lost & Found

A web app where students post items they lost or found on campus, and owners claim them back.

## Tech stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas)

## Project structure
```
client/   React frontend  → http://localhost:5173
server/   Express API     → http://localhost:3000
```

## Setup
Requires **Node.js 20+**.

1. Clone the repo
   ```
   git clone https://github.com/Roy4985/lost-and-found.git
   cd lost-and-found
   ```
2. Start the backend
   ```
   cd server
   npm install
   cp .env.example .env
   npm run dev
   ```
   Fill in the values in `server/.env`. Check it works at http://localhost:3000/api/health

3. Start the frontend (in a second terminal)
   ```
   cd client
   npm install
   cp .env.example .env.development
   npm run dev
   ```
   Open http://localhost:5173

## Design
- [Wireframes](docs/wireframes.svg)
- [Database schema](docs/schema.md)