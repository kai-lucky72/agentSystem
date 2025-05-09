from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django import forms
from .models import (
    User, Group, Client, Attendance,
    Report, Performance, ActivityLog, Notification, LoginHelpRequest
)

class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all required fields plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput, required=False)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = ('email', 'work_id', 'role')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        if self.cleaned_data["password1"]:
            user.set_password(self.cleaned_data["password1"])
        else:
            user.set_unusable_password()
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all fields on the user, but replaces the password field with hashed password field."""
    password = ReadOnlyPasswordHashField(help_text="Raw passwords are not stored, so there is no way to see this user's password, but you can change the password using <a href=\"../password/\">this form</a>.")

    class Meta:
        model = User
        fields = ('email', 'work_id', 'role', 'password', 'is_active', 'is_staff', 'is_superuser')


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('email', 'work_id', 'role', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_active', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'work_id', 'password')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'work_id', 'role', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'work_id')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)


admin.site.register(User, UserAdmin)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'team_leader', 'sales_staff', 'created_at')
    search_fields = ('name',)
    list_select_related = ('team_leader', 'sales_staff')
    list_per_page = 20


class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'added_by', 'timestamp')
    search_fields = ('name', 'details')
    list_select_related = ('added_by',)
    list_per_page = 20


class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'time', 'status')
    list_select_related = ('user',)
    list_filter = ('status', 'date')
    search_fields = ('user__email', 'user__work_id')
    date_hierarchy = 'date'
    list_per_page = 20


class ReportAdmin(admin.ModelAdmin):
    list_display = ('submitted_by', 'submitted_to', 'period', 'status')
    list_select_related = ('submitted_by', 'submitted_to')
    list_filter = ('status', 'period')
    search_fields = ('submitted_by__email', 'submitted_to__email')
    list_per_page = 20


class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'period')
    list_select_related = ('user',)
    list_filter = ('period',)
    search_fields = ('user__email', 'user__work_id')
    list_per_page = 20


class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp')
    list_select_related = ('user',)
    list_filter = ('action',)
    search_fields = ('user__email', 'action')
    date_hierarchy = 'timestamp'
    list_per_page = 20


class NotificationAdmin(admin.ModelAdmin):
    list_display = ('receiver', 'sender', 'message', 'timestamp')
    list_select_related = ('receiver', 'sender')
    search_fields = ('receiver__email', 'message')
    list_per_page = 20


class LoginHelpRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'status')
    list_select_related = ('user',)
    list_filter = ('status',)
    search_fields = ('user__email', 'message')
    list_per_page = 20


admin.site.register(Group, GroupAdmin)
admin.site.register(Client, ClientAdmin)
admin.site.register(Attendance, AttendanceAdmin)
admin.site.register(Report, ReportAdmin)
admin.site.register(Performance, PerformanceAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(LoginHelpRequest, LoginHelpRequestAdmin)
