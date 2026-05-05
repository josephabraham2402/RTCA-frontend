import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send, Smile, Check, CheckCheck } from 'lucide-react';
import MessageService from '../../Services/MessageService';
import SocketService from '../../Services/SocketService';
import AuthService from '../../Services/AuthService';
import { encryptMessage, decryptMessage } from '../../utils/encryption';

const ActiveChat = ({ activeChat, isOnline }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const currentUser = AuthService.getCurrentUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const data = await MessageService.getMessages(activeChat.id);
        setMessages(data);
        
        // Mark as seen
        const unseenIds = data
          .filter(m => m.sender !== currentUser.id && m.status !== 'seen')
          .map(m => m._id);
          
        if (unseenIds.length > 0) {
          await MessageService.markAsSeen(unseenIds, activeChat.id);
          const socket = SocketService.getSocket();
          socket.emit('mark_seen', { 
            messageIds: unseenIds, 
            senderId: activeChat.id, 
            receiverId: currentUser.id 
          });
        }
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };

    fetchMessages();

    const socket = SocketService.getSocket();
    
    const handleReceiveMessage = (msg) => {
      if (msg.sender === activeChat.id || msg.receiver === activeChat.id) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        
        if (msg.sender === activeChat.id) {
          MessageService.markAsSeen([msg._id], activeChat.id);
          socket.emit('mark_seen', { 
            messageIds: [msg._id], 
            senderId: activeChat.id, 
            receiverId: currentUser.id 
          });
        }
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiver === activeChat.id) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    };

    const handleMessagesSeen = ({ messageIds }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m._id) ? { ...m, status: 'seen' } : m));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('messages_seen', handleMessagesSeen);
    };
  }, [activeChat, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const encryptedText = encryptMessage(inputText, currentUser.id, activeChat.id);

    const socket = SocketService.getSocket();
    socket.emit('send_message', {
      sender: currentUser.id,
      receiver: activeChat.id,
      text: encryptedText
    });
    
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!activeChat) return null;

  return (
    <div className="flex-1 bg-white flex flex-col h-full border-r border-gray-100">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center">
          <img src={activeChat.avatar} alt={activeChat.name} className="h-10 w-10 rounded-full object-cover bg-gray-200" />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
            <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {activeChat.isGroup ? 'Group Chat' : (isOnline ? 'Online' : 'Offline')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><Phone className="h-5 w-5" /></button>
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><Video className="h-5 w-5" /></button>
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><MoreVertical className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar flex flex-col">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => {
            const isMine = msg.sender === currentUser.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={msg._id || index} className={`flex items-end ${isMine ? 'justify-end' : ''}`}>
                {!isMine && (
                  <img src={activeChat.avatar} className="h-8 w-8 rounded-full object-cover mb-1 mr-2 bg-gray-200" alt="Avatar" />
                )}
                <div className={`${isMine ? 'bg-brand-primary rounded-br-sm' : 'bg-white border border-gray-100 rounded-bl-sm'} rounded-2xl px-4 py-3 max-w-md shadow-sm`}>
                  <p className={`text-sm ${isMine ? 'text-white' : 'text-gray-800'}`}>
                    {decryptMessage(msg.text, currentUser.id, activeChat.id)}
                  </p>
                  <div className={`flex items-center justify-end space-x-1 mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{time}</span>
                    {isMine && (
                      msg.status === 'sent' ? <Check className="h-3 w-3" /> :
                      msg.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                      msg.status === 'seen' ? <CheckCheck className="h-3 w-3 text-blue-300" /> : null
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
          <button className="text-gray-400 hover:text-gray-600 transition-colors mr-3 cursor-pointer">
            <Smile className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors mr-3 cursor-pointer">
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 py-1"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-brand-primary text-white h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#6853e0] transition-colors ml-2 cursor-pointer shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveChat;
