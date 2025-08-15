from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access = response.data.get('access')
        refresh = response.data.get('refresh')
        # Set cookies as before
        if access:
            response.set_cookie(
                key='access_token',
                value=access,
                httponly=True,
                samesite='Lax',
                secure=False
            )
        if refresh:
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                samesite='Lax',
                secure=False
            )
        # Remove tokens from response body
        response.data = {'detail': 'Login successful'}
        return response
import io, csv
from datetime import datetime
import pandas as pd
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Upload, EnergyRecord
from .serializers import RegisterSerializer, UploadSerializer, EnergyRecordSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UploadCSVView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "No file provided with key 'file'."}, status=400)

        # Save Upload model first
        upload = Upload.objects.create(user=request.user, file=file_obj)

        # Read CSV using pandas for validation + speed
        try:
            df = pd.read_csv(upload.file.path, header=0)
        except Exception as e:
            upload.delete()
            return Response({"detail": f"Invalid CSV: {e}"}, status=400)

        # Validate row count
        if not (100 <= len(df) <= 200):
            upload.delete()
            return Response({"detail": "CSV must contain between 100 and 200 rows."}, status=400)

        # Basic schema validation
        try:
            df["name"] = df["name"].astype(str).str.strip()
            df["city"] = df["city"].astype(str).str.strip()
            df["energy_consumption"] = pd.to_numeric(df["energy_consumption"], errors="raise")
            # parse date (YYYY-MM-DD expected)
            df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d").dt.date
            df["price"] = pd.to_numeric(df["price"], errors="raise")
        except Exception as e:
            upload.delete()
            return Response({"detail": f"Schema validation failed: {e}"}, status=400)

        # Bulk create EnergyRecord
        records = [
            EnergyRecord(
                upload=upload,
                name=row["name"],
                city=row["city"],
                energy_consumption=row["energy_consumption"],
                date=row["date"],
                price=row["price"],
            )
            for _, row in df.iterrows()
        ]
        EnergyRecord.objects.bulk_create(records, batch_size=1000)

        return Response({"detail": "Upload successful", "upload_id": upload.id}, status=201)

class ProcessedDataView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        latest = Upload.objects.filter(user=request.user).order_by("-created_at").first()
        if not latest:
            return Response({"detail": "No uploads found."}, status=404)
        qs = latest.records.all().values("name","city","energy_consumption","date","price")
        return Response(list(qs), status=200)

class UploadSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        uploads = Upload.objects.filter(user=request.user)
        total_uploads = uploads.count()
        if total_uploads == 0:
            return Response({
                "total_uploads": 0,
                "total_rows": 0,
                "avg_energy_consumption": 0,
            })
        latest = uploads.order_by("-created_at").first()
        total_rows = EnergyRecord.objects.filter(upload__in=uploads).count()
        from django.db.models import Avg
        avg_consumption = EnergyRecord.objects.filter(upload=latest).aggregate(avg=Avg("energy_consumption"))["avg"] or 0
        return Response({
            "total_uploads": total_uploads,
            "total_rows": total_rows,
            "latest_upload_id": latest.id,
            "avg_energy_consumption": float(avg_consumption),
        })
