export const N02_PEER_ENDPOINTS={N01:{in:'/mesh/in/N01',out:'/mesh/in/N02'},N03:{in:'/mesh/in/N03',out:'/mesh/in/N02'},N04:{in:'/mesh/in/N04',out:'/mesh/in/N02'},N05:{in:'/mesh/in/N05',out:'/mesh/in/N02'},N06:{in:'/mesh/in/N06',out:'/mesh/in/N02'}} as const;
/** @deprecated Legacy aliases retained for compatibility; use N02_PEER_ENDPOINTS. */
export const R3_PEER_ENDPOINTS={aeternum:N02_PEER_ENDPOINTS.N01,nexus:N02_PEER_ENDPOINTS.N03,chatbot:N02_PEER_ENDPOINTS.N04,chatbots:N02_PEER_ENDPOINTS.N05,'chatbot-2000':N02_PEER_ENDPOINTS.N06} as const;
