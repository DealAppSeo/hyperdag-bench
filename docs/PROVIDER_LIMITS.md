# Expected Free-Tier Limits Per Provider

These limits govern the `RotationClient` which automatically handles concurrency, retries, and failovers during nightly benchmark runs:
- **Concurrency**: Parallel calls are throttled using `p-limit` with a default concurrency of 3 to stay within conservative free-tier limits.
- **Exponential Backoff**: On a 429 or transient error, the client pauses and retries the *same* provider up to 3 times (delays: 1s, 2s, 4s) before giving up.
- **Failover**: If a provider exhausts its retries, it is marked as rate-limited for 60 seconds, and the client fails over to the next provider in the rotation.
- **Cerebras**: 1M tokens/day, 30 RPM, 60-100K TPM. Excellent first-choice for speed.
- **Groq**: 1K req/day, 6K TPM (varies by model). Fast, strict TPM.
- **Google AI Studio**: 1,500 req/day for Flash, 250/day for Pro. Very reliable free-tier volume.
- **Mistral**: 1B tokens/month, 2 RPM (highly limiting!). The rotation client will likely hit this 2 RPM limit immediately and push to fallback.
- **SambaNova**: $5 free credits + ongoing tier. Good fallback before burning Anthropic credits.
- **Anthropic**: Paid tier. Used only as a fallback of last resort if all free tiers are exhausted.

## Adapter Status (Observed 2026-05-04)
- **CerebrasAdapter**: Ready (Tested successfully, highly performant).
- **GroqAdapter**: Needs Fix (Returns 400 Bad Request, likely model deprecation for `llama3-8b-8192`).
- **GoogleAIAdapter**: Untested (Awaiting `GOOGLE_AI_API_KEY`).
- **MistralAdapter**: Untested (Awaiting `MISTRAL_API_KEY`).
- **SambaNovaAdapter**: Untested (Awaiting `SAMBANOVA_API_KEY`).
- **AnthropicAdapter**: Needs Fix (Returns 404 Not Found for model `claude-3-haiku-20240307`).
