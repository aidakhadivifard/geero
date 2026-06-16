export async function drawCard({ intent, input = "", previous = null }) {
  const res = await fetch("/api/card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent, input, previous }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.code = data.error;
    throw err;
  }
  return data;
}

export async function health() {
  try {
    const res = await fetch("/api/health");
    return await res.json();
  } catch {
    return { ok: false };
  }
}
