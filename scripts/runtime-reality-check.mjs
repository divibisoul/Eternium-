import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = process.cwd();
const files = {
  app: await readFile(root + '/App.tsx', 'utf8'),
  capability: await readFile(root + '/components/CapabilityCard.tsx', 'utf8'),
  dcrs: await readFile(root + '/components/DCRSMonitor.tsx', 'utf8'),
  bnc: await readFile(root + '/components/BNCv2Monitor.tsx', 'utf8'),
  agi: await readFile(root + '/hooks/useAgiCoreSystems.ts', 'utf8'),
  reverse: await readFile(root + '/hooks/useReverseEquation.ts', 'utf8'),
  dias: await readFile(root + '/components/DIASPerformanceMonitor.tsx', 'utf8'),
  governance: await readFile(root + '/components/GovernanceReportModal.tsx', 'utf8'),
};
assert.match(files.app, /aeternum_deployed_capabilities_v6_reality/);
assert.match(files.app, /aeternum_active_operations_v6_reality/);
assert.match(files.app, /EXECUTION_REQUIRED/);
assert.doesNotMatch(files.app, /Math\.random\(\)/);
assert.doesNotMatch(files.dcrs, /Math\.random\(\)/);
assert.doesNotMatch(files.bnc, /Math\.random\(\)/);
assert.doesNotMatch(files.agi, /Math\.random\(\)/);
assert.match(files.agi, /AgiCoreModuleStatus\.OFFLINE/);
assert.doesNotMatch(files.reverse, /Simulate/);
assert.doesNotMatch(files.reverse, /Math\.random\(\)/);
assert.doesNotMatch(files.dias, /Math\.random\(\)/);
assert.doesNotMatch(files.governance, /fake entropy/i);
assert.doesNotMatch(files.governance, /128 \/ 128/);
assert.doesNotMatch(files.governance, /Δ > 0\.94/);
assert.match(files.capability, /Declarada — não medida/);
console.log('N02_RUNTIME_REALITY_GATE: ok=true synthetic_metrics_blocked=true fake_operations_blocked=true');