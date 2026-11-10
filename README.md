# Campus Lost & Found

A web app where students post items they lost or found on campus, and owners claim them back.

## Tech stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (Atlas) with Mongoose

## Project structure
```
client/            React frontend  → http://localhost:5173
server/            Express API     → http://localhost:3000
  models/Item.js   item schema (fields, types, validation rules)
  routes/items.js  CRUD routes for items
  server.js        app setup, middleware, database connection
  requests.http    test requests for every route
docs/              wireframes and database schema
```

## Setup
Requires **Node.js 20+** and a MongoDB connection string (a free MongoDB Atlas cluster works).

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
   In `server/.env`, set `MONGODB_URI` to your MongoDB connection string. The terminal should print `Connected to MongoDB`. Check it works at http://localhost:3000/api/health

3. Start the frontend (in a second terminal)
   ```
   cd client
   npm install
   cp .env.example .env.development
   npm run dev
   ```
   Open http://localhost:5173

## API reference

Base URL: `http://localhost:3000/api`. All request and response bodies are JSON.

### The item resource

| Field | Type | Rules |
|---|---|---|
| `type` | String | required — `lost` or `found` |
| `title` | String | required, max 100 characters |
| `description` | String | optional, max 1000 characters |
| `category` | String | required — `electronics`, `keys`, `cards-ids`, `bags`, `clothing`, `other` |
| `location` | String | required, max 100 characters |
| `date` | Date | required — when it was lost or found (e.g. `2026-11-08`) |
| `photoUrl` | String | optional |
| `status` | String | `open` (default) or `closed` — set by the server, not the client |
| `_id`, `createdAt`, `updatedAt` | — | set automatically by the server |

### Routes

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/items` | List all items, newest first | 200 | — |
| GET | `/api/items/:id` | Get one item | 200 | 400 invalid id, 404 not found |
| POST | `/api/items` | Create an item | 201 | 400 invalid data |
| PUT / PATCH | `/api/items/:id` | Update the fields sent | 200 | 400 invalid id or data, 404 not found |
| DELETE | `/api/items/:id` | Delete an item | 204 | 400 invalid id, 404 not found |

Any unknown route returns `404 {"error": "Route not found"}`. Malformed JSON returns `400 {"error": "Malformed JSON in request body"}`.

#### GET /api/items
```
curl http://localhost:3000/api/items
```
Response `200`:
```json
[
  {
    "_id": "6730f1c2e4b7a1d3f0c8e2a9",
    "type": "found",
    "title": "Black wallet",
    "description": "",
    "category": "cards-ids",
    "location": "Library",
    "date": "2026-11-08T00:00:00.000Z",
    "photoUrl": "",
    "status": "open",
    "createdAt": "2026-11-09T15:02:11.000Z",
    "updatedAt": "2026-11-09T15:02:11.000Z"
  }
]
```

#### GET /api/items/:id
```
curl http://localhost:3000/api/items/6730f1c2e4b7a1d3f0c8e2a9
```
Response `200`: one item (same shape as above).
Response `400`: `{"error": "Invalis id"}` · Response `404`: `{"error": "Item not found"}`

#### POST /api/items
```
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"type":"found","title":"Black wallet","category":"cards-ids","location":"Library","date":"2026-11-08"}'
```
Response `201`: the created item, including its new `_id`.

Response `400` when data is invalid:
```json
{
  "error": "Invalid data",
  "details": ["type must be \"lost\" or \"found\"", "title is required"]
}
```

#### PUT / PATCH /api/items/:id
Only the fields sent are changed; the rest stay as they were.
```
curl -X PATCH http://localhost:3000/api/items/6730f1c2e4b7a1d3f0c8e2a9 \
  -H "Content-Type: application/json" \
  -d '{"location":"Cafeteria"}'
```
Response `200`: the updated item.
Response `400`: `{"error": "Send at least one field to update"}` when the body has no editable fields, or validation details when a value is invalid.

#### DELETE /api/items/:id
```
curl -i -X DELETE http://localhost:3000/api/items/6730f1c2e4b7a1d3f0c8e2a9
```
Response `204`: no body. Deleting the same id again returns `404`.

### Testing every route
`server/requests.http` has a request for every route and error case. Open it in VS Code with the **REST Client** extension:
1. Start the server with `npm run dev`.
2. Send **"Create an item"** and copy the `_id` from the response into `@itemId` at the top of the file.
3. Click **Send Request** above each request, top to bottom. The comment on each request shows the expected status code.

## Design
- [Wireframes](docs/wireframes.svg)
- [Database schema](docs/schema.md)