from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
import json

# ROLE CHOICES
ROLE_ADMIN = 'Admin'
ROLE_MANAGER = 'Manager'
ROLE_SALES_STAFF = 'Sales Staff'
ROLE_TEAM_LEADER = 'Team Leader'
ROLE_INDIVIDUAL_AGENT = 'Individual Agent'
ROLE_SALES_AGENT = 'Sales Agent'

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
STATUS_SUBMITTED = 'submitted'
STATUS_APPROVED = 'approved'

REPORT_STATUS_CHOICES = [
    (STATUS_SUBMITTED, 'Submitted'),
    (STATUS_APPROVED, 'Approved'),
]

# ATTENDANCE STATUS CHOICES
ATTENDANCE_ATTENDED = 'attended'
ATTENDANCE_LATE = 'late'
ATTENDANCE_EXCUSED = 'excused'

ATTENDANCE_STATUS_CHOICES = [
    (ATTENDANCE_ATTENDED, 'Attended'),
    (ATTENDANCE_LATE, 'Late'),
    (ATTENDANCE_EXCUSED, 'Excused'),
]

# LOGIN HELP REQUEST STATUS CHOICES
LOGIN_HELP_PENDING = 'pending'
LOGIN_HELP_RESOLVED = 'resolved'

LOGIN_HELP_STATUS_CHOICES = [
    (LOGIN_HELP_PENDING, 'Pending'),
    (LOGIN_HELP_RESOLVED, 'Resolved'),
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
    id = models.AutoField(primary_key=True)
    work_id = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    password = models.CharField(max_length=128, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='created_users')
    group = models.ForeignKey('Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['work_id']
    
    def __str__(self):
        return f"{self.work_id} - {self.email} ({self.role})"


class Group(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    team_leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='led_groups')
    sales_staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Client(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    details = models.TextField()
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='added_clients')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Attendance(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances', db_index=True)
    date = models.DateField(db_index=True)
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default=ATTENDANCE_ATTENDED, db_index=True)
    sector = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.work_id} - {self.date} - {self.status}"


class Report(models.Model):
    id = models.AutoField(primary_key=True)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_reports')
    submitted_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reports')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    content = models.TextField()
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=REPORT_STATUS_CHOICES, default=STATUS_SUBMITTED)
    
    def __str__(self):
        return f"{self.submitted_by.work_id} - {self.period} - {self.status}"


class Performance(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performances')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    metrics_json = models.TextField()  # Stored as JSON
    
    @property
    def metrics(self):
        return json.loads(self.metrics_json)
    
    @metrics.setter
    def metrics(self, value):
        self.metrics_json = json.dumps(value)
    
    def __str__(self):
        return f"{self.user.work_id} - {self.period}"


class ActivityLog(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.work_id} - {self.action} - {self.timestamp}"


class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.receiver.work_id} - {self.message[:30]}"


class LoginHelpRequest(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='help_requests')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=LOGIN_HELP_STATUS_CHOICES, default=LOGIN_HELP_PENDING)
    
    def __str__(self):
        return f"{self.user.work_id} - {self.status}"
