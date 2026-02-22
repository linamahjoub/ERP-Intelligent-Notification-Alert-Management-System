from django.db import models


class Supplier(models.Model):
	name = models.CharField(max_length=255)
	contact_name = models.CharField(max_length=255, blank=True)
	email = models.EmailField(blank=True)
	phone = models.CharField(max_length=50, blank=True)
	address = models.TextField(blank=True)
	city = models.CharField(max_length=120, blank=True)
	country = models.CharField(max_length=120, blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-updated_at"]

	def __str__(self):
		return self.name
