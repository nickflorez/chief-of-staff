/**
 * Fireflies.ai GraphQL Client
 *
 * API Documentation: https://docs.fireflies.ai/
 * Authentication: Bearer token (API key)
 */

const FIREFLIES_ENDPOINT = "https://api.fireflies.ai/graphql";

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  host_email: string;
  organizer_email: string;
  transcript_url: string;
  audio_url: string;
}

export interface FirefliesTranscriptDetail extends FirefliesTranscript {
  summary: {
    overview: string | null;
    action_items: string[] | null;
    keywords: string[] | null;
  } | null;
  sentences: Array<{
    speaker_name: string;
    text: string;
    start_time: number;
  }>;
}

export interface FirefliesError {
  message: string;
  code?: string;
}

/**
 * Execute a GraphQL query against the Fireflies API
 */
export async function firefliesQuery<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const body = JSON.stringify({ query, variables });

  console.log("Fireflies request body:", body);

  const response = await fetch(FIREFLIES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fireflies HTTP error:", response.status, errorText);
    throw new Error(`Fireflies API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  console.log("Fireflies response:", JSON.stringify(result, null, 2).substring(0, 500));

  if (result.errors && result.errors.length > 0) {
    const error = result.errors[0];
    console.error("Fireflies GraphQL error:", JSON.stringify(result.errors, null, 2));
    throw new Error(error.message || "Fireflies API error");
  }

  return result.data;
}

/**
 * List recent meeting transcripts
 */
export async function listTranscripts(
  apiKey: string,
  options: {
    limit?: number;
    fromDate?: string;
  } = {}
): Promise<FirefliesTranscript[]> {
  const { limit = 10, fromDate } = options;

  const query = `
    query Transcripts($limit: Int, $fromDate: DateTime) {
      transcripts(limit: $limit, fromDate: $fromDate) {
        id
        title
        date
        duration
        participants
        host_email
        organizer_email
        transcript_url
        audio_url
      }
    }
  `;

  const data = await firefliesQuery<{ transcripts: FirefliesTranscript[] }>(
    apiKey,
    query,
    { limit, fromDate }
  );

  return data.transcripts || [];
}

/**
 * Get a single transcript with full details
 */
export async function getTranscript(
  apiKey: string,
  transcriptId: string
): Promise<FirefliesTranscriptDetail | null> {
  // Using regular string to avoid any template literal bundling issues
  const query = "query Transcript($transcriptId: String!) { transcript(id: $transcriptId) { id title date duration participants host_email organizer_email transcript_url audio_url summary { overview action_items keywords } sentences { speaker_name text start_time } } }";

  const data = await firefliesQuery<{ transcript: FirefliesTranscriptDetail | null }>(
    apiKey,
    query,
    { transcriptId }
  );

  return data.transcript;
}

/**
 * Search transcripts by keyword
 */
export async function searchTranscripts(
  apiKey: string,
  keyword: string,
  options: {
    limit?: number;
  } = {}
): Promise<FirefliesTranscript[]> {
  const { limit = 10 } = options;

  const query = `
    query SearchTranscripts($keyword: String!, $limit: Int) {
      transcripts(keyword: $keyword, limit: $limit, scope: all) {
        id
        title
        date
        duration
        participants
        host_email
        organizer_email
        transcript_url
        audio_url
      }
    }
  `;

  const data = await firefliesQuery<{ transcripts: FirefliesTranscript[] }>(
    apiKey,
    query,
    { keyword, limit }
  );

  return data.transcripts || [];
}

/**
 * Verify API key is valid by fetching user info
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const query = `
      query {
        user {
          email
          name
        }
      }
    `;

    await firefliesQuery(apiKey, query);
    return true;
  } catch {
    return false;
  }
}
