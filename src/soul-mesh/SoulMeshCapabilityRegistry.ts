import { SOUL_MESH_CAPABILITIES, type SoulMeshCapability } from './SoulMeshCapabilities';

export class SoulMeshCapabilityRegistry {
  private readonly capabilities = new Map<string, SoulMeshCapability>();

  constructor(initial: SoulMeshCapability[] = SOUL_MESH_CAPABILITIES) {
    for (const capability of initial) this.add(capability);
  }

  add(capability: SoulMeshCapability): void {
    if (!capability.id.trim()) throw new Error('CAPABILITY_ID_REQUIRED');
    if (this.capabilities.has(capability.id)) throw new Error(`CAPABILITY_ALREADY_REGISTERED:${capability.id}`);
    this.capabilities.set(capability.id, capability);
  }

  register(capabilities: SoulMeshCapability[]): void {
    for (const capability of capabilities) {
      if (this.capabilities.has(capability.id)) continue;
      this.add(capability);
    }
  }

  getAll(): SoulMeshCapability[] { return [...this.capabilities.values()]; }
  get(id: string): SoulMeshCapability | undefined { return this.capabilities.get(id); }
  has(id: string): boolean { return this.capabilities.has(id); }
}
