import React from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send, Smile } from 'lucide-react';

const ActiveChat = ({ activeChat }) => {
  if (!activeChat) return null;

  return (
    <div className="flex-1 bg-white flex flex-col h-full border-r border-gray-100">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center">
          <img src={activeChat.avatar} alt={activeChat.name} className="h-10 w-10 rounded-full object-cover" />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
            <p className="text-xs text-green-500">{activeChat.isOnline ? 'Online' : (activeChat.isGroup ? 'Group Chat' : 'Offline')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><Phone className="h-5 w-5" /></button>
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><Video className="h-5 w-5" /></button>
          <button className="hover:text-brand-primary transition-colors cursor-pointer"><MoreVertical className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar flex flex-col justify-end">
        {/* Placeholder for messages */}
        <div className="text-center text-xs text-gray-400 my-4">Today</div>
        
        <div className="flex flex-col space-y-4">
          {/* Receiver Message */}
          <div className="flex items-end">
            <img src={activeChat.avatar} className="h-8 w-8 rounded-full object-cover mb-1 mr-2" alt="Avatar" />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-md shadow-sm">
              <p className="text-sm text-gray-800">{activeChat.message}</p>
              <span className="text-[10px] text-gray-400 mt-1 block">{activeChat.time}</span>
            </div>
          </div>
          
          {/* Sender Message */}
          <div className="flex items-end justify-end">
            <div className="bg-brand-primary rounded-2xl rounded-br-sm px-4 py-3 max-w-md shadow-sm">
              <p className="text-sm text-white">That sounds great! Let's do it.</p>
              <span className="text-[10px] text-white/70 mt-1 block text-right">Just now</span>
            </div>
          </div>
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
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 py-1"
          />
          <button className="bg-brand-primary text-white h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#6853e0] transition-colors ml-2 cursor-pointer shadow-sm">
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveChat;
