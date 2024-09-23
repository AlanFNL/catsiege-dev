import React from "react";
import ig from "./assets/ig.svg";
import twitter from "./assets/twitter.svg";
import circleArrow from "./assets/circlearrow.png";

export default function Footer() {
  return (
    <footer className="relative bg-black text-white py-8">
      {/* Background Image */}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left: Circular Arrow Icon */}
          <div className="mb-4 md:mb-0">
            <div className="relative w-24 h-24">
              <img
                src={circleArrow}
                alt="Circular arrow"
                className="w-full h-full object-contain rotate-[110deg] md:rotate-45"
              />
            </div>
          </div>

          {/* Center: Logo and Social Icons */}
          <div className="text-center mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">CATSIEGE</h2>
            <p className="text-sm mb-2">LET THE SIEGE BEGIN</p>
            <div className="flex justify-center space-x-4 mt-6">
              <a href="#" className="hover:text-gray-300">
                <img src={ig} />
              </a>
              <a href="#" className="hover:text-gray-300">
                <img src={twitter} />
              </a>
            </div>
          </div>

          {/* Right: Privacy Policy */}
          <div className="text-sm">
            <a href="#" className="hover:underline">
              PRIVACY POLICY
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 text-sm">
          © 2024 ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}
