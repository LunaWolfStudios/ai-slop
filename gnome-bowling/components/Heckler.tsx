import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface HecklerProps {
  message: string;
  visible: boolean;
}

const Heckler: React.FC<HecklerProps> = ({ message, visible }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && message) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000); // Hide after 5s
      return () => clearTimeout(timer);
    }
  }, [message, visible]);

  if (!show || !message) return null;

  return (
    <div className="absolute top-20 left-4 z-50 max-w-[200px] md:max-w-xs animate-float">
      <div className="relative bg-white border-4 border-red-500 rounded-2xl p-4 shadow-xl">
        <div className="absolute -bottom-3 left-6 w-6 h-6 bg-white border-b-4 border-r-4 border-red-500 transform rotate-45"></div>
        <div className="flex items-start space-x-2">
            <MessageCircle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="font-bold text-gray-800 text-sm md:text-base leading-tight">
            "{message}"
            </p>
        </div>
      </div>
      <div className="mt-4 ml-4 w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-t-full relative shadow-lg border-2 border-white">
          <div className="absolute bottom-0 w-full h-8 bg-pink-200 rounded-b-lg"></div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-white rounded-full"></div> 
          <div className="absolute top-10 left-4 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-10 right-4 w-2 h-2 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

export default Heckler;