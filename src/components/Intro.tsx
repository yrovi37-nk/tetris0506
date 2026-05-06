import React from 'react';
import { Play, Trophy } from 'lucide-react';
import { LEVEL_SPEEDS } from '../utils/constants';
import { initAudio, playBGM } from '../utils/audio';

interface IntroProps {
  onStart: () => void;
  lastScore?: number;
  lastLevel?: number;
}

export const Intro: React.FC<IntroProps> = ({ onStart, lastScore = 0, lastLevel = 1 }) => {
  return (
    <div className="h-full bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none grid grid-cols-10 grid-rows-20 gap-1 opacity-[0.03]">
         {Array.from({length: 200}).map((_, i) => (
             <div key={i} className="bg-white rounded-sm" />
         ))}
      </div>
      
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/20 blur-3xl rounded-full" />

      <div className="z-10 bg-gray-800/80 backdrop-blur-xl border border-gray-700 p-10 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-500 to-yellow-400">
          테트리스
        </h1>
        <p className="text-gray-400 mb-10 text-sm tracking-widest uppercase">전체 통합 버전</p>

        {/* Stats if available */}
        {lastScore > 0 && (
          <div className="bg-gray-900/50 w-full rounded-2xl p-6 mb-8 border border-gray-700/50 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-700 items-center justify-center gap-4 sm:gap-0">
             <div className="flex flex-col items-center sm:pr-8">
                <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">최근 점수</span>
                <span className="text-3xl font-mono text-yellow-400">{lastScore}</span>
             </div>
             <div className="flex flex-col items-center sm:pl-8">
                <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">도달 레벨</span>
                <span className="text-3xl font-mono text-cyan-400">{lastLevel}</span>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 w-full mb-8">
           <button 
             onClick={() => {
               initAudio();
               playBGM();
               onStart();
             }}
             className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
           >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <Play fill="currentColor" className="w-6 h-6 z-10" />
              <span className="text-xl z-10 font-bold">{lastScore > 0 ? "다시 하기" : "게임 시작"}</span>
           </button>
        </div>

        {/* Detail Cards */}
        <div className="w-full bg-gray-900/50 rounded-xl p-5 border border-gray-700/50">
            <h3 className="flex items-center text-sm text-gray-300 font-bold mb-3 uppercase tracking-wide gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                레벨
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
               {LEVEL_SPEEDS.map((speed, i) => (
                  <div key={i} className="flex flex-col bg-gray-800 rounded p-2">
                     <span className="text-gray-400 mb-1">Lv {i+1}</span>
                     <span className="text-cyan-400">{speed}ms</span>
                  </div>
               ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-3 font-sans break-keep">
               10줄을 지우면 다음 레벨로 넘어갑니다. 레벨이 오를수록 속도가 빨라집니다!
            </p>
        </div>

      </div>
      
    </div>
  );
};
