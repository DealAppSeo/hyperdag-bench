# HAL Input/Output Contract

**Note:** The real HAL implementation could not be located or cleanly invoked from `trinity-symphony-shared/lib/ConstitutionalAgentV4.js` (integration missing). We have engaged **Fallback D: Mock HAL** to validate the benchmark methodology. This validates the runner and methodology, not the real HAL.

## Input
Method `evaluate(prompt: string, output: string, context: any)`:
- `prompt`: The question or task given to the LLM.
- `output`: The generated response from the base LLM.
- `context`: Optional configuration, e.g. `{ threshold: 1.013643, n_llms: 1 }`.

## Output
Returns `HALResult`:
- `harm_probability` (0-1)
- `epistemic_uncertainty` (0-1)
- `evidence_quality` (0-1)
- `scope_appropriateness` (0-1)
- `certainty_at_claim` (0-1)
- `agreement_score` (0-1)
- `hal_score` (number)
- `vetoed` (boolean)
- `comma_veto` (boolean)
- `comma_gap` (number)
- `formula` (string)
