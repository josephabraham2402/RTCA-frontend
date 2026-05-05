import React from 'react';
import { Bell, Search, X, Image as ImageIcon, FileText, Link as LinkIcon, ChevronRight } from 'lucide-react';

const ChatDetailsSidebar = ({ activeChat, onClose }) => {
  if (!activeChat) return null;

  return (
    <div className="w-80 bg-gray-50 flex flex-col h-full border-l border-gray-100 flex-shrink-0">
      
      {/* Top Header */}
      <div className="h-20 p-6 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h2 className="font-semibold text-gray-900">Contact Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Profile Info */}
        <div className="flex flex-col items-center p-6 border-b border-gray-100 bg-white">
          <img src={activeChat.avatar} alt={activeChat.name} className="h-24 w-24 rounded-full object-cover mb-4 shadow-md border-4 border-white" />
          <h3 className="text-lg font-bold text-gray-900">{activeChat.name}</h3>
          <p className="text-sm text-gray-500 mb-6">{activeChat.isOnline ? 'Online' : (activeChat.isGroup ? 'Group' : 'Offline')}</p>
          
          <div className="flex space-x-3 w-full">
             <button className="flex-1 bg-gray-50 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-primary transition-colors cursor-pointer flex flex-col items-center justify-center">
               <Search className="h-4 w-4 mb-1" />
               Search
             </button>
             <button className="flex-1 bg-gray-50 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-primary transition-colors cursor-pointer flex flex-col items-center justify-center">
               <Bell className="h-4 w-4 mb-1" />
               Mute
             </button>
          </div>
        </div>

        {/* Media & Files */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Shared Media</h4>
            <button className="text-xs text-brand-primary font-medium hover:text-[#6853e0] cursor-pointer">See All</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
             <div className="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80")'}}></div>
             <div className="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80")'}}></div>
             <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center text-xs font-medium text-gray-500 shadow-sm">+12</div>
          </div>

          <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center">
                   <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3">
                     <ImageIcon className="h-4 w-4" />
                   </div>
                   <span className="text-sm font-medium text-gray-700">Images & Videos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
             </button>
             <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center">
                   <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mr-3">
                     <FileText className="h-4 w-4" />
                   </div>
                   <span className="text-sm font-medium text-gray-700">Documents</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
             </button>
             <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center">
                   <div className="h-8 w-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center mr-3">
                     <LinkIcon className="h-4 w-4" />
                   </div>
                   <span className="text-sm font-medium text-gray-700">Links</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailsSidebar;
