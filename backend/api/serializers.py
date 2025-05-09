from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    Group, GroupMembership, Client, AttendanceTimeFrame, Attendance,
    Report, Performance, ActivityLog, Notification, LoginHelpRequest,
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER,
    ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT
)
import json

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'work_id', 'email', 'role', 'is_active', 'created_at', 'created_by', 'created_by_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'created_by': {'read_only': True}
        }
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.work_id} - {obj.created_by.email}"
        return None
    
    def validate(self, attrs):
        # Ensure role hierarchy is respected
        request = self.context.get('request')
        if request and request.user:
            user_role = request.user.role
            new_role = attrs.get('role')
            
            # Define role hierarchy
            role_hierarchy = {
                ROLE_ADMIN: [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
                ROLE_MANAGER: [ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
                ROLE_SALES_STAFF: [ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
                ROLE_TEAM_LEADER: [ROLE_SALES_AGENT],
                ROLE_INDIVIDUAL_AGENT: [],
                ROLE_SALES_AGENT: []
            }
            
            if new_role and new_role not in role_hierarchy.get(user_role, []):
                raise serializers.ValidationError({
                    "role": f"Users with role '{user_role}' cannot create/update users with role '{new_role}'"
                })
        
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        password = validated_data.pop('password', None)
        user = User.objects.create(
            created_by=request.user if request else None,
            **validated_data
        )
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'work_id', 'email', 'role', 'is_active', 'created_at']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'
        
    def validate(self, attrs):
        team_leader = attrs.get('team_leader')
        sales_staff = attrs.get('sales_staff')
        
        if team_leader and team_leader.role != ROLE_TEAM_LEADER:
            raise serializers.ValidationError({
                "team_leader": "Team leader must have the Team Leader role"
            })
        
        if sales_staff and sales_staff.role != ROLE_SALES_STAFF:
            raise serializers.ValidationError({
                "sales_staff": "Sales staff must have the Sales Staff role"
            })
        
        return attrs


class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = '__all__'
        
    def validate(self, attrs):
        user = attrs.get('user')
        group = attrs.get('group')
        
        if user.role not in [ROLE_SALES_AGENT]:
            raise serializers.ValidationError({
                "user": "Only Sales Agents can be added to groups"
            })
        
        # Ensure user is not already in another group
        if GroupMembership.objects.filter(user=user).exclude(group=group).exists():
            raise serializers.ValidationError({
                "user": "This user is already a member of another group"
            })
        
        return attrs


class ClientSerializer(serializers.ModelSerializer):
    added_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = '__all__'
        extra_kwargs = {
            'added_by': {'read_only': True}
        }
    
    def get_added_by_name(self, obj):
        if obj.added_by:
            return f"{obj.added_by.work_id} - {obj.added_by.email}"
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Check if user has attended or has been excused
        today = validated_data.get('created_at', None)
        if today:
            today = today.date()
        else:
            from django.utils import timezone
            today = timezone.now().date()
        
        attendance = Attendance.objects.filter(
            user=user,
            date=today,
            status__in=['present', 'excused']
        ).first()
        
        if not attendance:
            raise serializers.ValidationError({
                "non_field_errors": "You must be attended or excused today to add clients"
            })
        
        validated_data['added_by'] = user
        return super().create(validated_data)


class AttendanceTimeFrameSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceTimeFrame
        fields = '__all__'
        extra_kwargs = {
            'sales_staff': {'read_only': True}
        }
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.role != ROLE_SALES_STAFF:
            raise serializers.ValidationError({
                "non_field_errors": "Only Sales Staff can create time frames"
            })
        
        validated_data['sales_staff'] = user
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    user_details = UserListSerializer(source='user', read_only=True)
    excused_by_details = UserListSerializer(source='excused_by', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        extra_kwargs = {
            'user': {'required': False},
            'excused_by': {'read_only': True}
        }
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        # If user is not provided, use the authenticated user
        if 'user' not in validated_data:
            validated_data['user'] = user
        
        # Check if there's a time frame for today (for non Sales Staff)
        today = validated_data.get('date')
        time = validated_data.get('time')
        
        if user.role not in [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF]:
            # Find time frames set by the sales staff for today
            time_frames = AttendanceTimeFrame.objects.filter(date=today)
            
            if not time_frames.exists():
                raise serializers.ValidationError({
                    "date": "No time frame has been set for today"
                })
            
            # Check if attendance is within any time frame
            is_within_timeframe = False
            for tf in time_frames:
                if tf.start_time <= time <= tf.end_time:
                    is_within_timeframe = True
                    break
            
            if not is_within_timeframe and validated_data.get('status') == 'present':
                validated_data['status'] = 'late'
        
        return super().create(validated_data)


class ExcuseAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'date', 'excused_by', 'status']
        read_only_fields = ['user', 'date']
    
    def validate(self, attrs):
        attrs['status'] = 'excused'
        return attrs
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user.role != ROLE_SALES_STAFF:
            raise serializers.ValidationError({
                "non_field_errors": "Only Sales Staff can excuse attendance"
            })
        
        validated_data['excused_by'] = user
        return super().update(instance, validated_data)


class ReportSerializer(serializers.ModelSerializer):
    submitted_by_details = UserListSerializer(source='submitted_by', read_only=True)
    submitted_to_details = UserListSerializer(source='submitted_to', read_only=True)
    
    class Meta:
        model = Report
        fields = '__all__'
        extra_kwargs = {
            'submitted_by': {'read_only': True},
            'status': {'read_only': True}
        }
    
    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        submitted_to = attrs.get('submitted_to')
        
        # Validate report submission hierarchies
        if user.role == ROLE_SALES_AGENT:
            # Sales Agents submit to Team Leaders
            if submitted_to.role != ROLE_TEAM_LEADER:
                raise serializers.ValidationError({
                    "submitted_to": "Sales Agents must submit reports to Team Leaders"
                })
            
            # Ensure Team Leader is from the same group
            memberships = GroupMembership.objects.filter(user=user)
            valid_team_leaders = [m.group.team_leader for m in memberships if m.group.team_leader]
            if submitted_to not in valid_team_leaders:
                raise serializers.ValidationError({
                    "submitted_to": "You can only submit reports to your Team Leader"
                })
                
        elif user.role == ROLE_INDIVIDUAL_AGENT:
            # Individual Agents submit to Sales Staff
            if submitted_to.role != ROLE_SALES_STAFF:
                raise serializers.ValidationError({
                    "submitted_to": "Individual Agents must submit reports to Sales Staff"
                })
                
        elif user.role == ROLE_TEAM_LEADER:
            # Team Leaders submit to Sales Staff
            if submitted_to.role != ROLE_SALES_STAFF:
                raise serializers.ValidationError({
                    "submitted_to": "Team Leaders must submit reports to Sales Staff"
                })
                
        elif user.role == ROLE_SALES_STAFF:
            # Sales Staff submit to Managers
            if submitted_to.role != ROLE_MANAGER:
                raise serializers.ValidationError({
                    "submitted_to": "Sales Staff must submit reports to Managers"
                })
        
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['submitted_by'] = request.user if request else None
        return super().create(validated_data)


class ReportActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'status', 'comment']
    
    def validate(self, attrs):
        status = attrs.get('status')
        if status not in ['approved', 'rejected']:
            raise serializers.ValidationError({
                "status": "Status must be 'approved' or 'rejected'"
            })
        return attrs
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        # Make sure the report was submitted to the current user
        if instance.submitted_to != user:
            raise serializers.ValidationError({
                "non_field_errors": "You can only approve/reject reports submitted to you"
            })
        
        return super().update(instance, validated_data)


class PerformanceSerializer(serializers.ModelSerializer):
    metrics = serializers.JSONField()
    
    class Meta:
        model = Performance
        fields = '__all__'
    
    def validate(self, attrs):
        metrics = attrs.get('metrics')
        
        if not isinstance(metrics, dict):
            raise serializers.ValidationError({
                "metrics": "Metrics must be a JSON object"
            })
        
        # Convert metrics to JSON string for storage
        attrs['metrics_json'] = json.dumps(metrics)
        
        return attrs
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Parse the metrics_json field to return as JSON
        try:
            representation['metrics'] = json.loads(instance.metrics_json)
        except (TypeError, json.JSONDecodeError):
            representation['metrics'] = {}
        
        return representation


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['user', 'timestamp', 'ip_address']


class NotificationSerializer(serializers.ModelSerializer):
    sender_details = UserListSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        extra_kwargs = {
            'sender': {'read_only': True},
            'is_system': {'read_only': True}
        }
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        validated_data['sender'] = user
        validated_data['is_system'] = False
        
        return super().create(validated_data)


class LoginHelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHelpRequest
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'status': {'read_only': True},
            'resolved_at': {'read_only': True},
            'resolved_by': {'read_only': True}
        }
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        validated_data['user'] = user
        return super().create(validated_data)


class ResolveHelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHelpRequest
        fields = ['id', 'status', 'resolved_at', 'resolved_by']
        read_only_fields = ['resolved_at', 'resolved_by']
    
    def validate(self, attrs):
        attrs['status'] = 'resolved'
        attrs['resolved_at'] = timezone.now()
        return attrs
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user.role not in [ROLE_ADMIN, ROLE_MANAGER]:
            raise serializers.ValidationError({
                "non_field_errors": "Only Admins and Managers can resolve help requests"
            })
        
        validated_data['resolved_by'] = user
        return super().update(instance, validated_data)


class PasswordResetSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    
    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user.role not in [ROLE_ADMIN]:
            raise serializers.ValidationError({
                "non_field_errors": "Only Admins can reset passwords"
            })
        
        try:
            attrs['target_user'] = User.objects.get(id=attrs['user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "user_id": "User does not exist"
            })
        
        return attrs
    
    def save(self):
        target_user = self.validated_data['target_user']
        target_user.set_unusable_password()
        target_user.save()
        return target_user
