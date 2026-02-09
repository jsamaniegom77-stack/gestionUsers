from rest_framework import serializers
from .models import Control, RiskControl

class ControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = Control
        fields = "__all__"

class RiskControlSerializer(serializers.ModelSerializer):
    control_code = serializers.CharField(source="control.code", read_only=True)
    control_name = serializers.CharField(source="control.name", read_only=True)

    class Meta:
        model = RiskControl
        fields = "__all__"
