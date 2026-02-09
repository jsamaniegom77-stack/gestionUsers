from django.db import models
from apps.assets.models import InformationAsset

class Risk(models.Model):
    STATUS = [
        ("open", "Open"),
        ("treating", "Treating"),
        ("closed", "Closed"),
    ]
    LEVEL = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    asset = models.ForeignKey(InformationAsset, on_delete=models.CASCADE, related_name="risks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    likelihood = models.IntegerField(default=1)  # 1-5
    impact = models.IntegerField(default=1)      # 1-5
    score = models.IntegerField(default=1)
    level = models.CharField(max_length=20, choices=LEVEL, default="low")

    status = models.CharField(max_length=20, choices=STATUS, default="open")

    created_at = models.DateTimeField(auto_now_add=True)

    def recalc(self):
        s = int(self.likelihood) * int(self.impact)
        self.score = s
        if s <= 4:
            self.level = "low"
        elif s <= 9:
            self.level = "medium"
        elif s <= 16:
            self.level = "high"
        else:
            self.level = "critical"

    def save(self, *args, **kwargs):
        self.recalc()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.level})"
