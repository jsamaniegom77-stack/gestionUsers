from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import SystemSetting
from rest_framework import serializers

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    # Only admins should change system settings
    permission_classes = [IsAdminUser]
