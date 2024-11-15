// src/components/Chat.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Chat = ({ selectedContact, conversationId }) => { // Accept conversationId as a prop
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/conversations/${conversationId}/messages/`, // Use the conversation ID
            { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
          );
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedContact, conversationId]); // Include conversationId in dependencies

 // src/components/Chat.js
const handleSendMessage = async () => {
    if (!conversationId) {
      console.error("Conversation ID is not set.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/conversations/${conversationId}/messages/`,
        { conversation: conversationId, text: newMessage },
        { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
      );
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <div className="w-3/4 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold">
        {selectedContact ? selectedContact.username : 'Select a contact'}
      </h2>
      <div className="flex-1 overflow-y-auto border-b mt-4">
        {messages.map(message => (
          <div key={message.id} className={`my-2 ${message.sender.id === selectedContact.id ? 'text-right' : 'text-left'}`}>
            <span className="inline-block p-2 bg-gray-200 rounded-lg">
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 border p-2 rounded-l-lg"
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded-r-lg">Send</button>
      </div>
    </div>
  );
};

export default Chat;
