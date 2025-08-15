from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
import logging

logger = logging.getLogger(__name__)

class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads the access token from HTTP-only cookies
    instead of the Authorization header.
    """
    
    def authenticate(self, request):
        # Debug logging
        logger.info(f"Authentication attempt for path: {request.path}")
        logger.info(f"Available cookies: {list(request.COOKIES.keys())}")
        
        # Try to get token from cookie first
        raw_token = request.COOKIES.get('access_token')
        
        if raw_token is None:
            logger.info("No access_token cookie found, trying header-based auth")
            # Fallback to header-based authentication
            return super().authenticate(request)
        
        logger.info("Found access_token cookie, validating...")
        
        try:
            # Validate the token using AccessToken directly
            validated_token = AccessToken(raw_token)
            user = self.get_user(validated_token)
            logger.info(f"Authentication successful for user: {user.username}")
            return (user, validated_token)
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            return None