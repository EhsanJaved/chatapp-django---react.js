# chat/routing.py
from django.urls import path
from .consumers import ChatConsumer  # Import your WebSocket consumer

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/', ChatConsumer.as_asgi()),  # WebSocket route
]
