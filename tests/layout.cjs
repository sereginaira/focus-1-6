const {chromium}=require('C:/Users/despa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.evaluate(()=>localStorage.setItem('miraculous-sport-v1',JSON.stringify({version:1,name:'Тест',calm:true,completed:{1:{stars:3},2:{stars:3},3:{stars:3},4:{stars:3},5:{stars:3}}})));
  await page.reload();await page.locator('[data-action=start]').click();await page.locator('[data-action=boss-intro]').click();await page.locator('[data-action=boss-begin]').click();
  await page.evaluate(()=>{const grid=document.querySelector('.answer-grid');while(grid.children.length<4)grid.append(grid.firstElementChild.cloneNode(true));if(!document.querySelector('.word-display .speak-button')){const button=document.createElement('button');button.className='speak-button';button.textContent='🔊';document.querySelector('.word-display').append(button);}});
  for(const [width,height] of [[390,844],[360,800]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const scan=await page.evaluate(()=>{
    const data=GameData;const bank=[...data.expressionQuestions,...data.grammarQuestions,...data.sportQuestions.filter(q=>q.options.length>=3),...data.contextQuestions].filter(q=>q.type!=='build');
    bank.push(...data.vocabulary.map(v=>({id:v.id,prompt:`Как по-английски «${v.ru}»?`,options:[v.en,'support your family','score ten points','long-distance runner']})));
    const result=[];
    for(const q of bank){
     document.querySelector('#question-title').textContent=q.prompt;
     document.querySelectorAll('.answer span:last-child').forEach((el,i)=>el.textContent=q.options[i]||q.options[0]);
     const bottom=document.querySelector('#boss-page').getBoundingClientRect().bottom;
     if(bottom>innerHeight)result.push({id:q.id,bottom,extra:Math.round(bottom-innerHeight)});
    }
    const worst=result.sort((a,b)=>b.bottom-a.bottom);
    if(worst.length){const q=bank.find(q=>q.id===worst[0].id);document.querySelector('#question-title').textContent=q.prompt;document.querySelectorAll('.answer span:last-child').forEach((el,i)=>el.textContent=q.options[i]||q.options[0]);}
    return worst;
   });
   console.log({width,height,overflowCases:scan.length,worst:scan.slice(0,12)});
   await page.screenshot({path:`tests/layout-worst-${width}.png`,fullPage:true});
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
