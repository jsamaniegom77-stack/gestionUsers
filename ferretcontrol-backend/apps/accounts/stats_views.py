from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from apps.risks.models import Risk

class AccessControlStatsView(APIView):
    def get(self, request):
        total_users = User.objects.count()
        
        # Active users: Logged in within last 24 hours
        time_threshold = timezone.now() - timedelta(hours=24)
        active_users = User.objects.filter(last_login__gte=time_threshold).count()
        
        # Inactive users: Never logged in
        inactive_users = User.objects.filter(last_login__isnull=True).count()
        
        # Security alerts: High/Critical risks that are Open
        security_alerts = Risk.objects.filter(
            level__in=['High', 'Critical'], 
            status='open'
        ).count()
        
        return Response({
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "security_alerts": security_alerts
        })
