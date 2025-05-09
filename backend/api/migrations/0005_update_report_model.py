from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20250509_1225'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='report',
            options={'ordering': ['-period_end_date']},
        ),
    ]