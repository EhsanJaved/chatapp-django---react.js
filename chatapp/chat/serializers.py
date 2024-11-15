from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer for User (for user info in conversation)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

# Serializer for Conversation
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    conversation = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'created_at', 'seen']

    # To only return sender id and conversation id (in API responses)
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['sender'] = instance.sender.id
        representation['conversation'] = instance.conversation.id
        return representation

    # Update message seen status
    def update(self, instance, validated_data):
        instance.seen = validated_data.get('seen', instance.seen)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email'] 
 

class ConversationsSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'created_at', 'updated_at', 'messages']

    def get_other_user(self, obj):
        request_user = self.context['request'].user
        return obj.user2.username if obj.user1 == request_user else obj.user1.username

class ConversationSerializer(serializers.ModelSerializer):
    user1 = UserSerializer()
    user2 = UserSerializer()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'created_at', 'updated_at', 'messages']

    # To return user1 and user2 with both ids and usernames
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Add user1 and user2 information
        representation['user1'] = {
            'id': instance.user1.id,
            'username': instance.user1.username
        }
        representation['user2'] = {
            'id': instance.user2.id,
            'username': instance.user2.username
        }
        
        return representation
