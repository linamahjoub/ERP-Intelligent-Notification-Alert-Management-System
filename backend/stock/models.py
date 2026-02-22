from django.db import models


class Product(models.Model):
    STATUS_OPTIMAL = "optimal"
    STATUS_LOW = "low"
    STATUS_OUT_OF_STOCK = "out_of_stock"
    STATUS_RUPTURE = "rupture"

    STATUS_CHOICES = [
        (STATUS_OPTIMAL, "Optimal"),
        (STATUS_LOW, "Low"),
        (STATUS_OUT_OF_STOCK, "Out of stock"),
        (STATUS_RUPTURE, "Rupture"),
    ]

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPTIMAL)
    quantity = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=0)
    max_quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    supplier = models.CharField(max_length=255, blank=True)
    last_restocked = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.sku})"
