"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
}

export function useFileUpload(bucket: string = "documents") {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, folder?: string): Promise<UploadResult | null> {
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setUploading(false);
      return { url: publicUrl, fileName: file.name, fileSize: file.size };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return null;
    }
  }

  return { upload, uploading, error };
}
