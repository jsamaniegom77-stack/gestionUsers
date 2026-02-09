from rest_framework import viewsets, filters
from .models import Control, RiskControl
from .serializers import ControlSerializer, RiskControlSerializer

class ControlViewSet(viewsets.ModelViewSet):
    queryset = Control.objects.all().order_by("code")
    serializer_class = ControlSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "name", "domain", "description"]

class RiskControlViewSet(viewsets.ModelViewSet):
    queryset = RiskControl.objects.select_related("risk", "control").all()
    serializer_class = RiskControlSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["risk__title", "control__code", "control__name"]
