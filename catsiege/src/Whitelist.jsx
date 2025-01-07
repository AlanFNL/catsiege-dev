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
import roadmapmob from "./assets/roadmap-mob.webp";
import roadmap from "./assets/roadmap.webp";

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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      try {
        const binId = "6749db2eacd3cb34a8b11fd9"; // Replace with your actual Bin ID
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
      } finally {
        setIsLoading(false);
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

        {/* Roadmap Image */}
        <div className="items-center justify-center sm:flex hidden">
          <img src={roadmap} alt="" />
        </div>

        {/* Roadmap Mobile Image */}
        <div className="items-center justify-center sm:hidden flex">
          <img src={roadmapmob} alt="" />
        </div>

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
