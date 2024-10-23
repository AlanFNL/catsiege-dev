import React from "react";
import mainImg from "./assets/4.webp";

function Fourth() {
  return (
    <div className="relative inset-0 z-0">
      <img
        src={mainImg}
        alt="Dark cityscape with ominous stuffed animal"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/0 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>
    </div>
  );
}

export default Fourth;
