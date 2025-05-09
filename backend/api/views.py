from rest_framework import viewsets, mixins, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Group, Client, Attendance,
    Report, Performance, ActivityLog, Notification, LoginHelpRequest,
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER,
    ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT
)
from .serializers import (
    UserSerializer, UserListSerializer, GroupSerializer,
    ClientSerializer, AttendanceSerializer, ExcuseAttendanceSerializer,
    ReportSerializer, ReportActionSerializer, PerformanceSerializer, ActivityLogSerializer,
    NotificationSerializer, LoginHelpRequestSerializer, ResolveHelpRequestSerializer,
    PasswordResetSerializer
)
from .permissions import (
    IsAdmin, IsManager, IsSalesStaff, IsTeamLeader, IsAgent,
    CanManageUsers, CanViewUser, CanManageGroups
)

User = get_user_model()


def log_activity(user, action, details="", request=None):
    """Helper function to log user activities"""
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
    
    ActivityLog.objects.create(
        user=user,
        action=action,
        details=details,
        ip_address=ip
    )


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log the successful login
            try:
                user = User.objects.get(email=request.data.get('email'))
                log_activity(user, "Logged in", request=request)
            except User.DoesNotExist:
                pass
            
        return response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageUsers]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter users based on role hierarchy
        if user.role == ROLE_ADMIN:
            return User.objects.all()
        elif user.role == ROLE_MANAGER:
            return User.objects.filter(
                Q(role__in=[ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]) |
                Q(id=user.id)
            )
        elif user.role == ROLE_SALES_STAFF:
            return User.objects.filter(
                Q(role__in=[ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]) |
                Q(id=user.id)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see sales agents in their groups
            led_groups = Group.objects.filter(team_leader=user)
            agent_ids = User.objects.filter(group__in=led_groups, role=ROLE_SALES_AGENT).values_list('id', flat=True)
            return User.objects.filter(Q(id__in=agent_ids) | Q(id=user.id))
        else:
            # Individual and Sales Agents can only see themselves
            return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Created user {serializer.instance.work_id}",
            request=self.request
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated user {serializer.instance.work_id}",
            request=self.request
        )
    
    def perform_destroy(self, instance):
        log_activity(
            self.request.user,
            f"Deleted user {instance.work_id}",
            request=self.request
        )
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def agents(self, request):
        """Get agents that can be assigned to groups"""
        queryset = User.objects.filter(role=ROLE_SALES_AGENT)
        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team_leaders(self, request):
        """Get team leaders for group assignment"""
        queryset = User.objects.filter(role=ROLE_TEAM_LEADER)
        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sales_staff(self, request):
        """Get sales staff for group assignment"""
        queryset = User.objects.filter(role=ROLE_SALES_STAFF)
        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reset_password(self, request, pk=None):
        serializer = PasswordResetSerializer(data={'user_id': pk}, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            log_activity(
                request.user,
                f"Reset password for {user.work_id}",
                request=request
            )
            return Response({"detail": "Password has been reset"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageGroups]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == ROLE_ADMIN:
            return Group.objects.all()
        elif user.role == ROLE_MANAGER:
            return Group.objects.all()
        elif user.role == ROLE_SALES_STAFF:
            return Group.objects.filter(sales_staff=user)
        elif user.role == ROLE_TEAM_LEADER:
            return Group.objects.filter(team_leader=user)
        else:
            # Find the group the user is a member of
            return Group.objects.filter(members__id=user.id)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Created group {serializer.instance.name}",
            request=self.request
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated group {serializer.instance.name}",
            request=self.request
        )
    
    def perform_destroy(self, instance):
        log_activity(
            self.request.user,
            f"Deleted group {instance.name}",
            request=self.request
        )
        instance.delete()
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        group = self.get_object()
        users = User.objects.filter(group=group)
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)





