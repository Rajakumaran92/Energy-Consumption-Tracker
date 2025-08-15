from django.db import models
from django.contrib.auth.models import User

class Upload(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="uploads")
    file = models.FileField(upload_to="uploads/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "uploads"


    def __str__(self):
        return f"Upload {self.id} by {self.user.username} @ {self.created_at}"

class EnergyRecord(models.Model):
    upload = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name="records")
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    energy_consumption = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "energy_records"
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["date"]),
        ]
