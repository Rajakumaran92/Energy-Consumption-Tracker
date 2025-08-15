from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Upload, EnergyRecord

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user

class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ["id", "file", "created_at"]

class EnergyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyRecord
        fields = ["name", "city", "energy_consumption", "date", "price"]
