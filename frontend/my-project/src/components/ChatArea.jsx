import React, { useState, useEffect } from 'react';
import axios from 'axios'; // You can import your custom axios hook if needed

const ChatArea = ({ messages, onSendMessage, loading, userProfile, conversationId, userSelect }) => {
  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);

  // Fetch messages on component mount or when conversationId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get-messages/${userSelect}/`);
        setConversationMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      // Send the message to the backend
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('conversation', conversationId);
      formData.append('sender', userProfile.id); // assuming userProfile contains user info

      try {
        await axios.post('http://127.0.0.1:8000/api/send-messages/', formData);
        setNewMessage('');  // Reset the message input
        // Fetch the updated messages after sending
        const response = await axios.get(`http://127.0.0.1:8000/api/get-inbox/${conversationId}/`);
        setConversationMessages(response.data);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          <div>
            {conversationMessages.map((message) => (
              <div key={message.id} className="my-2">
                <div className="flex items-start">
                  {/* Display Profile Image */}
                  <img
                    src={message.sender_profile.image} // Assuming the profile image URL
                    alt={message.sender_profile.full_name}
                    className="rounded-circle mr-2"
                    width={40}
                    height={40}
                  />
                  <div className="ml-2">
                    <div className="font-bold">{message.sender_profile.full_name}</div>
                    <div>{message.message}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="border p-2 flex-1 rounded-md"
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
