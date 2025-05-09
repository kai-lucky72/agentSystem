from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_attendancetimeframe'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='status',
            field=models.CharField(
                choices=[
                    ('submitted', 'Submitted'), 
                    ('approved', 'Approved'), 
                    ('rejected', 'Rejected')
                ], 
                default='submitted', 
                max_length=20
            ),
        ),
    ]