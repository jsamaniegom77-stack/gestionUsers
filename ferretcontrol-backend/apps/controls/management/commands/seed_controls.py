from django.core.management.base import BaseCommand
from apps.controls.seeds import seed_controls

class Command(BaseCommand):
    help = "Seed demo ISO controls"

    def handle(self, *args, **options):
        n = seed_controls()
        self.stdout.write(self.style.SUCCESS(f"Seeded controls: {n} created"))
