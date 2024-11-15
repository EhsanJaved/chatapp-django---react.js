import React, { useState, useEffect } from 'react';

const Sidebar = ({ onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const userId = parseInt(localStorage.getItem('userId'), 10); // Get the user ID from local storage
  
  // Fetch all existing conversations
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/conversations/', {
      headers: {
        Authorization: `token ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setConversations(data));
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    // Fetch search results from API
    if (e.target.value) {
      fetch(`http://127.0.0.1:8000/api/users/search/?q=${e.target.value}`, {
        headers: {
          Authorization: `token ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setSearchResults(data))
    } else {
      setSearchResults([]);
    }
  };

  // Start or open conversation with selected user
  const handleStartConversation = (user) => {
    fetch('http://127.0.0.1:8000/api/conversation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ user2: user.id }),
    })
      .then((response) => response.json())
      .then((conversation) => {
        console.log(conversation);
        
        // Pass the conversation data to open in chat area
        onSelectConversation(conversation); // need this
        setSearchResults([]);
        setSearchQuery('');
      })
      .catch((error) => console.error('Error creating conversation:', error));
  };

  // Mark messages as seen
  const markMessagesAsSeen = (messages) => {
    messages.forEach((message) => {
      if (!message.seen && message.sender !== userId) {
        fetch(`http://127.0.0.1:8000/api/message/${message.id}/seen/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${localStorage.getItem('token')}`,
          },
        }).catch((error) => console.error('Error marking message as seen:', error));
      }
    });
  };

  return (
    <div className="sidebar">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Display either search results or conversations */}
      <div className="overflow-y-auto">
        {searchResults.length > 0
          ? searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleStartConversation(user)}
                className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-200"
              >
                <img src="https://via.placeholder.com/40" alt="User Avatar" className="rounded-full mr-4" />
                <div>
                  <p className="font-bold">{user.username}</p>
                </div>
              </div>
            ))
          : conversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const unseenMessagesCount = conversation.messages.filter(
                message => !message.seen && message.sender !== userId
              ).length;

              const handleClick = () => {
                // Mark all messages as seen
                markMessagesAsSeen(conversation.messages);
                // Select the conversation
                onSelectConversation(conversation);
              };

              return (
                <div
                  key={conversation.id}
                  onClick={handleClick}
                  className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-200"
                >
                  <img src="https://via.placeholder.com/40" alt="User Avatar" className="rounded-full mr-4" />
                  <div className="flex-grow">
                    <p className="font-bold">{conversation.other_user}</p>
                    <p className="text-sm text-gray-600">{lastMessage?.content || 'No Msgs'}</p>
                  </div>
                  {unseenMessagesCount > 0 && (
                    <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {unseenMessagesCount}
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default Sidebar;
