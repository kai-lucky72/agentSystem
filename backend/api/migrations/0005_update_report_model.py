from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20250509_1225'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='period_start_date',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='report',
            name='period_end_date',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AlterModelOptions(
            name='report',
            options={'ordering': ['-period_end_date']},
        ),
    ]