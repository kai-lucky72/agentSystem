from rest_framework import viewsets, permissions
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import (
    AttendanceTimeFrame,
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER
)
from .serializers import AttendanceTimeFrameSerializer
from .views import log_activity

User = get_user_model()

class AttendanceTimeFrameViewSet(viewsets.ModelViewSet):
    queryset = AttendanceTimeFrame.objects.all()
    serializer_class = AttendanceTimeFrameSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        date = self.request.query_params.get('date', None)
        sales_staff_id = self.request.query_params.get('sales_staff', None)
        
        queryset = AttendanceTimeFrame.objects.all()
        
        # Filter by date if provided
        if date:
            queryset = queryset.filter(date=date)
        
        # Filter by sales_staff if provided
        if sales_staff_id:
            queryset = queryset.filter(sales_staff_id=sales_staff_id)
        
        # Apply role-based filtering
        if user.role == ROLE_ADMIN or user.role == ROLE_MANAGER:
            # Admins and managers can see all time frames
            return queryset
        elif user.role == ROLE_SALES_STAFF:
            # Sales staff can see their own time frames
            return queryset.filter(sales_staff=user)
        elif user.role == ROLE_TEAM_LEADER:
            # Team leaders can see time frames for sales staff in their groups
            managed_by = User.objects.filter(group__team_leader=user, role=ROLE_SALES_STAFF)
            return queryset.filter(Q(sales_staff__in=managed_by))
        else:
            # Agents can see time frames set by their sales staff
            if user.group and user.group.sales_staff:
                return queryset.filter(sales_staff=user.group.sales_staff)
            return AttendanceTimeFrame.objects.none()
    
    def perform_create(self, serializer):
        serializer.save()
        log_activity(
            self.request.user,
            f"Created attendance time frame for {serializer.instance.date}",
            request=self.request
        )