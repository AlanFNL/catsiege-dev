import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import mainImg from "../assets/landing.webp";
import { authService } from "../services/api";

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
    },
  }),
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setRequestSent(true);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-4 md:p-10 lg:p-20">
        <div className="mb-8">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10" />
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-grow max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-[#FFF5E4] mb-2">
              Reset Password
            </h1>
            <p className="text-[#FFF5E4]/60">
              Enter your email and we'll send you instructions to reset your
              password.
            </p>
          </motion.div>

          {requestSent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#FFF5E4]/5 border border-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg p-4 mb-6"
            >
              <h2 className="font-semibold text-lg mb-2">Check your email</h2>
              <p className="text-[#FFF5E4]/70">
                We've sent password reset instructions to {email}. Please check
                your inbox and follow the link to reset your password.
              </p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-[#FFF5E4] bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center w-full sm:w-auto border border-[#FFF5E4]/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="space-y-2"
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#FFF5E4]/70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFF5E4]/5 border border-[#FFF5E4]/20 rounded-lg px-4 py-2 text-[#FFF5E4] focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/30"
                  placeholder="your.email@example.com"
                />
              </motion.div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-[#FFF5E4]/20 to-[#FFF5E4]/10 hover:from-[#FFF5E4]/30 hover:to-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg px-4 py-2 font-medium transition-colors border border-[#FFF5E4]/20 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </div>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="text-[#FFF5E4]/70 hover:text-[#FFF5E4] text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </motion.form>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${mainImg})` }}
      ></div>
    </div>
  );
}
