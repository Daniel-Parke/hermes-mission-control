// ═══════════════════════════════════════════════════════════════
// Skills Manager — Profile-aware skills with inline toggles
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, FolderOpen, ChevronRight, ChevronDown,
  Check, X, Eye, ToggleLeft, ToggleRight, Save,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/Input";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface Skill {
  name: string;
  category: string;
  path: string;
  description: string;
  enabled: boolean;
  size: number;
  lastModified: string;
}

interface SkillsData {
  skills: Skill[];
  categories: Record<string, Skill[]>;
  total: number;
  categoryCount: number;
  profile: string;
}

export default function SkillsPage() {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState("default");
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [skillContent, setSkillContent] = useState<string>("");
  const [skillLoading, setSkillLoading] = useState(false);
  const toast = useToast();

  // Load profiles
  useEffect(() => {
    fetch("/api/agent/profiles")
      .then((res) => res.json())
      .then((d) => {
        const ps = (d.data?.profiles || []).map((p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
        }));
        setProfiles(ps);
      })
      .catch(() => {});
  }, []);

  // Load skills
  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills?profile=${selectedProfile}`);
      const d = await res.json();
      setData(d.data);
      setPendingToggles({});
    } catch {
      toast.showToast("Failed to load skills", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedProfile, toast]);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  const toggleSkill = (skillName: string, currentEnabled: boolean) => {
    setPendingToggles((prev) => ({
      ...prev,
      [skillName]: !currentEnabled,
    }));
  };

  const saveToggles = async () => {
    if (Object.keys(pendingToggles).length === 0) return;
    setSaving(true);
    try {
      for (const [skillName, enabled] of Object.entries(pendingToggles)) {
        await fetch(`/api/skills/${encodeURIComponent(skillName)}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: selectedProfile, enabled }),
        });
      }
      toast.showToast(`Updated ${Object.keys(pendingToggles).length} skills`, "success");
      loadSkills();
    } catch {
      toast.showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const viewSkill = async (skill: Skill) => {
    if (expandedSkill === skill.name) {
      setExpandedSkill(null);
      return;
    }
    setExpandedSkill(skill.name);
    setSkillLoading(true);
    try {
      // Read skill content from the path
      const res = await fetch(`/api/skills/${encodeURIComponent(skill.name)}`);
      const d = await res.json();
      setSkillContent(d.data?.content || d.content || "");
    } catch {
      setSkillContent("// Failed to load skill content");
    } finally {
      setSkillLoading(false);
    }
  };

  const isSkillEnabled = (skill: Skill) => {
    if (skill.name in pendingToggles) return pendingToggles[skill.name];
    return skill.enabled;
  };

  const filteredSkills =
    data?.skills.filter((skill) => {
      const matchesSearch =
        !search ||
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory || skill.category.startsWith(selectedCategory);
      return matchesSearch && matchesCategory;
    }) || [];

  const categories = data?.categories || {};
  const enabledCount = data?.skills.filter((s) => isSkillEnabled(s)).length || 0;
  const hasPendingChanges = Object.keys(pendingToggles).length > 0;

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <PageHeader
        icon={FileText}
        title="Skills Manager"
        subtitle={`${enabledCount}/${data?.total || 0} enabled — ${data?.categoryCount || 0} categories`}
        color="green"
        actions={
          <div className="flex items-center gap-3">
            {/* Profile Selector */}
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="bg-dark-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-green-500/50 focus:outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {hasPendingChanges && (
              <Button
                variant="primary"
                color="green"
                size="sm"
                icon={Save}
                onClick={saveToggles}
                disabled={saving}
              >
                {saving ? "Saving..." : `Save (${Object.keys(pendingToggles).length})`}
              </Button>
            )}
          </div>
        }
      />

      <div className="px-6 py-6">
        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search skills..."
              accentColor="green"
            />
          </div>
          {Object.keys(categories).length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FolderOpen className="w-4 h-4 text-white/30 flex-shrink-0" />
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                  !selectedCategory
                    ? "bg-neon-green/20 text-neon-green"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                All
              </button>
              {Object.entries(categories).map(([cat, skills]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                    selectedCategory === cat
                      ? "bg-neon-green/20 text-neon-green"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {cat} ({skills.length})
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading skills..." />
        ) : filteredSkills.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No skills found"
            description={search ? "Try a different search" : "No skills installed"}
          />
        ) : (
          <div className="space-y-1">
            {filteredSkills.map((skill) => {
              const enabled = isSkillEnabled(skill);
              const isPending = skill.name in pendingToggles;
              const isExpanded = expandedSkill === skill.name;
              return (
                <div key={skill.name}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                      enabled ? "hover:bg-white/5" : "opacity-50 hover:opacity-70"
                    } ${isPending ? "ring-1 ring-green-500/30" : ""}`}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => toggleSkill(skill.name, enabled)}
                      className="flex-shrink-0"
                      title={enabled ? "Disable" : "Enable"}
                    >
                      {enabled ? (
                        <ToggleRight className="w-6 h-6 text-neon-green" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-white/20" />
                      )}
                    </button>

                    {/* Skill Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white/80">{skill.name}</span>
                        {isPending && (
                          <Badge color="green" size="sm">
                            {pendingToggles[skill.name] ? "enabling" : "disabling"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/30 truncate">{skill.description}</p>
                    </div>

                    {/* Category Badge */}
                    <Badge color="gray" size="sm">{skill.category}</Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => viewSkill(skill)}
                      >
                        {isExpanded ? "Hide" : "View"}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Skill Content */}
                  {isExpanded && (
                    <div className="ml-9 mr-3 mb-2 p-3 bg-dark-800/50 border border-white/5 rounded-lg">
                      {skillLoading ? (
                        <LoadingSpinner text="Loading..." />
                      ) : (
                        <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                          {skillContent}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
