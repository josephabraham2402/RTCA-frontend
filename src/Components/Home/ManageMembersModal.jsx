import React, { useState } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import UserService from '../../Services/UserService';

const ManageMembersModal = ({ activeChat, friends, onClose, onUpdateGroup, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // friends who are not currently members
  const availableFriends = friends.filter(f => !activeChat.members.some(m => m._id === f.id || m === f.id));
  
  const filteredFriends = availableFriends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async (userId) => {
    try {
      setIsLoading(true);
      const updatedGroup = await UserService.addGroupMembers(activeChat.id, userId);
      onUpdateGroup(updatedGroup);
    } catch (error) {
      console.error("Failed to add member", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setIsLoading(true);
      const updatedGroup = await UserService.removeGroupMember(activeChat.id, memberId);
      onUpdateGroup(updatedGroup);
    } catch (error) {
      console.error("Failed to remove member", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = (userId) => {
      if (!activeChat.admin) return false;
      const adminId = typeof activeChat.admin === 'object' ? (activeChat.admin._id || activeChat.admin.id) : activeChat.admin;
      return String(adminId) === String(userId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Manage Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-gray-50 p-1.5 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              Current Members ({activeChat.members.length})
            </h3>
            <div className="space-y-3">
              {activeChat.members.map(member => {
                const memberId = typeof member === 'object' ? (member._id || member.id) : member;
                const isMemberAdmin = isAdmin(memberId);
                const getAvatarUrl = (u) => {
                    if (u?.avatar) {
                        if (u.avatar.startsWith('http') || u.avatar.startsWith('blob')) return u.avatar;
                        return `http://localhost:5000${u.avatar}`;
                    }
                    const name = u?.name || u?.email || 'U';
                    return `https://ui-avatars.com/api/?name=${name.charAt(0)}&background=random`;
                };
                return (
                  <div key={memberId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={getAvatarUrl(member)} alt={member?.name || 'Member'} className="h-10 w-10 rounded-full object-cover bg-gray-100" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{member?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{isMemberAdmin ? 'Admin' : 'Member'}</p>
                      </div>
                    </div>
                    {/* Admin can remove others, but cannot remove themselves */}
                    {!isMemberAdmin && isAdmin(currentUser?.id) && (
                      <button 
                        onClick={() => handleRemoveMember(memberId)}
                        disabled={isLoading}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Friends</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-3">
              {filteredFriends.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No friends found to add.</p>
              ) : (
                filteredFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.name?.charAt(0)}&background=random`} alt={friend.name} className="h-10 w-10 rounded-full object-cover bg-gray-100" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(friend.id)}
                      disabled={isLoading}
                      className="text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full transition-colors cursor-pointer"
                      title="Add to Group"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
