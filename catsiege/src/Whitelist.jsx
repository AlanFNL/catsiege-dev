import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useAnimationControls,
  useInView,
} from "framer-motion";

import circleArrow from "./assets/circlearrow.png";
import Third from "./assets/3.webp";
import White from "./assets/whitelist.webp";
import White2 from "./assets/white.webp";

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

const TypewriterText = ({ text, className }) => {
  const controls = useAnimationControls();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (isInView) {
      controls.start((i) => ({
        opacity: 1,
        transition: { delay: i * 0.1 },
      }));
    } else {
      controls.start({ opacity: 0 });
    }
  }, [isInView, controls]);

  return (
    <h2 ref={ref} className={className}>
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
    </h2>
  );
};

const ribbonVariants = {
  initial: { x: "-100%" },
  animate: { x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function Whitelist() {
  const arrowRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: arrowRef,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [180, 90]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const itemVariants = (index) => ({
    hidden: {
      opacity: 0,
      x: 40 - index * 10, // 40px for first, 30px for second, and so on
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.2, // Staggered delay
      },
    },
  });

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmails =
      JSON.parse(localStorage.getItem("whitelistEmails")) || [];
    if (storedEmails.length > 0) {
      setSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email) {
      try {
        const binId = "67187316ad19ca34f8bd09bf"; // Replace with your actual Bin ID
        const url = `https://api.jsonbin.io/v3/b/${binId}`;

        // First, get the current data
        const getResponse = await fetch(url, {
          headers: {
            "X-Master-Key":
              "$2a$10$hb8bmsYkpDTVveowb/uZG.l5qrTLgriVkJmdHbgmNNT0eNTUEMqfG", // Replace with your actual API Key
          },
        });
        const currentData = await getResponse.json();

        // Add the new email to the array
        const updatedEmails = [...currentData.record.emails, email];

        // Update the bin with the new data
        const updateResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key":
              "$2a$10$hb8bmsYkpDTVveowb/uZG.l5qrTLgriVkJmdHbgmNNT0eNTUEMqfG", // Replace with your actual API Key
          },
          body: JSON.stringify({ emails: updatedEmails }),
        });

        if (updateResponse.ok) {
          console.log("Email submitted successfully");
          setSubmitted(true);
          setEmail("");
          // Store email in localStorage
          const storedEmails =
            JSON.parse(localStorage.getItem("whitelistEmails")) || [];
          localStorage.setItem(
            "whitelistEmails",
            JSON.stringify([...storedEmails, email])
          );
        } else {
          throw new Error("Failed to update jsonbin");
        }
      } catch (err) {
        console.error("Error submitting email:", err);
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <motion.div
      className="relative min-h-screen bg-gray-900 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={Third}
          alt="Dark urban cityscape"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/0 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 z-30 to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 sm:p-6 lg:p-12">
        {/* Circular Arrow Icon */}
        <motion.div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-12 lg:right-12"
          variants={fadeInUp}
        >
          <motion.div
            ref={arrowRef}
            className="relative w-32 h-32 lg:w-48 lg:h-48 z-10"
            style={{
              rotate,
            }}
          >
            <img
              src={circleArrow}
              alt="Circular arrow"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Whitelist Form */}
        <motion.div
          className="mt-16 sm:mt-24 lg:mt-32"
          initial={{ opacity: 0, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false }}
        >
          <div
            className="bg-opacity-10 backdrop-blur-md p-6 rounded-lg max-w-md mx-auto w-full relative"
            style={{
              backgroundImage: `url(${White})`,
              backgroundSize: "cover",
            }}
          >
            <motion.h2
              className="text-base sm:text-lg text-center mb-2 text-black"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            ></motion.h2>
            <motion.h3
              className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-black"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Whitelist
            </motion.h3>
            {!submitted ? (
              <motion.form
                className="flex flex-col relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onSubmit={handleSubmit}
              >
                <div className="flex mb-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow bg-black text-white bg-opacity-20 border border-black border-opacity-50 rounded-l-md px-4 py-2 focus:outline-none focus:border-opacity-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 px-4 py-2 rounded-r-md hover:bg-gray-700 transition-colors"
                    style={{ color: "rgba(255, 245, 228, 1)" }}
                  >
                    SEND
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </motion.form>
            ) : (
              <motion.p
                className="text-black text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Thank you for joining the whitelist!
              </motion.p>
            )}
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
                <TypewriterText text="Coming soon" />
              </motion.h4>
              {["DIGITAL COLLECTIBLES", "Tournament"].map((item, index) => (
                <motion.div
                  key={item}
                  className={`py-4 ${
                    index === 0 ? "border-b border-white border-opacity-20" : ""
                  }`}
                  variants={fadeInUp}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{item}</span>
                    <span className="font-bold">??-??-202?</span>
                  </div>
                  <div className="flex justify-end"></div>
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
            <motion.div
              ref={arrowRef}
              className="relative w-32 h-32 lg:w-48 lg:h-48"
              style={{
                rotate: rotate2,
              }}
            >
              <img
                src={circleArrow}
                alt="Circular arrow"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          <div className="relative">
            {/* Danger Ribbons */}
            <motion.div
              className="absolute -top-4 left-0 w-full overflow-hidden h-16 z-10"
              variants={ribbonVariants}
              initial="initial"
              animate="animate"
            >
              <div className="absolute top-8 left-0 w-full h-8 bg-yellow-400 text-black font-bold text-lg transform -rotate-3 flex items-center justify-center">
                ROADMAP COMING SOON
              </div>
            </motion.div>
            <motion.div
              className="absolute -bottom-4 left-0 w-full overflow-hidden h-16 z-10"
              variants={ribbonVariants}
              initial="initial"
              animate="animate"
            >
              <div className="absolute bottom-8 left-0 w-full h-8 bg-yellow-400 text-black font-bold text-lg transform rotate-3 flex items-center justify-center">
                ROADMAP COMING SOON
              </div>
            </motion.div>

            {/* Blurred Content */}
            <div className="filter blur-sm">
              <TypewriterText
                text="Roadmap"
                className="text-3xl sm:text-4xl font-bold text-center mb-8"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item, index) => (
                  <motion.div
                    key={item}
                    className="bg-opacity-90 backdrop-blur-md p-6 rounded-lg text-black"
                    style={{ backgroundColor: "rgba(255, 245, 228, 0.97)" }}
                    variants={itemVariants(index)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-50px" }}
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
            </div>
          </div>
        </motion.div>

        {/* Bottom Image */}
        <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
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
      </div>

      {/* ... other content ... */}
    </motion.div>
  );
}

export default Whitelist;
