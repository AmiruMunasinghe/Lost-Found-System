# Frontend Integration Documentation

This directory documents how the React frontend communicates with the backend API.

## Purpose

This documentation helps developers understand:
- frontend API wrappers
- request formatting conventions
- authentication handling
- known backend communication patterns

## Structure

- `api-integration.md` — mapping of frontend methods to backend endpoints

## Notes

- Frontend uses `frontend/src/api/client.js` as a shared REST wrapper.
- Protected backend endpoints require `Authorization: Bearer <token>`.
- The frontend stores user session info in `localStorage` under `lost_found_user`.
