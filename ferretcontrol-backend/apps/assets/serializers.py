from rest_framework import serializers
from .models import InformationAsset

class InformationAssetSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = InformationAsset
        fields = "__all__"
