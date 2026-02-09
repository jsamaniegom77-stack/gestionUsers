from .models import Control

DEFAULT_CONTROLS = [
    {"code": "A.5.1", "name": "Policies for information security", "domain": "Organizational", "description": "Define and approve security policies."},
    {"code": "A.5.15", "name": "Access control", "domain": "Organizational", "description": "Rules and rights for access control."},
    {"code": "A.5.23", "name": "Information security for use of cloud services", "domain": "Organizational", "description": "Security requirements for cloud usage."},
    {"code": "A.6.3", "name": "Information security awareness", "domain": "People", "description": "Training and awareness program."},
    {"code": "A.8.9", "name": "Configuration management", "domain": "Technological", "description": "Manage configurations securely."},
    {"code": "A.8.12", "name": "Data leakage prevention", "domain": "Technological", "description": "Prevent unauthorized disclosure."},
    {"code": "A.8.15", "name": "Logging", "domain": "Technological", "description": "Generate and protect logs."},
    {"code": "A.8.16", "name": "Monitoring activities", "domain": "Technological", "description": "Monitor systems for anomalies."},
    {"code": "A.8.24", "name": "Use of cryptography", "domain": "Technological", "description": "Use encryption where appropriate."},
    {"code": "A.5.30", "name": "ICT readiness for business continuity", "domain": "Organizational", "description": "Prepare ICT for continuity."},
]

def seed_controls():
    created = 0
    for c in DEFAULT_CONTROLS:
        obj, was_created = Control.objects.get_or_create(code=c["code"], defaults=c)
        if was_created:
            created += 1
    return created
