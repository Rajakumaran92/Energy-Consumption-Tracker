from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UploadCSVView, ProcessedDataView, UploadSummaryView, CustomTokenObtainPairView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("upload-csv/", UploadCSVView.as_view(), name="upload_csv"),
    path("processed-data/", ProcessedDataView.as_view(), name="processed_data"),
    path("upload-summary/", UploadSummaryView.as_view(), name="upload_summary"),
]
