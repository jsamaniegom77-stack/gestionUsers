from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SecurityNotification
from .serializers import SecurityNotificationSerializer

class SecurityNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SecurityNotificationSerializer

    def get_queryset(self):
        # Admin sees all? Or user sees only theirs? 
        # Requirement: "administrador general el primer usuario"
        # Assuming for now user sees their own notifications, enforcing privacy. 
        # Or if admin, sees high priority alerts? 
        # Let's start with: Users see their own notifications.
        return SecurityNotification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"count": count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"status": "marked as read"})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "marked as read"})
