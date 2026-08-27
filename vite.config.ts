import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { n02HttpMeshHandler } from './src/soul-mesh/endpoint.ts';
const n02MeshPlugin=():Plugin=>({name:'n02-soul-mesh-http',configureServer(server){server.middlewares.use('/mesh/in',async(req,res,next)=>{if(req.method!=='POST')return next();try{await n02HttpMeshHandler(req,res);}catch(error){if(!res.headersSent){res.statusCode=500;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:'N02_MESH_INTERNAL_ERROR',message:error instanceof Error?error.message:String(error)}));}}});}});
export default defineConfig(({mode})=>{const env=loadEnv(mode,'.','');const geminiKey=env.GEMINI_API_KEY||env.API_KEY;return{plugins:[n02MeshPlugin()],define:{'process.env.API_KEY':JSON.stringify(geminiKey),'process.env.GEMINI_API_KEY':JSON.stringify(geminiKey)},resolve:{alias:{'@':path.resolve(__dirname,'.')}}};});
