# Frontend API Integration

## API Base URL

The frontend uses the environment variable `VITE_API_BASE_URL` to determine the backend base URL.
If not set, the default is:

- `http://localhost:8085`

The wrapper in `frontend/src/api/client.js` builds requests as:

```js
fetch(`${API_BASE_URL}${path}`, options)
```

## Authorization

The `apiRequest` wrapper automatically adds `Authorization: Bearer <token>` when a saved user session contains a token.
The token is read from `localStorage` via `getSavedUser()`.

## Content-Type rules

- If the request body is not `FormData`, `apiRequest` sets `Content-Type: application/json`.
- If the request body is `FormData`, it does not set `Content-Type` and allows the browser to generate the multipart boundary.

## Error handling

- Non-OK responses throw an `Error` with either a JSON `message`, a JSON `error`, or raw response text.
- On `401 Unauthorized`, the wrapper clears the stored session and redirects to `/login` unless the request path includes `/auth/login`.

## Existing frontend API modules

### `frontend/src/api/auth.js`

Functions:
- `registerUser` → POST `/auth/register`
- `loginUser` → POST `/auth/login`
- `logoutUser` → clears session locally
- `getCurrentUserFromStorage` → reads user from local storage
- `updateProfile` → PUT `/users/me`
- `uploadProfilePhoto` → POST `/users/me/photo` with `FormData`
- `requestPasswordReset` → POST `/auth/forgot-password`
- `confirmPasswordReset` → POST `/auth/reset-password`
- `changePassword` → POST `/auth/change-password`

### `frontend/src/api/items.js`

Functions:
- `getAllItems` → GET `/items`
- `getItemById(id)` → GET `/items/${id}`
- `searchItems(searchTerm)` → GET `/items/search?q=${encodedTerm}`
- `getItemsByType(type)` → GET `/items/filter?type=${reportType}`
- `getItemsByTypeAndStatus(type, status)` → GET `/items/filter?type=${reportType}&status=${status}`
- `createItem(itemData, forcedType)` → POST `/items` with `ItemRequestDTO` payload
- `deleteItem(id)` → DELETE `/items/${id}`

#### Data normalization

The module converts frontend payloads into backend-compatible payloads by:
- normalizing `reportType` to `LOST` or `FOUND`
- combining `description`, `color`, and `time` into a single `description` string
- ensuring `imageUrls` is an array

### `frontend/src/api/matches.js`

This module does not use the same `API_BASE_URL` wrapper.
Instead it uses a hard-coded base URL:

- `http://localhost:8080/matches`

Functions:
- `getMyMatches(token)` → GET `/my`
- `runMatchingForFilteredLostItems(lostItemIds, token)` → POST `/run-filtered`

> Note: This hard-coded host and base path is an existing implementation detail. Developers should verify whether this is intentional or should be aligned with `VITE_API_BASE_URL`.

## Frontend-supported endpoints

### Authentication and user profile
- `POST /auth/register`
- `POST /auth/login`
- `PUT /users/me`
- `POST /users/me/photo`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/change-password`

### Item service
- `GET /items`
- `GET /items/:id`
- `GET /items/search?q=`
- `GET /items/filter?type=&status=`
- `POST /items`
- `DELETE /items/:id`

### Support
- `POST /support`

### Matches
- `GET /matches/my`
- `POST /matches/run-filtered`

## Important developer notes

- The frontend stores the active session as a JSON object with keys including `id`, `username`, `email`, and `accessToken`.
- `saveUserSession` accepts either `response.accessToken` or `response.token` as the token source.
- When calling `/users/me/photo`, the request must send `FormData` because the backend expects `multipart/form-data`.
- The frontend currently does not expose timing or pagination controls for item pagination even though `/items/paginated` exists on the backend.
