import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  CheckCircle2, 
  Flame, 
  BrainCircuit, 
  Zap, 
  Sun, 
  Moon 
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// Interface for FAQ item
interface FAQItem {
  question: string;
  answer: string;
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoInput, setDemoInput] = useState("Build portfolio");
  const [demoSubtasks, setDemoSubtasks] = useState<string[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);

  const faqData: FAQItem[] = [
    {
      question: "How is Momentum AI different from standard todo apps?",
      answer: "Standard todo apps only remind you of what you missed. Momentum AI acts like a personal coach: it breaks big goals into actionable steps, schedules them in your free blocks, writes contextual reminders, and gives weekly coaching advice based on your habits."
    },
    {
      question: "Does it connect to my calendar?",
      answer: "Yes! Momentum AI integrates with Google Calendar to understand your meeting schedules and meal times, finding the optimal blocks for focus tasks."
    },
    {
      question: "What AI model runs behind the scenes?",
      answer: "We use Google Gemini via Google AI Studio. It leverages gemini-2.0-flash for high-speed subtask structuring and prioritizations, giving you instant responses."
    },
    {
      question: "Is there support for dark mode?",
      answer: "Absolutely. Momentum AI is built with full dark mode styling. You can toggle it at the top right of the landing page or dashboard."
    }
  ];

  const simulateBreakdown = () => {
    if (demoInput.trim() === "") return;
    setDemoLoading(true);
    setDemoSubtasks([]);
    
    setTimeout(() => {
      setDemoLoading(false);
      setDemoSubtasks([
        "🔍 Research: Study 3 target competitor portfolios (1h)",
        "🎨 Design: Outline color schemes, fonts, and wireframes in Figma (2h)",
        "💻 Frontend: Build React + Tailwind layout with page routing (4h)",
        "⚙️ Backend: Setup Node.js API with Express & Firebase storage (3h)",
        "🧪 Testing: Validate responsiveness and test loading skeletons (1.5h)",
        "🚀 Deployment: Deploy frontend on Vercel and backend on Cloud Run (1h)"
      ]);
    }, 1200);
  };

  // Trigger demo simulation on mount to catch attention
  useEffect(() => {
    const timer = setTimeout(() => {
      simulateBreakdown();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-400/20 dark:bg-accent-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-400/20 dark:bg-indigo-600/10 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <nav className="sticky top-0 z-50 glass-card mx-4 my-3 rounded-2xl px-6 py-4 flex items-center justify-between border border-white/20 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-600/30">
            <Zap className="w-5 h-5 fill-white" />
          </span>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Momentum<span className="text-accent-600">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">Success Stories</a>
          <a href="#faq" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <Link 
            to="/signin" 
            className="hidden sm:inline-flex text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-accent-600 dark:hover:text-accent-400 px-4 py-2 transition-colors"
          >
            Sign In
          </Link>
          
          <Link 
            to="/signup" 
            className="inline-flex text-sm font-semibold text-white bg-accent-600 hover:bg-accent-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg shadow-accent-600/20 hover:shadow-accent-600/30 transition-all items-center gap-1.5"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 md:py-32 grid md:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="md:col-span-7 space-y-6 text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-700 dark:bg-accent-950/60 dark:text-accent-400 border border-accent-200 dark:border-accent-800">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Productivity Coach
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Finish work. <br />
            <span className="text-gradient">Stop procrastinating.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Your AI productivity partner that helps you finish work instead of just reminding you. Momentum AI breaks down projects, optimizes schedules, and delivers context-aware focus reminders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              to="/signup" 
              className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold shadow-lg shadow-accent-600/25 transition-all text-base"
            >
              Start Free Coaching <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#demo" 
              className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-xl glass-card text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-slate-900/90 font-semibold transition-all border border-slate-200 dark:border-slate-800 text-base"
            >
              See AI in Action
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Google Login Integrated
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Card Required
            </div>
          </div>
        </motion.div>

        {/* Hero Interactive Mockup */}
        <motion.div 
          className="md:col-span-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          id="demo"
        >
          <div className="glass-card rounded-2xl border border-white/40 dark:border-slate-800 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-full blur-xl" />
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-accent-600" />
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">AI Task Breakdown Demo</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Enter a project/task</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={demoInput} 
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="e.g. Build app, Prep interview"
                    className="flex-1 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
                  />
                  <button 
                    onClick={simulateBreakdown}
                    disabled={demoLoading}
                    className="bg-accent-600 hover:bg-accent-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 shrink-0 disabled:opacity-70"
                  >
                    Breakdown
                  </button>
                </div>
              </div>

              {/* Subtasks Box */}
              <div className="min-h-[220px] bg-slate-100/50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/40 relative">
                <AnimatePresence mode="wait">
                  {demoLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    >
                      <div className="w-8 h-8 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gemini generating subtasks...</p>
                    </motion.div>
                  ) : demoSubtasks.length > 0 ? (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2.5"
                    >
                      {demoSubtasks.map((task, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium leading-normal bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Enter a goal above and click Breakdown to see AI magic.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Designed for execution, not just scheduling
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
            Reminders don't solve procrastination. Dynamic, context-aware assistance does. Meet our core AI features.
          </p>
        </div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/5 dark:text-accent-400 inline-flex">
                <BrainCircuit className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">AI Task Breakdown</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Break complex goals down into immediate tasks with time estimates, difficulty rank, and step-by-step guidance automatically.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400 inline-flex">
                <Clock className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Smart Prioritization</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sort lists automatically based on real metrics: deadline closeness, task dependencies, effort estimation, and user history.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400 inline-flex">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Context Reminders</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive natural, smart reminders matching your free blocks. "You have 2 hours before dinner. Tackle research now."
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 inline-flex">
                <Flame className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Weekly Review Synthesis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Get custom reports highlighting achievements, weak links, focus streaks, and actionable recommendations to perform better.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-100/50 dark:bg-slate-900/30 py-20 border-t border-b border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Four steps to momentum
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
              The road to getting work finished has never been simpler.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Sign In & Connect</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log in via Google or Email in seconds. Give access to basic calendars.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-accent-600/80 text-white font-bold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Input Your Goals</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Add projects, homework, or checklists. Speak them directly using our Voice Assistant.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-accent-600/60 text-white font-bold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Execute Focus Blocks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter Pomodoro Focus Mode. Block distracting browser sites automatically.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-accent-600/40 text-white font-bold flex items-center justify-center text-sm shadow-md">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Review & Improve</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive weekly productivity summaries and personalized tips generated by Gemini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Success Stories
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
            See how professionals and students unlock their full potential with Momentum AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 relative flex flex-col justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-6 leading-relaxed">
              "The subtask breakdowns are scarily accurate. Entering 'Launch new marketing campaign' created specific steps I hadn't even thought of. I finished the campaign 3 days early."
            </p>
            <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-700 dark:text-accent-400 font-bold text-sm">
                SB
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sarah Brown</h4>
                <p className="text-xs text-slate-400">Marketing Lead</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 relative flex flex-col justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-6 leading-relaxed">
              "As a student juggling coursework and a part-time job, my biggest issue was starting. The context-aware notifications are amazing—they prompt me precisely when I actually have time."
            </p>
            <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                JM
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Jason Miller</h4>
                <p className="text-xs text-slate-400">Computer Science Student</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-950 relative flex flex-col justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-6 leading-relaxed">
              "The weekly analysis helped me realize my focus drops significantly on Thursday afternoons. The AI suggested taking short walks and rescheduled heavy coding to Fridays. Brilliant tool!"
            </p>
            <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-sm">
                AL
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alice Lim</h4>
                <p className="text-xs text-slate-400">Senior UX Designer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className="glass-card border border-slate-250 dark:border-slate-850 rounded-2xl overflow-hidden"
            >
              <button
                className="w-full text-left p-6 font-semibold flex items-center justify-between text-slate-900 dark:text-white focus:outline-none"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <span>{item.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-850/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-tr from-accent-600 via-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to build momentum?
            </h2>
            <p className="text-blue-100 text-base leading-relaxed">
              Join thousands of professionals and students who are completing work, beating deadlines, and building long-lasting routines.
            </p>
            <div className="pt-4">
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-accent-700 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all text-base"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/30 dark:bg-slate-950/30 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              Momentum<span className="text-accent-600">AI</span>
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-accent-600 dark:hover:text-accent-400">Features</a>
            <a href="#how-it-works" className="hover:text-accent-600 dark:hover:text-accent-400">How It Works</a>
            <a href="#faq" className="hover:text-accent-600 dark:hover:text-accent-400">FAQ</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Momentum AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
