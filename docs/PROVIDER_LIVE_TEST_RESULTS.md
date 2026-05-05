# Provider Live Test Results

**Date:** 2026-05-04

## Cerebras (Tested in prior prep phase)
- **Status:** SUCCESS
- **Latency:** ~150ms - 790ms
- **Observed Limits:** None hit during the 5-request test. Fastest of the free tiers.

## Groq
- **Status:** SUCCESS (Post-Fix)
- **Error:** N/A (previously 400 Bad Request)
- **Notes:** Model updated to `llama-3.3-70b-versatile`. Tested successfully with full response.

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
- **Status:** SUCCESS (Post-Fix)
- **Error:** N/A (previously 404 Not Found)
- **Notes:** Model updated to `claude-haiku-4-5-20251001`. Tested successfully with full response.
