import React from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import mainImg from "./assets/4.webp";

// Import your carousel images here
import image1 from "./assets/NFTs1.webp";
import image2 from "./assets/NFTs2.webp";
import image3 from "./assets/NFTs3.webp";
import image4 from "./assets/NFTs4.webp";
import image5 from "./assets/NFTs5.webp";

function Fourth() {
  const carouselImages = [image1, image2, image3, image4, image5];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: "0",
    cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={mainImg}
          alt="Dark cityscape with ominous stuffed animal"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/0 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>
      </div>

      {/* Carousel Slider */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl mx-auto px-4"
      >
        <div className="relative">
          {/* Left fade */}

          <Slider {...settings}>
            {carouselImages.map((image, index) => (
              <motion.div
                key={index}
                className="px-2 py-8"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  <img
                    src={image}
                    alt={`Carousel image ${index + 1}`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    initial={{ boxShadow: "none" }}
                    whileHover={{
                      boxShadow: "0 4px 15px rgba(255, 245, 228, 0.3)",
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </Slider>

          {/* Right fade */}
        </div>
      </motion.div>
    </div>
  );
}

export default Fourth;
