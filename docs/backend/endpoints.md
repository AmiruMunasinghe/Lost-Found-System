# Backend Endpoint Reference

## Authentication

### POST /auth/register
- Description: Register a new user.
- Request body (JSON):
  - `username` string, required
  - `password` string, required
  - `email` string, optional, valid email format
- Response: `AuthResponse`
  - `accessToken` string
  - `tokenType` string (`Bearer`)
  - `user` object with `id`, `username`, `email`, `createdAt`
- Status: `201 Created`

### POST /auth/login
- Description: Authenticate a user.
- Request body (JSON):
  - `username` string, required
  - `password` string, required
- Response: `AuthResponse`
- Status: `200 OK`

### GET /auth/me
- Description: Get currently authenticated user's profile.
- Authorization: Bearer token required
- Response: `UserResponse`
- Status: `200 OK`

### POST /auth/forgot-password
- Description: Request password reset token generation.
- Request body (JSON):
  - `email` string, required
- Response: JSON with `message` and `token`
- Status: `200 OK`

### POST /auth/reset-password
- Description: Reset password using token.
- Request body (JSON):
  - `token` string, required
  - `newPassword` string, required
- Response: JSON with `message`
- Status: `200 OK`

### POST /auth/change-password
- Description: Change authenticated user's password.
- Authorization: Bearer token required
- Request body (JSON):
  - `currentPassword` string, required
  - `newPassword` string, required
- Response: JSON with `message`
- Status: `200 OK`

## User Profile

### PUT /users/me
- Description: Update current user's profile fields.
- Authorization: Bearer token required
- Request body (JSON):
  - `fullName` string, optional
  - `phone` string, optional
  - `studentId` string, optional
  - `faculty` string, optional
  - `department` string, optional
  - `yearOfStudy` string, optional
- Response: `UserResponse`
- Status: `200 OK`

### POST /users/me/photo
- Description: Upload profile photo for current user.
- Authorization: Bearer token required
- Request body: `multipart/form-data`
  - `file` file, required
- Response: `UserResponse`
- Status: `200 OK`

## Support

### POST /support
- Description: Submit a support request.
- Authorization: Bearer token required
- Request body (JSON):
  - `subject` string, required
  - `message` string, required
- Response: JSON with `message`
- Status: `200 OK`

## Item Management

### POST /items
- Description: Create a lost or found item report.
- Authorization: Bearer token required
- Request body (JSON): `ItemRequestDTO`
  - `title` string
  - `description` string
  - `category` string
  - `location` string
  - `reportType` string (`LOST` or `FOUND`)
  - `imageUrls` array of strings
- Response: `ItemResponseDTO`
- Status: `201 Created`

### GET /items/{itemId}
- Description: Retrieve a single item by ID.
- Response: `ItemResponseDTO`
- Status: `200 OK`

### GET /items
- Description: Retrieve all items.
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/type/{reportType}
- Description: Retrieve items filtered by report type.
- Path parameter:
  - `reportType` string: `LOST` or `FOUND`
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/status/{status}
- Description: Retrieve items filtered by status.
- Path parameter:
  - `status` string: any `ItemStatus` value
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/user/{userId}
- Description: Retrieve items created by a specific user.
- Path parameter:
  - `userId` number
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/filter
- Description: Retrieve items filtered by report type and status.
- Query parameters:
  - `type` string: `LOST` or `FOUND`
  - `status` string: any `ItemStatus`
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/search
- Description: Search items by title or description.
- Query parameters:
  - `q` string, required
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/category
- Description: Retrieve items by category and report type.
- Query parameters:
  - `category` string, required
  - `type` string: `LOST` or `FOUND`, required
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### GET /items/location
- Description: Retrieve items by location and status.
- Query parameters:
  - `location` string, required
  - `status` string: any `ItemStatus`, required
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

### PUT /items/{itemId}/status
- Description: Update item status.
- Path parameter:
  - `itemId` number
- Query parameter:
  - `status` string: any `ItemStatus`
- Response: `ItemResponseDTO`
- Status: `200 OK`

### POST /items/{itemId}/images
- Description: Add an image URL to an item.
- Path parameter:
  - `itemId` number
- Request body (JSON):
  - `imageUrl` string, required
- Response: `ItemResponseDTO`
- Status: `201 Created`

### DELETE /items/{itemId}
- Description: Delete a specific item.
- Path parameter:
  - `itemId` number
- Response: no content
- Status: `204 No Content`

### GET /items/paginated
- Description: Retrieve items with pagination.
- Query parameters:
  - `page` number, default `0`
  - `size` number, default `10`, max `50`
- Response: array of `ItemResponseDTO`
- Status: `200 OK`

## Match Management

### POST /matches/run
- Description: Run matching for a single lost item.
- Query parameter:
  - `lostItemId` number, required
- Response: array of `MatchResponseDTO`
- Status: `200 OK`

### POST /matches/run-filtered
- Description: Run matching for selected lost items.
- Request body (JSON):
  - `lostItemIds` array of numbers
- Response: array of `MatchResponseDTO`
- Status: `200 OK`

### GET /matches/my
- Description: Retrieve matches visible to the authenticated user.
- Authorization: Bearer token required
- Response: array of `MatchResponseDTO`
- Status: `200 OK`

### GET /matches/review-queue
- Description: Retrieve pending review matches.
- Response: array of `MatchResponseDTO`
- Status: `200 OK`

### POST /matches/review-queue/{matchId}/approve
- Description: Approve a pending review match.
- Path parameter:
  - `matchId` number
- Response: `MatchResponseDTO`
- Status: `200 OK`

