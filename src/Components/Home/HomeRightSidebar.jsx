import { Settings, Check, X, MessageSquarePlus, ChevronRight } from 'lucide-react';
import logo from '../../Assests/logo.png';

const HomeRightSidebar = ({ friendRequests, onNewChatClick, onRespondRequest, onSettingsClick }) => {
  return (
    <div className="w-95 bg-gray-50 flex flex-col h-full border-l border-gray-100 flex-shrink-0">

      {/* Top Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center text-brand-primary">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium">
          <button
            onClick={onSettingsClick}
            className="flex items-center hover:text-brand-primary transition-colors cursor-pointer"
          >
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
