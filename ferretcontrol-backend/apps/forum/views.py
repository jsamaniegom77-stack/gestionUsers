from rest_framework import viewsets, permissions
from .models import ForumPost
from .serializers import ForumPostSerializer
from apps.accounts.models import SecurityNotification
from django.contrib.auth.models import User

class ForumPostViewSet(viewsets.ModelViewSet):
    queryset = ForumPost.objects.filter(parent__isnull=True).order_by('-created_at') # Top level posts
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        
        # Notify all users (GLOBAL FORUM)
        # Verify optimization later, for now simple loop is fine for small user base
        users = User.objects.exclude(id=self.request.user.id)
        notifications = []
        for user in users:
            notifications.append(SecurityNotification(
                user=user,
                title="Nuevo Mensaje en el Foro",
                message=f"{self.request.user.username} ha publicado un nuevo mensaje: {post.content[:50]}...",
                alert_type="FORUM_POST"
            ))
        SecurityNotification.objects.bulk_create(notifications)
