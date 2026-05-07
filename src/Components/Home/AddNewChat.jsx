import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Users, UserPlus, Plus, Globe, ChevronDown, Check } from 'lucide-react';
import UserService from '../../Services/UserService';
import MessageService from '../../Services/MessageService';

const CreateGroupWizard = ({ onClose, onGroupCreated }) => {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setGroupAvatarPreview(previewUrl);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const data = await UserService.getFriends();
        if (Array.isArray(data)) setFriends(data);
      } catch (error) {
        console.error("Failed to fetch friends", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleCreateGroup = async () => {
    setIsCreating(true);
    try {
      let avatarUrl = '';
      if (groupAvatar) {
        const uploadResult = await MessageService.uploadFile(groupAvatar);
        avatarUrl = uploadResult.fileUrl;
      }
      
      const groupData = {
        name: groupName,
        description: groupDescription,
        members: selectedMembers,
        avatar: avatarUrl
      };
      
      const createdGroup = await UserService.createGroup(groupData);
      
      if (onGroupCreated) onGroupCreated(createdGroup);
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to create group", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = friends.filter(u => 
    (u.name && u.name.toLowerCase().includes(groupSearchQuery.toLowerCase())) || 
    (u.username && u.username.toLowerCase().includes(groupSearchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Stepper Header */}
      <div className="px-16 pt-8 pb-10 shrink-0">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-100 z-0"></div>
          {[
            { num: 1, label: 'Group Info' },
            { num: 2, label: 'Add Members' },
            { num: 3, label: 'Review' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center bg-white px-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                {s.num}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'} absolute top-8 whitespace-nowrap`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="flex flex-col items-center mb-8">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center relative mb-3 cursor-pointer hover:bg-brand-primary/20 transition-colors"
            >
              {groupAvatarPreview ? (
                <img src={groupAvatarPreview} alt="Group Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Users className="w-10 h-10 text-brand-primary" />
              )}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                <div className="bg-brand-primary text-white rounded-full p-1">
                   <Plus className="w-3 h-3" />
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Group Avatar</h3>
            <p onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-primary mt-1 cursor-pointer">Click to upload image</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Group Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value.substring(0, 50))}
                  placeholder="Enter group name..." 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{groupName.length}/50</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Group Description (optional)</label>
              <div className="relative">
                <textarea 
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value.substring(0, 200))}
                  placeholder="What is this group about?" 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all resize-none h-28"
                ></textarea>
                <div className="absolute right-4 bottom-3 text-xs text-gray-400">{groupDescription.length}/200</div>
              </div>
            </div>

          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setStep(2)} 
              disabled={!groupName.trim()}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-colors ${groupName.trim() ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-8 pb-4 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Search friends to add..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
             {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors mb-2 cursor-pointer" onClick={() => toggleMember(user.id)}>
                  <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="ml-4">
                      <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-xs text-gray-500">{user.username}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMembers.includes(user.id) ? 'bg-brand-primary border-brand-primary' : 'border-gray-200'}`}>
                    {selectedMembers.includes(user.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
             ))}
             {isLoading && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Loading friends...
                </div>
             )}
             {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {friends.length === 0 ? "You need to add friends first to create a group." : "No friends found matching your search."}
                </div>
             )}
          </div>
          <div className="px-8 py-4 mt-auto border-t border-gray-100 flex justify-between shrink-0 bg-white">
            <button onClick={() => setStep(1)} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Back
            </button>
            <button onClick={() => setStep(3)} className="bg-brand-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-brand-primary/90 transition-colors">
              Next {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 flex flex-col items-center pt-8 custom-scrollbar">
             <div className="w-32 h-32 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                {groupAvatarPreview ? (
                  <img src={groupAvatarPreview} alt="Group Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Users className="w-12 h-12 text-brand-primary" />
                )}
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">{groupName}</h2>
             <p className="text-sm text-gray-500 text-center mb-8 max-w-sm">{groupDescription || 'No description provided.'}</p>
             
             <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Members ({selectedMembers.length + 1})</h3>
                <div className="flex flex-wrap gap-3">
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold shadow-sm mb-1">
                       You
                     </div>
                     <span className="text-xs font-medium text-gray-700">Admin</span>
                   </div>
                   {friends.filter(u => selectedMembers.includes(u.id)).map(user => (
                     <div key={user.id} className="flex flex-col items-center">
                       <img src={user.avatar} title={user.name} alt={user.name} className="w-12 h-12 rounded-full object-cover shadow-sm mb-1" />
                       <span className="text-xs text-gray-600 truncate w-16 text-center">{user.name.split(' ')[0]}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
          <div className="px-8 py-4 mt-auto border-t border-gray-100 flex justify-between shrink-0 bg-white">
            <button onClick={() => setStep(2)} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
              Back
            </button>
            <button 
              onClick={handleCreateGroup} 
              disabled={isCreating}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-colors ${isCreating ? 'bg-brand-primary/70 text-white cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}`}
            >
              {isCreating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AddNewChat = ({ onClose, onAddFriend, onGroupCreated, existingRequests }) => {
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
        <button onClick={activeTab === 'groups' ? () => setActiveTab('friends') : onClose} className="bg-brand-primary/5 text-brand-primary p-2 rounded-xl hover:bg-brand-primary/10 transition-colors mr-4 cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{activeTab === 'groups' ? 'Create Group' : 'Add New Chat'}</h2>
      </div>

      {activeTab === 'friends' ? (
        <>
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
        </>
      ) : (
        <CreateGroupWizard onClose={onClose} onGroupCreated={onGroupCreated} />
      )}
      
    </div>
  );
};

export default AddNewChat;
