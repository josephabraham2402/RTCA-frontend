import React from 'react';

const HomeMain = () => {
  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-center relative">
      <div className="text-center max-w-sm px-4">
        {/* Illustration */}
        <div className="mb-8 relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-3xl w-48 h-48 -m-8 z-0"></div>
          
          <div className="relative z-10">
            {/* Background elements */}
            <svg width="220" height="180" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 65C100 84.33 84.33 100 65 100C59.88 100 55.02 98.9 50.66 96.94C49.31 96.33 47.75 96.41 46.49 97.16L31 106.5V91.5C31 89.8 30.15 88.24 28.71 87.4C21.34 83.1 16.5 74.72 16.5 65C16.5 45.67 32.17 30 51.5 30C70.83 30 86.5 45.67 86.5 65" fill="#DDE0F2" />
              
              <path d="M125 50C100.15 50 80 67.91 80 90C80 101.42 85.35 111.72 93.94 118.66C95.2 119.68 95.84 121.3 95.53 122.9L92 140L107.5 132.5C109 131.78 110.82 131.78 112.32 132.22C116.32 133.4 120.57 134 125 134C149.85 134 170 116.09 170 94C170 71.91 149.85 50 125 50Z" fill="#7B68EE" />
              
              <circle cx="110" cy="92" r="5" fill="white" />
              <circle cx="125" cy="92" r="5" fill="white" />
              <circle cx="140" cy="92" r="5" fill="white" />
              
              {/* Sparkles */}
              <path d="M45 15L47 22L54 24L47 26L45 33L43 26L36 24L43 22L45 15Z" fill="#B1A7F5" />
              <path d="M175 25L176 30L181 31L176 32L175 37L174 32L169 31L174 30L175 25Z" fill="#B1A7F5" />
              <path d="M15 115L16 119L20 120L16 121L15 125L14 121L10 120L14 119L15 115Z" fill="#B1A7F5" />
              <path d="M185 105L186 109L190 110L186 111L185 115L184 111L180 110L184 109L185 105Z" fill="#B1A7F5" opacity="0.5"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your messages</h2>
        <p className="text-gray-500 text-sm">
          Select a chat from the sidebar<br/>to view your conversation
        </p>
      </div>
    </div>
  );
};

export default HomeMain;
