// src/components/ChatWindow.js
import React, { useEffect, useState, useRef } from 'react';
import API from '../api.js';

export default function ChatWindow({ conversationId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await API.get(`/conversation/${conversationId}/messages/`);
            setMessages(response.data);
        };
        fetchMessages();
    }, [conversationId]);

    const sendMessage = async () => {
        if (newMessage.trim()) {
            const response = await API.post(`/conversation/${conversationId}/message/`, { content: newMessage });
            setMessages([...messages, response.data]);
            setNewMessage('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`p-2 my-2 rounded-lg max-w-xs ${msg.is_sender ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-200 text-gray-800'}`}>
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex p-4 bg-white border-t border-gray-200">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-grow border border-gray-300 rounded-lg p-2 mr-2"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
