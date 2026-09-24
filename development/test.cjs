const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
for(const file of fs.readdirSync(path.join(__dirname,'tests')).filter(f=>f.endsWith('.test.cjs')).sort()){
 const r=spawnSync(process.execPath,[path.join(__dirname,'tests',file)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
console.log('PASS: all CurveLab checks.');
