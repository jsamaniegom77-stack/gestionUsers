from rest_framework import serializers
from .models import Risk

class RiskSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    class Meta:
        model = Risk
        fields = "__all__"
