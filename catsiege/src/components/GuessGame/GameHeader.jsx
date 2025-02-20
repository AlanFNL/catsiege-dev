import React from "react";
import { Volume2, VolumeX, Info } from "lucide-react";

export const GameHeader = ({ isMuted, onMuteToggle, onInfoOpen }) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-center text-[#FFF5E4] mb-8">
        YOUR TURN
      </h1>
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onMuteToggle}
          className="p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[#FFF5E4]/70" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#FFF5E4]/70" />
          )}
        </button>
        <button
          onClick={onInfoOpen}
          className="p-2 rounded-full bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 transition-colors"
          aria-label="Game Information"
        >
          <Info className="w-5 h-5 text-[#FFF5E4]/70" />
        </button>
      </div>
    </>
  );
};
