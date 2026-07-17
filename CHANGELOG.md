# Changelog

All notable changes to this project are documented in this file.

## [0.1.1] - 2026-07-16
### Added
- Migration `add_email_sent_column.sql` to add `email_sent` boolean column to `tickets` table.
- Script `set_email_sent.mjs` to set `email_sent` to true for existing tickets.
- Updated `node_update_missing_tickets.mjs` with dummy select and 500 ms delay to avoid schema cache issues.
- Documentation in this changelog.

### Fixed
- Payment status and booking status inconsistencies for user `roopchandu96@gmail.com`.
- Missing tickets for certain bookings (generated tickets TKT‑1996 to TKT‑1999).
- `email_sent` flag was not being set due to Supabase client cache; now correctly updated.
