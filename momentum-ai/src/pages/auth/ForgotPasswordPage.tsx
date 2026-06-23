import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Zap, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-400/10 dark:bg-accent-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[140px] rounded-full -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <span className="p-2 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-600/30">
            <Zap className="w-5 h-5 fill-white" />
          </span>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            Momentum<span className="text-accent-600">AI</span>
          </span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We'll send you instructions to restore your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card py-8 px-6 sm:px-10 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-xl"
        >
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold leading-relaxed">
              Check your inbox! We sent password reset instructions to <strong>{email}</strong>.
            </div>
          )}

          <form className="space-y-5" onSubmit={handlePasswordReset}>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-600 hover:bg-accent-700 disabled:opacity-75 text-white font-semibold py-3 rounded-xl shadow-lg shadow-accent-600/10 hover:shadow-accent-600/20 transition-all flex items-center justify-center gap-1.5 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Send Instructions <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm">
            <Link 
              to="/signin" 
              className="inline-flex items-center gap-1.5 font-semibold text-accent-600 dark:text-accent-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
