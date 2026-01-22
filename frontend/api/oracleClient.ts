export type OracleResponse = {
  p_yes: number;
  p_no: number;
  answer: "yes" | "no";
  model_version?: string;
  latency_ms?: number;
};

const DEFAULT_BASE_URL = "https://api-664189756248.europe-west1.run.app";

export async function askOracle(
  question: string,
  opts?: { baseUrl?: string }
): Promise<OracleResponse> {
  const startTime = performance.now();

  const baseUrl = opts?.baseUrl?.trim() || DEFAULT_BASE_URL;
  const url = new URL("/ask_model/", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.searchParams.set("question", question);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Model API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    p_yes: data.p_yes,
    p_no: data.p_no,
    answer: data.answer,
    model_version: data.model_version,
    latency_ms: Math.round(performance.now() - startTime),
  };
}
