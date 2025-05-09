from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AttendanceTimeFrame',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date', models.DateField(db_index=True)),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sales_staff', models.ForeignKey(limit_choices_to={'role': 'sales_staff'}, on_delete=django.db.models.deletion.CASCADE, related_name='set_time_frames', to='api.user')),
            ],
            options={
                'ordering': ['-date', 'start_time'],
                'unique_together': {('sales_staff', 'date')},
            },
        ),
    ]