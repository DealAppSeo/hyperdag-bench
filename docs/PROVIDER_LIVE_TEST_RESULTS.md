# Provider Live Test Results

**Date:** 2026-05-04

## Cerebras (Tested in prior prep phase)
- **Status:** SUCCESS
- **Latency:** ~150ms - 790ms
- **Observed Limits:** None hit during the 5-request test. Fastest of the free tiers.

## Groq
- **Status:** FAILURE
- **Error:** API returned HTTP 400 (Bad Request).
- **Notes:** Auth succeeded (no 401), but the request payload was rejected. This likely indicates the model `llama3-8b-8192` has been retired or the API strictly requires a different parameter shape.

## Google AI Studio
- **Status:** SKIPPED (Auth Missing)
- **Error:** `GOOGLE_AI_API_KEY missing`
- **Notes:** Environment variable is not configured in the active `.env`.

## Mistral
- **Status:** SKIPPED (Auth Missing)
- **Error:** `MISTRAL_API_KEY missing`
- **Notes:** Environment variable is not configured in the active `.env`.

## SambaNova
- **Status:** SKIPPED (Auth Missing)
- **Error:** `SAMBANOVA_API_KEY missing`
- **Notes:** Environment variable is not configured in the active `.env`.

## Anthropic
- **Status:** FAILURE
- **Error:** HTTP 404 `{"type":"error","error":{"type":"not_found_error","message":"model: claude-3-haiku-20240307"}}`
- **Notes:** The model identifier `claude-3-haiku-20240307` is unavailable on this account or has been fully deprecated. The AnthropicAdapter needs its default model updated.
