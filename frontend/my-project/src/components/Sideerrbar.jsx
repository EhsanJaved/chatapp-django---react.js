// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const Sidebar = ({ onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setUsers([]);  // Clear users when search query is empty
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await Axios.get(`http://localhost:8000/api/search/${searchQuery}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,  // Add token for authentication
          },
        });
        setUsers(response.data);  // Update the users state with search results
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery]); // Run this effect when searchQuery changes

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);  // Update searchQuery as user types
  };

  return (
    <div className="w-1/3 h-full bg-gray-100 border-r border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}  // Update searchQuery on input change
          placeholder="Search or start new chat"
          className="w-full p-2 bg-white border border-gray-300 rounded-md"
        />
      </div>
      <div className="overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>  // Show loading indicator while fetching
        ) : users.length === 0 && searchQuery.trim() !== '' ? (
          <p className="text-center text-gray-500">No users found</p>  // Show when no users are found
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}  // Trigger onSelectUser callback when a user is clicked
              className="flex items-center p-4 cursor-pointer hover:bg-gray-200"
            >
              {/* Profile Image Placeholder */}
              <div className="h-10 w-10 rounded-full bg-gray-400 mr-4">
                {user.profile_picture && (
                  <img src={user.profile_picture} alt={user.username} className="h-full w-full rounded-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-gray-500">Last message...</p>  {/* Placeholder for last message */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
