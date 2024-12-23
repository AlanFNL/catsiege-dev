import React, { useState, useRef } from "react";
import orb from "../assets/guess-start4.png";
import { ArrowLeft } from "lucide-react";
import GuessingGame from "./GuessGame";
import bg from "../assets/guess-start11.webp";
import button1 from "../assets/guess-start-b.webp";
import button2 from "../assets/guess-start-b2.webp";
import { motion } from "framer-motion";
import backB from "../assets/guess-game8.png";
import bgMusic from "../assets/guess-game-music.mp3";

function Guess() {
  const [activeTab, setActiveTab] = useState("");
  const audioRef = useRef(new Audio(bgMusic));

  audioRef.current.volume = 0.2;
  audioRef.current.loop = true;

  const setRules = () => {
    setActiveTab("rules");
  };

  const backFromRules = () => {
    setActiveTab("");
  };

  const startGame = () => {
    setActiveTab("game");
    audioRef.current.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  };

  const handleBackToMenu = () => {
    setActiveTab("");
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <section className="relative w-screen h-screen bg-[url('./assets/BG.webp')]  bg-center flex justify-center items-center">
      {activeTab == "" && (
        <div className="flex h-[80vh] w-[90vw] sm:w-[500px] flex-col justify-center items-center ">
          <img
            src={bg}
            alt=""
            className="absolute object-cover mx-auto h-[80vh] w-[90vw] sm:w-[600px]"
          />
          <h1 className="mt-[18%] text-2xl font-bold z-10">
            The haunted number
          </h1>

          <div className="w-[500px] h-[80vh] md:h-[600px] flex flex-col gap-7 justify-center text-center items-center px-6">
            <div className="h-16 w-[350px]  z-10 relative group overflow-hidden">
              <img
                src={button1}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover inset-0 -mx-2.5 my-auto transition-opacity duration-300 group-hover:opacity-0"
              />
              <img
                src={button2}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover inset-0 my-auto transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              />
              <button
                onClick={startGame}
                className="z-10 text-center font-bold text-3xl relative group h-16 w-full p-0 overflow-hidden transition-all duration-300 group-hover:text-[#FBE294]"
              >
                START
              </button>
            </div>

            <div className="h-16 w-[350px]  z-10 relative group overflow-hidden">
              <img
                src={button1}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover inset-0 -mx-2.5 my-auto transition-opacity duration-300 group-hover:opacity-0"
              />
              <img
                src={button2}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover inset-0 my-auto transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              />
              <button
                onClick={setRules}
                className="z-10 text-center font-bold text-3xl relative group h-16 w-full p-0 overflow-hidden transition-all duration-300 group-hover:text-[#FBE294]"
              >
                RULES
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab == "rules" && (
        <div className="flex justify-center flex-col items-center mb-[50%] sm:mb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center"
          >
            <img
              src={bg}
              alt=""
              className="absolute h-[80vh] object-cover w-[90vw] sm:w-[600px]"
            />
            <div className="z-50 mt-[50%] sm:mt-0">
              <div className=" flex items-center justify-center mt-[20%]  sm:mb-[32%] sm:mt-[42%] hover:cursor-pointer">
                <h1 className="text-3xl font-bold flex z-10">RULES</h1>
              </div>
              <div className="w-[350px] h-[80vh] md:h-[500px] text-[10px] mt-[20%] sm:text-[12px] gap-3 flex flex-col items-center px-6 text-yellow-200 z-10">
                <p className="italic">The darkness whispers you challenge.</p>
                <p className="italic">A secret number hides in the shadows.</p>

                <p className="mt-4 italic">
                  {" "}
                  Guess it first to win, but beware the unknown.
                </p>
                <div className="border-t border-b border-[#EED88D70] py-2">
                  <div>
                    <p className="font-bold">Objective:</p>
                    <p>
                      Uncover the hidden number in the selected range before
                      your opponent.
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center font-bold">
                      Multiplier of Shadows:{" "}
                      <img src={orb} className="ml-3 mr-1" /> X20
                    </p>
                    <p>
                      Each wrong guess weakens the Multiplier. The higher the
                      Multiplier when yo guess correctly, the higher your score.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">Victory:</p>
                    <p>
                      The first to guess correctly wins. Your score depends on
                      your Multiplier and remaining attempts.
                    </p>
                  </div>
                </div>
                <p className="italic text-center">
                  Will you uncover the secret number before the darkness takes
                  over?
                </p>
              </div>
            </div>
          </motion.div>
          <img
            src={backB}
            alt="Back button"
            className="w-32 h-32 z-50  mt-[-70%] sm:mt-[-35%] object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={backFromRules}
          />
        </div>
      )}
      {activeTab == "game" && <GuessingGame onBackToMenu={handleBackToMenu} />}
    </section>
  );
}

export default Guess;
