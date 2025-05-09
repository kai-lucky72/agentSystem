from django.db import connection
from background_task.models import Task
from django.utils import timezone
import time

# Initialize the tasks
def init_scheduled_tasks():
    """
    Initialize all scheduled tasks - should be called once on app startup
    """
    # Give the database some time to fully initialize to avoid connection errors
    time.sleep(5)
    
    try:
        from .tasks import (
            send_attendance_reminders,
            send_report_reminders,
            update_performance_metrics,
            notify_pending_report_reviews
        )
        
        # Clean up existing tasks to ensure we don't get duplicates
        Task.objects.filter(task_name__contains="api.tasks").delete()
        
        # Schedule tasks to run at appropriate intervals
        # The repeat parameter specifies how often the task should be run in seconds
        
        # Hourly tasks
        send_attendance_reminders(repeat=60*60)  # Every hour
        
        # Daily tasks
        send_report_reminders(repeat=60*60*24)  # Once per day
        notify_pending_report_reviews(repeat=60*60*24)  # Once per day
        
        # Weekly tasks
        update_performance_metrics(repeat=60*60*24*7)  # Once per week
        
        print("Scheduled background tasks successfully")
    except Exception as e:
        print(f"Error initializing scheduled tasks: {e}")
        
    # Close any lingering database connections
    connection.close()