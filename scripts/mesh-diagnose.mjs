import { spawn } from 'node:child_process';
const verbose=process.argv.includes('--verbose');
const url=verbose?'/?mesh-diagnose=1&verbose=1':'/?mesh-diagnose=1';
const child=spawn('npx',['vite','--host','127.0.0.1','--open',url],{stdio:'inherit',shell:process.platform==='win32'});
child.on('exit',code=>process.exit(code??0));
