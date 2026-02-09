from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', required=False)
    avatar = serializers.ImageField(source='profile.avatar', required=False)
    bio = serializers.CharField(source='profile.bio', required=False)
    social_links = serializers.JSONField(source='profile.social_links', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'is_active', 'last_login', 'date_joined', 'display_name', 'avatar', 'bio', 'social_links']
        extra_kwargs = {
            'password': {'write_only': True},
            'last_login': {'read_only': True},
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(**validated_data)
        user.is_staff = True 
        user.save()
        if hasattr(user, 'profile'):
            for attr, value in profile_data.items():
                setattr(user.profile, attr, value)
            user.profile.save()
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        # Update User fields
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        else:
            # Create if missing (migration safety)
            from .models import UserProfile
            UserProfile.objects.create(user=instance, **profile_data)
        
        return instance

from .models import SecurityNotification

class SecurityNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityNotification
        fields = '__all__'
