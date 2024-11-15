import React, { useState, useEffect } from 'react';
import MessageInput from './MessageInput';

const ConversationView = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null); // State to store logged-in user's ID
  const [otherUserName, setOtherUserName] = useState(''); // State to store the other user's name

  useEffect(() => {
    // Get the logged-in user's ID from localStorage
    const loggedInUserId = localStorage.getItem('userId');
    setUserId(Number(loggedInUserId)); // Ensure userId is a number if needed by your API

    if (conversation) {
      // Fetch messages for the selected conversation
      fetch(`http://127.0.0.1:8000/api/conversation/${conversation.id}/messages/`, {
        headers: {
          Authorization: `token ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setMessages(data));

      // Determine the other user's name based on the logged-in user ID and conversation data
      const determineOtherUserName = () => {
        if (conversation.other_user) {
          return conversation.other_user;
        } else if (conversation.user1.id === Number(loggedInUserId)) {
          return conversation.user2.username;
        } else if (conversation.user2.id === Number(loggedInUserId)) {
          return conversation.user1.username;
        }
        return 'Unknown User'; // Fallback if no match
      };

      setOtherUserName(determineOtherUserName());
    }
  }, [conversation]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!conversation || !conversation.messages) {
    return <div className="flex items-center justify-center h-full">Select a conversation</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Display the other user's name at the top */}
      <div className="p-4 bg-gray-100 border-b text-xl font-semibold">
        {otherUserName}
      </div>

      {/* Message list */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversation.messages.map((message) => {
          const isUserMessage = message.sender === userId;
          return (
            <div
              key={message.id}
              className={`flex items-start my-2 ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`p-3 rounded-lg ${isUserMessage ? 'bg-blue-200' : 'bg-gray-200'}`}>
                <div>{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(message.created_at)}
                </div>
                <div className={`text-xs mt-1 ${message.seen ? 'text-green-500' : 'text-red-500'}`}>
                  {message.seen ? 'Seen' : 'Not Seen'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message input */}
      <MessageInput
        conversationId={conversation.id}
        onNewMessage={(msg) => setMessages([...messages, msg])}
      />
    </div>
  );
};

export default ConversationView;
