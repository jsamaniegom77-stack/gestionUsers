from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import UserSessionStatus, SecurityNotification
from django.utils import timezone

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user_id = None
            # SimpleJWT doesn't easily expose user in response, so we get it from request using the serializer context or username
            # But the serializer was already validated. Let's try to get user from request data
            username = request.data.get('username')
            if username:
                from django.contrib.auth.models import User
                try:
                    user = User.objects.get(username=username)
                    ip = self.get_client_ip(request)
                    
                    # Check for existing session
                    session_status, created = UserSessionStatus.objects.get_or_create(user=user)
                    
                    if session_status.is_logged_in:
                        # Concurrent login attempt detected!
                        SecurityNotification.objects.create(
                            user=user,
                            title="Intento de Inicio de Sesión Concurrente",
                            message=f"Se ha detectado un inicio de sesión desde IP: {ip} mientras existía una sesión activa (Última IP: {session_status.last_ip}).",
                            alert_type="CONCURRENT_LOGIN",
                            ip_address=ip
                        )
                    
                    # Update session status
                    session_status.is_logged_in = True
                    session_status.last_ip = ip
                    session_status.save()

                    # Log success notification (optional, maybe too noisy, let's keep it for now as requested)
                    SecurityNotification.objects.create(
                        user=user,
                        title="Inicio de Sesión Exitoso",
                        message=f"Se ha iniciado sesión existosamente desde IP: {ip}",
                        alert_type="LOGIN_SUCCESS",
                        ip_address=ip
                    )

                except User.DoesNotExist:
                    pass
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            session_status, created = UserSessionStatus.objects.get_or_create(user=user)
            session_status.is_logged_in = False
            session_status.save()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
