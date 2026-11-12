# Campus Lost & Found

A web app where students post items they lost or found on campus, and owners claim them back.

A finder posts the item with where and when it was found. The owner sends a **claim** with proof that it's theirs. The poster accepts one claim, which closes the item.

## Tech stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (Atlas) with Mongoose
- **Authentication:** email + password hashed with bcrypt; JWT sent as a Bearer token

## Project structure
```
client/                       React frontend  → http://localhost:5173
server/                       Express API     → http://localhost:3000
  server.js                   app setup, middleware, database connection
  models/                     User, Item, Claim schemas (fields, types, rules)
  routes/auth.js              signup, login, current user
  routes/items.js             items CRUD (owner-only edit and delete)
  routes/claims.js            send, list, accept and reject claims
  middleware/requireAuth.js   checks the login token on protected routes
  middleware/checkId.js       rejects malformed ids
  auth/token.js               signs and verifies tokens
  utils/handleDbError.js      turns database errors into JSON answers
  requests.http               test requests for every route
docs/                         wireframes and database schema
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
   In `server/.env`, fill in:
   - `MONGODB_URI`: your MongoDB connection string
   - `JWT_SECRET`: a long random string. Generate one with `node -p "crypto.randomBytes(32).toString('hex')"`

   The terminal should print `Connected to MongoDB`. Check it works at http://localhost:3000/api/health

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

### Authentication
Signup and login return a **token**. Send it on every protected request in the `Authorization` header:
```
Authorization: Bearer <token>
```
Tokens expire after 1 hour; log in again to get a new one.

| Code | Meaning |
|---|---|
| `401` | no token, or an invalid or expired one |
| `403` | logged in, but not allowed (e.g. editing someone else's item) |

### All routes

| Method | Path | Access | Description | Success |
|---|---|---|---|---|
| POST | `/api/auth/signup` | public | Create an account | 201 |
| POST | `/api/auth/login` | public | Log in | 200 |
| GET | `/api/auth/me` | logged in | The current user | 200 |
| GET | `/api/items` | public | List all items, newest first | 200 |
| GET | `/api/items/:id` | public | Get one item | 200 |
| POST | `/api/items` | logged in | Post an item | 201 |
| PUT / PATCH | `/api/items/:id` | poster only | Update the fields sent | 200 |
| DELETE | `/api/items/:id` | poster only | Delete an item and its claims | 204 |
| POST | `/api/items/:id/claims` | logged in, not the poster | Send a claim | 201 |
| GET | `/api/items/:id/claims` | poster only | Claims on one item | 200 |
| GET | `/api/claims/sent` | logged in | Claims I sent | 200 |
| GET | `/api/claims/received` | logged in | Claims on items I posted | 200 |
| PATCH | `/api/claims/:id/accept` | poster only | Accept a claim, close the item | 200 |
| PATCH | `/api/claims/:id/reject` | poster only | Reject a claim | 200 |

Errors always come back as JSON, e.g. `{"error": "Item not found"}`. Common ones: `400` invalid id or data, `404` not found, `409` conflicts with the current state. Any unknown route returns `404 {"error": "Route not found"}`, and malformed JSON returns `400 {"error": "Malformed JSON in request body"}`.

### Claim rules
These are enforced on the server, not just hidden in the interface:
1. A user can have only **one pending claim per item** (also guaranteed by a unique database index, so two simultaneous requests can't both succeed).
2. Only the **item's poster** can accept or reject a claim.
3. **Accepting** a claim closes the item and rejects every other pending claim on it.
4. A user can't claim **their own item**, and nobody can claim a **closed** item.
5. After a claim is **rejected**, the same user may send a new one.

---

### Auth routes

#### POST /api/auth/signup
```
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Roy","email":"roy@example.com","password":"supersecret123"}'
```
Response `201`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6731a2b3c4d5e6f708192a3b",
    "name": "Roy",
    "email": "roy@example.com",
    "createdAt": "2026-11-10T18:30:00.000Z",
    "updatedAt": "2026-11-10T18:30:00.000Z"
  }
}
```
The password is stored only as a bcrypt hash, and the hash is never returned.
Errors: `400` password under 8 characters, missing name or invalid email · `409` email already registered.

