import type { SoulMeshMessage } from './SoulMeshProtocol';
import { SoulMeshCapabilityRegistry } from './SoulMeshCapabilityRegistry';

export type SoulMeshCapabilityHandler = (message: SoulMeshMessage) => unknown | Promise<unknown>;

/** Runtime bridge: the Mesh invokes handlers registered by the N02 runtime/tools. */
export class SoulMeshCapabilityExecutor {
  private readonly handlers = new Map<string, SoulMeshCapabilityHandler>();

  constructor(readonly registry = new SoulMeshCapabilityRegistry()) {}

  register(capability: string, handler: SoulMeshCapabilityHandler): () => void {
    if (!capability.trim()) throw new Error('CAPABILITY_ID_REQUIRED');
    if (!this.registry.has(capability)) throw new Error(`CAPABILITY_NOT_DECLARED:${capability}`);
    if (this.handlers.has(capability)) throw new Error(`CAPABILITY_ALREADY_REGISTERED:${capability}`);
    this.handlers.set(capability, handler);
    return () => this.handlers.delete(capability);
  }

  has(capability: string): boolean { return this.handlers.has(capability); }
  listExecutable(): string[] { return [...this.handlers.keys()].sort(); }

  async execute(message: SoulMeshMessage): Promise<unknown> {
    if (!message.capability) throw new Error('CAPABILITY_REQUIRED');
    const capability = this.registry.get(message.capability);
    if (!capability) throw new Error(`CAPABILITY_NOT_DECLARED:${message.capability}`);
    const handler = this.handlers.get(message.capability);
    if (!handler) throw new Error(`CAPABILITY_HANDLER_NOT_REGISTERED:${message.capability}`);
    return handler(message);
  }
}
