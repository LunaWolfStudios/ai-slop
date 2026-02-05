import React, { useState } from 'react';

interface CartoonEarthProps {
  onClick: (e: React.MouseEvent) => void;
}

const CartoonEarth: React.FC<CartoonEarthProps> = ({ onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    onClick(e);
  };

  return (
    <div className="relative group z-10 flex justify-center items-center">
      {/* Shockwave Effect container */}
      <div className={`absolute inset-0 rounded-full border-4 border-blue-400 opacity-0 pointer-events-none ${isClicked ? 'animate-shockwave' : ''}`}></div>

      <button 
        onClick={handleClick}
        className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full transition-transform duration-100 ease-out 
          ${isClicked ? 'scale-110' : 'hover:scale-105 active:scale-95'}
        `}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.4), inset -10px -10px 20px rgba(0,0,0,0.5)'
        }}
      >
        {/* Ocean Gradient/Texture */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          
          {/* Continents - Simple SVG Paths animating */}
          <svg className="absolute inset-0 w-full h-full opacity-80 animate-spin-slow" viewBox="0 0 100 100" fill="none">
             <g fill="#4ade80">
                {/* Simulated Continents */}
                <path d="M20,30 Q30,10 50,30 T80,40 T90,60 T70,80 T40,70 T20,50 Z" />
                <path d="M10,60 Q5,70 15,80 T30,90 T40,80 Z" />
                <path d="M80,20 Q90,10 95,30 T90,50 Z" />
                {/* Clone for wrapping effect (simplified visual) */}
                <path d="M-80,30 Q-70,10 -50,30 T-20,40 T-10,60 T-30,80 T-60,70 T-80,50 Z" transform="translate(100,0)" />
             </g>
          </svg>

          {/* Atmosphere Shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none"></div>
        </div>
        
        {/* Border Ring */}
        <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full"></div>
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes shockwave {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-shockwave {
          animation: shockwave 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CartoonEarth;