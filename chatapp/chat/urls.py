from django.urls import path
from .views import ConversationCreateView, ConversationMessagesView, SendMessageView, MessageSeenView, RegisterUserView,  CustomAuthToken, ContactListView, UserConversationsView, UserSearchView

urlpatterns = [
    path('conversation/', ConversationCreateView.as_view(), name='conversation-create'), #working for createing conversations 
    path('conversation/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'), #working view converation between users
    path('conversation/<int:conversation_id>/message/', SendMessageView.as_view(), name='send-message'), #working for sending msg to the user
    path('message/<int:message_id>/seen/', MessageSeenView.as_view(), name='message-seen'),  #working make msg seen 
    path('register/', RegisterUserView.as_view(), name='register'), #done add users
    path('login/', CustomAuthToken.as_view(), name='login'), #done loging in 
    path('contacts/', ContactListView.as_view(), name='contact-list'), #done show all contects
    path('conversations/', UserConversationsView.as_view(), name='user-conversations'), # working, to display all converations
    path('users/search/', UserSearchView.as_view(), name='user-search'), #working  search for users
]
