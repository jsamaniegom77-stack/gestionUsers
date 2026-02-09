from django.db import models

class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True, help_text="Unique key for the setting")
    value = models.BooleanField(default=False, help_text="Toggle value")
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.key}: {self.value}"
