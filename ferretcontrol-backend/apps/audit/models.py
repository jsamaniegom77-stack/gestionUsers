from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)     # "CREATE", "UPDATE", "DELETE", "LOGIN", "VIEW"
    entity = models.CharField(max_length=100)     # "InformationAsset", "Risk", etc.
    entity_id = models.CharField(max_length=50, blank=True)

    path = models.CharField(max_length=300, blank=True)
    method = models.CharField(max_length=10, blank=True)
    ip = models.CharField(max_length=80, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    success = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    meta = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.timestamp} {self.action} {self.entity}:{self.entity_id}"
