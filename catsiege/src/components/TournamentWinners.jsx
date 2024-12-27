import React, { useState } from "react";
import { motion } from "framer-motion";
import tournbg from "../assets/tourn-bg.webp";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

const winners = [
  {
    rank: 1,
    name: "CatSiege Zero75",
    image:
      "https://na-assets.pinit.io/9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb/328efc9d-a122-4512-8261-cebff2b5d821/43",
  },
  {
    rank: 2,
    name: "CatSiege Zero380",
    image:
      "https://na-assets.pinit.io/9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb/328efc9d-a122-4512-8261-cebff2b5d821/17",
  },
  {
    rank: 3,
    name: "CatSiege Zero 35",
    image:
      "https://na-assets.pinit.io/9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb/328efc9d-a122-4512-8261-cebff2b5d821/44",
  },
  {
    rank: 4,
    name: "CatSiege Zero64",
    image:
      "https://na-assets.pinit.io/9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb/328efc9d-a122-4512-8261-cebff2b5d821/164",
  },
  {
    rank: 5,
    name: "CatSiege Zero282",
    image:
      "https://img-cdn.magiceden.dev/rs:fill:640:0:0/plain/https%3A%2F%2Fna-assets.pinit.io%2F9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb%2F328efc9d-a122-4512-8261-cebff2b5d821%2F358",
  },
  {
    rank: 6,
    name: "CatSiege Zero466",
    image:
      "https://img-cdn.magiceden.dev/rs:fill:640:0:0/plain/https%3A%2F%2Fna-assets.pinit.io%2F9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb%2F328efc9d-a122-4512-8261-cebff2b5d821%2F260",
  },
  {
    rank: 7,
    name: "CatSiege Zero322",
    image:
      "https://img-cdn.magiceden.dev/rs:fill:640:0:0/plain/https%3A%2F%2Fna-assets.pinit.io%2F9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb%2F328efc9d-a122-4512-8261-cebff2b5d821%2F30",
  },
  {
    rank: 8,
    name: "CatSiege Zero461",
    image:
      "https://img-cdn.magiceden.dev/rs:fill:640:0:0/plain/https%3A%2F%2Fna-assets.pinit.io%2F9Tu1Gg7c1anzGcmjDXL5ttYzuKRXiPPkPhae2Fci5wbb%2F328efc9d-a122-4512-8261-cebff2b5d821%2F500",
  },
];

const TournamentWinners = () => {
  const { width, height } = useWindowSize();
  const [showHoverConfetti, setShowHoverConfetti] = useState(false);

  return (
    <div className="min-h-screen relative text-[#FFF5E4] p-8">
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={200}
        recycle={false}
      />
      {showHoverConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
        />
      )}
      <div className="absolute inset-0">
        <img src={tournbg} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>
      </div>

      <div className="relative z-10">
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 text-[#FFF5E4]">
            Tournament Champion
          </h1>

          <motion.div
            className="relative aspect-[16/9] h-96 w-full rounded-2xl overflow-hidden border border-gray-500/50"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onHoverStart={() => setShowHoverConfetti(true)}
            onHoverEnd={() => setShowHoverConfetti(false)}
          >
            <img
              src={winners[0].image}
              alt={winners[0].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-4xl font-bold text-[#FFF5E4]mb-2">
                {winners[0].name}
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-yellow-400 text-black px-4 py-1 rounded-full font-bold">
                  CHAMPION
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-3xl flex flex-col items-center justify-center mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-400">
            Runners Up
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 ">
            {winners.slice(1).map((winner, index) => (
              <motion.div
                key={winner.rank}
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="absolute  -top-2 z-10 bg-gray-800 text-[#FFF5E4] 
                            px-3 py-1 rounded-full font-bold shadow-lg"
                >
                  #{winner.rank}
                </div>

                <div
                  className="aspect-square w-16 h-16 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-700 
                            group-hover:border-yellow-400/50 transition-all duration-300"
                >
                  <img
                    src={winner.image}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max opacity-0 
                            group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300
                            bg-gray-800 text-white px-3 py-1 rounded-full text-sm z-50"
                >
                  {winner.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentWinners;
