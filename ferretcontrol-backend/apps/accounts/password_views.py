from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.utils import timezone
from .models import PasswordResetCode
import random
import datetime

from django.core.mail import send_mail

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Si el correo existe, se ha enviado un código."}, status=status.HTTP_200_OK)

        # Generate code
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + datetime.timedelta(minutes=15)

        PasswordResetCode.objects.create(user=user, code=code, expires_at=expires_at)

        # Send Email
        try:
            send_mail(
                subject='Código de Recuperación - FerretControl',
                message=f'Tu código de verificación es: {code}\n\nEste código expira en 15 minutos.',
                from_email=None, # Uses DEFAULT_FROM_EMAIL
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")
            return Response({"error": "Error enviando el correo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Código enviado a tu correo."}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not email or not code or not new_password:
            return Response({"error": "Todos los campos son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            reset_code = PasswordResetCode.objects.filter(
                user=user, 
                code=code, 
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except (User.DoesNotExist, PasswordResetCode.DoesNotExist):
            return Response({"error": "Código inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Clean up used codes
        PasswordResetCode.objects.filter(user=user).delete()

        return Response({"message": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)