#### POST /api/auth/login
```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"roy@example.com","password":"supersecret123"}'
```
Response `200`: `{ "token": "...", "user": { ... } }` (same shape as signup).
Errors: `401 {"error": "Invalid email or password"}`. The same message is used for an unknown email and a wrong password, so it doesn't reveal which emails have accounts.

#### GET /api/auth/me
```
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```
Response `200`: the logged-in user. Errors: `401` missing or invalid token.

---

### Item routes

#### The item resource

| Field | Type | Rules |
|---|---|---|
| `type` | String | required — `lost` or `found` |
| `title` | String | required, max 100 characters |
| `description` | String | optional, max 1000 characters |
| `category` | String | required — `electronics`, `keys`, `cards-ids`, `bags`, `clothing`, `other` |
| `location` | String | required, max 100 characters |
| `date` | Date | required — when it was lost or found (e.g. `2026-11-08`) |
| `photoUrl` | String | optional |
| `userId` | ObjectId | set by the server from the token: who posted it |
| `status` | String | `open` (default) or `closed` — changed only by accepting a claim |
| `_id`, `createdAt`, `updatedAt` | — | set automatically by the server |

#### GET /api/items
```
curl http://localhost:3000/api/items
```
Response `200`:
```json
[
  {
    "_id": "6731b0c1d2e3f4a5b6c7d8e9",
    "userId": "6731a2b3c4d5e6f708192a3b",
    "type": "found",
    "title": "Black wallet",
    "description": "Found near the printers",
    "category": "cards-ids",
    "location": "Library",
    "date": "2026-11-08T00:00:00.000Z",
    "photoUrl": "",
    "status": "open",
    "createdAt": "2026-11-10T18:35:00.000Z",
    "updatedAt": "2026-11-10T18:35:00.000Z"
  }
]
```

#### GET /api/items/:id
```
curl http://localhost:3000/api/items/6731b0c1d2e3f4a5b6c7d8e9
```
Response `200`: one item (same shape as above). Errors: `400 {"error": "Invalid id"}` · `404 {"error": "Item not found"}`.

#### POST /api/items
```
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"found","title":"Black wallet","category":"cards-ids","location":"Library","date":"2026-11-08"}'
```
Response `201`: the created item, with its new `_id` and `userId` set to the logged-in user.

Response `400` when data is invalid:
```json
{
  "error": "Invalid data",
  "details": ["type must be \"lost\" or \"found\"", "title is required"]
}
```

#### PUT / PATCH /api/items/:id
Only the fields sent are changed; the rest stay as they were. `status` and `userId` can't be changed this way.
```
curl -X PATCH http://localhost:3000/api/items/6731b0c1d2e3f4a5b6c7d8e9 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"location":"Cafeteria"}'
```
Response `200`: the updated item.
Errors: `400` invalid id or data, or `{"error": "Send at least one field to update"}` · `401` not logged in · `403 {"error": "Only the person who posted this item can change it"}` · `404` not found.

#### DELETE /api/items/:id
```
curl -i -X DELETE http://localhost:3000/api/items/6731b0c1d2e3f4a5b6c7d8e9 \
  -H "Authorization: Bearer <token>"
```
Response `204`: no body. The item's claims are deleted with it.
Errors: `400` invalid id · `401` not logged in · `403` not the poster · `404` not found.

---

### Claim routes

#### The claim resource

