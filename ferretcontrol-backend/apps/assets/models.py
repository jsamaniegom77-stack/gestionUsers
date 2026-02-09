from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class InformationAsset(models.Model):
    ASSET_TYPES = [
        ("dataset", "Dataset"),
        ("database", "Database"),
        ("api", "API"),
        ("file", "File"),
    ]
    CLASSIFICATIONS = [
        ("public", "Public"),
        ("internal", "Internal"),
        ("confidential", "Confidential"),
        ("restricted", "Restricted"),
    ]
    CRITICALITY = [
        (1, "1 - Low"),
        (2, "2 - Medium"),
        (3, "3 - High"),
        (4, "4 - Very High"),
        (5, "5 - Critical"),
    ]

    name = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES)
    source = models.CharField(max_length=200, blank=True)  # "Postgres ventas", "API proveedores"
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    classification = models.CharField(max_length=20, choices=CLASSIFICATIONS, default="internal")
    criticality = models.IntegerField(choices=CRITICALITY, default=2)
    tags = models.CharField(max_length=300, blank=True)  # MVP: CSV tags "pii,ventas,precios"
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def criticality_display(self):
        return dict(self.CRITICALITY).get(self.criticality, "Unknown")
