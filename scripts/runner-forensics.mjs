import fs from 'node:fs/promises';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const run=(cmd,args)=>{try{return execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}catch(error){return `ERROR:${error?.message??String(error)}`}};
const report={system:'SOUL',nucleus:'N02',kind:'runner-forensics',generatedAt:new Date().toISOString(),runner:{os:os.platform(),release:os.release(),arch:os.arch(),cpus:os.cpus().length},toolchain:{node:process.version,npm:run('npm',['--version']),pnpm:run('pnpm',['--version'])},git:{commit:process.env.GITHUB_SHA??run('git',['rev-parse','HEAD']),ref:process.env.GITHUB_REF??'',event:process.env.GITHUB_EVENT_NAME??''},environment:{runnerName:process.env.RUNNER_NAME??'',runnerOS:process.env.RUNNER_OS??'',runnerArch:process.env.RUNNER_ARCH??''}};
await fs.writeFile('SOUL-N02-RUNNER-FORENSICS.json',`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
