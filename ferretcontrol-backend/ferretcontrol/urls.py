"""
URL configuration for ferretcontrol project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.assets.views import InformationAssetViewSet
from apps.risks.views import RiskViewSet
from apps.controls.views import ControlViewSet, RiskControlViewSet
from apps.audit.views import AuditLogViewSet
from apps.accounts.views import UserViewSet
from apps.accounts.stats_views import AccessControlStatsView
from apps.accounts.auth_views import CustomTokenObtainPairView, LogoutView
from apps.accounts.notification_views import SecurityNotificationViewSet
from apps.accounts.password_views import RequestPasswordResetView, ResetPasswordView
from apps.core.views import SystemSettingViewSet
from apps.forum.views import ForumPostViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"settings", SystemSettingViewSet, basename="settings")
router.register(r"forum", ForumPostViewSet, basename="forum")
router.register(r"notifications", SecurityNotificationViewSet, basename="notifications")
router.register(r"assets", InformationAssetViewSet, basename="assets")
router.register(r"risks", RiskViewSet, basename="risks")
router.register(r"controls", ControlViewSet, basename="controls")
router.register(r"risk-controls", RiskControlViewSet, basename="risk-controls")
router.register(r"audit", AuditLogViewSet, basename="audit")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth JWT
    path("api/auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/auth/password_reset/request/", RequestPasswordResetView.as_view(), name="password_reset_request"),
    path("api/auth/password_reset/confirm/", ResetPasswordView.as_view(), name="password_reset_confirm"),

    path("api/", include(router.urls)),
    path("api/access-control/stats/", AccessControlStatsView.as_view(), name="access_control_stats"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
