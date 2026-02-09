from rest_framework import serializers
from .models import ForumPost
from django.contrib.auth.models import User

class ForumPostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = ['id', 'author', 'author_username', 'author_avatar', 'content', 'created_at', 'parent', 'replies']
        read_only_fields = ['author', 'created_at']

    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            return obj.author.profile.avatar.url
        return None

    def get_replies(self, obj):
        if obj.replies.exists():
            return ForumPostSerializer(obj.replies.all(), many=True).data
        return []
