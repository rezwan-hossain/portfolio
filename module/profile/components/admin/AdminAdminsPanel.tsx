// module/profile/components/admin/AdminAdminsPanel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdminUsers,
  grantAdmin,
  revokeAdmin,
  searchUsersToPromote,
  type AdminUser,
} from "@/app/actions/admins";
import { CheckCircle2, Loader2, Search, ShieldCheck, UserMinus, UserPlus, X } from "lucide-react";

type Candidate = Omit<AdminUser, "isYou">;

const since = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });

export function AdminAdminsPanel() {
  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [removing, setRemoving] = useState<string | null>(null); // confirm step
  const [busy, setBusy] = useState<string | null>(null);

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [promoting, setPromoting] = useState<Candidate | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const load = useCallback(
    () =>
      getAdminUsers().then((r) => {
        setAdmins(r.admins);
        if (r.error) setError(r.error);
      }),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const done = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 5000);
  };

  const onSearch = (value: string) => {
    setTerm(value);
    setPromoting(null);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 3) {
      setResults(null);
      return;
    }
    timer.current = setTimeout(async () => {
      const id = ++seq.current;
      setSearching(true);
      const r = await searchUsersToPromote(value);
      if (id !== seq.current) return;
      setSearching(false);
      setResults(r.users);
      if (r.error) setError(r.error);
    }, 300);
  };

  const grant = async () => {
    if (!promoting) return;
    setBusy("grant");
    setError("");
    const r = await grantAdmin(promoting.id, confirmEmail);
    setBusy(null);
    if (!r.success) return setError(r.error ?? "Failed");
    done(`${promoting.email} is now an admin.`);
    setPromoting(null);
    setConfirmEmail("");
    setTerm("");
    setResults(null);
    await load();
  };

  const revoke = async (a: AdminUser) => {
    setBusy(a.id);
    setError("");
    const r = await revokeAdmin(a.id);
    setBusy(null);
    setRemoving(null);
    if (!r.success) return setError(r.error ?? "Failed");
    done(`${a.email} is no longer an admin.`);
    await load();
  };

  const onlyOne = (admins?.length ?? 0) <= 1;
  const matches = !!promoting && confirmEmail.trim().toLowerCase() === promoting.email.toLowerCase();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gray-400" /> Admins
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Admins can see every runner&apos;s details, orders and payments. Changes apply on the person&apos;s next page load.
        </p>
      </div>

      {flash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">{flash}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-2">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 cursor-pointer" title="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Current admins */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <header className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">
            Current admins {admins && <span className="text-gray-400 font-normal">({admins.length})</span>}
          </h3>
        </header>
        {admins === null ? (
          <div className="p-5 space-y-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {admins.map((a) => (
              <li key={a.id} className="px-5 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {a.name}
                    {a.isYou && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 align-middle">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    {a.email}
                    {a.phone && <span className="text-gray-400"> · {a.phone}</span>}
                    <span className="text-gray-400"> · account since {since(a.createdAt)}</span>
                  </p>
                </div>
                {!a.isYou &&
                  (removing === a.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Remove admin access?</span>
                      <button
                        onClick={() => revoke(a)}
                        disabled={!!busy}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-red-600 rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50"
                      >
                        {busy === a.id && <Loader2 size={11} className="animate-spin" />}
                        Remove
                      </button>
                      <button onClick={() => setRemoving(null)} className="px-2 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer">
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRemoving(a.id)}
                      disabled={onlyOne || !!busy}
                      title={onlyOne ? "The last admin can't be removed" : "Remove admin access"}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserMinus size={12} /> Remove admin
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add an admin */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <header>
          <h3 className="text-sm font-bold text-gray-900">Add an admin</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            The person needs a registered account on the site first (guest checkouts can&apos;t log in).
          </p>
        </header>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <label htmlFor="admin-search" className="sr-only">Find a user</label>
          <input
            id="admin-search"
            value={term}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, email or phone (3+ characters)"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        {searching && <p className="text-xs text-gray-400">Searching…</p>}
        {results && !searching && results.length === 0 && (
          <p className="text-xs text-gray-500">No registered users match. They may need to create an account first.</p>
        )}
        {results && results.length > 0 && (
          <ul className="border border-gray-100 rounded-lg divide-y divide-gray-50">
            {results.map((u) => (
              <li key={u.id} className="px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 break-all">
                      {u.email}
                      {u.phone && <span className="text-gray-400"> · {u.phone}</span>}
                    </p>
                  </div>
                  {promoting?.id !== u.id && (
                    <button
                      onClick={() => {
                        setPromoting(u);
                        setConfirmEmail("");
                        setError("");
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <UserPlus size={12} /> Make admin
                    </button>
                  )}
                </div>
                {promoting?.id === u.id && (
                  <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-xs text-amber-900">
                      <strong>{u.email}</strong> will be able to see all runners, orders and payments, and change them.
                      Type their email to confirm.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor={`confirm-${u.id}`} className="sr-only">Type the email to confirm</label>
                      <input
                        id={`confirm-${u.id}`}
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder={u.email}
                        autoComplete="off"
                        className="flex-1 min-w-[12rem] h-9 px-3 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        onClick={grant}
                        disabled={!matches || !!busy}
                        className="flex items-center gap-1.5 h-9 px-3 text-xs font-bold uppercase tracking-wider text-white bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {busy === "grant" && <Loader2 size={12} className="animate-spin" />}
                        Give admin access
                      </button>
                      <button onClick={() => setPromoting(null)} className="h-9 px-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
