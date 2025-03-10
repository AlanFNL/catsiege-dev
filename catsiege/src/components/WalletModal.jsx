import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";
import { WalletConnect } from "./WalletConnect";

export default function WalletModal({ isOpen, onClose }) {
  const [showHelp, setShowHelp] = useState(false);

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

                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <h1 className="text-2xl font-bold text-[#FFF5E4]">
                        Connect Wallet
                      </h1>
                      <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="text-[#FFF5E4]/60 hover:text-[#FFF5E4] transition-colors mt-12 -mr-2"
                      >
                        <HelpCircle size={20} />
                      </button>
                    </div>
                    <p className="text-[#FFF5E4]/60 mt-2">
                      Connect your Solana wallet to verify NFT ownership
                    </p>
                  </div>

                  {showHelp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-[#FFF5E4]/5 p-4 rounded-lg"
                    >
                      <h3 className="text-[#FFF5E4] font-bold mb-2">
                        Wallet Help
                      </h3>
                      <ul className="text-sm text-[#FFF5E4]/80 space-y-2 list-disc pl-4">
                        <li>Phantom is the recommended wallet for CatSiege</li>
                        <li>
                          If you don't have Phantom installed, you'll see an
                          option to install it
                        </li>
                        <li>
                          If you're having connection issues, try refreshing the
                          page
                        </li>
                        <li>
                          Your wallet must be connected to the Solana network
                        </li>
                        <li>
                          You must approve the connection request in your wallet
                          app
                        </li>
                      </ul>
                    </motion.div>
                  )}

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
