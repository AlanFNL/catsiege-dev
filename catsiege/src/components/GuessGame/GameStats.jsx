import React from "react";
import orb from "../../assets/guess-start4.png";
import time from "../../assets/guess-game5.png";

export const GameStats = ({ currentMultiplier, timeLeft, timerActive }) => {
  return (
    <div className="flex justify-center gap-12 text-xl text-[#FFF5E4]/90">
      <div className="flex items-center gap-2">
        <img src={orb} alt="" className="h-8 w-8" />
        <span>x{currentMultiplier.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        <img src={time} className="h-8 w-8" />
        <span>{timerActive ? `${timeLeft}s` : "--"}</span>
      </div>
    </div>
  );
};
