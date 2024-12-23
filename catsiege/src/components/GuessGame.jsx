import React, { useState, useEffect } from "react";
import game1 from "../assets/guess-game1.png";
import game4 from "../assets/guess-game4.png";
import { motion } from "framer-motion";
import orb from "../assets/guess-start4.png";
import time from "../assets/guess-game5.png";
import cpu1 from "../assets/guess-game6.webp";
import cpu2 from "../assets/guess-game7.webp";
import button1 from "../assets/guess-start-b.webp";
import button2 from "../assets/guess-start-b2.webp";

import * as Slider from "@radix-ui/react-slider";
import bg from "../assets/guess-start11.webp";
import backB from "../assets/guess-game8.png";
const GuessingGame = ({ onBackToMenu }) => {
  const [stage, setStage] = useState("playing");
  const [rangeMax] = useState(256);
  const [secretNumber, setSecretNumber] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [turns, setTurns] = useState(0);
  const [multiplier, setMultiplier] = useState(20);
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(256);
  const [guessedRanges, setGuessedRanges] = useState([]);
  const [isCpuTurn, setIsCpuTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const MAX_TURNS = 6;
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const TURN_TIME_LIMIT = 999; // seconds

  useEffect(() => {
    setSecretNumber(Math.floor(Math.random() * 256) + 1);
  }, []);

  useEffect(() => {
    let timeoutId;

    if (isCpuTurn && !gameOver) {
      const cpuGuess = Math.floor((minRange + maxRange) / 2);

      timeoutId = setTimeout(() => {
        handleGuess(cpuGuess, true);
      }, 2000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCpuTurn]);

  useEffect(() => {
    let timerId;

    if (timerActive && !isCpuTurn && !gameOver && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    // Handle time running out
    if (timeLeft === 0 && !isCpuTurn) {
      const newMultiplier = multiplier / 2;
      setMultiplier(newMultiplier);
      setIsCpuTurn(true);
      setTimerActive(false);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timeLeft, timerActive, isCpuTurn, gameOver]);

  // Initialize timer when component mounts
  useEffect(() => {
    setTimeLeft(TURN_TIME_LIMIT);
    setTimerActive(true);
  }, []);

  const handleGuess = (guess, isCpu = false) => {
    const numericGuess = parseInt(guess, 10);
    const newTurns = turns + 1;
    setTurns(newTurns);

    if (!isCpu && newTurns > MAX_TURNS) {
      setGameOver(true);
      setHasWon(false);
      setStage("result");
      return;
    }

    if (!isCpu) {
      const newMultiplier = multiplier / 2;
      setMultiplier(newMultiplier);

      if (newMultiplier <= 0) {
        setGameOver(true);
        setHasWon(false);
        setStage("result");
        return;
      }
    }

    if (numericGuess < secretNumber) {
      setMinRange(numericGuess);
      setGuessedRanges([
        ...guessedRanges,
        { min: minRange, max: numericGuess },
      ]);
      setUserGuess(numericGuess.toString());

      if (!isCpu) {
        setIsCpuTurn(true);
        setTimerActive(false);
      } else {
        // First wait for CPU turn overlay to fade out
        setTimeout(() => {
          setIsCpuTurn(false);
          // Then show feedback after a short delay
          setTimeout(() => {
            setFeedback("HIGHER!");
            // Clear feedback and start timer after feedback duration
            setTimeout(() => {
              setFeedback(null);
              setTimeLeft(TURN_TIME_LIMIT);
              setTimerActive(true);
            }, 3000);
          }, 500);
        }, 2000);
      }
    } else if (numericGuess > secretNumber) {
      setMaxRange(numericGuess);
      setGuessedRanges([
        ...guessedRanges,
        { min: numericGuess, max: maxRange },
      ]);
      setUserGuess(numericGuess.toString());

      if (!isCpu) {
        setIsCpuTurn(true);
        setTimerActive(false);
      } else {
        // First wait for CPU turn overlay to fade out
        setTimeout(() => {
          setIsCpuTurn(false);
          // Then show feedback after a short delay
          setTimeout(() => {
            setFeedback("LOWER!");
            // Clear feedback and start timer after feedback duration
            setTimeout(() => {
              setFeedback(null);
              setTimeLeft(TURN_TIME_LIMIT);
              setTimerActive(true);
            }, 3000);
          }, 500);
        }, 2000);
      }
    } else {
      setHasWon(!isCpu);
      setGameOver(true);
      setScore(multiplier * (rangeMax - turns));
      setStage("result");
    }
  };

  const handleGuessSubmit = () => {
    if (!isCpuTurn && !gameOver) {
      handleGuess(userGuess);
    }
  };

  const handleSliderChange = (values) => {
    const value = values[0];
    const boundedValue = Math.max(minRange, Math.min(value, maxRange));
    setUserGuess(boundedValue.toString());
  };

  return (
    <div style={{ padding: "20px" }}>
      {stage === "playing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 w-[80vw] mx-auto mt-[-70%] sm:mt-0"
        >
          <img src={game1} className="absolute w-[100vw] h-[80vh] sm:h-auto" />
          <h1 className="text-2xl sm:text-xl md:text-3xl text-center font-extrabold z-50 absolute  mt-[20%] sm:mt-[5.5%]">
            YOUR TURN
            {!feedback && !isCpuTurn && (
              <p className="mt-16 text-xl">
                Choose a number between{" "}
                <div className="flex justify-center items-center gap-4">
                  <div
                    className="p-4 sm:p-6 flex justify-center bg-[url('./assets/guess-game2.png')] hover:opacity-60 bg-cover 
                     transition-all duration-300 
                    rounded-full h-16 w-16 sm:h-24 sm:w-24 text-center"
                  >
                    <h2 className="text-2xl sm:text-5xl font-bold text-center">
                      {minRange}
                    </h2>
                  </div>{" "}
                  and{" "}
                  <div
                    className="p-4 sm:p-6 flex justify-center bg-[url('./assets/guess-game2.png')] hover:opacity-60 bg-cover 
                     transition-all duration-300 
                    rounded-full h-16 w-16 sm:h-24 sm:w-24 text-center"
                  >
                    <h2 className="text-2xl sm:text-5xl font-bold text-center">
                      {maxRange || rangeMax}
                    </h2>
                  </div>
                </div>
              </p>
            )}
          </h1>

          <div className="w-full space-y-4 z-30 mt-[100%] sm:mt-[25%]">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div
                  className="p-6 sm:flex justify-center bg-[url('./assets/guess-game2.png')] hover:opacity-60 bg-cover 
                     transition-all duration-300 
                    rounded-full h-24 w-24 text-center hidden"
                >
                  <h2 className="!text-5xl font-bold text-center">
                    {isCpuTurn || feedback ? "??" : minRange}
                  </h2>
                </div>
                <div className="relative flex-1">
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-8"
                    value={[parseInt(userGuess) || minRange]}
                    max={maxRange || rangeMax}
                    min={minRange}
                    step={1}
                    onValueChange={handleSliderChange}
                  >
                    {/* Track background */}
                    <Slider.Track className="relative h-4 w-full grow rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3c3b37] via-[#504d45] to-[#3c3b37]" />

                      {/* Filled track */}
                      <Slider.Range className="absolute h-full bg-gradient-to-r from-[#c4b48d] via-[#FBE294] to-[#FBE294]" />
                    </Slider.Track>

                    {/* Thumb with number */}
                    <Slider.Thumb className="block w-8 h-8 rounded-full bg-gradient-to-br from-[#d4d0c5] to-[#a39f8f] shadow-lg ring-2 ring-[#847f6f] focus:outline-none">
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-[#FBE294]">
                        {userGuess || minRange}
                      </span>
                    </Slider.Thumb>
                  </Slider.Root>
                </div>
                <div
                  className="p-6 sm:flex justify-center bg-[url('./assets/guess-game2.png')] hover:opacity-60 bg-cover 
                     transition-all duration-300 
                    rounded-full h-24 w-24 text-center hidden"
                >
                  <h2 className="!text-5xl font-bold text-center">
                    {feedback || isCpuTurn ? "??" : maxRange || rangeMax}
                  </h2>
                </div>
              </div>
              <div className="h-10"></div>
              <div className="mb-[20%] sm:mb-0 text-xl flex gap-2 items-center z-30 text-yellow-200 w-full justify-evenly">
                <div className="flex gap-2 items-center text-4xl">
                  {" "}
                  <img src={orb} alt="" className="h-8 w-8" /> x
                  {multiplier.toFixed(1)}
                </div>
                <div className="flex gap-2 items-center text-4xl">
                  <img src={time} className="h-8 w-8" />{" "}
                  {timerActive ? `${timeLeft}s` : "--"}
                </div>
              </div>
            </div>
            <div className=" flex justify-center items-center h-16 disabled:opacity-60 z-10 relative group overflow-hidden">
              <img
                src={button1}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover disabled:opacity-60 ml-[-2%] transition-opacity duration-300 group-hover:opacity-0"
              />
              <img
                src={button2}
                alt=""
                className="h-[110px] w-[350px] absolute object-cover disabled:opacity-60 inset-0 my-auto mx-auto transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              />
              <button
                disabled={!userGuess}
                onClick={handleGuessSubmit}
                className="z-10 text-center font-bold text-xl disabled:opacity-60 relative group h-16 w-full p-0 overflow-hidden transition-all duration-300 group-hover:text-[#FBE294]"
              >
                CHOOSE NUMBER
              </button>
            </div>
          </div>

          {/* Timer warning only shows when timer is active */}
          {timerActive && !isCpuTurn && timeLeft <= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[100] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl font-bold"
            >
              {timeLeft}
            </motion.div>
          )}

          {/* CPU Turn Overlay */}
          {isCpuTurn && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            >
              <div className="flex flex-col h-[400px] w-[80vw] sm:h-[600px] sm:w-[600px] justify-center items-center">
                <img src={cpu2} alt="" />
                <img src={cpu1} alt="" className="w-1/2 h-1/2" />
              </div>
            </motion.div>
          )}

          {/* Feedback Animation */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="absolute z-[100] top-[50vh] w-[500px] flex justify-center items-center"
            >
              <img src={game4} className="z-20 absolute" />
              <p className="z-[100] font-bold text-center mt-[30%] absolute text-4xl">
                {feedback}
              </p>
            </motion.div>
          )}

          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            >
              <div className="bg-gray-900/90 p-8 rounded-xl border-2 border-yellow-500">
                <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                  {hasWon
                    ? "You Won!"
                    : turns > MAX_TURNS
                    ? "Out of Turns!"
                    : multiplier <= 0
                    ? "Multiplier Depleted!"
                    : "CPU Won!"}
                </h2>
                <p className="text-white">
                  {turns > MAX_TURNS
                    ? "You've exceeded the maximum number of turns!"
                    : multiplier <= 0
                    ? "You ran out of multiplier power!"
                    : `The number was: ${secretNumber}`}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {stage === "result" && (
        <div className="flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center"
          >
            <img src={bg} alt="" className="absolute h-[80vh] w-[600px]" />
            <h1 className="mb-[30%] mt-[15%] text-2xl font-bold flex z-50">
              CONGRATULATIONS!
            </h1>
            <div className="w-[350px] h-[400px] z-50 text-sm gap-3 flex flex-col items-center px-6 text-yellow-200">
              <p className="italic text-center">
                The shadows recede as you uncover the secret number.
              </p>
              <p className="italic">You've outwitted the night.</p>

              <div className="border-t border-b border-[#EED88D70] py-2 w-full">
                <div>
                  <p className="font-bold">Your balance:</p>

                  <p className="flex items-center">
                    The experience you retained:{" "}
                    <img src={orb} className="ml-3 mr-1" /> x{multiplier}
                  </p>
                </div>
              </div>
              <p className="italic text-center">
                The shadows may fade, but your victory echoes through the dark.
              </p>
            </div>
          </motion.div>
          <img
            src={backB}
            alt="Back button"
            className="w-32 h-32 z-50 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onBackToMenu}
          />
        </div>
      )}
    </div>
  );
};

export default GuessingGame;
