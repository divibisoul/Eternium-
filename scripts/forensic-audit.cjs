const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const manifestPath = process.env.FORENSIC_MANIFEST || 'docs/forensics/n02-manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const root = process.cwd();
const skip = new Set(['.git','node_modules','.next','dist','build','coverage']);
const files = [];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else files.push(path.relative(root,full));
  }
}
walk(root);
const textFiles = files.filter(f=>!/[.]?(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf)$/i.test(f));
const contents = new Map();
for(const file of textFiles){
  try{ contents.set(file,fs.readFileSync(path.join(root,file),'utf8')); }catch{}
}
function sh(cmd,args){
  try{return {ok:true,stdout:execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']})}}
  catch(e){return {ok:false,error:String(e?.stderr||e?.message||e)}}
}
const refs=sh('git',['for-each-ref','--format=%(refname)','refs/heads','refs/remotes/origin','refs/tags']);
const history=sh('git',['log','--all','--name-only','--format=%H']);
const stash=sh('git',['stash','list']);
let prs={ok:false,error:'GH_CLI_NOT_RUN'};
try{
  prs=sh('gh',['pr','list','--state','all','--limit','100','--json','number,title,url,headRefName,baseRefName']);
}catch{}
const backupDirs=files.filter(f=>/(^|[/])(?:backup|backups|archive|archives|snapshot|snapshots)(?:[/]|$)/i.test(f));
const results=manifest.targets.map(target=>{
  const pathHits=files.filter(f=>target.paths.some(p=>f===p||f.startsWith(p+'/')) && target.terms.some(t=>f.toLowerCase().includes(t.toLowerCase())));
  const contentHits=[];
  for(const [file,txt] of contents){
    if(!target.paths.some(p=>file===p||file.startsWith(p+'/'))) continue;
    const hits=target.terms.filter(t=>txt.toLowerCase().includes(t.toLowerCase()));
    if(hits.length) contentHits.push({file,terms:hits});
  }
  const historyHit=history.ok && target.terms.some(t=>history.stdout.toLowerCase().includes(t.toLowerCase()));
  const prHit=prs.ok && target.terms.some(t=>prs.stdout.toLowerCase().includes(t.toLowerCase()));
  const refHit=refs.ok && target.terms.some(t=>refs.stdout.toLowerCase().includes(t.toLowerCase()));
  const backupHit=backupDirs.length>0 && target.terms.some(t=>backupDirs.some(f=>f.toLowerCase().includes(t.toLowerCase())));
  const any=pathHits.length||contentHits.length||historyHit||prHit||refHit||backupHit;
  return {id:target.id,status:any?'FOUND':'NOT_FOUND_IN_AVAILABLE_SOURCES',
    sevenSources:{
      main_path_scan:{status:'MEASURED',hits:pathHits.slice(0,50)},
      content_scan:{status:'MEASURED',hits:contentHits.slice(0,50)},
      all_refs:{status:refs.ok?'MEASURED':'BLOCKED',match:refHit},
      git_history:{status:history.ok?'MEASURED':'BLOCKED',match:historyHit},
      pull_requests:{status:prs.ok?'MEASURED':'BLOCKED',match:prHit},
      stash:{status:stash.ok?'MEASURED':'BLOCKED',present:Boolean(stash.stdout?.trim())},
      repository_backups:{status:backupDirs.length?'MEASURED':'NOT_CONFIGURED_IN_CHECKOUT',match:backupHit}
    }};
});
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/forensic-audit-report.json',JSON.stringify({
  generatedAt:new Date().toISOString(), repository:manifest.repository, nucleus:manifest.nucleus,
  branch:sh('git',['branch','--show-current']).stdout.trim(), head:sh('git',['rev-parse','HEAD']).stdout.trim(),
  totalFilesScanned:textFiles.length, results
},null,2));
console.log(JSON.stringify({nucleus:manifest.nucleus,totalFilesScanned:textFiles.length,results},null,2));
