import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import mainImg from "../assets/landing.webp";

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

const passwordRequirements = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pass) => pass.length >= 8,
  },
  { id: "number", label: "One number", test: (pass) => /\d/.test(pass) },
  {
    id: "special",
    label: "One special character",
    test: (pass) => /[!@#$%^&*]/.test(pass),
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const isEmailValid = formData.email.includes("@");
    const isPasswordValid = validatePassword(formData.password);
    const doPasswordsMatch = formData.password === formData.confirmPassword;
    const areFieldsFilled =
      formData.email && formData.password && formData.confirmPassword;

    setIsFormValid(
      isEmailValid && isPasswordValid && doPasswordsMatch && areFieldsFilled
    );
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validatePassword = (password) => {
    return passwordRequirements.every((req) => req.test(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData.email, formData.password);
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-[#FFF5E4] flex flex-col"
    >
      <ArrowLeft
        onClick={() => {
          navigate("/");
        }}
        className="absolute left-2 top-2 h-12 w-12 z-10 p-2 hover:scale-90 transition-all cursor-pointer"
      />
      <div className="absolute inset-0 z-0">
        <img
          src={mainImg}
          alt="Dark cityscape with ominous stuffed animal"
          className="h-full w-full object-cover blur-md opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/10 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent"></div>

      <motion.div
        className="relative z-10 max-w-md w-full mx-auto mt-20 p-8"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="Logo"
          className="h-12 w-auto mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Join the Siege
        </motion.h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black/50 border border-[#FFF5E4] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/50"
              value={formData.email}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full bg-black/50 border border-[#FFF5E4] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/50"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFF5E4]/60 hover:text-[#FFF5E4] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password requirements checklist */}
            <div className="mt-2 space-y-2 bg-black/50 p-2 rounded-md">
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center text-sm">
                  {req.test(formData.password) ? (
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span
                    className={
                      req.test(formData.password)
                        ? "text-green-500 text-lg font-bold"
                        : "text-red-500 text-lg font-bold"
                    }
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                className="w-full bg-black/50 border border-[#FFF5E4] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFF5E4]/50"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFF5E4]/60 hover:text-[#FFF5E4] transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Show password match status if both fields have content */}
            {formData.password && formData.confirmPassword && (
              <div className="mt-2 flex items-center">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-500 text-sm">
                      Passwords match
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-red-500 text-sm">
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>

          <motion.button
            className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isFormValid && !loading
                ? "bg-[#FFF5E4] text-black hover:bg-[#FFF5E4]/90"
                : "bg-[#FFF5E4]/50 text-black/50 cursor-not-allowed"
            }`}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Register
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          className="mt-6 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#FFF5E4] underline hover:text-[#FFF5E4]/80"
          >
            Sign in here
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
