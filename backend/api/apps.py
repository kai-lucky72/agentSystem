from django.apps import AppConfig
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        # Import signal handlers
        import api.signals
        
        # Only initialize scheduled tasks when running the web server
        # This prevents tasks from being scheduled twice when running in development
        if os.environ.get('RUN_MAIN', None) != 'true' and not os.environ.get('SCHEDULER_DISABLED'):
            from .scheduled_tasks import init_scheduled_tasks
            init_scheduled_tasks()
