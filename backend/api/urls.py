from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, UserViewSet, GroupViewSet,
    ClientViewSet, AttendanceViewSet, ReportViewSet,
    PerformanceViewSet, ActivityLogViewSet, NotificationViewSet, LoginHelpRequestViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'performance', PerformanceViewSet)
router.register(r'activity-logs', ActivityLogViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'login-help', LoginHelpRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
