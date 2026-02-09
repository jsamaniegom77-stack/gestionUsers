from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from .models import AuditLog

SENSITIVE_PATH_PREFIXES = (
    "/api/assets/",
    "/api/risks/",
    "/api/controls/",
)

class AuditMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        try:
            path = request.path or ""
            if not any(path.startswith(p) for p in SENSITIVE_PATH_PREFIXES):
                return response

            user = getattr(request, "user", None)
            if isinstance(user, AnonymousUser) or user is None or not user.is_authenticated:
                user = None

            # Acción simplificada por método
            method = (request.method or "").upper()
            if method == "POST":
                action = "CREATE"
            elif method in ("PUT", "PATCH"):
                action = "UPDATE"
            elif method == "DELETE":
                action = "DELETE"
            else:
                action = "VIEW"

            # Entity aproximado por path
            entity = "Unknown"
            if path.startswith("/api/assets/"):
                entity = "InformationAsset"
            elif path.startswith("/api/risks/"):
                entity = "Risk"
            elif path.startswith("/api/controls/"):
                entity = "Control"

            AuditLog.objects.create(
                user=user,
                action=action,
                entity=entity,
                entity_id="",
                path=path,
                method=method,
                ip=(request.META.get("REMOTE_ADDR") or "")[:80],
                user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:300],
                success=(200 <= response.status_code < 400),
                meta={"status_code": response.status_code},
            )
        except Exception:
            # MVP: no rompas la app por auditoría
            pass

        return response
