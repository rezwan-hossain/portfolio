// module/profile/components/admin/ImageUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
};

type UploadState = "idle" | "uploading" | "success" | "error";

export function ImageUpload({
  value,
  onChange,
  bucket = "event-images",
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

  // ─── Validate File ────────────────────────────────
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

  // ─── Generate Unique Filename ─────────────────────
  const generateFileName = (file: File): string => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return `${folder}/${timestamp}-${random}.${ext}`;
  };

  // ─── Delete Old Image from Supabase ───────────────
  const deleteOldImage = useCallback(
    async (oldUrl: string) => {
      if (!oldUrl) return;

      try {
        const supabase = createClient();

        // Extract file path from the public URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/event-images/banners/123-abc.jpg
        const bucketPrefix = `/storage/v1/object/public/${bucket}/`;
        const urlObj = new URL(oldUrl);
        const pathIndex = urlObj.pathname.indexOf(bucketPrefix);

        if (pathIndex === -1) return;

        const filePath = urlObj.pathname.slice(pathIndex + bucketPrefix.length);

        if (filePath) {
          await supabase.storage.from(bucket).remove([filePath]);
        }
      } catch (err) {
        // Silent fail — old image cleanup is non-critical
        console.warn("Failed to delete old image:", err);
      }
    },
    [bucket],
  );

  // ─── Upload File ──────────────────────────────────
  const uploadFile = async (file: File) => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setErrorMsg("");
    setProgress(0);

    try {
      const supabase = createClient();
      const fileName = generateFileName(file);

      // Simulate progress (Supabase JS SDK doesn't support upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      // Delete old image if replacing
      if (value) {
        await deleteOldImage(value);
      }

      setProgress(100);
      setUploadState("success");
      onChange(publicUrl);

      // Reset state after brief success indication
      setTimeout(() => {
        setUploadState("idle");
        setProgress(0);
      }, 1500);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err?.message || "Upload failed. Please try again.");
      setUploadState("error");
      setProgress(0);
    }
  };

  // ─── Handle Remove ───────────────────────────────
  const handleRemove = async () => {
    if (value) {
      await deleteOldImage(value);
    }
    onChange("");
    setUploadState("idle");
    setErrorMsg("");

    // Reset file input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ─── Drag & Drop ─────────────────────────────────
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
    if (file) uploadFile(file);
  };

  // ─── File Input Change ────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) uploadFile(file);

    // Reset input so same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ─── Format file size ────────────────────────────
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-2">
      {/* ─── Preview State ─── */}
      {value ? (
        <div
          className={`relative ${aspectRatio} rounded-xl overflow-hidden border border-gray-200 group`}
        >
          {/* Image */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
              setErrorMsg("Failed to load image preview");
            }}
          />

          {/* Hover Overlay */}
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

          {/* Success Indicator */}
          {uploadState === "success" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg">
              <CheckCircle size={14} />
              Uploaded
            </div>
          )}

          {/* Uploading Overlay (for replace) */}
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
        /* ─── Upload State ─── */
        <div
          onClick={() => {
            if (uploadState !== "uploading") {
              inputRef.current?.click();
            }
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
                Drag & drop or click · Max {maxSizeMB}MB
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

      {/* ─── Error Message ─── */}
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

      {/* ─── URL Fallback Input ─── */}
      {!value && uploadState === "idle" && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            or paste URL
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {!value && uploadState === "idle" && (
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all placeholder:text-gray-300"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.target as HTMLInputElement;
              const url = input.value.trim();
              if (url) {
                onChange(url);
                input.value = "";
              }
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
      )}

      {/* ─── Hidden File Input ─── */}
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
