import React, { useEffect, useState } from 'react';
import { HEADLINES } from '../constants';
import { MarketHeadline } from '../types';

interface StockTickerProps {
  marketPhase: 'BULL' | 'BEAR';
  multiplier: number;
}

const StockTicker: React.FC<StockTickerProps> = ({ marketPhase, multiplier }) => {
  const [headline, setHeadline] = useState<MarketHeadline>(HEADLINES[0]);
  const [price, setPrice] = useState(12.50);

  useEffect(() => {
    // Change headline every 8 seconds randomly based on phase
    const interval = setInterval(() => {
      const relevantHeadlines = HEADLINES.filter(h => h.type === marketPhase || h.type === 'NEUTRAL');
      const random = relevantHeadlines[Math.floor(Math.random() * relevantHeadlines.length)];
      setHeadline(random);
    }, 8000);
    return () => clearInterval(interval);
  }, [marketPhase]);

  useEffect(() => {
     // Jiggle price
     const interval = setInterval(() => {
        setPrice(prev => {
           const change = (Math.random() - 0.5) * 0.5;
           const newPrice = prev + change;
           // Trend based on market
           if (marketPhase === 'BULL') return newPrice + 0.1;
           return newPrice - 0.05;
        });
     }, 1000);
     return () => clearInterval(interval);
  }, [marketPhase]);

  // CSS Animation for marquee
  const tickerColor = marketPhase === 'BULL' ? 'bg-green-900/90 border-green-500 text-green-300' : 'bg-red-900/90 border-red-500 text-red-300';
  const icon = marketPhase === 'BULL' ? '🚀' : '📉';

  return (
    <div className={`w-full h-14 border-b-2 flex items-center overflow-hidden relative z-50 shadow-md ${tickerColor}`}>
      
      {/* STATIC LEFT SECTION: PRICE */}
      <div className="flex-shrink-0 px-6 h-full flex items-center z-20 bg-[#0b0d17] border-r-2 border-inherit text-white min-w-[180px]">
         <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold">ASTS PRICE</span>
            <div className={`text-2xl font-mono font-bold ${marketPhase === 'BULL' ? 'text-green-400' : 'text-red-400'}`}>
               ${Math.max(0.01, price).toFixed(2)}
            </div>
         </div>
         <div className="ml-4 text-xs font-bold opacity-75">
            {multiplier.toFixed(2)}x Yield
         </div>
      </div>
      
      {/* SCROLLING MARQUEE */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center absolute">
          {/* Duplicate content to create seamless loop */}
          {Array.from({ length: 4 }).map((_, i) => (
             <span key={i} className="flex items-center">
                <span className="mx-8 text-lg font-mono font-bold tracking-wider">
                  {icon} {headline.text.toUpperCase()} {icon}
                </span>
                <span className="mx-8 text-lg font-mono opacity-50">
                   MARKET: {marketPhase}
                </span>
             </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Move half way because content is doubled/quadrupled */
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default StockTicker;