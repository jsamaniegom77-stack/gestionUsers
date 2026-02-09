from rest_framework import viewsets, filters
from .models import Risk
from .serializers import RiskSerializer

class RiskViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'head', 'put', 'patch']
    queryset = Risk.objects.select_related("asset").all().order_by("-created_at")
    serializer_class = RiskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "asset__name"]
    ordering_fields = ["created_at", "score", "level", "status"]
