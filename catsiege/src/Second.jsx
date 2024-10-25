import React from "react";

import mainImg from "./assets/fight.webm";

// Add more images as needed

function Second() {
  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          playsInline
          muted
          src={mainImg}
          alt="Dark cityscape with ominous stuffed animal"
          className="h-full w-full object-cover"
        />
        {/* Black fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>
      </div>
      <div className="absolute top-0 text-white w-full">
        <ul
          className="flex text-xs md:text-lg flex-row justify-evenly items-center border-b border-t p-2"
          style={{ borderColor: "rgba(255, 245, 228, 1)" }}
        >
          <li className="border-r px-4"> CATSIEGE </li>
          <li className="md:border-r px-4"> LET THE SIEGE BEGIN </li>
          <li className="border-r px-4 hidden md:block">
            {" "}
            LET THE SIEGE BEGIN{" "}
          </li>
          <li className="border-l md:border-0 px-4"> CATSIEGE </li>
        </ul>
      </div>
    </div>
  );
}

export default Second;
