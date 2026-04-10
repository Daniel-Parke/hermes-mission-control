// ═══════════════════════════════════════════════════════════════
// Rec Room Hub — Activity Selection
// ═══════════════════════════════════════════════════════════════

"use client";

import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Palette,
  Terminal,
  BookOpen,
  Zap,
} from "lucide-react";
import ActivityCard from "@/components/recroom/ActivityCard";
import { REC_ROOM_ACTIVITIES } from "@/types/recroom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Terminal,
  BookOpen,
  Zap,
};

export default function RecRoomHub() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark-950 grid-bg relative scanlines">
      {/* Header */}
      <div className="border-b border-white/10 bg-dark-900/50 px-6 py-5 backdrop-blur-xl border-t-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 text-neon-purple" />
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-neon-purple">Rec</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white">Room</span>
            </h1>
            <p className="text-xs text-white/40 font-mono">
              Creative activities powered by your agent
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-sm text-white/50 mb-8 max-w-2xl leading-relaxed">
          Welcome to the Rec Room — a space for creative exploration.
          Describe what you want to create and watch your agent bring it to life.
          From generative art to interactive stories, every activity is powered by AI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REC_ROOM_ACTIVITIES.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              iconMap={iconMap}
              onClick={() => router.push("/recroom/" + activity.id)}
            />
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 rounded-xl border border-white/5 bg-dark-900/30 p-6">
          <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/40">
            <div>
              <div className="text-neon-cyan font-mono mb-1">1. Describe</div>
              <p>Type what you want to create — from simple to complex, literal to abstract.</p>
            </div>
            <div>
              <div className="text-neon-purple font-mono mb-1">2. Enhance</div>
              <p>Your agent interprets your request and suggests creative approaches.</p>
            </div>
            <div>
              <div className="text-neon-green font-mono mb-1">3. Create</div>
              <p>Watch your creation come to life — refine, save, and export.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
