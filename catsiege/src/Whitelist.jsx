import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import circleArrow from "./assets/circlearrow.png";
import Third from "./assets/3.png";
import White from "./assets/whitelist.png";
import White2 from "./assets/white.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

function Whitelist() {
  return (
    <motion.div
      className="relative min-h-screen bg-gray-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={Third}
          alt="Dark urban cityscape"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/0 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 z-30 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 sm:p-6 lg:p-12">
        {/* Circular Arrow Icon */}
        <motion.div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-12 lg:right-12"
          variants={fadeInUp}
        >
          <div className="w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center">
            <motion.img
              src={circleArrow}
              className="w-full h-full rotate-180"
              alt="Circular arrow"
              animate={{ rotate: 140 }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Whitelist Form */}
        <motion.div className="mt-16 sm:mt-24 lg:mt-32" variants={fadeInUp}>
          <div
            className="bg-opacity-10 backdrop-blur-md p-6 rounded-lg max-w-md mx-auto w-full"
            style={{
              backgroundImage: `url(${White})`,
              backgroundSize: "cover",
            }}
          >
            <motion.h2
              className="text-base sm:text-lg text-center mb-2 text-black"
              variants={fadeInUp}
            >
              ¿Quieres formar parte?
            </motion.h2>
            <motion.h3
              className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-black"
              variants={fadeInUp}
            >
              White list
            </motion.h3>
            <motion.div className="flex" variants={fadeInUp}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow bg-black text-white bg-opacity-20 border border-black border-opacity-50 rounded-l-md px-4 py-2 focus:outline-none focus:border-opacity-100"
              />
              <button
                className="bg-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-700 transition-colors"
                style={{ color: "rgba(255, 245, 228, 1)" }}
              >
                SEND
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          className="mt-8 backdrop-blur-md bg-black bg-opacity-50 rounded-lg overflow-hidden"
          variants={fadeInUp}
        >
          <div className="border-t border-white border-opacity-20">
            <div className="p-4">
              <motion.h4
                className="text-xl sm:text-2xl font-bold mb-4"
                variants={fadeInUp}
              >
                Coming soon
              </motion.h4>
              {["NFT", "Torneo"].map((item, index) => (
                <motion.div
                  key={item}
                  className={`py-4 ${
                    index === 0 ? "border-b border-white border-opacity-20" : ""
                  }`}
                  variants={fadeInUp}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{item}</span>
                    <span className="font-bold">00-00-2024</span>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-white hover:underline inline-flex items-center">
                      {item === "NFT" ? "Discover" : "Inscribirme"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Roadmap Section */}
        <motion.div
          className="mt-16 relative pb-96 md:pb-0"
          variants={staggerChildren}
        >
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="w-32 h-32 mx-auto">
              <motion.img
                src={circleArrow}
                className="w-full h-full rotate-[110deg] md:rotate-45"
                alt="Circular arrow"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-8"
            variants={fadeInUp}
          >
            Roadmap
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                className="bg-opacity-90 backdrop-blur-md p-6 rounded-lg text-black"
                style={{ backgroundColor: "rgba(255, 245, 228, 0.97)" }}
                variants={fadeInUp}
              >
                <h3 className="text-sm mb-2">Informacion.detalle</h3>
                <h4 className="text-xl font-bold mb-4">Texto descp</h4>
                <p className="text-sm">
                  Descripción de la tarjeta, Descripción de la tarjeta,
                  Descripción de la tarjeta Descripción de la tarjeta,
                  Descripción de la tarjeta Descripción de la tarjeta,
                  Descripción de la tarjeta
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Image */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <div className="relative h-64 sm:h-96">
          <img
            src={White2}
            alt="Bottom cityscape"
            className="h-full w-full object-cover opacity-80"
            style={{
              maskImage: "linear-gradient(to bottom, transparent, black)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Whitelist;
