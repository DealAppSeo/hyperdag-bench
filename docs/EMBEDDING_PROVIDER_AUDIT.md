# Embedding Provider Audit & Selection

## Current State Analysis
- **Location:** `C:\Users\Cash4\repos\repid-engine\src\hal\lib\cross-llm\agreement.ts`
- **Method:** The `getEmbedding` function executes a direct `fetch` POST request to a provided `client.endpoint`. 
- **Format:** It assumes an OpenAI-compatible JSON payload (`{ model, input }`) and expects a response shape of `data.data[0].embedding`.
- **Dimensionality:** By default, OpenAI `text-embedding-3-small` is 1536 dimensions.
- **Error Handling:** Throws an error on non-OK HTTP responses (which surfaced the `429 You exceeded your current quota` error).

## Candidate Evaluation
1. **Voyage AI:** Generous free tier, `voyage-3` model provides excellent quality. Simple REST API.
2. **Cohere:** Free tier available but strict rate limits.
3. **Hugging Face Inference API:** Generous free tier, but relies on 384-dimension models like `all-MiniLM-L6-v2`.
4. **Local `@xenova/transformers`:** Runs entirely in-process. 384 dimensions. No network latency after initial model download, completely immune to API limits.

## Selection
- **Primary:** **Voyage AI**. It offers a generous free tier, high dimensionality, and high quality. It requires minimal changes as it is a remote REST API.
- **Backup:** **Local `@xenova/transformers`**. If remote APIs fail or keys are unavailable, running embeddings locally ensures the benchmark suite cannot be rate-limited.

## Implementation Path
We will refactor the embedding logic to use an `EmbeddingClient` interface. The primary implementation will target Voyage AI via REST, and if that fails, we can fall back to local `@xenova/transformers`.
