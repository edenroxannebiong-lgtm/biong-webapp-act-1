# Keepsake Security Specification & Invariants

## 1. Data Invariants
- **Strict Owner Isolation**: Every journal entry (`/users/{userId}/entries/{entryId}`) and deadline (`/users/{userId}/deadlines/{deadlineId}`) is isolated under the owning user's path. Only the authenticated owner (`request.auth.uid == userId`) can read, list, create, update, or delete their own documents.
- **User Document Pinning**: A user document at `/users/{userId}` can only be read or modified by that exact authenticated user (`request.auth.uid == userId`). Listing `/users` is strictly disabled to protect PII.
- **Identity & Parent Integrity**: On creation, `incoming().userId` must match `{userId}` and `incoming().id` must match the document ID. Both fields are immutable on updates.
- **Strict Schema & Bounds**: Journal entries enforce `title` (1..150 chars), `content` (1..10000 chars), `date` (`YYYY-MM-DD`), `mood` (`Happy`, `Productive`, `Stressed`, `Chill`, `Grateful`, `Sad`), and optional `isFavorite` (bool). Deadlines enforce `title` (1..150 chars), optional `subject` (<= 100 chars), `dueDate` (`YYYY-MM-DD`), optional `notes` (<= 2000 chars), and `completed` (bool).
- **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable thereafter. `updatedAt` must equal `request.time` on creation and update.

## 2. The Dirty Dozen Payloads (Must Fail with PERMISSION_DENIED)
1. **Unauthenticated Entry Read**: Anonymous `GET /users/u1/entries/e1` -> PERMISSION_DENIED.
2. **Cross-User Entry Read**: User A reads `/users/user_b/entries/e1` -> PERMISSION_DENIED.
3. **Cross-User Entry List**: User A queries `collection(db, 'users', 'user_b', 'entries')` -> PERMISSION_DENIED.
4. **Blanket Query Without Owner Filter**: User A queries `entries` without `where('userId', '==', auth.uid)` -> PERMISSION_DENIED.
5. **Identity Spoofing on Entry Create**: User A writes `{ id: 'e1', userId: 'user_b', ... }` under `/users/user_a/entries/e1` -> PERMISSION_DENIED.
6. **Ghost Field Injection**: Adding `{ isAdmin: true }` or `{ extraField: 'x' }` to a journal entry or profile -> PERMISSION_DENIED.
7. **Invalid Mood Tag**: Creating or updating an entry with `mood: 'Angry'` -> PERMISSION_DENIED.
8. **Malformed Date String**: Creating an entry with `date: '14-11-2026'` or `'invalid'` -> PERMISSION_DENIED.
9. **Empty or Oversized Content**: Submitting `content: ''` or `title: ''` or `content > 10000 chars` -> PERMISSION_DENIED.
10. **Tampering with Immutable Timestamps**: Modifying `createdAt` during an entry update -> PERMISSION_DENIED.
11. **User Profile Listing**: Any user querying `collection(db, 'users')` -> PERMISSION_DENIED.
12. **Client-Forged Future Timestamp**: Setting `updatedAt` to a client-chosen date instead of `request.time` -> PERMISSION_DENIED.
