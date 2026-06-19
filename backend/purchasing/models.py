from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    price = models.IntegerField()              
    stock_quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)

    def __str__(self):
        return self.name

    @property
    def is_below_reorder(self):
        return self.stock_quantity < self.reorder_level

    @property
    def price_display(self):
        return self.price / 100


class PurchaseOrder(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PLACED = 'placed'
    STATUS_RECEIVED = 'received'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PLACED, 'Placed'),
        (STATUS_RECEIVED, 'Received'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    VALID_TRANSITIONS = {
        STATUS_DRAFT: [STATUS_PLACED, STATUS_CANCELLED],
        STATUS_PLACED: [STATUS_RECEIVED, STATUS_CANCELLED],
        STATUS_RECEIVED: [],
        STATUS_CANCELLED: [],
    }

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PO-{self.id} ({self.status})"

    @property
    def total(self):
        return sum(item.line_total for item in self.line_items.all())


class POLineItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='line_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.IntegerField()   # snapshot

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    @property
    def line_total(self):
        return self.quantity * self.unit_price