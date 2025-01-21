import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { gameService } from "../services/api";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    recentGames: [],
    totalGames: 0,
    averages: {
      avgRoi: 0,
      avgTurns: 0,
      avgMultiplier: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await gameService.getGameStats();
        setStats({
          recentGames: data.recentGames || [],
          totalGames: data.totalGames || 0,
          averages: {
            avgRoi: data.statistics?.avgRoi || 0,
            avgTurns: data.statistics?.avgTurns || 0,
            avgMultiplier: data.statistics?.avgMultiplier || 0,
          },
        });
      } catch (error) {
        console.error("Failed to fetch game stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-[#FFF5E4] p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-[60vh]"
        >
          <div className="text-2xl">Loading statistics...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#FFF5E4] p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          Game Statistics Dashboard
        </h1>
        <ArrowLeft
          className="absolute top-4 left-4 h-12 w-12 hover:scale-125 hover:cursor-pointer transition-all"
          onClick={() => navigate("/")}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] p-6 rounded-xl border border-[#FFF5E4]/10"
          >
            <h3 className="text-[#FBE294] text-lg mb-2">Total Games</h3>
            <p className="text-4xl font-bold">{stats.totalGames}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] p-6 rounded-xl border border-[#FFF5E4]/10"
          >
            <h3 className="text-[#FBE294] text-lg mb-2">Average ROI</h3>
            <p className="text-4xl font-bold">
              {stats.averages.avgRoi > 0 ? "+" : ""}
              {stats.averages.avgRoi}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] p-6 rounded-xl border border-[#FFF5E4]/10"
          >
            <h3 className="text-[#FBE294] text-lg mb-2">Average Multiplier</h3>
            <p className="text-4xl font-bold">
              x{stats.averages.avgMultiplier}
            </p>
          </motion.div>
        </div>

        {/* Recent Games Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl border border-[#FFF5E4]/10 overflow-hidden"
        >
          <h2 className="text-2xl font-bold p-6 border-b border-[#FFF5E4]/10">
            Recent Games
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-[#FBE294]">User</th>
                  <th className="px-6 py-4 text-left text-[#FBE294]">Date</th>
                  <th className="px-6 py-4 text-left text-[#FBE294]">Turns</th>
                  <th className="px-6 py-4 text-left text-[#FBE294]">
                    Multiplier
                  </th>
                  <th className="px-6 py-4 text-left text-[#FBE294]">ROI</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentGames.map((game) => (
                  <tr
                    key={game._id}
                    className="border-t border-[#FFF5E4]/5 hover:bg-[#FFF5E4]/5"
                  >
                    <td className="px-6 py-4">{game.userEmail}</td>
                    <td className="px-6 py-4">
                      {new Date(game.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{game.turnsToWin}</td>
                    <td className="px-6 py-4">x{game.endingMultiplier}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          game.roi > 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {game.roi > 0 ? "+" : ""}
                        {game.roi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
