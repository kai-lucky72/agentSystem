from background_task import background
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta, datetime
from .models import (
    User, Attendance, Report, Notification, AttendanceTimeFrame, Performance, Client,
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER,
    ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT,
    STATUS_APPROVED as REPORT_APPROVED, STATUS_REJECTED as REPORT_REJECTED
)

@background
def send_attendance_reminders():
    """
    Send notifications to agents who haven't recorded their attendance today
    """
    today = timezone.now().date()
    
    # Get all time frames for today
    time_frames = AttendanceTimeFrame.objects.filter(date=today)
    
    if not time_frames.exists():
        return
    
    # Get all active agents
    agents = User.objects.filter(
        is_active=True,
        role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]
    )
    
    # Get agents who have already recorded attendance today
    attended_agents = Attendance.objects.filter(date=today).values_list('user_id', flat=True)
    
    # Find agents who haven't recorded attendance
    missing_agents = agents.exclude(id__in=attended_agents)
    
    # Current time
    now = timezone.now().time()
    
    # Check which agents are late based on time frames
    for agent in missing_agents:
        for time_frame in time_frames:
            # If current time is past the start time, send a reminder
            if now > time_frame.start_time:
                Notification.objects.create(
                    receiver=agent,
                    message=f"Please record your attendance for today ({today})",
                    is_system=True
                )
                break


@background
def send_report_reminders():
    """
    Send reminders for pending reports
    """
    today = timezone.now().date()
    
    # Weekly reminders - if today is Friday
    if today.weekday() == 4:  # Friday
        send_weekly_report_reminders()
    
    # Monthly reminders - if today is the last day of the month
    next_day = today + timedelta(days=1)
    if next_day.month != today.month:
        send_monthly_report_reminders()
    
    # Quarterly reminders - if today is the last day of a quarter
    if today.month in [3, 6, 9, 12] and next_day.month != today.month:
        send_quarterly_report_reminders()


def send_weekly_report_reminders():
    """Send reminders for weekly reports"""
    # Get all users who need to submit reports
    agents = User.objects.filter(
        is_active=True,
        role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]
    )
    
    today = timezone.now().date()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    for agent in agents:
        # Check if agent has already submitted their weekly report
        has_report = Report.objects.filter(
            submitted_by=agent,
            period='weekly',
            period_start_date=start_of_week,
            period_end_date=end_of_week
        ).exists()
        
        if not has_report:
            Notification.objects.create(
                receiver=agent,
                message="Please submit your weekly report",
                is_system=True
            )


def send_monthly_report_reminders():
    """Send reminders for monthly reports"""
    # Get all users who need to submit reports
    agents = User.objects.filter(
        is_active=True,
        role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]
    )
    
    today = timezone.now().date()
    
    # First day of the current month
    start_of_month = today.replace(day=1)
    
    for agent in agents:
        # Check if agent has already submitted their monthly report
        has_report = Report.objects.filter(
            submitted_by=agent,
            period='monthly',
            period_start_date=start_of_month,
            period_end_date=today
        ).exists()
        
        if not has_report:
            Notification.objects.create(
                receiver=agent,
                message="Please submit your monthly report",
                is_system=True
            )


def send_quarterly_report_reminders():
    """Send reminders for quarterly reports"""
    # Get all users who need to submit reports
    agents = User.objects.filter(
        is_active=True,
        role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]
    )
    
    today = timezone.now().date()
    month = today.month
    
    # Determine the start month of the quarter
    if month in [1, 2, 3]:
        start_month = 1
    elif month in [4, 5, 6]:
        start_month = 4
    elif month in [7, 8, 9]:
        start_month = 7
    else:
        start_month = 10
    
    # First day of the quarter
    start_of_quarter = today.replace(month=start_month, day=1)
    
    for agent in agents:
        # Check if agent has already submitted their quarterly report
        has_report = Report.objects.filter(
            submitted_by=agent,
            period='quarterly',
            period_start_date=start_of_quarter,
            period_end_date=today
        ).exists()
        
        if not has_report:
            Notification.objects.create(
                receiver=agent,
                message="Please submit your quarterly report",
                is_system=True
            )

@background
def update_performance_metrics():
    """
    Update performance metrics for all active users based on their activities
    """
    today = timezone.now().date()
    
    # Get all active agents
    agents = User.objects.filter(
        is_active=True,
        role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]
    )
    
    # Calculate weekly metrics
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    # Calculate monthly metrics
    start_of_month = today.replace(day=1)
    next_month = today.replace(day=28) + timedelta(days=4)  # Move to next month
    end_of_month = next_month.replace(day=1) - timedelta(days=1)  # Last day of current month
    
    # Calculate quarterly metrics
    current_month = today.month
    if current_month in [1, 2, 3]:
        start_of_quarter = today.replace(month=1, day=1)
        end_of_quarter = today.replace(month=3, day=31)
    elif current_month in [4, 5, 6]:
        start_of_quarter = today.replace(month=4, day=1)
        end_of_quarter = today.replace(month=6, day=30)
    elif current_month in [7, 8, 9]:
        start_of_quarter = today.replace(month=7, day=1)
        end_of_quarter = today.replace(month=9, day=30)
    else:
        start_of_quarter = today.replace(month=10, day=1)
        end_of_quarter = today.replace(month=12, day=31)
    
    for agent in agents:
        # Weekly metrics
        calculate_performance_for_period(
            agent=agent, 
            period='weekly', 
            start_date=start_of_week, 
            end_date=end_of_week
        )
        
        # Monthly metrics
        calculate_performance_for_period(
            agent=agent, 
            period='monthly', 
            start_date=start_of_month, 
            end_date=end_of_month
        )
        
        # Quarterly metrics
        calculate_performance_for_period(
            agent=agent, 
            period='quarterly', 
            start_date=start_of_quarter, 
            end_date=end_of_quarter
        )

def calculate_performance_for_period(agent, period, start_date, end_date):
    """
    Calculate performance metrics for a specific user and time period
    """
    # Get attendance data
    attendance_count = Attendance.objects.filter(
        user=agent, 
        date__range=[start_date, end_date]
    ).count()
    
    # Get approved reports
    report_count = Report.objects.filter(
        submitted_by=agent,
        status=REPORT_APPROVED,
        period_start_date__gte=start_date,
        period_end_date__lte=end_date
    ).count()
    
    # Get client additions
    client_count = Client.objects.filter(
        added_by=agent,
        timestamp__date__range=[start_date, end_date]
    ).count()
    
    # Calculate performance metrics
    metrics = {
        'attendance_rate': (attendance_count / 5) * 100 if attendance_count > 0 else 0,
        'report_completion': report_count,
        'clients_added': client_count,
        'last_updated': timezone.now().isoformat(),
    }
    
    # Update or create performance record
    performance, created = Performance.objects.update_or_create(
        user=agent,
        period=period,
        period_start_date=start_date,
        period_end_date=end_date,
        defaults={'metrics_json': metrics}
    )

@background
def notify_pending_report_reviews():
    """
    Notify managers and sales staff about pending reports that need review
    """
    # Get all managers and sales staff
    reviewers = User.objects.filter(
        is_active=True,
        role__in=[ROLE_MANAGER, ROLE_SALES_STAFF]
    )
    
    for reviewer in reviewers:
        # Count pending reports for this reviewer
        pending_count = Report.objects.filter(
            submitted_to=reviewer,
            status='submitted'
        ).count()
        
        if pending_count > 0:
            Notification.objects.create(
                receiver=reviewer,
                message=f"You have {pending_count} pending reports that need your review",
                is_system=True
            )
