import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

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

export default function AuthForm() {
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

  // Hook file usage
  const {
    loading,
    error,
    loginWithPW,
    loginWithWebauth,
    registerWithPW,
    registerWithWebauth
  } = useAuth();

  // Helpers for the authentication 
  async function handleLogin() {
    try { await loginWithPW(loginEmail.trim(), loginPassword) } catch { }
  }
  async function handleLoginPasskey() {
    try { await loginWithWebauth(loginEmail.trim()) } catch { }
  }
  async function handleRegisterPasskey() {
    try { await registerWithWebauth(registerEmail.trim()) } catch { }
  }

  async function handleRegister() {
    if (registerPassword !== registerConfirm) alert("Passwords do not match!");
    try { await registerWithPW(registerEmail.trim(), registerPassword) } catch { }
  }

  return (
    <div className="flex flex-col sm:flex-row w-full rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Sign In panel ── */}
      <div className="flex-1 bg-neutral p-8 sm:p-10 flex flex-col justify-center gap-4">
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
          onClick={handleLoginPasskey}
          className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          {resetMode ? "Send reset link" : "Login With Passkey"}
        </button>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          {resetMode ? "Send reset link" : "Login"}
        </button>
      </div>

      {/* ── Sign Up panel ── */}
      <div className="flex-1 bg-secondary p-8 sm:p-10 flex flex-col justify-center gap-4">
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
          onClick={handleRegisterPasskey}
          className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          Sign Up With Passkey
        </button>

        <button
          type="button"
          onClick={handleRegister}
          className="w-full bg-primary text-white font-bold py-3 rounded-4xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

