# Wiring Status

**Date:** 2026-05-04

**Status:** Awaiting CC1 extraction completion. Real-HAL adapter ready; flip is one-line config change.

Currently, `src/hal-client.ts` uses an adapter pattern that switches between `MockHALClient` and `RealHALClient` based on the `HAL_MODE` environment variable.

- **To run mock benchmarks (default):** Leave `HAL_MODE` unset or set it to `mock`.
- **To run real benchmarks:** Set `HAL_MODE=real`.

When `HAL_MODE=real`, the adapter dynamically imports the extracted HAL from `../../../trinity-symphony-shared/lib/hal/index.js`. If the file is missing or lacks an `evaluate()` function, it throws a clear runtime error.

Because CC1's extraction of the HAL into `lib/hal/` was not finished at the start of this sprint, we have fully prepared the wiring logic without attempting to blindly run real benchmarks. Once the extraction lands, the flip is immediate.
