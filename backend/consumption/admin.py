from django.contrib import admin
from .models import Upload, EnergyRecord

@admin.register(Upload)
class UploadAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")

@admin.register(EnergyRecord)
class EnergyRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "upload", "city", "energy_consumption", "date", "price")
    list_filter = ("city", "date")
