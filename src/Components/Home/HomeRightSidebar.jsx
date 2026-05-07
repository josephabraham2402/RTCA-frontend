import React from 'react';
import { Bell, Settings, Check, X, Trash2, Phone, PhoneOutgoing, PhoneMissed, MessageSquarePlus, ChevronRight } from 'lucide-react';
import { mockCallLogs } from '../../mockData';

const HomeRightSidebar = ({ friendRequests, onNewChatClick, onRespondRequest }) => {
  return (
    <div className="w-95 bg-gray-50 flex flex-col h-full border-l border-gray-100 flex-shrink-0">
      
      {/* Top Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center text-brand-primary">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
             <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
          <button className="flex items-center hover:text-brand-primary transition-colors cursor-pointer">
            <Settings className="h-4 w-4 mr-1" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scrollbar">
        
        {/* Friend Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Friend Requests</h3>
            <span className="bg-brand-primary text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
              {friendRequests.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                No new friend requests.
              </div>
            ) : (
              friendRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={req.avatar} alt={req.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{req.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onRespondRequest(req.id, 'accept')}
                      className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onRespondRequest(req.id, 'reject')}
                      className="h-7 w-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {friendRequests.length > 0 && (
            <button className="mt-5 text-sm text-brand-primary hover:text-[#6853e0] font-medium flex items-center transition-colors cursor-pointer w-full justify-between">
              <span>View all requests</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Call Logs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-900">Call Logs</h3>
            </div>
            <button className="text-sm text-brand-primary hover:text-[#6853e0] font-medium transition-colors cursor-pointer">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {mockCallLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={log.avatar} alt={log.name} className="h-10 w-10 rounded-full object-cover" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{log.name}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      {log.type === 'outgoing' ? (
                        <>
                          <PhoneOutgoing className="h-3 w-3 text-green-500 mr-1" />
                          <span>Outgoing call</span>
                        </>
                      ) : (
                        <>
                          <PhoneMissed className="h-3 w-3 text-red-500 mr-1" />
                          <span>Missed call</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">{log.time}</p>
                  <p className="text-xs text-gray-400">{log.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6">
        <button 
          onClick={onNewChatClick}
          className="w-full bg-brand-primary hover:bg-[#6853e0] text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        >
          <MessageSquarePlus className="h-5 w-5 mr-2" />
          New Chat
        </button>
      </div>
    </div>
  );
};

export default HomeRightSidebar;
