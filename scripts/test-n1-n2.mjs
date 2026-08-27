const required=['SOUL_MESH_N01_URL','SOUL_MESH_N02_URL'];
for(const key of required)if(!process.env[key])throw new Error(`${key}_REQUIRED`);
const trim=(x)=>String(x).replace(/\/$/,'');
const urls={N01:process.env.SOUL_MESH_N01_URL,N02:process.env.SOUL_MESH_N02_URL};
const tokens={N01:process.env.SOUL_MESH_N01_TOKEN,N02:process.env.SOUL_MESH_N02_TOKEN};
const endpoint=(source,target)=>`${trim(urls[target])}/mesh/in/${source}`;
const send=async(source,target,capability,payload)=>{const started=Date.now();const correlationId=crypto.randomUUID();const message={protocol:'soul-mesh/1',id:crypto.randomUUID(),correlationId,source,target,kind:'request',capability,payload,timestamp:Date.now()};const headers={'content-type':'application/json','accept':'application/json','x-soul-mesh-source':source};const token=tokens[target];if(token)headers.authorization=`Bearer ${token}`;const response=await fetch(endpoint(source,target),{method:'POST',headers,body:JSON.stringify(message)});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(`${target}:${response.status}:${JSON.stringify(body)}`);if(!body||body.correlationId!==correlationId||body.source!==target||body.target!==source)throw new Error(`${target}:INVALID_CORRELATED_RESPONSE`);return{body,durationMs:Date.now()-started};};
const tests=[
 ['N1 -> N2 ai.reason',()=>send('N01','N02','ai.reason',{text:'Responda apenas: N1-N2-REASON-OK',conversationId:'integration-test'})],
 ['N2 -> N1 mesh.echo',()=>send('N02','N01','mesh.echo',{text:'N2-N1-ECHO-OK'})],
 ['N1 -> N2 persona.switch',()=>send('N01','N02','persona.switch',{personaId:'einstein_code',conversationId:'integration-test'})],
 ['N1 -> N2 system.orchestrate',()=>send('N01','N02','system.orchestrate',{task:'Primeiro faça uma análise; depois faça uma síntese.',conversationId:'integration-test'})],
];
const report={startedAt:new Date().toISOString(),tests:[]};
for(const [name,run] of tests){try{const result=await run();report.tests.push({name,status:'PASS',durationMs:result.durationMs,response:result.body});console.log(`PASS ${name} ${result.durationMs}ms`);}catch(error){report.tests.push({name,status:'FAIL',error:String(error)});console.error(`FAIL ${name}`,error);}}
report.finishedAt=new Date().toISOString();report.passed=report.tests.filter(x=>x.status==='PASS').length;report.failed=report.tests.filter(x=>x.status==='FAIL').length;console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
