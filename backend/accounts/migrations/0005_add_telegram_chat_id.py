from django.db import migrations, models
import django.utils.translation


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_update_existing_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='telegram_chat_id',
            field=models.CharField(
                blank=True,
                help_text=django.utils.translation.gettext_lazy('Identifiant Telegram pour recevoir des notifications.'),
                max_length=64,
                null=True,
                verbose_name=django.utils.translation.gettext_lazy('telegram chat id'),
            ),
        ),
    ]
