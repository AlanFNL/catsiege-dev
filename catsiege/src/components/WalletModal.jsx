import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { WalletConnect } from "./WalletConnect";

export default function WalletModal({ isOpen, onClose }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[1000] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-screen px-4 text-center">
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <motion.div
                className="inline-block w-full max-w-md my-8 text-left align-middle transition-all transform bg-black shadow-xl rounded-2xl border border-[#FFF5E4]/20"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative p-6">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[#FFF5E4]/60 hover:text-[#FFF5E4]"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#FFF5E4] mb-2">
                      Connect Wallet
                    </h1>
                    <p className="text-[#FFF5E4]/60">
                      Connect your Solana wallet to verify NFT ownership
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <WalletConnect onClose={onClose} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
