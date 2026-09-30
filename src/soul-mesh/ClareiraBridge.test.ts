import assert from 'node:assert/strict';
import test from 'node:test';
import { createClareiraPacket, isClareiraPacket } from '../../shared/clareira-contract';
import { clareiraMetrics, ingestClareiraPacket, recordClareiraDrop } from './ClareiraBridge';

test('N02 Clareira packet factory preserves correlation and validates the packet', () => {
  const packet = createClareiraPacket('state', 'N02', 'corr-clareira', {
    criticality: 0.9,
    packetType: 'StateReport',
    metadata: { phase: 'federation' },
  });
  assert.equal(isClareiraPacket(packet), true);
  assert.equal(packet.correlationId, 'corr-clareira');
  assert.equal(packet.sourceId, 'N02');
  assert.equal(packet.packetType, 'StateReport');
  assert.equal(packet.criticality, 0.9);
});

test('N02 Clareira drop bookkeeping closes in-flight accounting', () => {
  const before = clareiraMetrics();
  const packet = createClareiraPacket('drop-me', 'N02', 'corr-drop');
  ingestClareiraPacket(packet);
  recordClareiraDrop(packet, 'test');
  const after = clareiraMetrics();
  assert.equal(after.packets.ingested, before.packets.ingested + 1);
  assert.equal(after.packets.dropped, (before.packets.dropped ?? 0) + 1);
  assert.equal(after.packets.inFlight, before.packets.inFlight);
});
