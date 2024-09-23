import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, stagger } from "framer-motion";
import mainImg from "./assets/hero.png";
import circleArrow from "./assets/circlearrow.png";
import logo from "./assets/logo.png";

const navItems = ["WISH LIST", "TORNEOS", "ROADMAP", "WHITE PAPER", "CONTACTO"];

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
    },
  }),
};

const textLineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 * i,
      duration: 0.5,
    },
  }),
};

export default function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      className="relative min-h-screen bg-black text-[#FFF5E4]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={mainImg}
          alt="Dark cityscape with ominous stuffed animal"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/10 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <motion.nav
          className="p-4 lg:p-8 border-b border-[#FFF5E4]"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false }}
        >
          <div className="flex items-center justify-between">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <div className="hidden md:flex space-x-4 lg:space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-sm lg:text-base hover:text-gray-300"
                  variants={navItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={index}
                  viewport={{ once: false }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mt-4 flex flex-col space-y-2 md:hidden">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block py-2 text-sm hover:text-gray-300"
                >
                  {item}
                </a>
              ))}
            </div>
          )}
        </motion.nav>

        {/* Main Content */}
        <div className="flex-grow flex flex-col justify-end p-4 lg:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end">
            {/* Left side content */}
            <motion.div
              className="lg:w-1/3 mb-8 lg:mb-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: false }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                LET THE
                <br />
                SIEGE BEGIN
              </h2>
              <motion.div
                className="relative w-32 h-32 lg:w-48 lg:h-48"
                initial={{ rotate: 0 }}
                whileInView={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                viewport={{ once: false }}
              >
                <img
                  src={circleArrow}
                  alt="Circular arrow"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Right side content */}
            <motion.div
              className="lg:text-right"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: false }}
            >
              <motion.p
                className="text-lg lg:text-xl mb-4"
                variants={textLineVariants}
                initial="hidden"
                whileInView="visible"
                custom={0}
                viewport={{ once: false }}
              >
                CATSIEGE IS A 1/1
              </motion.p>
              <motion.p
                className="text-lg lg:text-xl mb-4 font-bold"
                variants={textLineVariants}
                initial="hidden"
                whileInView="visible"
                custom={1}
                viewport={{ once: false }}
              >
                AI-GENERATED NFT
              </motion.p>
              <motion.p
                className="text-lg lg:text-xl mb-4 font-bold"
                variants={textLineVariants}
                initial="hidden"
                whileInView="visible"
                custom={2}
                viewport={{ once: false }}
              >
                COLLECTION ON SOLANA.
              </motion.p>
              {[
                "EARN STAKING REWARDS AND",
                "JOIN THRILLING PVP TOURNAMENTS",
                "FOR SOL/USDC PRIZES. YOUR",
                "NFT IS YOUR KEY",
                "TO VICTORY IN THE",
                "SIEGE OF SOLANA.",
              ].map((line, index) => (
                <motion.p
                  key={index}
                  className="text-sm lg:text-lg"
                  variants={textLineVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={index + 3}
                  viewport={{ once: false }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
