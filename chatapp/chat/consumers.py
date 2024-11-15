from djangochannelsrestframework.consumers import AsyncAPIConsumer
from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, MessageSerializer  # Ensure serializers are correct

class ChatConsumer(AsyncAPIConsumer):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    async def connect(self):
        # Handle WebSocket connection setup
        self.accept()

    async def disconnect(self, close_code):
        # Handle WebSocket disconnection
        pass

    async def receive(self, text_data):
        # Handle received WebSocket messages (actions like create_conversation, send_message, etc.)
        data = text_data  # Assuming this is a JSON message

        if data.get("action") == "create_conversation":
            await self.create_conversation(data["conversation_data"])

        elif data.get("action") == "send_message":
            await self.send_message(data["message_data"])

        elif data.get("action") == "mark_seen":
            await self.mark_seen(data["message_id"])

    async def create_conversation(self, conversation_data):
        # Custom logic for creating a conversation
        conversation = await self.create_object(conversation_data)
        await self.broadcast(conversation)

    async def send_message(self, message_data):
        # Custom logic for sending a message
        message = await self.create_object(message_data, serializer_class=MessageSerializer)
        await self.broadcast(message)

    async def mark_seen(self, message_id):
        # Logic to mark a message as seen
        message = await ChatMessage.objects.get(id=message_id)
        message.seen = True
        await message.save()
        await self.broadcast({"message_id": message_id, "seen": True})
