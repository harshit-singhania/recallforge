from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('decks', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='deck',
            name='parent_deck',
            field=models.ForeignKey(blank=True, help_text='Original deck if this is a fork', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='forks', to='decks.deck'),
        ),
    ]
