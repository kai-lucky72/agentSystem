from rest_framework import permissions
from .models import (
    ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER,
    ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT
)

class IsAdmin(permissions.BasePermission):
    """
    Permission to only allow admin access
    """
    def has_permission(self, request, view):
        return request.user.role == ROLE_ADMIN


class IsManager(permissions.BasePermission):
    """
    Permission to only allow manager access
    """
    def has_permission(self, request, view):
        return request.user.role == ROLE_MANAGER


class IsSalesStaff(permissions.BasePermission):
    """
    Permission to only allow sales staff access
    """
    def has_permission(self, request, view):
        return request.user.role == ROLE_SALES_STAFF


class IsTeamLeader(permissions.BasePermission):
    """
    Permission to only allow team leader access
    """
    def has_permission(self, request, view):
        return request.user.role == ROLE_TEAM_LEADER


class IsAgent(permissions.BasePermission):
    """
    Permission to only allow agent access (individual or sales)
    """
    def has_permission(self, request, view):
        return request.user.role in [ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT]


class CanManageUsers(permissions.BasePermission):
    """
    Permission to manage users based on hierarchical role
    """
    def has_permission(self, request, view):
        # Anyone can view user list (filtered by role in view)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only certain roles can create/update/delete users
        return request.user.role in [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER]
    
    def has_object_permission(self, request, view, obj):
        # Anyone can view user details (filtered by role in view)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Define role hierarchy
        role_hierarchy = {
            ROLE_ADMIN: [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_MANAGER: [ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_SALES_STAFF: [ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_TEAM_LEADER: [ROLE_SALES_AGENT],
            ROLE_INDIVIDUAL_AGENT: [],
            ROLE_SALES_AGENT: []
        }
        
        # Users can always update themselves
        if obj.id == request.user.id:
            return True
        
        # Check if the target user's role is in the allowed list for the requester's role
        return obj.role in role_hierarchy.get(request.user.role, [])


class CanViewUser(permissions.BasePermission):
    """
    Permission to view user details based on hierarchical role
    """
    def has_object_permission(self, request, view, obj):
        # Users can always view themselves
        if obj.id == request.user.id:
            return True
        
        # Define role hierarchy
        role_hierarchy = {
            ROLE_ADMIN: [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_MANAGER: [ROLE_SALES_STAFF, ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_SALES_STAFF: [ROLE_TEAM_LEADER, ROLE_INDIVIDUAL_AGENT, ROLE_SALES_AGENT],
            ROLE_TEAM_LEADER: [ROLE_SALES_AGENT],
            ROLE_INDIVIDUAL_AGENT: [],
            ROLE_SALES_AGENT: []
        }
        
        # Check if the target user's role is in the allowed list for the requester's role
        return obj.role in role_hierarchy.get(request.user.role, [])


class CanManageGroups(permissions.BasePermission):
    """
    Permission to manage groups based on role
    """
    def has_permission(self, request, view):
        # Anyone can view groups (filtered by role in view)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only certain roles can create/update/delete groups
        return request.user.role in [ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES_STAFF]
