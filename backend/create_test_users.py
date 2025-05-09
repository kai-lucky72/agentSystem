import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'team_management.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT, Group

User = get_user_model()

# Create admin user if not exists
if not User.objects.filter(email='admin@example.com').exists():
    admin = User.objects.create_superuser(
        email='admin@example.com',
        work_id='ADMIN001',
        password='admin123'
    )
    print(f"Created admin user: {admin.email}")

# Create manager user if not exists
if not User.objects.filter(email='manager@example.com').exists():
    manager = User.objects.create_user(
        email='manager@example.com',
        work_id='MANAGER001',
        role=ROLE_MANAGER,
        password='manager123',
        is_staff=True,
        created_by=User.objects.get(email='admin@example.com')
    )
    print(f"Created manager user: {manager.email}")

# Create sales staff user if not exists
if not User.objects.filter(email='salesstaff@example.com').exists():
    sales_staff = User.objects.create_user(
        email='salesstaff@example.com',
        work_id='SALESSTAFF001',
        role=ROLE_SALES_STAFF,
        password='salesstaff123',
        created_by=User.objects.get(email='manager@example.com')
    )
    print(f"Created sales staff user: {sales_staff.email}")

# Create team leader user if not exists
if not User.objects.filter(email='teamleader@example.com').exists():
    team_leader = User.objects.create_user(
        email='teamleader@example.com',
        work_id='TEAMLEADER001',
        role=ROLE_TEAM_LEADER,
        password='teamleader123',
        created_by=User.objects.get(email='salesstaff@example.com')
    )
    print(f"Created team leader user: {team_leader.email}")

# Create individual agent user if not exists
if not User.objects.filter(email='individual@example.com').exists():
    individual_agent = User.objects.create_user(
        email='individual@example.com',
        work_id='INDIVIDUAL001',
        role=ROLE_INDIVIDUAL_AGENT,
        password='individual123',
        created_by=User.objects.get(email='salesstaff@example.com')
    )
    print(f"Created individual agent user: {individual_agent.email}")

# Create sales agent user if not exists
if not User.objects.filter(email='salesagent@example.com').exists():
    sales_agent = User.objects.create_user(
        email='salesagent@example.com',
        work_id='SALESAGENT001',
        role=ROLE_SALES_AGENT,
        password='salesagent123',
        created_by=User.objects.get(email='teamleader@example.com')
    )
    print(f"Created sales agent user: {sales_agent.email}")

# Create a group with team leader and sales staff
if not Group.objects.filter(name='Sales Team A').exists():
    group = Group.objects.create(
        name='Sales Team A',
        team_leader=User.objects.get(email='teamleader@example.com'),
        sales_staff=User.objects.get(email='salesstaff@example.com')
    )
    
    # Add sales agent to the group
    sales_agent = User.objects.get(email='salesagent@example.com')
    sales_agent.group = group
    sales_agent.save()
    
    print(f"Created group: {group.name}")

print("Test users created successfully!")