# Expected Free-Tier Limits Per Provider

These limits govern the `RotationClient` which automatically skips rate-limited providers to maintain continuity during nightly benchmark runs.

- **Cerebras**: 1M tokens/day, 30 RPM, 60-100K TPM. Excellent first-choice for speed.
- **Groq**: 1K req/day, 6K TPM (varies by model). Fast, strict TPM.
- **Google AI Studio**: 1,500 req/day for Flash, 250/day for Pro. Very reliable free-tier volume.
- **Mistral**: 1B tokens/month, 2 RPM (highly limiting!). The rotation client will likely hit this 2 RPM limit immediately and push to fallback.
- **SambaNova**: $5 free credits + ongoing tier. Good fallback before burning Anthropic credits.
- **Anthropic**: Paid tier. Used only as a fallback of last resort if all free tiers are exhausted.

## Adapter Status
- CerebrasAdapter: Ready
- GroqAdapter: Ready
- GoogleAIAdapter: Ready
- MistralAdapter: Ready
- SambaNovaAdapter: Ready
- AnthropicAdapter: Ready (Paid fallback)
