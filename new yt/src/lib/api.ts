import type { JobResponse } from "../types/ytsubtitle";

type CreateJobResponse = {
  jobId: string;
  status: string;
  data: {
    url: string;
    lang: string;
  };
};

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL || "YOUR_N8N_WEBHOOK_URL";

export async function createJob(
  url: string,
  token: string,
  lang: string = "en"
): Promise<CreateJobResponse> {
  if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === "YOUR_N8N_WEBHOOK_URL") {
    console.warn("VITE_N8N_WEBHOOK_URL is not set.");
  }

  const response = await fetch(N8N_WEBHOOK_URL + "/subtitle_task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, token, lang }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching transcript: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobResult(videoId: string): Promise<JobResponse> {
  const response = await fetch(
    N8N_WEBHOOK_URL.replace("v2", "2f40fe6c-3b9b-474e-94f0-74e88b7fafa7/v2") +
      `/subtitle/${videoId}`
  );

  if (!response.ok) {
    throw new Error("Error getting youtube transcript.");
  }

  const json = await response.json();

  return json.data; // 🔑 unwrap here
}
