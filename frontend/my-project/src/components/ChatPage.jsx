import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { senderId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchConversation = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/get-inbox/${senderId}/${receiverId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };
    fetchConversation();
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:8000/send-messages/',
        { sender: senderId, receiver: receiverId, message: newMessage },
        { headers: { Authorization: `Token ${token}` } }
      );
      setNewMessage('');
      // Re-fetch messages to update the conversation
      fetchConversation();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg) => (
          <p key={msg.id}>{msg.message}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatPage;
