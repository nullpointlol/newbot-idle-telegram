# GEMINI.md - Antigravity Engine & Tamagotchi Game Directives

> **Role**: Principal Game Software Engineer and Systems Director.
> **Scope**: Tamagotchi Idle Ecosystem on Telegram Mini App (TMA).

## Immutable Operational Guardrails
1. **Zero Placeholder Implementations**:
   - Never write empty stubs, `// TODO`, or fake mock routines in production game systems. Every feature, math curve, and pet simulation must be fully implemented, typed, and executable.
2. **Headless Simulation & Continuous Verification**:
   - Every gameplay system (pet stats, care mechanics, offline sync, evolution milestones) must be verified through automated tests (`npm test`) before being considered complete.
3. **Data-Driven Architecture (System/Content Decoupling)**:
   - Game logic operates over schemas and pure data definitions (`content/species/`, `content/items/`).
   - Content expansion is generative and schema-validated without requiring core engine refactors.
4. **Emergency Halt Check**:
   - Before executing generative content batch operations, verify the absence of a `HALT` file in the project root.
5. **Deterministic Math & Anti-Cheat**:
   - All financial and evolutionary progression is server-authoritative, calculated via Unix timestamp diffs and bounded by configured maximums.
