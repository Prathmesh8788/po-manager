from rest_framework import serializers
from .models import Supplier, Product, PurchaseOrder, POLineItem


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_below_reorder = serializers.BooleanField(read_only=True)
    price_display = serializers.FloatField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'supplier', 'supplier_name', 'price',
                  'price_display', 'stock_quantity', 'reorder_level', 'is_below_reorder']


class POLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    line_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = POLineItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'line_total']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    line_items = POLineItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    total = serializers.IntegerField(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'status', 'notes',
                  'created_at', 'line_items', 'total']