from django.db import models
from django.contrib.auth.models import User

class UserSessionStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='session_status')
    is_logged_in = models.BooleanField(default=False)
    last_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_logged_in else 'Offline'}"

class SecurityNotification(models.Model):
    ALERT_TYPES = [
        ('LOGIN_SUCCESS', 'Login Success'),
        ('CONCURRENT_LOGIN', 'Concurrent Login Attempt'),
        ('FORUM_POST', 'Nuevo Mensaje en Foro'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    is_read = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.user.username

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} - {self.code}"

