from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
import uuid
import json

# ROLE CHOICES
ROLE_ADMIN = 'admin'
ROLE_MANAGER = 'manager'
ROLE_SALES_STAFF = 'sales_staff'
ROLE_TEAM_LEADER = 'team_leader'
ROLE_INDIVIDUAL_AGENT = 'individual_agent'
ROLE_SALES_AGENT = 'sales_agent'

ROLE_CHOICES = [
    (ROLE_ADMIN, 'Admin'),
    (ROLE_MANAGER, 'Manager'),
    (ROLE_SALES_STAFF, 'Sales Staff'),
    (ROLE_TEAM_LEADER, 'Team Leader'),
    (ROLE_INDIVIDUAL_AGENT, 'Individual Agent'),
    (ROLE_SALES_AGENT, 'Sales Agent'),
]

# REPORT PERIOD CHOICES
PERIOD_WEEKLY = 'weekly'
PERIOD_MONTHLY = 'monthly'
PERIOD_QUARTERLY = 'quarterly'

PERIOD_CHOICES = [
    (PERIOD_WEEKLY, 'Weekly'),
    (PERIOD_MONTHLY, 'Monthly'),
    (PERIOD_QUARTERLY, 'Quarterly'),
]

# REPORT STATUS CHOICES
STATUS_PENDING = 'pending'
STATUS_APPROVED = 'approved'
STATUS_REJECTED = 'rejected'

REPORT_STATUS_CHOICES = [
    (STATUS_PENDING, 'Pending'),
    (STATUS_APPROVED, 'Approved'),
    (STATUS_REJECTED, 'Rejected'),
]

# ATTENDANCE STATUS CHOICES
ATTENDANCE_PRESENT = 'present'
ATTENDANCE_LATE = 'late'
ATTENDANCE_EXCUSED = 'excused'
ATTENDANCE_ABSENT = 'absent'

ATTENDANCE_STATUS_CHOICES = [
    (ATTENDANCE_PRESENT, 'Present'),
    (ATTENDANCE_LATE, 'Late'),
    (ATTENDANCE_EXCUSED, 'Excused'),
    (ATTENDANCE_ABSENT, 'Absent'),
]


class CustomUserManager(BaseUserManager):
    def create_user(self, email, work_id, role, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not work_id:
            raise ValueError('The Work ID field must be set')
        if not role:
            raise ValueError('The Role field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, work_id=work_id, role=role, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, work_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, work_id, ROLE_ADMIN, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    work_id = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='created_users')
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['work_id']
    
    def __str__(self):
        return f"{self.work_id} - {self.email} ({self.role})"


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    team_leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='led_groups')
    sales_staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'group')
    
    def __str__(self):
        return f"{self.user.work_id} in {self.group.name}"


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=100, blank=True)
    details = models.TextField(blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='added_clients')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class AttendanceTimeFrame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timeframes')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.date} - {self.start_time} to {self.end_time}"


class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default=ATTENDANCE_PRESENT)
    sector = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    excused_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='excused_attendances')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.work_id} - {self.date} - {self.status}"


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_reports')
    submitted_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reports')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    content = models.TextField()
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=REPORT_STATUS_CHOICES, default=STATUS_PENDING)
    period_start_date = models.DateField()
    period_end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.submitted_by.work_id} - {self.period} - {self.status}"


class Performance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performances')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    period_start_date = models.DateField()
    period_end_date = models.DateField()
    metrics_json = models.TextField()  # Stored as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def metrics(self):
        return json.loads(self.metrics_json)
    
    @metrics.setter
    def metrics(self, value):
        self.metrics_json = json.dumps(value)
    
    def __str__(self):
        return f"{self.user.work_id} - {self.period} ({self.period_start_date} to {self.period_end_date})"


class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.work_id} - {self.action} - {self.timestamp}"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.receiver.work_id} - {self.message[:30]}"


class LoginHelpRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='help_requests')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='resolved_help_requests')
    
    def __str__(self):
        return f"{self.user.work_id} - {self.status}"
