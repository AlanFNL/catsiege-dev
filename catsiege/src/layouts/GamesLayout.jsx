import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../Nav";
import { motion } from "framer-motion";

const GamesLayout = () => {
  return (
    <div className="min-h-screen w-screen bg-black text-[#FFF5E4] overflow-hidden">
      <Nav />
      <motion.div
        className="mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default GamesLayout;
