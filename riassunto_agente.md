# Riassunto agente — Pointer

Questo file è stato spezzato. La memoria operativa del progetto vive in:

- **`MEMORY.md`** (auto-memory, `~/.claude/projects/.../memory/`) — stato corrente: stack, schema tabelle, key paths, pages, route, workflow.
- **`riassunto/`** (cartella in repo) — pattern operativi non-ovvi e rischi:
  - [`riassunto/INDEX.md`](riassunto/INDEX.md) — indice
  - [`riassunto/stripe-pagamenti.md`](riassunto/stripe-pagamenti.md)
  - [`riassunto/ticket-qr.md`](riassunto/ticket-qr.md)
  - [`riassunto/schema-db.md`](riassunto/schema-db.md)
  - [`riassunto/entrypoint-task.md`](riassunto/entrypoint-task.md)
  - [`riassunto/rischi.md`](riassunto/rischi.md)

Per la cronologia delle modifiche → `git log`.

## Regola per agenti

All'inizio di un task: leggi `MEMORY.md` (auto-caricata) + apri il file `riassunto/*.md` rilevante al task. **Non rileggere tutto il blocco** — apri solo quello che serve.

Aggiornamenti vanno fatti **nel file specifico** in `riassunto/`, non qui.
