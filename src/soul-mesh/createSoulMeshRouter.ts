import type { SoulNucleus } from './SoulMeshProtocol';
import { SoulMeshRouter } from './N02PeerFabric';
/** Canonical N02 router factory. Legacy Supabase transport wiring remains in SoulMeshSupabaseTransport. */
export function createSoulMeshRouter(local:SoulNucleus):SoulMeshRouter{return new SoulMeshRouter(local);}
