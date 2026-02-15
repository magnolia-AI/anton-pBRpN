import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          VY <span className="text-cyan-400">ARCADE</span>
        </h1>
        <p className="text-xl text-white/60 mb-12 max-w-lg mx-auto">
          Experience high-performance browser gaming built with cutting-edge 3D technology.
        </p>

        <Link to="/game">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-2xl font-bold text-xl transition-colors hover:bg-cyan-400"
          >
            <Play className="w-6 h-6 fill-current" />
            ENTER THE RIFT
          </motion.button>
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-8 text-white/40 uppercase tracking-widest text-xs font-medium">
          <div className="flex flex-col gap-2">
            <span className="text-white text-lg font-bold">60 FPS</span>
            <span>Smooth Motion</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white text-lg font-bold">3D</span>
            <span>WebGL Core</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white text-lg font-bold">100%</span>
            <span>Javascript</span>
          </div>
        </div>
      </motion.div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

