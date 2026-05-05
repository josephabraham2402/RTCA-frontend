import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, UserPlus } from 'lucide-react';
import UserService from '../../Services/UserService';

const AddNewChat = ({ onClose, onAddFriend, existingRequests }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);

  const handleAdd = (user) => {
    onAddFriend(user);
    setSentRequests([...sentRequests, user.id]);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const users = await UserService.searchUsers(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Filter out users that are already in friend requests
  const availableUsers = searchResults.filter(user => 
    !existingRequests.some(req => req.email === user.email || req.id === user.id)
  );

  return (
    <div className="flex-1 bg-white flex flex-col h-full border-r border-gray-100 relative">
      
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center px-6 bg-white shrink-0">
        <button onClick={onClose} className="bg-brand-primary/5 text-brand-primary p-2 rounded-xl hover:bg-brand-primary/10 transition-colors mr-4 cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Add New Chat</h2>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-4 border-b border-gray-100 flex space-x-8 shrink-0">
        <button 
          onClick={() => setActiveTab('friends')}
          className={`pb-3 text-sm font-semibold flex items-center transition-colors cursor-pointer border-b-2 ${activeTab === 'friends' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friends
        </button>
        <button 
          onClick={() => setActiveTab('groups')}
          className={`pb-3 text-sm font-semibold flex items-center transition-colors cursor-pointer border-b-2 ${activeTab === 'groups' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="h-4 w-4 mr-2" />
          Create Group
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-8 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, email or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
        <h3 className="text-xs font-semibold text-gray-500 mb-4">Search results</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Searching...
            </div>
          ) : (
            <>
              {availableUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="ml-4">
                      <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-xs text-brand-primary">{user.username}</p>
                    </div>
                  </div>
                  {sentRequests.includes(user.id) ? (
                    <button 
                      disabled
                      className="border border-gray-200 text-gray-400 bg-gray-50 font-medium py-1.5 px-6 rounded-lg text-sm cursor-not-allowed"
                    >
                      Sent
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAdd(user)}
                      className="border border-brand-primary/30 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 hover:border-brand-primary/50 font-medium py-1.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
              {availableUsers.length === 0 && searchQuery.trim() !== '' && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No users found matching your search.
                </div>
              )}
              {availableUsers.length === 0 && searchQuery.trim() === '' && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Type a name or email to search for friends.
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AddNewChat;
