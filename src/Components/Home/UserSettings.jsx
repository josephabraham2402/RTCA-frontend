import React, { useState } from 'react';
import { Camera, Save, ArrowLeft, Key, User, AtSign, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import UserService from '../../Services/UserService';

const UserSettings = ({ onClose, currentUser }) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getAvatarUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    return `http://localhost:5000${url}`;
  };

  const avatarUrl = previewUrl || getAvatarUrl(currentUser?.avatar) || "https://ui-avatars.com/api/?name=" + (currentUser?.email?.[0] || "U");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let uploadedAvatarUrl = currentUser?.avatar;

      if (avatarFile) {
        const uploadRes = await UserService.uploadFile(avatarFile);
        uploadedAvatarUrl = uploadRes.fileUrl;
      }

      // Update profile
      const profileRes = await UserService.updateProfile({
        name,
        username,
        avatar: uploadedAvatarUrl
      });

      // Update current user in sessionStorage
      const updatedUser = profileRes.user;
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      // Update password if fields are filled
      if (currentPassword && newPassword) {
        await UserService.updatePassword({ currentPassword, newPassword });
        setCurrentPassword('');
        setNewPassword('');
      }

      setSuccess("Settings updated successfully! Changes to your profile will be fully visible on next reload.");
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full border-l border-gray-100 relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Manage your profile and account</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-primary hover:bg-[#6853e0] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center shadow-sm transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm border border-red-100">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center text-sm border border-green-100">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Profile Picture</h3>
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                  <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                  <input type="file" accept="image/jpeg, image/png, image/gif" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <div>
                <label className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer inline-block">
                  Change Picture
                  <input type="file" accept="image/jpeg, image/png, image/gif" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* General Information Section */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">General Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider flex items-center">
              <Key className="h-4 w-4 mr-2" /> Security
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to change it"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserSettings;
