const API_BASE = "https://api.devin.ai/v3";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`,
    );
  }

  return value;
}

export async function createSession({
  prompt,
  title,
  repo,
  playbookId,
}) {
  const apiKey =
    requiredEnv("DEVIN_API_KEY");

  const orgId =
    requiredEnv("DEVIN_ORG_ID");

  const body = {
    prompt,

    ...(title
      ? {
          title,
        }
      : {}),

    ...(repo
      ? {
          repos: [repo],
        }
      : {}),

    ...(playbookId
      ? {
          playbook_id: playbookId,
        }
      : {}),
  };

  const response = await fetch(
    `${API_BASE}/organizations/${encodeURIComponent(
      orgId,
    )}/sessions`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),
    },
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Devin API ${response.status}: ${text}`,
    );
  }

  return JSON.parse(text);
}
