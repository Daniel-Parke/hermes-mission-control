// ═══════════════════════════════════════════════════════════════
// Session Transcript Viewer
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bot,
  Wrench,
  Clock,
  HardDrive,
  Cpu,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { LoadingSpinner, ErrorBanner } from "@/components/ui/LoadingSpinner";

interface SessionMessage {
  index: number;
  role?: string;
  content?: string;
  name?: string;
  tool_calls?: unknown[];
  tool_call_id?: string;
  raw?: string;
  [key: string]: unknown;
}

interface SessionData {
  id: string;
  filename: string;
  format: string;
  title: string;
  model: string;
  source: string;
  messages: SessionMessage[];
  messageCount: number;
  size: number;
  created: string;
}

function MessageBubble({ msg }: { msg: SessionMessage }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const role = (msg.role || "unknown").toLowerCase();
  const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Role-based styling
  const roleConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    user: {
      icon: <User className="w-3.5 h-3.5" />,
      color: "text-neon-cyan",
      bg: "border-neon-cyan/20 bg-neon-cyan/5",
      label: "USER",
    },
    assistant: {
      icon: <Bot className="w-3.5 h-3.5" />,
      color: "text-neon-purple",
      bg: "border-neon-purple/20 bg-neon-purple/5",
      label: "ASSISTANT",
    },
    tool: {
      icon: <Wrench className="w-3.5 h-3.5" />,
      color: "text-neon-green",
      bg: "border-neon-green/20 bg-neon-green/5",
      label: "TOOL",
    },
    system: {
      icon: <Cpu className="w-3.5 h-3.5" />,
      color: "text-white/50",
      bg: "border-white/10 bg-white/5",
      label: "SYSTEM",
    },
  };

  const config = roleConfig[role] || roleConfig.system;
  const isLong = content && content.length > 500;
  const displayContent = isLong && !expanded ? content.slice(0, 500) + "..." : content;

  return (
    <div className={`rounded-xl border ${config.bg} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={config.color}>{config.icon}</span>
          <span className={`text-xs font-mono font-bold ${config.color}`}>
            {config.label}
          </span>
          {msg.tool_call_id && (
            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
              {msg.tool_call_id.slice(0, 12)}
            </span>
          )}
          {msg.name && (
            <span className="text-xs font-mono text-neon-green">
              {String(msg.name)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-neon-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      <div className="px-4 py-3">
        <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap break-words">
          {displayContent || "(no content)"}
        </pre>
        {Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Tool Calls ({msg.tool_calls.length})
            </div>
            {msg.tool_calls.map((tc: unknown, i: number) => {
              const toolCall = tc as Record<string, unknown>;
              const fn = toolCall.function as Record<string, unknown> | undefined;
              return (
                <div key={i} className="bg-dark-900/50 rounded-lg p-3 text-xs font-mono">
                  <span className="text-neon-green">{String(fn?.name || "unknown")}</span>
                  <pre className="mt-1 text-white/40 whitespace-pre-wrap">
                    {typeof fn?.arguments === "string"
                      ? fn.arguments
                      : JSON.stringify(fn?.arguments, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed to load session`);
      }
      const sessionData = await res.json();
      setData(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center">
        <LoadingSpinner text="Loading transcript..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-white/40 font-mono mb-4">{error || "Unknown error"}</p>
          <Link
            href="/sessions"
            className="text-neon-orange text-sm font-mono hover:underline"
          >
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  // Count messages by role
  const roleCounts = data.messages.reduce(
    (acc, msg) => {
      const role = msg.role || "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/sessions"
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-mono">SESSIONS</span>
              </Link>
              <div className="w-px h-6 bg-white/20" />
              <div>
                <h1 className="text-lg font-bold text-neon-orange flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {data.title || data.id}
                </h1>
                <div className="flex items-center gap-4 text-xs text-white/40 font-mono mt-0.5">
                  {data.model && (
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {data.model}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {data.messageCount} messages
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {(data.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {Object.entries(roleCounts).map(([role, count]) => (
                <span
                  key={role}
                  className={`text-xs font-mono px-2 py-1 rounded ${
                    role === "user"
                      ? "bg-neon-cyan/10 text-neon-cyan"
                      : role === "assistant"
                      ? "bg-neon-purple/10 text-neon-purple"
                      : role === "tool"
                      ? "bg-neon-green/10 text-neon-green"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {count} {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-3">
          {data.messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
        </div>

        {data.messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 font-mono">No messages in this session</p>
          </div>
        )}
      </div>
    </div>
  );
}
