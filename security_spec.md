# ClientVault Security Specification & Invariants

## 1. Data Invariants
- **Strict Owner Isolation**: A user can only create, read, query, update, or delete files and client records that belong to their own authenticated UID (`userId == request.auth.uid`).
- **User Document Pinning**: A user document at `/users/{userId}` can only be read or written if `{userId} == request.auth.uid`. Cross-user inspection of profiles or PII is strictly forbidden.
- **Identity Integrity**: Incoming `userId` on creation must match `request.auth.uid`. Identity fields (`userId`, `id`, `createdAt`) are immutable after creation.
- **Payload Validation**: All text fields have length limits (file name <= 255 chars, notes <= 500 chars). Numbers like `size` and `downloadCount` cannot be negative.
- **Atomic Timestamps**: `createdAt` on create must equal `request.time`. `updatedAt` on create and update must equal `request.time`.

## 2. The Dirty Dozen Payloads (Designed to Fail with PERMISSION_DENIED)
1. **Unauthenticated Read on Files**: Anonymous/unauthenticated `GET /files/{fileId}` -> PERMISSION_DENIED.
2. **Cross-User File Access**: User A attempts `GET /files/{fileB_id}` where `fileB.userId == 'user_b'` -> PERMISSION_DENIED.
3. **Identity Spoofing on File Create**: User A attempts to write `{ id: 'f1', userId: 'user_b', name: 'hack.pdf' }` -> PERMISSION_DENIED.
4. **Blanket Query Scraping**: User attempts `allow list` without filtering by `userId == request.auth.uid` -> PERMISSION_DENIED.
5. **Ghost Field Injection**: Adding unauthorized field `{ isSuperAdmin: true }` on update -> PERMISSION_DENIED.
6. **Path Traversal / Malformed Document ID**: Using oversized or special characters in document ID -> PERMISSION_DENIED.
7. **Negative File Size**: Attempting to set `size: -5000` -> PERMISSION_DENIED.
8. **Tampering with Immutable Timestamps**: Updating `createdAt` timestamp on an existing file -> PERMISSION_DENIED.
9. **Stealing Client Records**: User A attempting to read/update User B's `/clients/{clientId}` -> PERMISSION_DENIED.
10. **Client Record with Spoofed userId**: Creating client record with mismatched `userId` -> PERMISSION_DENIED.
11. **Client Profile Hijacking**: Updating another user's profile at `/users/{otherUid}` -> PERMISSION_DENIED.
12. **Role Escalation**: Client attempting to self-promote to admin or overwrite immutable profile fields -> PERMISSION_DENIED.
