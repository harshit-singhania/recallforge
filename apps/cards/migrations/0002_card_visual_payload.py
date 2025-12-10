from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='visual_payload',
            field=models.TextField(blank=True, help_text='SVG code or JSON for generative UI', null=True),
        ),
    ]
