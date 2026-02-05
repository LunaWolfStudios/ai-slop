import React from 'react';
import { ScoreFrame } from '../types';

interface ScoreBoardProps {
  frames: ScoreFrame[];
  currentFrameIndex: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ frames, currentFrameIndex }) => {
  return (
    <div className="w-full bg-white/90 backdrop-blur-sm border-b-4 border-sky-600 p-2 overflow-x-auto shadow-md">
      <div className="flex justify-center min-w-[600px] mx-auto space-x-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const frame = frames[i];
          const isActive = i === currentFrameIndex;
          
          let roll1 = '';
          let roll2 = '';
          let roll3 = ''; // 10th frame

          if (frame) {
            // Logic for displaying symbols
            if (frame.isStrike) {
                roll1 = '';
                roll2 = 'X';
                if(i === 9) { // 10th frame special handling
                     roll1 = frame.rolls[0] === 10 ? 'X' : frame.rolls[0]?.toString();
                     roll2 = frame.rolls[1] === 10 ? 'X' : frame.rolls[1] === 10 && frame.rolls[0] === 10 ? 'X' : (frame.rolls[0] + frame.rolls[1] === 10) ? '/' : frame.rolls[1]?.toString();
                     roll3 = frame.rolls[2] === 10 ? 'X' : frame.rolls[2]?.toString();
                }
            } else if (frame.isSpare) {
                roll1 = frame.rolls[0].toString();
                roll2 = '/';
                if(i === 9) roll3 = frame.rolls[2]?.toString();
            } else {
                roll1 = frame.rolls[0] !== undefined ? frame.rolls[0].toString() : '';
                roll2 = frame.rolls[1] !== undefined ? frame.rolls[1].toString() : '';
            }
          }

          return (
            <div 
              key={i} 
              className={`flex-1 border-2 ${isActive ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'} rounded flex flex-col items-center justify-between h-16 md:h-20 min-w-[3rem]`}
            >
              <div className="w-full bg-gray-100 text-[10px] text-center border-b border-gray-200">
                {i + 1}
              </div>
              <div className="flex w-full h-full">
                <div className="flex-1 flex items-center justify-center border-r border-gray-100 text-sm font-bold">{roll1}</div>
                <div className="flex-1 flex items-center justify-center text-sm font-bold">{roll2}</div>
                {i === 9 && <div className="flex-1 flex items-center justify-center border-l border-gray-100 text-sm font-bold">{roll3}</div>}
              </div>
              <div className="w-full text-center font-bold text-sky-700 text-sm md:text-base border-t border-gray-200">
                {frame ? frame.cumulativeScore : ''}
              </div>
            </div>
          );
        })}
        <div className="ml-2 w-16 h-20 bg-sky-600 text-white rounded flex flex-col items-center justify-center shadow-inner">
            <div className="text-xs uppercase font-bold opacity-75">Total</div>
            <div className="text-xl font-black">
                {frames.length > 0 ? frames[frames.length - 1].cumulativeScore : 0}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;