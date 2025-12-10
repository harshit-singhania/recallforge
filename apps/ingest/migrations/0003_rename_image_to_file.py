from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('ingest', '0002_source_image_alter_source_url'),
    ]

    operations = [
        migrations.RenameField(
            model_name='source',
            old_name='image',
            new_name='file',
        ),
    ]
