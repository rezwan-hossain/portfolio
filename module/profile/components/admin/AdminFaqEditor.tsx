// module/profile/components/admin/AdminFaqEditor.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createFaq,
  deleteFaq,
  getAllFaqs,
  reorderFaqs,
  setFaqVisible,
  updateFaq,
  type FaqItem,
} from "@/app/actions/faq";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900";

function FaqForm({
  initial,
  saving,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial: { question: string; answer: string };
  saving: boolean;
  onSave: (v: { question: string; answer: string }) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [question, setQuestion] = useState(initial.question);
  const [answer, setAnswer] = useState(initial.answer);
  const valid = question.trim().length >= 3 && answer.trim().length > 0;

  return (
    <div className="space-y-2">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question, e.g. Where do I collect my kit?"
        maxLength={200}
        className={inputCls}
        aria-label="Question"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer (line breaks are kept)"
        rows={3}
        maxLength={2000}
        className={`${inputCls} resize-y`}
        aria-label="Answer"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ question, answer })}
          disabled={!valid || saving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {submitLabel}
        </button>
        <button onClick={onCancel} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AdminFaqEditor() {
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      getAllFaqs().then((r) => {
        setFaqs(r.faqs);
        if (r.error) setError(r.error);
      }),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<{ success: boolean; error: string | null }>) => {
    setBusy(key);
    setError("");
    const res = await fn();
    setBusy(null);
    if (!res.success) {
      setError(res.error ?? "Something went wrong");
      return false;
    }
    await load();
    return true;
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!faqs) return;
    const next = [...faqs];
    const [item] = next.splice(index, 1);
    next.splice(index + dir, 0, item);
    setFaqs(next); // move right away; the server saves the order
    await run(`move-${item.id}`, () => reorderFaqs(next.map((f) => f.id)));
  };

  const activeCount = faqs?.filter((f) => f.isActive).length ?? 0;
  const iconBtn =
    "p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">FAQ</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {faqs === null
              ? "Loading…"
              : `${activeCount} of ${faqs.length} shown on the homepage${activeCount === 0 && faqs.length > 0 ? " — the FAQ section is hidden" : ""}`}
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            className="flex items-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-4 py-2.5 hover:bg-gray-800 cursor-pointer"
          >
            <Plus size={14} /> Add question
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-2">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 cursor-pointer" title="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {adding && (
        <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <FaqForm
            initial={{ question: "", answer: "" }}
            saving={busy === "add"}
            submitLabel="Add question"
            onCancel={() => setAdding(false)}
            onSave={async (v) => {
              if (await run("add", () => createFaq(v))) setAdding(false);
            }}
          />
        </div>
      )}

      {faqs === null ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white border border-gray-200 rounded-xl" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
          No questions yet — the FAQ section is hidden on the homepage.
        </p>
      ) : (
        <ol className="space-y-2">
          {faqs.map((f, i) => (
            <li
              key={f.id}
              className={`bg-white border rounded-xl p-4 ${f.isActive ? "border-gray-200" : "border-dashed border-gray-200 opacity-70"}`}
            >
              {editing === f.id ? (
                <FaqForm
                  initial={{ question: f.question, answer: f.answer }}
                  saving={busy === `save-${f.id}`}
                  submitLabel="Save"
                  onCancel={() => setEditing(null)}
                  onSave={async (v) => {
                    if (await run(`save-${f.id}`, () => updateFaq(f.id, v))) setEditing(null);
                  }}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 tabular-nums pt-0.5 w-5 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {f.question}
                      {!f.isActive && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 align-middle">
                          Hidden
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line break-words line-clamp-3">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {confirmDelete === f.id ? (
                      <>
                        <button
                          onClick={async () => {
                            if (await run(`del-${f.id}`, () => deleteFaq(f.id))) setConfirmDelete(null);
                          }}
                          disabled={!!busy}
                          className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white bg-red-600 rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50"
                        >
                          {busy === `del-${f.id}` ? "Deleting…" : "Delete"}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer">
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => move(i, -1)} disabled={i === 0 || !!busy} className={iconBtn} title="Move up">
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => move(i, 1)} disabled={i === faqs.length - 1 || !!busy} className={iconBtn} title="Move down">
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => run(`vis-${f.id}`, () => setFaqVisible(f.id, !f.isActive))}
                          disabled={!!busy}
                          className={iconBtn}
                          title={f.isActive ? "Hide from homepage" : "Show on homepage"}
                        >
                          {busy === `vis-${f.id}` ? <Loader2 size={14} className="animate-spin" /> : f.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(f.id);
                            setAdding(false);
                          }}
                          disabled={!!busy}
                          className={iconBtn}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(f.id)} disabled={!!busy} className={`${iconBtn} hover:text-red-600 hover:bg-red-50`} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
