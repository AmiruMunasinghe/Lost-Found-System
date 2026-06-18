# Backend API Documentation

This directory documents the existing backend endpoints for the Lost and Found Management System.

## Purpose

This documentation helps developers understand:
- available REST endpoints
- request payloads and query parameters
- response contract shapes
- authentication expectations
- how frontend integration is currently implemented

## Structure

- `endpoints.md` — complete backend endpoint reference

## Notes

- The backend is implemented as a Spring Boot application.
- The primary API base path is the service root, with a few nested namespaces under `/api`.
- JWT authentication is used for protected endpoints.
- The backend also exposes internal event and reward APIs.
