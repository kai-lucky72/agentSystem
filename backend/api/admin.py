from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django import forms
from .models import (
    User, Group, GroupMembership, Client, AttendanceTimeFrame, Attendance,
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
admin.site.register(Group)
admin.site.register(GroupMembership)
admin.site.register(Client)
admin.site.register(AttendanceTimeFrame)
admin.site.register(Attendance)
admin.site.register(Report)
admin.site.register(Performance)
admin.site.register(ActivityLog)
admin.site.register(Notification)
admin.site.register(LoginHelpRequest)
