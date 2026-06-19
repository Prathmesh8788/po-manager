from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, ProductViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register('suppliers', SupplierViewSet)
router.register('products', ProductViewSet)
router.register('purchase-orders', PurchaseOrderViewSet)

urlpatterns = [path('', include(router.urls))]