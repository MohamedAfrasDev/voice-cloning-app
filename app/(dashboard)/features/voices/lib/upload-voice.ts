const UPLOAD_FAILED = "Upload failed. Please retry";

/** POSTs JSON to our API and throws the server's error message on failure. */
export async function postJson<T = unknown>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // A platform error page isn't JSON.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Failed to create voice");
  }

  return data as T;
}

/** Sends the file straight to storage and returns the id to create from. */
export async function uploadFile(file: File) {
  const { uploadId, uploadUrl } = await postJson<{
    uploadId: string;
    uploadUrl: string;
  }>("/api/voices/upload-url", { size: file.size });

  // Rejects on network and CORS errors, which carry no useful message.
  const response = await fetch(uploadUrl, { method: "PUT", body: file }).catch(
    () => null,
  );

  if (!response?.ok) throw new Error(UPLOAD_FAILED);

  return { uploadId };
}
