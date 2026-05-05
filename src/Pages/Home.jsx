import React, { useState, useEffect } from 'react';
import HomeSidebar from '../Components/Home/HomeSidebar';
import HomeMain from '../Components/Home/HomeMain';
import HomeRightSidebar from '../Components/Home/HomeRightSidebar';
import ActiveChat from '../Components/Home/ActiveChat';
import ChatDetailsSidebar from '../Components/Home/ChatDetailsSidebar';
import AddNewChat from '../Components/Home/AddNewChat';
import UserService from '../Services/UserService';
import SocketService from '../Services/SocketService';

const Home = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const activeChatRef = React.useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
    if (activeChat) {
      setUnreadCounts(prev => ({ ...prev, [activeChat.id]: 0 }));
    }
  }, [activeChat]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [requests, fetchedFriends] = await Promise.all([
          UserService.getFriendRequests(),
          UserService.getFriends()
        ]);
        setFriendRequests(requests);
        setFriends(fetchedFriends);
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
      if (currentActiveChatId !== msg.sender) {
         setUnreadCounts(prev => ({ ...prev, [msg.sender]: (prev[msg.sender] || 0) + 1 }));
      }
    };

    socket.on('newFriendRequest', handleNewRequest);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('newFriendRequest', handleNewRequest);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('receive_message', handleReceiveMessage);
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

  const handleSidebarChatClick = (chat) => {
    setActiveChat(chat);
    setIsAddingChat(false);
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
          <ActiveChat activeChat={activeChat} isOnline={onlineUsers.has(activeChat.id)} />
          <ChatDetailsSidebar activeChat={activeChat} onClose={() => setActiveChat(null)} />
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
