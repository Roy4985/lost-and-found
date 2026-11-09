# Database schema

MongoDB, 3 collections. `→` marks a reference to another collection.

## users

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | created automatically |
| `name` | String | required |
| `email` | String | required, unique, stored lowercase |
| `passwordHash` | String | required — bcrypt hash, never the plain password |
| `createdAt` | Date | created automatically |

## items

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | created automatically |
| `userId` | ObjectId → users | required — who posted the item |
| `type` | String | required — `lost` or `found` |
| `title` | String | required |
| `description` | String | optional |
| `category` | String | required — `electronics`, `keys`, `cards-ids`, `bags`, `clothing`, `other` |
| `location` | String | required — where on campus |
| `date` | Date | required — when it was lost or found |
| `photoUrl` | String | optional — Cloudinary image link |
| `status` | String | `open` (default) or `closed` |
| `createdAt` | Date | created automatically |

## claims

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | created automatically |
| `itemId` | ObjectId → items | required — the item being claimed |
| `userId` | ObjectId → users | required — who is claiming |
| `message` | String | required — proof the item is theirs |
| `status` | String | `pending` (default), `accepted` or `rejected` |
| `createdAt` | Date | created automatically |

## Relationships

- One **user** posts many **items**
- One **user** sends many **claims**
- One **item** receives many **claims**

## Claim rules (enforced on the server)

1. A user can have only **one pending claim per item**.
2. A user cannot claim **their own item**, and nobody can claim a **closed** item.
3. Only the **item's poster** can accept or reject a claim.
4. **Accepting** a claim sets the item to `closed` and rejects its other pending claims.