class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            return Client.objects.all()
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see clients added by agents they manage
            managed_groups = Group.objects.filter(sales_staff=user)
            agent_ids = User.objects.filter(group__in=managed_groups).values_list('id', flat=True)
            
            # Also include individual agents
            individual_agents = User.objects.filter(
                role=ROLE_INDIVIDUAL_AGENT,
                created_by=user
            ).values_list('id', flat=True)
            
            agent_ids = list(agent_ids) + list(individual_agents)
            
            return Client.objects.filter(
                Q(added_by_id__in=agent_ids) |
                Q(added_by=user)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see clients added by agents in their groups
            led_groups = Group.objects.filter(team_leader=user)
            agent_ids = User.objects.filter(group__in=led_groups).values_list('id', flat=True)
            
            return Client.objects.filter(
                Q(added_by_id__in=agent_ids) |
                Q(added_by=user)
            )
        else:
            # Agents can only see clients they added
            return Client.objects.filter(added_by=user)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Added client {serializer.instance.name}",
            request=self.request
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated client {serializer.instance.name}",
            request=self.request
        )
    
    def perform_destroy(self, instance):
        log_activity(
            self.request.user,
            f"Deleted client {instance.name}",
            request=self.request
        )
        instance.delete()





class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        date = self.request.query_params.get('date')
        user_id = self.request.query_params.get('user_id')
        
        queryset = Attendance.objects.all()
        
        if date:
            queryset = queryset.filter(date=date)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            return queryset
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see attendance for agents they manage
            managed_groups = Group.objects.filter(sales_staff=user)
            agent_ids = User.objects.filter(group__in=managed_groups).values_list('id', flat=True)
            
            # Also include individual agents
            individual_agents = User.objects.filter(
                role=ROLE_INDIVIDUAL_AGENT,
                created_by=user
            ).values_list('id', flat=True)
            
            agent_ids = list(agent_ids) + list(individual_agents)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see attendance for agents in their groups
            led_groups = Group.objects.filter(team_leader=user)
            agent_ids = User.objects.filter(group__in=led_groups).values_list('id', flat=True)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        else:
            # Agents can only see their own attendance
            return queryset.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Recorded attendance for {serializer.instance.date}",
            request=self.request
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated attendance for {serializer.instance.date}",
            request=self.request
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsSalesStaff])
    def excuse(self, request, pk=None):
        attendance = self.get_object()
        serializer = ExcuseAttendanceSerializer(
            attendance,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            log_activity(
                request.user,
                f"Excused attendance for {attendance.user.work_id} on {attendance.date}",
                request=request
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        period = self.request.query_params.get('period')
        status_filter = self.request.query_params.get('status')
        
        queryset = Report.objects.all()
        
        if period:
            queryset = queryset.filter(period=period)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            # Admins can see all reports, managers can see reports submitted to them
            if user.role == ROLE_MANAGER:
                queryset = queryset.filter(
                    Q(submitted_to=user) | 
                    Q(submitted_by=user)
                )
            return queryset
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see reports submitted to them, and those they submitted
            return queryset.filter(
                Q(submitted_to=user) | 
                Q(submitted_by=user)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see reports submitted to them, and those they submitted
            return queryset.filter(
                Q(submitted_to=user) | 
                Q(submitted_by=user)
            )
        else:
            # Agents can only see reports they submitted
            return queryset.filter(submitted_by=user)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Submitted {serializer.instance.period} report to {serializer.instance.submitted_to.work_id}",
            request=self.request
        )
        
        # Create notification for the recipient
        Notification.objects.create(
            sender=self.request.user,
            receiver=serializer.instance.submitted_to,
            message=f"New {serializer.instance.period} report submitted by {self.request.user.work_id}",
            is_system=True
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated {serializer.instance.period} report for {serializer.instance.submitted_to.work_id}",
            request=self.request
        )
    
    @action(detail=True, methods=['post'])
    def approve_reject(self, request, pk=None):
        report = self.get_object()
        serializer = ReportActionSerializer(
            report,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            status_text = "approved" if result.status == "approved" else "rejected"
            
            log_activity(
                request.user,
                f"{status_text.capitalize()} {report.period} report from {report.submitted_by.work_id}",
                request=request
            )
            
            # Create notification for the submitter
            Notification.objects.create(
                sender=request.user,
                receiver=report.submitted_by,
                message=f"Your {report.period} report has been {status_text}",
                is_system=True
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def submitted_to_me(self, request):
        """Get reports submitted to the current user"""
        queryset = Report.objects.filter(submitted_to=request.user)
        period = request.query_params.get('period')
        status_filter = request.query_params.get('status')
        
        if period:
            queryset = queryset.filter(period=period)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_submissions(self, request):
        """Get reports submitted by the current user"""
        queryset = Report.objects.filter(submitted_by=request.user)
        period = request.query_params.get('period')
        status_filter = request.query_params.get('status')
        
        if period:
            queryset = queryset.filter(period=period)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        period = self.request.query_params.get('period')
        user_id = self.request.query_params.get('user_id')
        
        queryset = Performance.objects.all()
        
        if period:
            queryset = queryset.filter(period=period)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            return queryset
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see performance for agents they manage
            managed_groups = Group.objects.filter(sales_staff=user)
            agent_ids = User.objects.filter(group__in=managed_groups).values_list('id', flat=True)
            
            # Also include individual agents
            individual_agents = User.objects.filter(
                role=ROLE_INDIVIDUAL_AGENT,
                created_by=user
            ).values_list('id', flat=True)
            
            agent_ids = list(agent_ids) + list(individual_agents)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see performance for agents in their groups
            led_groups = Group.objects.filter(team_leader=user)
            agent_ids = User.objects.filter(group__in=led_groups).values_list('id', flat=True)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        else:
            # Agents can only see their own performance
            return queryset.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Recorded performance metrics for {serializer.instance.user.work_id}",
            request=self.request
        )
    
    def perform_update(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Updated performance metrics for {serializer.instance.user.work_id}",
            request=self.request
        )


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_id = self.request.query_params.get('user_id')
        
        queryset = ActivityLog.objects.all().order_by('-timestamp')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            return queryset
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see logs for agents they manage
            managed_groups = Group.objects.filter(sales_staff=user)
            agent_ids = User.objects.filter(group__in=managed_groups).values_list('id', flat=True)
            
            # Also include individual agents
            individual_agents = User.objects.filter(
                role=ROLE_INDIVIDUAL_AGENT,
                created_by=user
            ).values_list('id', flat=True)
            
            agent_ids = list(agent_ids) + list(individual_agents)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see logs for agents in their groups
            led_groups = Group.objects.filter(team_leader=user)
            agent_ids = User.objects.filter(group__in=led_groups).values_list('id', flat=True)
            
            return queryset.filter(
                Q(user_id__in=agent_ids) |
                Q(user=user)
            )
        else:
            # Agents can only see their own logs
            return queryset.filter(user=user)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        unread = self.request.query_params.get('unread')
        
        queryset = Notification.objects.filter(receiver=user).order_by('-created_at')
        
        if unread == 'true':
            queryset = queryset.filter(is_read=False)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Sent notification to {serializer.instance.receiver.work_id}",
            request=self.request
        )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "notification marked as read"})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = Notification.objects.filter(receiver=request.user, is_read=False)
        count = notifications.count()
        notifications.update(is_read=True)
        return Response({"status": f"{count} notifications marked as read"})


class LoginHelpRequestViewSet(viewsets.ModelViewSet):
    queryset = LoginHelpRequest.objects.all()
    serializer_class = LoginHelpRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get('status')
        
        queryset = LoginHelpRequest.objects.all().order_by('-created_at')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if user.role in [ROLE_ADMIN, ROLE_MANAGER]:
            return queryset
        else:
            # Regular users can only see their own help requests
            return queryset.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            "Submitted login help request",
            details=serializer.instance.message,
            request=self.request
        )
        
        # Notify admins
        admins = User.objects.filter(role=ROLE_ADMIN)
        for admin in admins:
            Notification.objects.create(
                sender=self.request.user,
                receiver=admin,
                message=f"New login help request from {self.request.user.work_id}",
                is_system=True
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated & (IsAdmin | IsManager)])
    def resolve(self, request, pk=None):
        help_request = self.get_object()
        serializer = ResolveHelpRequestSerializer(
            help_request,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            
            log_activity(
                request.user,
                f"Resolved login help request from {help_request.user.work_id}",
                request=request
            )
            
            # Notify the user
            Notification.objects.create(
                sender=request.user,
                receiver=help_request.user,
                message="Your login help request has been resolved",
                is_system=True
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
