from rest_framework import viewsets, filters
from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user").all().order_by("-timestamp")
    serializer_class = AuditLogSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["action", "entity", "entity_id", "path", "user__username"]
    ordering_fields = ["timestamp", "action", "entity"]
