import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameToggleProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const DeviceFrameToggle: React.FC<DeviceFrameToggleProps> = ({
  isMobileFrame,
  setIsMobileFrame,
}) => {
  return (
    <div className="fixed top-16 right-4 z-50 hidden md:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full p-1 shadow-2xl">
      <button
        onClick={() => setIsMobileFrame(true)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          isMobileFrame
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="View in Mobile Shell"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Mobile App</span>
      </button>

      <button
        onClick={() => setIsMobileFrame(false)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          !isMobileFrame
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Expand to Full Screen View"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Full Screen</span>
      </button>
    </div>
  );
};
