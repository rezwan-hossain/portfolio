// module/profile/components/admin/ImageVpsUpload.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toSrc, isOwned, toRelPath } from "@/lib/imageCdn";
import { Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";

type Props = {
  /** Relative path from the DB, or a legacy/pasted absolute URL. */
  value: string;
  /** Receives the RELATIVE path — store this in your database. */
  onChange: (path: string) => void;
  /** @deprecated Supabase bucket. Ignored — kept so old call sites still compile. */
  bucket?: string;
  /** Top-level folder on the VPS, e.g. "banners". Server whitelists this. */
  folder?: string;
  label?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
};

type UploadState = "idle" | "uploading" | "success" | "error";

type UploadResult = {
  path: string;
  url: string;
  width: number;
  height: number;
  size: number;
};

export function ImageVpsUpload({
  value,
  onChange,
  folder = "banners",
  label = "Upload Image",
  aspectRatio = "aspect-[16/9]",
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  // Held in a ref so the cleanup function below can abort an in-flight upload.
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  // Held in a ref so we can clear the success timer if the component unmounts.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevents "setState on unmounted component" warnings and wasted bandwidth
  // when the user navigates away mid-upload.
  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ─── Client-side validation ───────────────────────────────────────────
  // Purely for fast feedback. The server re-validates everything.
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes
        .map((t) => t.split("/")[1].toUpperCase())
        .join(", ")}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  // ─── Upload via XHR ───────────────────────────────────────────────────
  // XMLHttpRequest rather than fetch() because only XHR exposes upload
  // progress events. fetch() has no equivalent for request bodies.
  const postFile = (file: File): Promise<UploadResult> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("POST", "/api/upload");
      xhr.responseType = "json"; // parses the JSON body for us

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        // Cap at 95%: once the bytes are sent, the server is still running
        // sharp. Showing 100% while the user waits feels broken.
        setProgress(Math.min(95, Math.round((e.loaded / e.total) * 95)));
      };

      xhr.onload = () => {
        const body = xhr.response;
        if (xhr.status >= 200 && xhr.status < 300 && body?.path) {
          resolve(body as UploadResult);
        } else {
          // Surface the server's own message ("File too large") when present.
          reject(new Error(body?.error || `Upload failed (${xhr.status})`));
        }
      };

      xhr.onerror = () =>
        reject(new Error("Network error — check your connection"));
      xhr.ontimeout = () => reject(new Error("Upload timed out"));
      xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      // Do NOT set Content-Type manually. The browser must generate its own
      // multipart boundary string; overriding it breaks server-side parsing.
      xhr.send(fd);
    });

  // ─── Delete from the VPS ──────────────────────────────────────────────
  const deleteOldImage = useCallback(async (oldValue: string) => {
    // isOwned() stops us firing a delete for a pasted third-party URL.
    if (!oldValue || !isOwned(oldValue)) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: toRelPath(oldValue) }),
      });
    } catch (err) {
      // Non-critical: a leftover file wastes a few KB, a thrown error would
      // block the user. The orphan-cleanup cron (Step 13) sweeps these up.
      console.warn("Failed to delete old image:", err);
    }
  }, []);

  // ─── Main upload flow ─────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setUploadState("error");
      return;
    }

    // Capture the current value BEFORE we overwrite it, so we know what to
    // clean up afterwards.
    const previous = value;

    setUploadState("uploading");
    setErrorMsg("");
    setProgress(0);

    try {
      const data = await postFile(file);

      setProgress(100);
      setUploadState("success");

      onChange(data.url); // ← absolute URL flows up to your form/DB

      //   onChange(data.path); // ← relative path flows up to your form/DB

      // Delete the OLD file only after the NEW one is safely on disk.
      // Deleting first would lose both if the upload then failed.
      // void = fire and forget; the user shouldn't wait on cleanup.
      if (previous && previous !== data.path) {
        void deleteOldImage(previous);
      }

      // Show the green "Uploaded" badge briefly, then return to idle.
      timerRef.current = setTimeout(() => {
        setUploadState("idle");
        setProgress(0);
      }, 1500);
    } catch (err) {
      // An abort is an intentional unmount, not a failure — stay silent.
      if (err instanceof DOMException && err.name === "AbortError") return;

      console.error("Upload error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
      setUploadState("error");
      setProgress(0);
    } finally {
      xhrRef.current = null;
    }
  };

  // ─── Remove button ────────────────────────────────────────────────────
  const handleRemove = async () => {
    const previous = value;

    // Clear the UI immediately — don't make the user wait on the network.
    onChange("");
    setUploadState("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";

    if (previous) void deleteOldImage(previous);
  };

  // ─── Drag and drop ────────────────────────────────────────────────────
  // preventDefault on dragOver is mandatory — without it the browser's
  // default behaviour opens the dropped file as a new page.
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setErrorMsg("");

    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);

    // Reset the input so selecting the SAME file twice still fires onChange.
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* ─── Preview state ─── */}
      {value ? (
        <div
          className={`relative ${aspectRatio} rounded-xl overflow-hidden border border-gray-200 group`}
        >
          {/* toSrc() handles relative paths, legacy Supabase URLs and pasted URLs */}
          <img
            src={toSrc(value)}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setErrorMsg("Failed to load image preview")}
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors uppercase tracking-wider"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-white/20 text-white rounded-lg hover:bg-red-500/80 cursor-pointer transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>

          {uploadState === "success" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg">
              <CheckCircle size={14} />
              Uploaded
            </div>
          )}

          {uploadState === "uploading" && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
              <p className="text-white text-sm font-medium">Uploading...</p>
              <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── Empty / dropzone state ─── */
        <div
          onClick={() => {
            if (uploadState !== "uploading") inputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${aspectRatio} border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
            uploadState === "uploading"
              ? "border-gray-300 bg-gray-50 cursor-wait"
              : dragOver
                ? "border-gray-900 bg-gray-50 scale-[1.01]"
                : uploadState === "error"
                  ? "border-red-300 bg-red-50/30 cursor-pointer hover:border-red-400"
                  : "border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {uploadState === "uploading" ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Uploading...</p>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}%</p>
            </div>
          ) : (
            <>
              <Upload
                className={`w-8 h-8 mb-2 ${
                  uploadState === "error" ? "text-red-400" : "text-gray-400"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  uploadState === "error" ? "text-red-600" : "text-gray-600"
                }`}
              >
                {uploadState === "error" ? "Try again" : label}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag &amp; drop or click · Max {maxSizeMB}MB
              </p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                {acceptedTypes
                  .map((t) => t.split("/")[1].toUpperCase())
                  .join(" · ")}
              </p>
            </>
          )}
        </div>
      )}

      {/* ─── Error banner ─── */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle
            size={14}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setUploadState("idle");
              }}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ─── Paste-a-URL fallback ─── */}
      {!value && uploadState === "idle" && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              or paste URL
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all placeholder:text-gray-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                // Just blur — onBlur does the actual commit. Calling onChange
                // here too would fire it twice for a single Enter press.
                (e.target as HTMLInputElement).blur();
              }
            }}
            onBlur={(e) => {
              const url = e.target.value.trim();
              if (url) {
                onChange(url);
                e.target.value = "";
              }
            }}
          />
        </>
      )}

      {/* Hidden — triggered programmatically by the dropzone and Replace button */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
