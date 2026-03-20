import { motion } from 'motion/react';
import { ArrowRight, TerminalSquare } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400 mb-8"
      >
        <TerminalSquare className="w-3 h-3" />
        <span>v2.0.0-stable</span>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6"
      >
        Deploy WhatsApp Bots <br className="hidden md:block" />
        <span className="text-neutral-500">in seconds.</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10"
      >
        HuTao MD Cloner provides a seamless, infrastructure-free way to clone and run your WhatsApp bot instances directly from your browser.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <a 
          href="#clone"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-medium text-sm hover:bg-neutral-200 transition-colors"
        >
          Start Deployment <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </section>
  );
}
