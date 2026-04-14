import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full border border-gray rounded-lg px-4 py-2.5 text-sm text-dark bg-white outline-none focus:border-dark/30 transition";

const inputClassLight =
  "w-full border border-white/30 rounded-lg px-4 py-2.5 text-sm text-dark bg-white outline-none focus:border-white/60 transition";

const fieldAnim = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: "auto", marginTop: 0 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
  transition: { duration: 0.2 },
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // Sign in state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Sign up state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const registerEmailFilled = registerEmail.trim().length > 0;
  const headingSize = registerEmailFilled ? "text-2xl" : "text-4xl";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-2000 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative flex w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 text-dark/40 hover:text-dark text-2xl transition-colors"
            >
              <IoCloseSharp />
            </button>

            {/* ── Sign In panel ── */}
            <div className="flex-1 bg-neutral p-10 flex flex-col justify-center gap-4">
              <h2 className="text-4xl font-bold text-dark">
                {resetMode ? "Reset password." : "Sign in."}
              </h2>

              <div className="flex flex-col gap-3 mt-1">
                <AnimatePresence initial={false}>
                  {resetMode ? (
                    <motion.div key="reset-block" {...fieldAnim} className="flex flex-col gap-3 overflow-hidden">
                      <p className="text-sm text-dark/60">
                        Enter your email and we'll send you a reset link.
                      </p>
                      <input
                        type="email"
                        placeholder="Email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={inputClass}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="login-block" {...fieldAnim} className="flex flex-col gap-3 overflow-hidden">
                      <input
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={inputClass}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setResetMode((r) => !r)}
                  className="text-left text-xs text-dark/50 hover:text-dark transition-colors"
                >
                  {resetMode ? "← Back to login" : "Forgot your password?"}
                </button>
              </div>

              <button
                type="button"
                className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
              >
                {resetMode ? "Send reset link" : "Login"}
              </button>
            </div>

            {/* ── Sign Up panel ── */}
            <div className="flex-1 bg-secondary p-10 flex-col justify-center gap-4 hidden sm:flex">
              <div>
                <h2 className={`${headingSize} font-bold text-white transition-all duration-200`}>
                  Hey new friend!
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  Sign up and start locating some Lounas!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={inputClassLight}
                />

                <AnimatePresence initial={false}>
                  {registerEmailFilled && (
                    <motion.div
                      key="register-extra"
                      className="flex flex-col gap-3 overflow-hidden"
                      {...fieldAnim}
                    >
                      <input
                        type="password"
                        placeholder="Password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className={inputClassLight}
                      />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={registerConfirm}
                        onChange={(e) => setRegisterConfirm(e.target.value)}
                        className={inputClassLight}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
