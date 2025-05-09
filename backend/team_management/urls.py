"""
URL configuration for team_management project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import TemplateView

def healthcheck(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('health/', healthcheck, name='healthcheck'),
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
]
