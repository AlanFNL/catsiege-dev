import React, { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import {
  motion,
  stagger,
  useAnimationControls,
  useScroll,
  useTransform,
} from "framer-motion";
import mainImg from "./assets/landing.webp";
import circleArrow from "./assets/circlearrow.png";
import logo from "./assets/logo.png";
import { Link } from "react-scroll";

const navItems = [
  { name: "TOURNAMENT", target: "tournament" },
  { name: "WHITELIST", target: "whitelist" },
  { name: "ROADMAP", target: "roadmap" },
  { name: "WHITEPAPER", target: "whitepaper" },
  { name: "CONTACT", target: "contact" },
];

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

const TypewriterText = ({ text }) => {
  const controls = useAnimationControls();

  React.useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      transition: { delay: i * 0.1 },
    }));
  }, [controls]);

  return (
    <motion.h2 className="text-4xl lg:text-5xl font-bold mb-4">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          custom={index}
          animate={controls}
          initial={{ opacity: 0 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
};

export default function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const arrowRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: arrowRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [10, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

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
                <motion.div
                  key={item.name}
                  variants={navItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={index}
                  viewport={{ once: false }}
                >
                  <Link
                    to={item.target}
                    smooth={true}
                    duration={500}
                    className="text-sm lg:text-base hover:text-gray-300 cursor-pointer"
                  >
                    {item.name}
                  </Link>
                </motion.div>
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
                <Link
                  key={item.name}
                  to={item.target}
                  smooth={true}
                  duration={500}
                  className="block py-2 text-sm hover:text-gray-300 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
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
              <TypewriterText text="LET THE SIEGE BEGIN" />
              <motion.div
                ref={arrowRef}
                className="relative w-32 h-32 lg:w-48 lg:h-48"
                style={{
                  rotate,
                  opacity,
                  scale,
                }}
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
