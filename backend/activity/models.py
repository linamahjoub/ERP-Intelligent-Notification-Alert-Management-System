from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    ACTION_PRODUCT_CREATED = "product_created"
    ACTION_USER_CREATED = "user_created"
    ACTION_CATEGORY_CREATED = "category_created"
    ACTION_ALERT_CREATED = "alert_created"

    ACTION_CHOICES = [
        (ACTION_PRODUCT_CREATED, "Product created"),
        (ACTION_USER_CREATED, "User created"),
        (ACTION_CATEGORY_CREATED, "Category created"),
        (ACTION_ALERT_CREATED, "Alert created"),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Activity Log"
        verbose_name_plural = "Activity Logs"

    def __str__(self):
        return f"{self.action_type}: {self.title}"
