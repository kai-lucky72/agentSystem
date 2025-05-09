from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ActivityLog, Notification

@receiver(post_save, sender=User)
def create_user_notification(sender, instance, created, **kwargs):
    """
    Send notification to admin when a user is created or updated
    """
    if created:
        # Notify the creator of the user
        if instance.created_by:
            Notification.objects.create(
                receiver=instance.created_by,
                message=f"New user {instance.work_id} was created successfully",
                is_system=True
            )
            
            # Log the user creation event
            ActivityLog.objects.create(
                user=instance.created_by,
                action=f"Created user {instance.work_id}",
                details=f"Email: {instance.email}, Role: {instance.role}"
            )
