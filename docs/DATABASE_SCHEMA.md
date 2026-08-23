# Database Schema

## Database

AirGuard AI uses **Firestore** as the primary application database.

The backend is responsible for validating and accessing database records.

---

## Collections

### `users`

Stores application users and their roles.

```text
user_id
email
display_name
role
created_at
updated_at