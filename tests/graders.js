// Prints grader estimates for a few example cards. Run: node tests/graders.js
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
new Function(js); // syntax check of the whole script
const pure=js.split('/*PURE_START*/')[1].split('/*PURE_END*/')[0];
const api=new Function(pure+';return {estimateAll,fmtGrade,tierFor,GRADERS};')();
const show=(label,worst,cond,ai)=>{
  console.log('\n'+label+'  worst axis '+worst+'/'+(100-worst)+'  cond '+JSON.stringify(cond)+'  ai '+ai);
  api.estimateAll(worst,cond,ai).forEach(r=>console.log('  '+r.name.padEnd(4),'centering',(r.unknown?'n/a':api.fmtGrade(r.centering,r.centeringPristine)).padEnd(12),'overall',(r.unknown?'not calculated':r.range?api.fmtGrade(r.lo)+'-'+api.fmtGrade(r.hi):'up to '+api.fmtGrade(r.hi,r.pristine)).padEnd(14),'held by',r.held.join(', ')||'-'));
};
show('Worn card as measured',59.7,{corners:1,edges:0,surface:1},null);
show('Same card with AI cap 4',59.7,{corners:1,edges:0,surface:1},4);
show('Perfect card',50.5,{corners:0,edges:0,surface:0},null);
show('Great centering, light wear',54,{corners:1,edges:1,surface:0},null);
show('Poor centering 72/28',72,{corners:0,edges:0,surface:0},null);
show('Terrible 93/7',93,{corners:0,edges:0,surface:0},null);
