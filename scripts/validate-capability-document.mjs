#!/usr/bin/env node

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let document;
try {
  document = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  console.error('CAPABILITY_DOCUMENT_INVALID_JSON');
  process.exit(1);
}

const nodeIds = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const statuses = new Set(['AVAILABLE', 'DEGRADED', 'UNAVAILABLE']);
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);
const isNumberOrNull = (value) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);

const valid = document && typeof document === 'object' && !Array.isArray(document)
  && nodeIds.has(document.node)
  && Array.isArray(document.capabilities)
  && document.capabilities.every((capability) => capability && typeof capability === 'object'
    && typeof capability.id === 'string' && capability.id.length > 0
    && typeof capability.version === 'string' && /^\d+\.\d+$/.test(capability.version)
    && typeof capability.implementation === 'string' && capability.implementation.length > 0
    && statuses.has(capability.status)
    && isStringArray(capability.input)
    && isStringArray(capability.output)
    && isNumberOrNull(capability.latency_ms)
    && (capability.privacy === null || (typeof capability.privacy === 'number' && Number.isFinite(capability.privacy) && capability.privacy >= 0 && capability.privacy <= 1))
    && isNumberOrNull(capability.cost));

if (!valid) {
  console.error('CAPABILITY_DOCUMENT_SCHEMA_INVALID');
  process.exit(1);
}

console.log(`CAPABILITY_DOCUMENT_OK node=${document.node} capabilities=${document.capabilities.length}`);
