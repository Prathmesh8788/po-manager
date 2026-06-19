from django.db import transaction
from .models import PurchaseOrder, POLineItem, Product


class POError(Exception):
    pass


def transition_po(po, new_status):
    allowed = PurchaseOrder.VALID_TRANSITIONS.get(po.status, [])
    if new_status not in allowed:
        raise POError(f"Cannot move PO from '{po.status}' to '{new_status}'.")

    if new_status == PurchaseOrder.STATUS_RECEIVED:
        _receive_po(po)
    else:
        po.status = new_status
        po.save()

    return po


@transaction.atomic
def _receive_po(po):
    locked_po = PurchaseOrder.objects.select_for_update().get(pk=po.pk)

    if locked_po.status == PurchaseOrder.STATUS_RECEIVED:
        raise POError("This PO was already received.")

    if locked_po.status != PurchaseOrder.STATUS_PLACED:
        raise POError("Only a 'placed' PO can be received.")

    for item in locked_po.line_items.select_related('product').all():
        Product.objects.filter(pk=item.product_id).update(
            stock_quantity=item.product.stock_quantity + item.quantity
        )

    locked_po.status = PurchaseOrder.STATUS_RECEIVED
    locked_po.save()
    po.status = PurchaseOrder.STATUS_RECEIVED


def add_line_item(po, product, quantity):
    if po.status != PurchaseOrder.STATUS_DRAFT:
        raise POError("You can only add items while the PO is still a draft.")
    if quantity <= 0:
        raise POError("Quantity must be more than 0.")

    return POLineItem.objects.create(
        purchase_order=po,
        product=product,
        quantity=quantity,
        unit_price=product.price,
    )