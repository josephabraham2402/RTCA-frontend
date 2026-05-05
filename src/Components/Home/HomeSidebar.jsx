import React, { useState } from 'react';
import { Search, Plus, Filter, Settings, ChevronDown } from 'lucide-react';
import { mockChats } from '../../mockData';

const HomeSidebar = ({ activeChat, setActiveChat, friends = [], onlineUsers, unreadCounts }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = friends.filter(friend => {
    if (!friend) return false;
    
    const isGroup = friend.isGroup === true;
    if (filter === 'Friends' && isGroup) return false;
    if (filter === 'Groups' && !isGroup) return false;

    const nameMatch = friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const usernameMatch = friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return nameMatch || usernameMatch;
  });

  return (
    <div className="w-80 bg-white flex flex-col h-full border-r border-gray-100 flex-shrink-0">
      {/* Header Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-400 font-medium border border-gray-200 rounded px-1">⌘K</span>
          </div>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex space-x-2">
          {['All', 'Friends', 'Groups'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${filter === f ? 'bg-brand-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        
      </div>

      {/* List Header */}
      <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
        <span>Friends / Groups</span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-1">
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-6 text-center">
            <p>
              {searchTerm 
                ? `No ${filter === 'Groups' ? 'groups' : filter === 'Friends' ? 'friends' : 'chats'} found matching your search.` 
                : `No ${filter === 'Groups' ? 'groups' : filter === 'Friends' ? 'friends' : 'chats'} available.`}
            </p>
            {!searchTerm && filter !== 'Groups' && (
              <p className="mt-1 text-xs">Click "New Chat" to find and add friends!</p>
            )}
          </div>
        ) : (
          filteredFriends.map(friend => (
            <div
              key={friend.id}
              onClick={() => setActiveChat(friend)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-colors relative group ${activeChat?.id === friend.id ? 'bg-brand-primary/5 border-l-4 border-brand-primary pl-3' : 'hover:bg-gray-50 border-l-4 border-transparent pl-3'}`}
            >
              <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="h-10 w-10 rounded-full object-cover bg-gray-200" />
                {onlineUsers?.has(friend.id) && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{friend.name}</h4>
                  {unreadCounts?.[friend.id] > 0 && (
                    <span className="bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCounts[friend.id]}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${unreadCounts?.[friend.id] > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {friend.username}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default HomeSidebar;
