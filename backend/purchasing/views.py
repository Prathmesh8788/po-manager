from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

from .models import Supplier, Product, PurchaseOrder
from .serializers import SupplierSerializer, ProductSerializer, PurchaseOrderSerializer
from .services import POError, transition_po, add_line_item


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('supplier').all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        supplier_id = self.request.query_params.get('supplier')
        if supplier_id:
            qs = qs.filter(supplier_id=supplier_id)
        return qs

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        products = Product.objects.filter(stock_quantity__lt=F('reorder_level'))
        return Response(ProductSerializer(products, many=True).data)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.prefetch_related('line_items__product').all()
    serializer_class = PurchaseOrderSerializer

    @action(detail=True, methods=['post'], url_path='transition')
    def transition(self, request, pk=None):
        po = self.get_object()
        new_status = request.data.get('status')
        try:
            transition_po(po, new_status)
        except POError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PurchaseOrderSerializer(po).data)

    @action(detail=True, methods=['post'], url_path='line-items')
    def add_item(self, request, pk=None):
        po = self.get_object()
        product = Product.objects.get(pk=request.data.get('product_id'))
        try:
            add_line_item(po, product, int(request.data.get('quantity')))
        except POError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PurchaseOrderSerializer(po).data)