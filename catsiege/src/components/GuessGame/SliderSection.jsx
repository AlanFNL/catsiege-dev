import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";

export const SliderSection = ({
  userGuess,
  minRange,
  maxRange,
  rangeMax,
  onSliderChange,
  isGuessButtonDisabled,
  loading,
  onGuessSubmit,
}) => {
  return (
    <div className="w-full space-y-8 mt-8">
      <div className="relative px-12">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-8"
          value={[parseInt(userGuess) || minRange]}
          max={maxRange || rangeMax}
          min={minRange}
          step={1}
          onValueChange={onSliderChange}
        >
          <Slider.Track className="relative h-4 w-full grow rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3c3b37] via-[#504d45] to-[#3c3b37]" />
            <Slider.Range className="absolute h-full bg-gradient-to-r from-[#c4b48d] via-[#FBE294] to-[#FBE294]" />
          </Slider.Track>

          <Slider.Thumb className="block w-8 h-8 rounded-full bg-gradient-to-br from-[#d4d0c5] to-[#a39f8f] shadow-lg ring-2 ring-[#847f6f] focus:outline-none">
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-[#FBE294]">
              {userGuess || minRange}
            </span>
          </Slider.Thumb>
        </Slider.Root>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!userGuess || loading}
        onClick={onGuessSubmit}
        className={`${
          isGuessButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
        } w-full max-w-md mx-auto h-16 bg-gradient-to-r from-[#FFF5E4]/10 via-[#FFF5E4]/20 to-[#FFF5E4]/10 
                  hover:from-[#FFF5E4]/20 hover:via-[#FFF5E4]/30 hover:to-[#FFF5E4]/20
                  border border-[#FFF5E4]/30 rounded-lg text-[#FFF5E4] font-bold text-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 flex items-center justify-center`}
      >
        {isGuessButtonDisabled ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#FFF5E4]/20 border-t-[#FFF5E4] rounded-full animate-spin" />
          </div>
        ) : (
          "CHOOSE NUMBER"
        )}
      </motion.button>
    </div>
  );
};
