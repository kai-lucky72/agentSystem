from .tasks import (
    send_attendance_reminders,
    send_report_reminders,
    update_performance_metrics,
    notify_pending_report_reviews
)

# Initialize the tasks
def init_scheduled_tasks():
    """
    Initialize all scheduled tasks - should be called once on app startup
    """
    # Hourly tasks
    send_attendance_reminders(repeat=60*60)  # Every hour
    
    # Daily tasks
    send_report_reminders(repeat=60*60*24)  # Once per day
    notify_pending_report_reviews(repeat=60*60*24)  # Once per day
    
    # Weekly tasks
    update_performance_metrics(repeat=60*60*24*7)  # Once per week