import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send, Smile, Check, CheckCheck, FileText, X, Search } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import MessageService from '../../Services/MessageService';
import SocketService from '../../Services/SocketService';
import AuthService from '../../Services/AuthService';
import { encryptMessage, decryptMessage } from '../../utils/encryption';

const ActiveChat = ({ activeChat, isOnline, isSearching, onCloseSearch, onCloseChat, onRemoveFriend, onBlockUser }) => {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const currentUser = AuthService.getCurrentUser();
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      const isForActiveGroup = activeChat.isGroup && msg.receiver === activeChat.id;
      const isForActivePrivate = !activeChat.isGroup && msg.sender === activeChat.id && msg.receiver === currentUser.id;

      if (isForActiveGroup || isForActivePrivate) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        // Always mark as seen if it matches the active chat
        MessageService.markAsSeen([msg._id], activeChat.id);
        socket.emit('mark_seen', {
          messageIds: [msg._id],
          senderId: activeChat.id,
          receiverId: currentUser.id
        });
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

    const handleMessageEdited = ({ messageId, newText }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text: newText, isEdited: true } : m));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true } : m));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [activeChat, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedFile) return;

    const socket = SocketService.getSocket();

    if (editingMessageId) {
      const encryptedText = inputText.trim() ? encryptMessage(inputText.trim(), activeChat.isGroup ? activeChat.id : currentUser.id, activeChat.isGroup ? activeChat.id : activeChat.id) : '';
      socket.emit('edit_message', {
        messageId: editingMessageId,
        newText: encryptedText,
        receiverId: activeChat.id
      });
      setEditingMessageId(null);
      setInputText('');
      return;
    }

    let fileUrl, fileType, fileName;
    if (selectedFile) {
      try {
        setIsUploading(true);
        const data = await MessageService.uploadFile(selectedFile);
        fileUrl = data.fileUrl;
        fileType = data.fileType;
        fileName = data.fileName;
      } catch (error) {
        console.error("Failed to upload file", error);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    }

    const encryptedText = inputText.trim() ? encryptMessage(inputText.trim(), activeChat.isGroup ? activeChat.id : currentUser.id, activeChat.isGroup ? activeChat.id : activeChat.id) : '';

    socket.emit('send_message', {
      sender: currentUser.id,
      receiver: activeChat.id,
      text: encryptedText,
      fileUrl,
      fileType,
      fileName
    });

    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleEditClick = (msg) => {
    const decrypted = msg.text ? decryptMessage(msg.text, activeChat.isGroup ? activeChat.id : currentUser.id, activeChat.isGroup ? activeChat.id : activeChat.id) : '';
    setInputText(decrypted);
    setEditingMessageId(msg._id);
  };

  const handleDeleteClick = (msgId) => {
    const socket = SocketService.getSocket();
    socket.emit('delete_message', {
      messageId: msgId,
      receiverId: activeChat.id
    });
  };

  const handleEmojiClick = (emojiObject) => {
    setInputText((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:text-brand-primary transition-colors cursor-pointer"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onCloseChat) onCloseChat();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close Chat
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmAction({ type: 'remove', title: 'Remove Friend', message: 'Are you sure you want to remove this friend from your list?' });
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove Friend
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmAction({ type: 'block', title: 'Block User', message: 'Are you sure you want to block this user? They will no longer be able to message you.' });
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearching && (
        <div className="bg-gray-50 border-b border-gray-100 p-3 px-6 flex items-center shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
              autoFocus
            />
          </div>
          <button 
            onClick={() => {
              setSearchQuery('');
              onCloseSearch();
            }} 
            className="ml-3 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar overflow-x-hidden flex flex-col">
        <div className="flex flex-col space-y-4">
          {(() => {
            const filteredMessages = messages.filter(msg => {
              if (!searchQuery.trim()) return true;
              if (msg.isDeleted) return false;
              let decrypted = '';
              if (msg.text) {
                try {
                  decrypted = decryptMessage(msg.text, activeChat.isGroup ? activeChat.id : currentUser.id, activeChat.isGroup ? activeChat.id : activeChat.id);
                } catch(e) {}
              }
              const q = searchQuery.toLowerCase();
              return decrypted.toLowerCase().includes(q) || 
                     (msg.fileName && msg.fileName.toLowerCase().includes(q));
            });

            if (searchQuery.trim() && filteredMessages.length === 0) {
              return <div className="text-center text-gray-500 text-sm mt-4">No messages found for "{searchQuery}"</div>;
            }

            return filteredMessages.map((msg, index) => {
              const isMine = msg.sender === currentUser.id;
              const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
              <div key={msg._id || index} className={`flex items-end group ${isMine ? 'justify-end' : ''}`}>
                {!isMine && (
                  <img src={activeChat.avatar} className="h-8 w-8 rounded-full object-cover mb-1 mr-2 bg-gray-200" alt="Avatar" />
                )}
                
                {isMine && !msg.isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mr-2 space-x-1">
                    <button onClick={() => handleEditClick(msg)} className="text-gray-400 hover:text-brand-primary cursor-pointer text-xs font-medium">Edit</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleDeleteClick(msg._id)} className="text-gray-400 hover:text-red-500 cursor-pointer text-xs font-medium">Delete</button>
                  </div>
                )}

                <div className={`${isMine ? 'bg-brand-primary rounded-br-sm' : 'bg-white border border-gray-100 rounded-bl-sm'} rounded-2xl px-4 py-3 max-w-md shadow-sm`}>
                  {msg.isDeleted ? (
                    <p className={`text-sm italic ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                      This message is deleted
                    </p>
                  ) : (
                    <>
                      {msg.fileUrl ? (
                        <div className="mb-1 bg-brand-primary rounded-br-sm rounded-2xl">
                          {msg.fileType && msg.fileType.startsWith('image/') ? (
                            <img src={`http://localhost:5000${msg.fileUrl}`} alt="Attachment" className="max-w-full rounded-md object-cover max-h-60" />
                          ) : (
                            <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-blue-100 px-3 py-2 rounded-md hover:bg-blue-600/30 transition-colors">
                              <FileText className="h-5 w-5" />
                              <span className="text-sm underline">{msg.fileName || 'Download File'}</span>
                            </a>
                          )}
                        </div>
                      ) : null}
                      {msg.text && (
                        <p className={`text-sm ${isMine ? 'text-white' : 'text-gray-800'}`}>
                          {decryptMessage(msg.text, activeChat.isGroup ? activeChat.id : currentUser.id, activeChat.isGroup ? activeChat.id : activeChat.id)}
                        </p>
                      )}
                    </>
                  )}
                  <div className={`flex items-center justify-end space-x-1 mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{time}</span>
                    {!msg.isDeleted && msg.isEdited && (
                      <span className="text-[10px] italic ml-1">(edited)</span>
                    )}
                    {isMine && !msg.isDeleted && (
                      msg.status === 'sent' ? <Check className="h-3 w-3" /> :
                        msg.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                          msg.status === 'seen' ? <CheckCheck className="h-3 w-3 text-blue-300" /> : null
                    )}
                  </div>
                </div>
              </div>
            );
          })})()}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 relative flex flex-col space-y-2">
        {selectedFile && (
          <div className="flex items-center bg-gray-100 p-2 rounded-md max-w-sm">
            <div className="flex-1 truncate text-sm text-gray-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {selectedFile.name}
            </div>
            <button 
              onClick={() => setSelectedFile(null)} 
              className="text-gray-500 hover:text-red-500 transition-colors ml-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {editingMessageId && (
          <div className="flex items-center bg-brand-primary/10 p-2 rounded-md max-w-sm mb-1">
            <div className="flex-1 text-xs text-brand-primary font-medium flex items-center">
              Editing message...
            </div>
            <button 
              onClick={() => {
                setEditingMessageId(null);
                setInputText('');
              }} 
              className="text-gray-500 hover:text-red-500 transition-colors ml-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {showEmojiPicker && (
          <div className="absolute bottom-[100%] left-4 mb-2 z-50" ref={emojiPickerRef}>
            <EmojiPicker onEmojiClick={handleEmojiClick} searchDisabled skinTonesDisabled />
          </div>
        )}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 transition-colors mr-3 cursor-pointer"
          >
            <Smile className="h-5 w-5" />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className={`transition-colors mr-3 cursor-pointer ${isUploading ? 'text-brand-primary animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
          >
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
            disabled={isUploading}
            className={`text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors ml-2 shadow-sm ${
              isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-primary hover:bg-[#6853e0] cursor-pointer'
            }`}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmAction.title}</h3>
            <p className="text-gray-600 text-sm mb-6">{confirmAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmAction.type === 'remove' && onRemoveFriend) {
                    onRemoveFriend();
                  } else if (confirmAction.type === 'block' && onBlockUser) {
                    onBlockUser();
                  }
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveChat;
