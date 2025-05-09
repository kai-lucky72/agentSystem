from django.apps import AppConfig
import os
import threading


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        # Import signal handlers
        import api.signals
        
        # Only initialize scheduled tasks when running the web server
        # This prevents tasks from being scheduled twice when running in development
        if os.environ.get('RUN_MAIN', None) != 'true' and not os.environ.get('SCHEDULER_DISABLED'):
            # Use a thread to initialize tasks to avoid database access during app initialization
            def init_tasks():
                # Import here to avoid circular imports
                from .scheduled_tasks import init_scheduled_tasks
                init_scheduled_tasks()
            
            # Start task initialization in a separate thread with a delay
            thread = threading.Thread(target=init_tasks)
            thread.daemon = True  # Allow the thread to be killed when the main process exits
            thread.start()
