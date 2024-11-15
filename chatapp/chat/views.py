from django.db.models import Q
from .models import *
from .serializers import *
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated

User =  get_user_model()

# Create a conversation between two users
class ConversationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user1 = request.user  # The logged-in user (can be either user1 or user2)
        user2_id = request.data.get('user2')  # ID of the other user in the conversation

        if not user2_id:
            return Response({"error": "User2 is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user2 = User.objects.get(id=user2_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if a conversation already exists between user1 and user2
        existing_conversation = Conversation.objects.filter(
            Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)
        ).first()

        if existing_conversation:
            # If conversation exists, return the existing conversation
            serializer = ConversationSerializer(existing_conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)  # change required at here

        # Create a new conversation if one does not exist
        conversation = Conversation.objects.create(user1=user1, user2=user2)
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
# Retrieve messages from a specific conversation
class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id, *args, **kwargs):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the requesting user is part of the conversation
        if request.user not in [conversation.user1, conversation.user2]:
            return Response({"error": "You are not a participant in this conversation"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(conversation=conversation).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

# Send a new message to a conversation
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id, *args, **kwargs):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the requesting user is part of the conversation
        if request.user not in [conversation.user1, conversation.user2]:
            return Response({"error": "You are not a participant in this conversation"}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content')
        if not content:
            return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the new message
        message = Message.objects.create(conversation=conversation, sender=request.user, content=content)
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Update message seen status
class MessageSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id, *args, **kwargs):
        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the requesting user is part of the conversation
        if request.user != message.conversation.user1 and request.user != message.conversation.user2:
            return Response({"error": "You are not a participant in this conversation"}, status=status.HTTP_403_FORBIDDEN)

        # Mark the message as seen
        message.seen = True
        message.save()
        serializer = MessageSerializer(message)
        return Response(serializer.data)


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        user_id = token.user.id
        return Response({'token': token.key, 'userId': user_id})

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)

class ContactListView(generics.ListAPIView):
    """
    List all users except the current user.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Exclude the current user to show as contacts
        return User.objects.exclude(id=self.request.user.id)

class UserConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            models.Q(user1=request.user) | models.Q(user2=request.user)
        ).distinct()
        
        serializer = ConversationsSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)
    
class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the query parameter from the request
        query = request.query_params.get('q', '')

        if not query:
            return Response({"error": "Query parameter 'q' is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Search for users by username or other attributes as needed
        users = User.objects.filter(username__icontains=query)  # Adjust the field for your needs
        serializer = UserSerializer(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)