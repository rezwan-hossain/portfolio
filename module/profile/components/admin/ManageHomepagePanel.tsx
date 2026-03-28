// module/profile/components/admin/ManageHomepagePanel.tsx
"use client";

import { useState } from "react";
import { HeroForm } from "./HeroForm";
import {
  getAllHeroes,
  setActiveHero,
  deleteHero,
} from "@/app/actions/homepage";
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Monitor,
  Smartphone,
} from "lucide-react";
import { HeroSectionData } from "@/types/homepage";

type Props = {
  initialHeroes: HeroSectionData[];
};

type View = "list" | "create" | "edit";

export function ManageHomepagePanel({ initialHeroes }: Props) {
  const [view, setView] = useState<View>("list");
  const [heroes, setHeroes] = useState(initialHeroes);
  const [editingHero, setEditingHero] = useState<HeroSectionData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSuccess = (updatedHeroes: HeroSectionData[]) => {
    setHeroes(updatedHeroes);
    setView("list");
    setEditingHero(null);
  };

  const handleSetActive = async (heroId: string) => {
    setLoadingId(heroId);
    await setActiveHero(heroId);
    const { heroes: updated } = await getAllHeroes();
    setHeroes(updated);
    setLoadingId(null);
  };

  const handleDelete = async (heroId: string) => {
    if (!confirm("Delete this hero section?")) return;
    setLoadingId(heroId);
    await deleteHero(heroId);
    const { heroes: updated } = await getAllHeroes();
    setHeroes(updated);
    setLoadingId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {view === "list" ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Manage Homepage
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {heroes.length} hero section{heroes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingHero(null);
                setView("create");
              }}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New Hero
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setView("list");
              setEditingHero(null);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
      </div>

      {/* List */}
      {view === "list" && (
        <>
          {heroes.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No hero sections yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Create one to customize the homepage
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    hero.isActive
                      ? "border-green-300 ring-1 ring-green-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Preview */}
                    <div className="relative w-full sm:w-48 h-28 sm:h-auto flex-shrink-0">
                      <img
                        src={hero.desktopImage}
                        alt={hero.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {hero.isActive && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500 text-white rounded-full">
                          Active
                        </span>
                      )}

                      {hero.mobileImage && (
                        <span className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-sm rounded">
                          <Smartphone size={10} className="text-white" />
                        </span>
                      )}

                      <p className="absolute bottom-2 left-2 right-2 text-white font-black text-sm leading-tight uppercase truncate">
                        {hero.title}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">
                            {hero.title}
                          </h4>
                          {hero.slug && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Link: {hero.slug}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {loadingId === hero.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              {!hero.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetActive(hero.id)}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                  title="Set as Active"
                                >
                                  <Circle size={15} />
                                </button>
                              ) : (
                                <span
                                  className="p-2 text-green-500"
                                  title="Currently Active"
                                >
                                  <CheckCircle size={15} />
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingHero(hero);
                                  setView("edit");
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(hero.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hero.showCountdown && (
                          <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full font-medium">
                            ⏱ Countdown
                          </span>
                        )}
                        {hero.showSlugButton && (
                          <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-600 rounded-full font-medium">
                            🔗 Button
                          </span>
                        )}
                        {hero.mobileImage && (
                          <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-600 rounded-full font-medium">
                            📱 Mobile
                          </span>
                        )}
                        {hero.eventDate && (
                          <span className="px-2 py-0.5 text-[10px] bg-yellow-50 text-yellow-600 rounded-full font-medium">
                            📅{" "}
                            {new Date(hero.eventDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-300 mt-2">
                        Updated{" "}
                        {new Date(hero.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit */}
      {(view === "create" || view === "edit") && (
        <HeroForm
          hero={editingHero}
          onSuccess={handleSuccess}
          onCancel={() => {
            setView("list");
            setEditingHero(null);
          }}
        />
      )}
    </div>
  );
}
