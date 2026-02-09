from django.db import models
from apps.risks.models import Risk

class Control(models.Model):
    code = models.CharField(max_length=50, unique=True)  # e.g. "A.5.1"
    name = models.CharField(max_length=200)
    domain = models.CharField(max_length=200, blank=True)  # "Organizational controls"
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class RiskControl(models.Model):
    risk = models.ForeignKey(Risk, on_delete=models.CASCADE, related_name="risk_controls")
    control = models.ForeignKey(Control, on_delete=models.CASCADE)
    applied = models.BooleanField(default=False)
    evidence = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ("risk", "control")

    def __str__(self):
        return f"{self.risk_id} -> {self.control.code}"
