import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';

/** Singleton runtime bridge for the server process. Existing N02 tools register here; none are replaced. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();
