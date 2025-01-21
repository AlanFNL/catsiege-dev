import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import points from "../assets/points.png";

const WelcomeGuide = ({ user }) => {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (user && !hasSeenGuide) {
      setShowGuide(true);
    }
  }, [user]);

  const handleClose = () => {
    localStorage.setItem("hasSeenGuide", "true");
    setShowGuide(false);
  };

  return (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-black/90 p-8 rounded-xl border border-[#FFF5E4]/20 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl text-center font-bold text-[#FFF5E4] mb-6">
              Welcome to CatSiege!
            </h2>

            <div className="relative mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <img src={points} alt="Points" className="w-8 h-8" />
                <span className="text-[#FFF5E4] text-2xl font-bold">0 </span>
              </div>
              <p className="text-[#FFF5E4]/90 text-lg text-center">
                Every account starts with 0 points.
              </p>
              <p className="text-[#FFF5E4]/90 text-lg text-center mt-4">
                To earn more:
              </p>
              <p className="text-left text-[#FFF5E4]/90 text-lg mt-4">
                {" "}
                1- tap your account icon{" "}
              </p>
              <span className="text-[#FBE294] font-bold text-left">
                (↗️ top-right corner)
              </span>{" "}
              <p className="text-left text-[#FFF5E4]/90 text-lg mt-4">
                {" "}
                2- select{" "}
                <span className="text-[#FBE294] font-bold">
                  'Points & Rewards'
                </span>{" "}
                and follow the steps.
              </p>
            </div>

            <p className="text-[#FBE294] text-xl text-center font-bold mb-8">
              Let the siege begin!
            </p>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="px-6 py-2 font-bold bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg"
              >
                Got it!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeGuide;
