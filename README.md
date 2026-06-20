# Purchase Order Manager
A lightweight Purchase Ordering module: manage suppliers, products, and POs through their
lifecycle (draft → placed → received / cancelled), with automatic stock updates on receipt.
**Stack used:** Django + Django REST Framework, React, PostgreSQL, Docker.
> This was built with Django/React instead of the Next.js/Prisma/Redis stack requested in
> the original brief. See the note at the top of `PLAN.md` for why, and what would differ
> in a Redis-backed version.
## Quick Start (Docker)
```bash
cp .env.example .env
docker compose up --build
```
This brings up:
- PostgreSQL on `:5432`
- Redis on `:6379` (included per the original compose shape; not used by the Django backend)
- Django backend on `:8000`
- React frontend on `:3000`
Then seed sample data:
```bash
docker compose exec backend python manage.py shell < seed.py
```
Open **http://localhost:3000**.
## Manual Setup (without Docker)
**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Update DB_* values in .env to point at your local Postgres
python manage.py migrate
python manage.py shell < seed.py
python manage.py runserver
```
**Frontend:**
```bash
cd frontend
npm install
npm start
```
## API Overview
| Endpoint | Method | Description |
|---|---|---|
| `/api/suppliers/` | GET, POST | List / create suppliers |
| `/api/products/` | GET, POST | List / create products (filter by `?supplier=<id>`) |
| `/api/products/low-stock/` | GET | Products below reorder level |
| `/api/purchase-orders/` | GET, POST | List / create POs (created in `draft`) |
| `/api/purchase-orders/<id>/` | GET | PO detail with line items |
| `/api/purchase-orders/<id>/line-items/` | POST | Add a line item (draft only) |
| `/api/purchase-orders/<id>/line-items/<item_id>/` | DELETE | Remove a line item (draft only) |
| `/api/purchase-orders/<id>/transition/` | POST | `{"status": "placed"\|"received"\|"cancelled"}` |
## Decisions & Trade-offs
- **Money** is stored as integers in paise (minor units) throughout, both in the DB and over
 the API, to avoid floating-point rounding issues. The frontend divides by 100 only for display.
- **Price snapshotting**: a PO line item locks in the product's price at the moment it's added,
 so historical POs don't change if the supplier's catalog price changes later.
- **Stock** is a stored column on `Product`, only written to inside the receive transaction —
 one clear write path, easy to reason about.
- **Double-receive protection** uses Postgres row locking (`select_for_update`) inside an atomic
 transaction, not Redis — sufficient for a single-instance Django deployment.
- **State transitions** are centralized in `purchasing/services.py`, not in views — the API
 cannot be used to bypass the lifecycle (e.g. draft → received directly).
## What's Not Built
See "Deliberately Out of Scope" in `PLAN.md` — stock movement history, auth, partial receiving,
editing non-draft POs, and notifications were all cut to keep this focused.