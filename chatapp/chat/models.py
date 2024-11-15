from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    # Foreign keys to represent the two users in the conversation
    user1 = models.ForeignKey(User, related_name='conversation_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='conversation_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the conversation is created
    updated_at = models.DateTimeField(auto_now=True)      # Timestamp when the conversation is updated

    def __str__(self):
        return f"Conversation between {self.user1.username} and {self.user2.username}"

class Message(models.Model):
    # ForeignKey to Conversation to relate messages to a specific conversation
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)  # The user who sent the message
    content = models.TextField()  # The content of the message
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the message was created
    seen = models.BooleanField(default=False)  # Whether the message has been seen by the recipient

    def __str__(self):
        return f"Message from {self.sender.username} in conversation with {self.conversation.user2.username if self.sender == self.conversation.user1 else self.conversation.user1.username}"
