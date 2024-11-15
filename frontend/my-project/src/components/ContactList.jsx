import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ContactList = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/contacts/', {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`, // Use your authentication token here
          },
        });
        console.log(response.data);
        
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="p-4 border-r">
      <h2 className="text-lg font-semibold">Contacts</h2>
      <ul className="mt-4">
        {contacts.map(contact => (
          <li key={contact.id} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => onSelectContact(contact)}>
            {contact.username} {/* Adjust this to your user field */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