| Field | Type | Rules |
|---|---|---|
| `itemId` | ObjectId | the item being claimed |
| `userId` | ObjectId | set by the server from the token: who is claiming |
| `message` | String | required, max 500 characters — proof the item is theirs |
| `status` | String | `pending` (default), `accepted` or `rejected` |
| `_id`, `createdAt`, `updatedAt` | — | set automatically by the server |

#### POST /api/items/:id/claims
```
curl -X POST http://localhost:3000/api/items/6731b0c1d2e3f4a5b6c7d8e9/claims \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"It is mine, my student ID is inside"}'
```
Response `201`:
```json
{
  "_id": "6731c4d5e6f7a8b9c0d1e2f3",
  "itemId": "6731b0c1d2e3f4a5b6c7d8e9",
  "userId": "6731a9b8c7d6e5f4a3b2c1d0",
  "message": "It is mine, my student ID is inside",
  "status": "pending",
  "createdAt": "2026-11-10T18:40:00.000Z",
  "updatedAt": "2026-11-10T18:40:00.000Z"
}
```
Errors: `400` invalid id or missing message · `401` not logged in · `403 {"error": "You cannot claim your own item"}` · `404` item not found · `409 {"error": "You already have a pending claim on this item"}` or `{"error": "This item is already closed"}`.

#### GET /api/items/:id/claims
```
curl http://localhost:3000/api/items/6731b0c1d2e3f4a5b6c7d8e9/claims \
  -H "Authorization: Bearer <token>"
```
Response `200`: the item's claims, newest first, with the claimer's name:
```json
[
  {
    "_id": "6731c4d5e6f7a8b9c0d1e2f3",
    "itemId": "6731b0c1d2e3f4a5b6c7d8e9",
    "userId": { "_id": "6731a9b8c7d6e5f4a3b2c1d0", "name": "Sara" },
    "message": "It is mine, my student ID is inside",
    "status": "pending",
    "createdAt": "2026-11-10T18:40:00.000Z",
    "updatedAt": "2026-11-10T18:40:00.000Z"
  }
]
```
Errors: `401` not logged in · `403` not the poster · `404` item not found.

#### GET /api/claims/sent
```
curl http://localhost:3000/api/claims/sent -H "Authorization: Bearer <token>"
```
Response `200`: claims sent by the logged-in user. `itemId` is replaced by the item's `title`, `type`, `location` and `status`.

#### GET /api/claims/received
```
curl http://localhost:3000/api/claims/received -H "Authorization: Bearer <token>"
```
Response `200`: claims on items the logged-in user posted, with the item's details and the claimer's name.

#### PATCH /api/claims/:id/accept
```
curl -X PATCH http://localhost:3000/api/claims/6731c4d5e6f7a8b9c0d1e2f3/accept \
  -H "Authorization: Bearer <token>"
```
Response `200`: `{ "claim": { ..., "status": "accepted" }, "item": { ..., "status": "closed" } }`. Every other pending claim on the item becomes `rejected`.
Errors: `400` invalid id · `401` not logged in · `403 {"error": "Only the person who posted this item can answer its claims"}` · `404` claim not found · `409 {"error": "This claim was already accepted"}` or `{"error": "This item is already closed"}`.

#### PATCH /api/claims/:id/reject
```
curl -X PATCH http://localhost:3000/api/claims/6731c4d5e6f7a8b9c0d1e2f3/reject \
  -H "Authorization: Bearer <token>"
```
Response `200`: the claim with `"status": "rejected"`. The item stays open.
Errors: same as accept.

---

## Testing every route
`server/requests.http` has a request for every route and error case. Open it in VS Code with the **REST Client** extension:
1. Start the server with `npm run dev`.
2. Log in three test users (Roy, Sara and Omar) and paste their tokens into `@token`, `@otherToken` and `@thirdToken` at the top of the file.
3. Click **Send Request** above each request, top to bottom. The comment on each request shows the expected status code, and tells you when to copy an id into a variable.

## Design
- [Wireframes](docs/wireframes.svg)
- [Database schema](docs/schema.md)