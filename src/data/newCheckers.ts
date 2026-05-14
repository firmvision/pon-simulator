/**
 * newCheckers.ts
 *
 * Documents extra objective checker IDs introduced by the new learning modules
 * (newModules.ts). These cases must be added to the checkObjective switch
 * statement inside LearningPanel.tsx (or wherever checkObjective lives).
 *
 * ─── HOW TO INTEGRATE ────────────────────────────────────────────────────────
 *
 * In LearningPanel.tsx, find the function/switch that handles checker strings
 * (e.g. `checkObjective(checker: string): boolean`) and add the following
 * cases alongside the existing ones:
 *
 *   case 'has-odf':
 *     return Object.keys(topo.odfs ?? {}).length > 0;
 *
 *   case 'has-end-device':
 *     return Object.keys(topo.endDevices ?? {}).length > 0;
 *
 *   case 'has-wifi-ap':
 *     return Object.values(topo.endDevices ?? {}).some(
 *       (d) => d.deviceType === 'wifi-ap'
 *     );
 *
 *   case 'has-router':
 *     return Object.values(topo.endDevices ?? {}).some(
 *       (d) => d.deviceType === 'router'
 *     );
 *
 * ─── EXISTING CHECKERS (reference, no changes needed) ────────────────────────
 *
 *   'has-olt'            → topology has ≥1 OLT
 *   'has-8-onus'         → topology has exactly 8 ONUs
 *   'olt-selected'       → an OLT node is currently selected
 *   'onu-selected'       → any ONU or end-device node is selected
 *   'sim-running'        → simulation is in running state
 *   'events-logged'      → Event Log has ≥1 entry
 *   'all-registered'     → every ONU in topology is in O5 state
 *   'any-registered'     → at least one ONU is in O5 state
 *   'marginal-budget'    → at least one ONU has signalMargin_dB < 3
 *   'power-budget-open'  → Power Budget tab is active in bottom panel
 *   'bandwidth-open'     → Bandwidth tab is active in bottom panel
 *   'standard-xgspon'    → topology's OLT standard is XGS-PON
 *   'terminal-dba'       → user has run "display dba-profile" in Terminal
 *   'terminal-ont-info'  → user has run "display ont info" in Terminal
 *   'terminal-service-port' → user has run "display service-port" in Terminal
 *
 * ─── NEW CHECKERS (add these) ─────────────────────────────────────────────────
 *
 *   'has-odf'            → topology has ≥1 ODF node  (used in ftth-design module)
 *   'has-end-device'     → topology has ≥1 end device (generic)
 *   'has-wifi-ap'        → topology has ≥1 wifi-ap end device
 *   'has-router'         → topology has ≥1 router end device
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file itself exports nothing that needs to be imported at runtime.
 * It exists purely as a co-located specification for the LearningPanel changes.
 */

export const EXTRA_CHECKER_IDS = [
  'has-odf',
  'has-end-device',
  'has-wifi-ap',
  'has-router',
] as const;

export type ExtraCheckerID = (typeof EXTRA_CHECKER_IDS)[number];
