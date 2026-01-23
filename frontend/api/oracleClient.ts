export type OracleResponse = {
  p_yes: number;
  p_no: number;
  answer: "yes" | "no";
  model_version?: string;
  latency_ms?: number;
};

const DEFAULT_BASE_URL = "https://lucky-ai-api-664189756248.europe-west1.run.app";

export async function askOracle(
  question: string,
  opts?: { baseUrl?: string }
): Promise<OracleResponse> {
  const startTime = performance.now();

  // 1. Sanitize the Base URL
  const rawBase = opts?.baseUrl?.trim() || DEFAULT_BASE_URL;
  // Ensure the base doesn't have a trailing slash so we can control the path precisely
  const baseUrl = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

  // 2. Build the URL with the mandatory trailing slash before the query string
  // Your Swagger proves it works with: .../ask_model/?question=...
  const url = new URL(baseUrl + "/ask_model/");
  url.searchParams.set("question", question);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json" 
    },
    // 3. Send an empty JSON object as the body. 
    // This solves the '411 Length Required' error from Google Cloud.
    body: JSON.stringify({}), 
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Model API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();

  // 4. Map the backend's "probs" structure
  const p_yes = data.probs.yes;
  const p_no = data.probs.no;
  const answer = p_yes > p_no ? "yes" : "no";

  return {
    p_yes: p_yes,
    p_no: p_no,
    answer: answer as "yes" | "no",
    latency_ms: Math.round(performance.now() - startTime),
  };
}