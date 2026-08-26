import { SOUL_MESH_CAPABILITIES, type SoulMeshCapability } from './SoulMeshCapabilities';

export type SoulMeshCapabilityHandler = (payload: unknown) => Promise<unknown> | unknown;

export class SoulMeshCapabilityRegistry {
  private readonly capabilities = new Map<string, SoulMeshCapability>();
  private readonly handlers = new Map<string, SoulMeshCapabilityHandler>();

  constructor() {
    for (const capability of SOUL_MESH_CAPABILITIES) this.capabilities.set(capability.id, capability);
  }

  register(capabilities: SoulMeshCapability[]): void {
    for (const capability of capabilities) this.capabilities.set(capability.id, capability);
  }

  registerHandler(id: string, handler: SoulMeshCapabilityHandler): void {
    if (!this.capabilities.has(id)) throw new Error(`CAPABILITY_NOT_DECLARED:${id}`);
    this.handlers.set(id, handler);
  }

  getAll(): SoulMeshCapability[] { return [...this.capabilities.values()]; }
  has(id: string): boolean { return this.capabilities.has(id); }
  canExecute(id: string): boolean { return this.handlers.has(id); }

  async execute(id: string, payload: unknown): Promise<unknown> {
    const handler = this.handlers.get(id);
    if (!handler) throw new Error(`CAPABILITY_HANDLER_NOT_REGISTERED:${id}`);
    return handler(payload);
  }
}
