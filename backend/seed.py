import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from purchasing.models import Supplier, Product

s1 = Supplier.objects.create(name="Tech Parts Ltd")
s2 = Supplier.objects.create(name="Office Supplies Co")

Product.objects.create(name="USB Cable", supplier=s1, price=50000, stock_quantity=5, reorder_level=10)
Product.objects.create(name="HDMI Cable", supplier=s1, price=120000, stock_quantity=20, reorder_level=8)
Product.objects.create(name="A4 Paper Ream", supplier=s2, price=35000, stock_quantity=3, reorder_level=15)

print("Seed data created!")