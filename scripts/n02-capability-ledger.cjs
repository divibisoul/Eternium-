const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=process.cwd();
const skip=new Set(['.git','node_modules','dist','build','coverage']);
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(skip.has(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else files.push(path.relative(root,full));}}
walk(root);
const textFiles=files.filter(f=>!/[.]?(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf)$/i.test(f));
const text=new Map();
for(const f of textFiles){try{text.set(f,fs.readFileSync(path.join(root,f),'utf8'));}catch{}}
const source=(p)=>text.get(p)||'';
const idsFrom=(s)=>[...s.matchAll(/id:\s*['\"]([^'\"]+)['\"]/g)].map(m=>m[1]);
const quotedKeys=(s)=>[...s.matchAll(/['\"]([^'\"]+)['\"]\s*:/g)].map(m=>m[1]);
const catalogIds=idsFrom(source('data/capabilities.ts'));
const meshIds=idsFrom(source('src/soul-mesh/SoulMeshCapabilities.ts'));
const handlerIds=[...new Set(quotedKeys(source('src/soul-mesh/N02AIProviderBridge.ts')))];
const personaIds=['mpvs','neural_forge','asc','bnc_v2','einstein_code'].filter(id=>source('services/geminiService.ts').includes("'"+id+"'"));
const aliases={bnc_v2:'neural.bnc_v2',csae:'cognitive.csae',dcrs:'resource.dcrs'};
const specialExecutable=['mesh.handshake','mesh.describe','mesh.ping','mesh.health','octacore.execute','clareira.ingest','clareira.metrics'];
const sourceMentions=(id)=>[...text.entries()].filter(([p,s])=>s.includes(id)).map(([p])=>p).slice(0,40);
const catalog=catalogIds.map(id=>{const runtimeId=aliases[id]||id;const declared=meshIds.includes(runtimeId);const handler=handlerIds.includes(runtimeId);const special=specialExecutable.includes(id);const persona=personaIds.includes(id);let state='CATALOG_ONLY';if(handler||special)state='EXECUTABLE_PATH';else if(declared)state='DECLARED_NO_HANDLER';else if(persona)state='PERSONA_ONLY';const mentions=sourceMentions(id);return{id,runtimeId,state,declared,handlerOrSpecial:handler||special,persona,mentionCount:mentions.length,files:mentions};});
function git(args){try{return execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();}catch{return '';}}
const refs=git(['for-each-ref','--format=%(refname)','refs/heads','refs/remotes/origin','refs/tags']).split('\n').filter(Boolean);
const suspiciousMathRandomTelemetry=[];
for(const [p,s] of text){if(!s.includes('Math.random'))continue;const lower=s.toLowerCase();if(/metric|cpu|memory|latency|score|status|plasticity|density|bandwidth|cognitive/.test(lower))suspiciousMathRandomTelemetry.push({file:p,reason:'Math.random appears in a file containing operational or telemetry terms'});}
const explicitSimulationMarkers=[];
for(const [p,s] of text){if(/simulate|fake entropy|random metric|fabricated telemetry|synthetic success/i.test(s))explicitSimulationMarkers.push({file:p});}
const meshHandlerGaps=meshIds.filter(id=>!handlerIds.includes(id)&&!specialExecutable.includes(id));
const summary={generatedAt:new Date().toISOString(),branch:git(['branch','--show-current']),head:git(['rev-parse','HEAD']),totalFilesScanned:textFiles.length,catalogCapabilities:catalog,mesh:{declared:meshIds,handlerKeys:handlerIds,declaredWithoutDirectHandler:meshHandlerGaps},git:{refsFound:refs.length},suspiciousMathRandomTelemetry,explicitSimulationMarkers};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/n02-capability-ledger.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify({totalFilesScanned:summary.totalFilesScanned,catalogCount:catalog.length,executablePaths:catalog.filter(x=>x.state==='EXECUTABLE_PATH').length,personaOnly:catalog.filter(x=>x.state==='PERSONA_ONLY').length,declaredNoHandler:catalog.filter(x=>x.state==='DECLARED_NO_HANDLER').length,catalogOnly:catalog.filter(x=>x.state==='CATALOG_ONLY').length,meshDeclaredWithoutDirectHandler:meshHandlerGaps.length,suspiciousMathRandomTelemetry:suspiciousMathRandomTelemetry.length,explicitSimulationMarkers:explicitSimulationMarkers.length},null,2));