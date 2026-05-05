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

    socket.on('newFriendRequest', handleNewRequest);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);

    return () => {
      socket.off('newFriendRequest', handleNewRequest);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
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
      <HomeSidebar activeChat={activeChat} setActiveChat={handleSidebarChatClick} friends={friends} />
      
      {activeChat ? (
        <>
          <ActiveChat activeChat={activeChat} />
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
