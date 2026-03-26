// module/profile/components/DangerZone.tsx
"use client";

import { useState } from "react";
import { deleteUserAccount } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export function DangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);
    setError("");

    const result = await deleteUserAccount();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="bg-white border border-red-200 rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Irreversible actions that affect your account
        </p>
      </div>

      {/* Delete Account */}
      <div className="border border-red-100 rounded-lg p-5 bg-red-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Delete Account</h3>
            <p className="text-sm text-gray-500 mt-1">
              Once you delete your account, all your data including
              registrations and payment history will be permanently removed.
              This action cannot be undone.
            </p>
          </div>

          {!showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          )}
        </div>

        {/* Confirmation */}
        {showConfirm && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm text-red-700 font-medium mb-3">
              Are you absolutely sure? This action is <strong>permanent</strong>
              .
            </p>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1.5">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Type DELETE"
                className="w-full max-w-xs h-10 border border-red-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== "DELETE"}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Deleting..." : "Permanently Delete Account"}
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                  setError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
