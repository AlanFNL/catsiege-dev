import React from "react";

export const NumberRangeDisplay = ({ minRange, maxRange }) => {
  return (
    <div className="text-center mb-12">
      <p className="text-[#FFF5E4]/80 text-xl mb-4">
        {minRange === "?" ? "CPU is thinking..." : "Choose a number between"}
      </p>
      <div className="flex justify-center items-center gap-8">
        <div
          className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full 
          ${
            minRange === "?"
              ? "bg-gradient-to-br from-[#FFF5E4]/10 to-[#FFF5E4]/5 border-[#FFF5E4]/20"
              : "bg-gradient-to-br from-[#FFF5E4]/20 to-[#FFF5E4]/5 border-[#FFF5E4]/30"
          } 
          border flex items-center justify-center transition-all duration-300`}
        >
          <span
            className={`text-2xl sm:text-5xl font-bold 
            ${minRange === "?" ? "text-[#FFF5E4]/50" : "text-[#FFF5E4]"}`}
          >
            {minRange}
          </span>
        </div>
        <span className="text-[#FFF5E4]/60">and</span>
        <div
          className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full 
          ${
            maxRange === "?"
              ? "bg-gradient-to-br from-[#FFF5E4]/10 to-[#FFF5E4]/5 border-[#FFF5E4]/20"
              : "bg-gradient-to-br from-[#FFF5E4]/20 to-[#FFF5E4]/5 border-[#FFF5E4]/30"
          } 
          border flex items-center justify-center transition-all duration-300`}
        >
          <span
            className={`text-2xl sm:text-5xl font-bold 
            ${maxRange === "?" ? "text-[#FFF5E4]/50" : "text-[#FFF5E4]"}`}
          >
            {maxRange}
          </span>
        </div>
      </div>
    </div>
  );
};
