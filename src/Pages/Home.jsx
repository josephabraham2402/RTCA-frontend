import React, { useState, useEffect } from 'react';
import HomeSidebar from '../Components/Home/HomeSidebar';
import HomeMain from '../Components/Home/HomeMain';
import HomeRightSidebar from '../Components/Home/HomeRightSidebar';
import ActiveChat from '../Components/Home/ActiveChat';
import SharedMediaView from '../Components/Home/SharedMediaView';
import ChatDetailsSidebar from '../Components/Home/ChatDetailsSidebar';
import AddNewChat from '../Components/Home/AddNewChat';
import UserService from '../Services/UserService';
import SocketService from '../Services/SocketService';

const Home = () => {
  const [activeChat, setActiveChat] = useState(() => {
    const saved = sessionStorage.getItem('activeChat');
    return saved ? JSON.parse(saved) : null;
  });
  const [mediaViewTab, setMediaViewTab] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mutedChats, setMutedChats] = useState([]);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const activeChatRef = React.useRef(null);
  const mutedChatsRef = React.useRef(mutedChats);

  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat) {
      setUnreadCounts(prev => ({ ...prev, [activeChat.id]: 0 }));
    }
  }, [activeChat]);

  useEffect(() => {
    mutedChatsRef.current = mutedChats;
  }, [mutedChats]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [requests, fetchedFriends, fetchedMuted] = await Promise.all([
          UserService.getFriendRequests(),
          UserService.getFriends(),
          UserService.getMutedChats()
        ]);
        setFriendRequests(requests);
        setFriends(fetchedFriends);
        setMutedChats(fetchedMuted);
      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };
    fetchInitialData();

    // Socket real-time listeners
    const socket = SocketService.connect();
    
    const handleNewRequest = (newRequest) => {
      setFriendRequests(prevRequests => {
        if (!prevRequests.some(req => req.id === newRequest.id)) {
          return [newRequest, ...prevRequests];
        }
        return prevRequests;
      });
    };

    const handleFriendRequestAccepted = (newFriend) => {
      setFriends(prev => {
        if (!prev.some(f => f.id === newFriend.id)) {
          return [...prev, newFriend];
        }
        return prev;
      });
    };

    const handleOnlineUsers = (users) => setOnlineUsers(new Set(users));
    const handleUserOnline = (userId) => setOnlineUsers(prev => new Set([...prev, userId]));
    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleReceiveMessage = (msg) => {
      const currentActiveChatId = activeChatRef.current?.id;
      if (currentActiveChatId !== msg.sender && !mutedChatsRef.current.includes(msg.sender)) {
         setUnreadCounts(prev => ({ ...prev, [msg.sender]: (prev[msg.sender] || 0) + 1 }));
      }
    };

    const handleFriendRemovalOrBlock = (userId) => {
      setFriends(prev => prev.filter(f => f.id !== userId));
      if (activeChatRef.current?.id === userId) {
        handleSetActiveChat(null);
      }
    };

    socket.on('newFriendRequest', handleNewRequest);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('friend_removed', handleFriendRemovalOrBlock);
    socket.on('user_blocked', handleFriendRemovalOrBlock);

    return () => {
      socket.off('newFriendRequest', handleNewRequest);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('friend_removed', handleFriendRemovalOrBlock);
      socket.off('user_blocked', handleFriendRemovalOrBlock);
    };
  }, []);

  const handleAddFriend = async (user) => {
    try {
      await UserService.sendFriendRequest(user.id);
      // Request sent to backend. The target user will see it on their screen when they refresh.
    } catch (error) {
      console.error("Failed to send friend request", error);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      const response = await UserService.respondFriendRequest(requestId, status);
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      if (status === 'accept') {
        setFriends(prev => [...prev, response.user]);
      }
    } catch (error) {
      console.error("Failed to respond to request", error);
    }
  };

  const handleSetActiveChat = (chat) => {
    setActiveChat(chat);
    setMediaViewTab(null);
    setIsSearching(false);
    if (chat) {
      sessionStorage.setItem('activeChat', JSON.stringify(chat));
    } else {
      sessionStorage.removeItem('activeChat');
    }
  };

  const handleSidebarChatClick = (chat) => {
    handleSetActiveChat(chat);
    setIsAddingChat(false);
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await UserService.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      if (activeChat?.id === friendId) {
        handleSetActiveChat(null);
      }
    } catch (error) {
      console.error("Failed to remove friend", error);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await UserService.blockUser(userId);
      setFriends(prev => prev.filter(f => f.id !== userId));
      if (activeChat?.id === userId) {
        handleSetActiveChat(null);
      }
    } catch (error) {
      console.error("Failed to block user", error);
    }
  };

  const handleToggleMute = async (chatId) => {
    try {
      const data = await UserService.toggleMute(chatId);
      setMutedChats(data.mutedChats);
    } catch (error) {
      console.error("Failed to toggle mute", error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-gray-900">
      <HomeSidebar 
        activeChat={activeChat} 
        setActiveChat={handleSidebarChatClick} 
        friends={friends} 
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
      />
      
      {activeChat ? (
        <>
          {mediaViewTab ? (
            <SharedMediaView 
              activeChat={activeChat} 
              initialTab={mediaViewTab} 
              onBack={() => setMediaViewTab(null)} 
            />
          ) : (
            <ActiveChat 
              activeChat={activeChat} 
              isOnline={onlineUsers.has(activeChat.id)} 
              isSearching={isSearching}
              onCloseSearch={() => setIsSearching(false)}
              onCloseChat={() => handleSetActiveChat(null)}
              onRemoveFriend={() => handleRemoveFriend(activeChat.id)}
              onBlockUser={() => handleBlockUser(activeChat.id)}
            />
          )}
          <ChatDetailsSidebar 
            activeChat={activeChat} 
            isOnline={onlineUsers.has(activeChat.id)} 
            isMuted={mutedChats.includes(activeChat.id)}
            onToggleMute={() => handleToggleMute(activeChat.id)}
            onSearchClick={() => setIsSearching(true)}
            onClose={() => handleSetActiveChat(null)} 
            onViewMedia={(tab) => setMediaViewTab(tab)}
          />
        </>
      ) : isAddingChat ? (
        <>
          <AddNewChat 
            onClose={() => setIsAddingChat(false)} 
            onAddFriend={handleAddFriend}
            existingRequests={friendRequests}
          />
          <HomeRightSidebar 
            friendRequests={friendRequests}
            onNewChatClick={() => setIsAddingChat(true)}
            onRespondRequest={handleRespondRequest}
          />
        </>
      ) : (
        <>
          <HomeMain />
          <HomeRightSidebar 
            friendRequests={friendRequests}
            onNewChatClick={() => setIsAddingChat(true)}
            onRespondRequest={handleRespondRequest}
          />
        </>
      )}
    </div>
  );
};

export default Home;
