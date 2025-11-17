import React from "react";
import twitter from "./assets/twitter.svg";
import ig from "./assets/ig.svg";
import circleArrow from "./assets/circlearrow.png";
import nftCalendar from "./assets/nftcalendar.png";
import discord from "./assets/discord1.svg";
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
              <a
                href="https://instagram.com/catsiege"
                target="_blank"
                rel="noopener"
                className="hover:text-gray-300"
              >
                <img src={ig} />
              </a>
              <a
                href="https://discord.gg/jTfQ42YKbq"
                target="_blank"
                rel="noopener"
                className="hover:text-gray-300 h-6 w-6"
              >
                <img src={discord} />
              </a>
              <a
                href="https://x.com/catsiege"
                target="_blank"
                rel="noopener"
                className="hover:text-gray-300"
              >
                <img src={twitter} />
              </a>
            </div>
            <div className="mt-3 text-sm text-[#FFF5E4]/70">
              <a
                href="mailto:team@catsiege.com"
                className="hover:text-[#FFF5E4] transition-colors"
              >
                team@catsiege.com
              </a>
            </div>
          </div>

          {/* Right: Privacy Policy */}
          <div className="text-sm">
            <a
              href="https://nftcalendar.io/b/solana/"
              target="_blank"
              rel="noopener"
              className="hover:underline"
            >
              As seen on
              <img src={nftCalendar} className="w-24 cursor-pointer"></img>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 text-sm">
          © 2025 ALL RIGHTS RESERVED
        </div>

        {/* Developer Credit */}
        <div className="text-center mt-4 text-xs text-white/60">
          Developed by{" "}
          <a
            href="https://cavia.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors underline"
          >
            Cavia Agency
          </a>
        </div>
      </div>
    </footer>
  );
}
