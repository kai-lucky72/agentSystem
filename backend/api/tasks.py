from background_task import background
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from .models import (
    User, Attendance, Report, Notification, AttendanceTimeFrame,
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER,
    ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT
)

@background(schedule=60*60)  # Run every hour
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


@background(schedule=60*60*24)  # Run daily
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
