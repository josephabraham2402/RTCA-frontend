import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, FileText, Link as LinkIcon, Download } from 'lucide-react';
import MessageService from '../../Services/MessageService';
import AuthService from '../../Services/AuthService';
import { decryptMessage } from '../../utils/encryption';
import { API_BASE_URL } from '../../Services/apiConfig';

const SharedMediaView = ({ activeChat, initialTab = 'all', onBack }) => {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const data = await MessageService.getMessages(activeChat.id);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages for media view", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [activeChat]);

  const images = messages.filter(m => !m.isDeleted && m.fileUrl && m.fileType?.startsWith('image/'));
  const documents = messages.filter(m => !m.isDeleted && m.fileUrl && !m.fileType?.startsWith('image/'));
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = messages.reduce((acc, m) => {
    if (!m.isDeleted && m.text) {
      try {
        const decryptedText = decryptMessage(m.text, currentUser.id, activeChat.id);
        const foundLinks = decryptedText.match(urlRegex);
        if (foundLinks) {
          foundLinks.forEach(url => {
            acc.push({ url, date: m.createdAt, msgId: m._id });
          });
        }
      } catch(e) {}
    }
    return acc;
  }, []);

  const tabs = [
    { id: 'all', label: 'All Media' },
    { id: 'images', label: 'Images' },
    { id: 'documents', label: 'Documents' },
    { id: 'links', label: 'Links' },
  ];

  return (
    <div className="flex-1 bg-white flex flex-col h-full border-r border-gray-100">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 flex items-center px-6 bg-white shrink-0">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-semibold text-gray-900">Shared Media</h2>
          <p className="text-xs text-gray-500">with {activeChat.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-6 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-4 font-medium text-sm transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Images Section */}
            {(activeTab === 'all' || activeTab === 'images') && (
              <div>
                {(activeTab !== 'all' || images.length > 0) && <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><ImageIcon className="h-4 w-4 mr-2" /> Images ({images.length})</h3>}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map(img => (
                      <a 
                        key={img._id} 
                        href={`${API_BASE_URL}${img.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <div 
                          className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105"
                          style={{ backgroundImage: `url(${API_BASE_URL}${img.fileUrl})` }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="text-white h-6 w-6" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : activeTab === 'images' ? (
                  <p className="text-gray-500 text-sm">No images shared in this chat.</p>
                ) : null}
              </div>
            )}

            {/* Documents Section */}
            {(activeTab === 'all' || activeTab === 'documents') && (
              <div>
                {(activeTab !== 'all' || documents.length > 0) && <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><FileText className="h-4 w-4 mr-2" /> Documents ({documents.length})</h3>}
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <a 
                        key={doc._id}
                        href={`${API_BASE_URL}${doc.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-primary hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center overflow-hidden">
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mr-4">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{doc.fileName || 'Document'}</h4>
                            <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Download className="h-5 w-5 text-gray-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : activeTab === 'documents' ? (
                  <p className="text-gray-500 text-sm">No documents shared in this chat.</p>
                ) : null}
              </div>
            )}

            {/* Links Section */}
            {(activeTab === 'all' || activeTab === 'links') && (
              <div>
                {(activeTab !== 'all' || links.length > 0) && <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><LinkIcon className="h-4 w-4 mr-2" /> Links ({links.length})</h3>}
                {links.length > 0 ? (
                  <div className="space-y-3">
                    {links.map((link, idx) => (
                      <a 
                        key={`${link.msgId}-${idx}`}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-primary hover:shadow-sm transition-all"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-green-50 text-green-500 flex items-center justify-center mr-4">
                          <LinkIcon className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-medium text-blue-600 hover:underline truncate">{link.url}</h4>
                          <p className="text-xs text-gray-500">{new Date(link.date).toLocaleDateString()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : activeTab === 'links' ? (
                  <p className="text-gray-500 text-sm">No links shared in this chat.</p>
                ) : null}
              </div>
            )}

            {activeTab === 'all' && images.length === 0 && documents.length === 0 && links.length === 0 && (
              <div className="text-center py-10">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Media Shared</h3>
                <p className="text-gray-500 text-sm">When you share photos, documents, or links, they will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedMediaView;
