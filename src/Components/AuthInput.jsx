import React from 'react';

const AuthInput = ({ label, type, placeholder, value, onChange, className }) => {
  return (
    <div className="mb-3">
      <input
        type={type}
        className={`w-full px-4 py-3 bg-white border border-gray-100 rounded-md text-sm text-gray-700 placeholder-gray-500 focus:outline-none transition-colors ${className || ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default AuthInput;