### POST /matches/review-queue/{matchId}/reject
- Description: Reject a pending review match.
- Path parameter:
  - `matchId` number
- Response: `MatchResponseDTO`
- Status: `200 OK`

### GET /matches
- Description: Query matches using optional filters.
- Query parameters:
  - `status` string: any `MatchStatus`
  - `lostItemId` number
  - `foundItemId` number
  - `itemId` number
- Response: array of `MatchResponseDTO`
- Status: `200 OK`

### GET /matches/{matchId}
- Description: Retrieve match details.
- Path parameter:
  - `matchId` number
- Response: `MatchResponseDTO`
- Status: `200 OK`

### POST /matches/{matchId}/confirm
- Description: Confirm a match and mark the items as matched.
- Path parameter:
  - `matchId` number
- Response: `MatchResponseDTO`
- Status: `200 OK`

### POST /matches/{matchId}/reject
- Description: Reject a match.
- Path parameter:
  - `matchId` number
- Response: `MatchResponseDTO`
- Status: `200 OK`

## Notification API

### POST /api/notifications
- Description: Send a new notification.
- Request body (JSON):
  - `userId` number, required
  - `type` string, required (`ITEM_MATCH`, `ITEM_CLAIMED`, `ITEM_RETURNED`, `REWARD_EARNED`, `REWARD_REDEEMED`, `GENERAL`)
  - `title` string, required
  - `message` string, required
  - `channel` string, required (`IN_APP`, `EMAIL`, `BOTH`)
  - `referenceItemId` number, optional
  - `recipientEmail` string, optional when `channel` is `EMAIL` or `BOTH`
- Response: `NotificationResponse`
- Status: `201 Created`

### GET /api/notifications/users/{userId}
- Description: Get all notifications for a user.
- Path parameter:
  - `userId` number
- Response: array of `NotificationResponse`
- Status: `200 OK`

### GET /api/notifications/users/{userId}/unread
- Description: Get unread notifications for a user.
- Path parameter:
  - `userId` number
- Response: array of `NotificationResponse`
- Status: `200 OK`

### GET /api/notifications/users/{userId}/unread-count
- Description: Get unread notification count.
- Path parameter:
  - `userId` number
- Response: JSON object with `unreadCount`
- Status: `200 OK`

### PATCH /api/notifications/{notificationId}/read
- Description: Mark a notification as read.
- Path parameter:
  - `notificationId` number
- Query parameter:
  - `userId` number, required
- Response: `NotificationResponse`
- Status: `200 OK`

### PATCH /api/notifications/users/{userId}/read-all
- Description: Mark all notifications for a user as read.
- Path parameter:
  - `userId` number
- Response: no content
- Status: `204 No Content`

## Reward API

### POST /api/rewards/transactions
- Description: Record a reward credit or debit transaction.
- Request body (JSON):
  - `userId` number, required
  - `points` integer, required, minimum `1`
  - `transactionType` string, required (`CREDIT` or `DEBIT`)
  - `description` string, required
  - `referenceId` number, optional
- Response: `RewardLedgerEntryResponse`
- Status: `201 Created`

### GET /api/rewards/users/{userId}
- Description: Get reward balance and history for a user.
- Path parameter:
  - `userId` number
- Response: `RewardBalanceResponse`
- Status: `200 OK`

### GET /api/rewards/users/{userId}/balance
- Description: Get current reward balance for a user.
- Path parameter:
  - `userId` number
- Response: JSON object with `balance`
- Status: `200 OK`

## Event API

### POST /api/events/item-matched
- Description: Emit an internal item matched event.
- Request body (JSON):
  - `lostItemOwnerId` number, required
  - `lostItemOwnerEmail` string, required
  - `lostItemName` string, required
  - `foundItemOwnerId` number, required
  - `foundItemOwnerEmail` string, required
  - `foundItemName` string, required
  - `foundItemId` number, required
  - `foundItemDescription` string, required
  - `foundLocation` string, required
- Response: no content
- Status: `202 Accepted`

### POST /api/events/found-item-submitted
- Description: Emit an internal event when a found item is submitted.
- Request body (JSON):
  - `finderId` number, required
  - `finderEmail` string, required
  - `foundItemId` number, required
  - `itemName` string, required
- Response: no content
- Status: `202 Accepted`

### POST /api/events/item-claimed
- Description: Emit an internal event when an item is claimed.
- Request body (JSON):
  - `ownerId` number, required
  - `ownerEmail` string, required
  - `finderId` number, optional
  - `finderEmail` string, optional
  - `itemId` number, required
  - `itemName` string, required
- Response: no content
- Status: `202 Accepted`

## Internal Matching Engine API

### Note
The repository also contains a separate matching-engine module exposing an internal service at `/api/v1/matches`.
This appears to be a separate microservice endpoint and is not currently wired through the main frontend API wrapper.

### Key internal endpoints
- POST `/api/v1/matches/trigger/lost/{lostItemId}`
- POST `/api/v1/matches/trigger/found/{foundItemId}`
- POST `/api/v1/matches/recalculate`
- GET `/api/v1/matches/lost/{lostItemId}`
- GET `/api/v1/matches/found/{foundItemId}`
- GET `/api/v1/matches/{matchId}`
- POST `/api/v1/matches/{matchId}/confirm`
- POST `/api/v1/matches/{matchId}/reject`
- GET `/api/v1/matches/queue`
- POST `/api/v1/matches/queue/{matchId}/resolve`

### Authorization
- Most `/api/v1/matches` endpoints require role-based access, including `INTERNAL`, `USER`, or `ADMIN`.
