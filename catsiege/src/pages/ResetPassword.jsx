import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setError(
        "Invalid or missing reset token. Please request a new password reset."
      );
      return;
    }

    setToken(tokenParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      setResetSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
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
              Set New Password
            </h1>
            <p className="text-[#FFF5E4]/60">
              Create a new password for your account
            </p>
          </motion.div>

          {resetSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#FFF5E4]/5 border border-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg p-4 mb-6"
            >
              <h2 className="font-semibold text-lg mb-2">
                Password reset successful!
              </h2>
              <p className="text-[#FFF5E4]/70">
                Your password has been updated. You can now log in with your new
                password.
              </p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-[#FFF5E4] bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center w-full sm:w-auto border border-[#FFF5E4]/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Login
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
                  htmlFor="password"
                  className="block text-sm font-medium text-[#FFF5E4]/70"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#FFF5E4]/5 border border-[#FFF5E4]/20 rounded-lg px-4 py-2 text-[#FFF5E4] focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/30"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FFF5E4]/40 hover:text-[#FFF5E4]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-[#FFF5E4]/40">
                  Must be at least 8 characters
                </p>
              </motion.div>

              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="space-y-2"
              >
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#FFF5E4]/70"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#FFF5E4]/5 border border-[#FFF5E4]/20 rounded-lg px-4 py-2 text-[#FFF5E4] focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/30"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FFF5E4]/40 hover:text-[#FFF5E4]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </motion.div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !token}
                  className={`w-full bg-gradient-to-r from-[#FFF5E4]/20 to-[#FFF5E4]/10 hover:from-[#FFF5E4]/30 hover:to-[#FFF5E4]/20 text-[#FFF5E4] rounded-lg px-4 py-2 font-medium transition-colors border border-[#FFF5E4]/20 ${
                    loading || !token ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
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
