# PLAN.md — Purchase Ordering Module
> ■■ Note: this project was built with **Django + DRF + React + PostgreSQL**, not the
> Next.js/Prisma/Redis stack listed in the brief. See README for reasoning. The business
> logic, data model, and decision points below follow the brief's intent regardless of stack.
## Data Model
```
Supplier
■■■ id, name, email, phone
Product
■■■ id, name, supplier (FK), price (int, paise), stock_quantity, reorder_level
PurchaseOrder
■■■ id, supplier (FK), status (draft/placed/received/cancelled), notes, created_at, updated_at
POLineItem
■■■ id, purchase_order (FK), product (FK), quantity, unit_price (int, paise — SNAPSHOT)
```
Each Product belongs to exactly one Supplier (a supplier "sells" a fixed set of products at
fixed prices — simplest model that satisfies the brief). A PurchaseOrder belongs to one
Supplier and has many POLineItems.
## Decision Points
**1. Line-item price: live or snapshot?**
Snapshot. `unit_price` is copied onto the `POLineItem` the moment it's added to a draft PO.
This means historical POs always show what was actually agreed/paid, even if the supplier's
catalog price changes later. The trade-off: if you want to "re-price" a draft PO, you'd need
to delete and re-add the line item (acceptable for this scope).
**2. Stock: stored column or derived?**
Stored column (`Product.stock_quantity`), updated only when a PO transitions to `received`.
Simpler to query ("show me current stock" is just a SELECT, no aggregation), and the only
place stock changes is the receiving step, so there's one clear write path to reason about.
The trade-off: no built-in audit trail of stock movements (out of scope — see below).
**3. Receiving: prevent double-receive / concurrency?**
The `_receive_po` service function is wrapped in `@transaction.atomic` and uses
`select_for_update()` to lock the PO row before checking/changing its status. Two concurrent
requests to receive the same PO will serialize on that lock — the second one will see
`status == 'received'` already and raise an error instead of double-incrementing stock.
**4. State machine enforcement**
`PurchaseOrder.VALID_TRANSITIONS` is a dict of allowed status → status moves. All transitions
go through `services.transition_po()`, which checks this dict before doing anything. The
route/view layer never sets `po.status` directly — it always calls the service function, so
the API can't be used to "jump" a PO from draft straight to received, or revive a
cancelled PO.
**5. Where would Redis have helped? (not implemented — see below)**
In the original stack, Redis would be used as a distributed lock for the receive step
(`SETNX po:lock:<id>`) so that two backend instances behind a load balancer can't both pass
the lock check at once. Since this build uses a single Django process + Postgres
`select_for_update()`, the database lock alone is sufficient for correctness at this scale,
so Redis was not added. **Redis is not part of this Django implementation.**
## Deliberately Out of Scope
- Stock movement history / audit log (only current stock is tracked, not a ledger)
- Authentication / multi-user roles
- Partial receiving (a PO is received all-at-once, not item-by-item)
- Editing a placed/received PO's line items
- Email notifications to suppliers
## Time Allocation (original 3-day framing, adapted)
- Day 1: Models, migrations, service layer (state machine, receive logic), seed data
- Day 2: DRF serializers/views, line-item endpoints, manual API testing
- Day 3: React frontend (Suppliers, Products, PO detail, Stock dashboard), README