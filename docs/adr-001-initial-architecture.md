# ADR 001: Initial Architecture

## Status
Accepted

## Context
We are building the backend for our production-grade Travel Agency CMS and Lead Generation platform using Node.js, Express, and MongoDB.

## Decision
We will adopt a clean-architecture framework layout:
- Core application setup in `app.js` with unified server runtime in `server.js`.
- Strict logic segregation using Controllers (`controllers/`).
- Relational data integrity enforced via Mongoose Models (`models/`) utilizing object ID referencing.
- Express Router matrices mapping clearly to controllers (`routes/`).
- Hardened database connection configuration in `config/db.js` with fail-fast validation.

## Consequences
- High maintainability and clear separation of concerns.
- Scalability to add new features (e.g., booking system) with minimal coupling.
- Proper handling of DB connection failures avoiding silent background crashes.
