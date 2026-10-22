/* End-to-end tests run against file://, without a server or application hooks.
   PLAYWRIGHT_PATH can point to an installed Playwright package. */
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/despa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(process.argv[2]||process.env.GAME_ROOT||'.');
const output=path.join(root,'tests');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),sandbox);
const D=sandbox.window.GameData;
const bank=[...D.expressionQuestions,...D.grammarQuestions,...D.sportQuestions,...D.contextQuestions];
let passed=[],errors=[],positions=new Set();
const check=(title,condition)=>{assert.ok(condition,title);passed.push(title);console.log('PASS',title);};
const local=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('miraculous-sport-v1')));
const answerFor=id=>{
 if(id.startsWith('v:')){const dir=id.endsWith(':en')?'en':'ru';const en=id.slice(2,-3);const item=D.vocabulary.find(v=>v.en===en);assert.ok(item,'vocabulary exists: '+id);return {answer:item[dir==='en'?'ru':'en'],item};}
 const q=bank.find(q=>q.id===id);assert.ok(q,'question exists: '+id);return q;
};
async function answer(page,correct=true){
 const id=await page.locator('#question').getAttribute('data-qid'),q=answerFor(id);
 if(q.type==='build'){
   const tokens=correct?q.tokens:[...q.tokens].reverse();
   for(const token of tokens)await page.locator('#token-bank').getByRole('button',{name:token,exact:true}).click();
   await page.locator('#builder-check').click();
 }else{
   const options=page.locator('.answer');const texts=await options.evaluateAll(a=>a.map(b=>b.querySelector('span:last-child').textContent));
   const i=correct?texts.indexOf(q.answer):texts.findIndex(t=>t!==q.answer);assert.ok(i>=0,`answer available: ${id}`);positions.add(texts.indexOf(q.answer));await options.nth(i).click();
 }
 await page.locator('#next-question').waitFor();
 return id;
}
async function next(page){await page.locator('#next-question').click();}
async function finishRound(page,limit=80){let n=0;while(await page.locator('#question').count()){assert.ok(n++<limit,'round terminates');await answer(page);await next(page);}return n;}
async function mission(page,id){await page.locator('[data-action=map]').first().click();await page.locator(`[data-action=intro][data-id="${id}"]`).click();await page.locator('[data-action=begin]').click();}
async function assertLayout(page,label){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const layout=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));
 check(label+' — no horizontal overflow',layout.scroll<=layout.w);check(label+' — all local images load',layout.images.length===0);
}
(async()=>{
 check('148 vocabulary entries from all seven sections',D.vocabulary.length===148&&new Set(D.vocabulary.map(v=>v.unit)).size===7);
 check('unique vocabulary identifiers',new Set(D.vocabulary.map(v=>v.id)).size===D.vocabulary.length);
 check('all question identifiers unique',new Set(bank.map(q=>q.id)).size===bank.length);
 for(const q of bank){
   assert.ok(q.answer&&q.explanation&&q.category&&q.topic,'complete metadata '+q.id);
   assert.equal(new Set(q.options).size,q.options.length,'unique distractors '+q.id);
   assert.equal(q.options.filter(o=>o===q.answer).length,1,'exactly one answer '+q.id);
   if(q.type==='build')assert.equal(q.tokens.join(' '),q.answer,'builder tokens '+q.id);
   else assert.ok(q.options.length>=2&&q.options.length<=4,'2–4 options '+q.id);
 }
 check('89 static questions validated: answers, distractors, builders and metadata',bank.length===89);
 const ladybug=fs.readFileSync(path.join(root,'assets/ladybug.png'));check('transparent character PNG exists',ladybug.length>10000&&ladybug[25]===6);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.clock.install();
  page.setDefaultTimeout(7000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.locator('.hero').waitFor();
  await assertLayout(page,'Desktop home');
  await page.screenshot({path:path.join(output,'home-desktop.png'),fullPage:true});
  await page.locator('[data-action=start]').click();await page.locator('#hero-name').fill('Аня');await page.locator('#name-form .button').click();
  check('name saved to localStorage',(await local(page)).name==='Аня');
  await page.locator('[data-action=boss-intro]').click({force:true});check('boss initially locked',await page.locator('.mission-card.final.locked').count()===1&&await page.locator('#toast').textContent()!=='');
  await page.screenshot({path:path.join(output,'map-desktop.png'),fullPage:true});
  await mission(page,1);
  await page.screenshot({path:path.join(output,'mission-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await assertLayout(page,'Mobile mission');await page.screenshot({path:path.join(output,'mission-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:1000});
  const first=await answer(page,false);check('wrong answer highlights correct choice',await page.locator('.answer.correct').count()===1&&await page.locator('.answer.wrong').count()===1);
  check('mistake record contains required fields',Object.values((await local(page)).mistakes).some(m=>m.qid===first&&m.correctAnswer&&m.selectedAnswer&&m.whetherCorrect===false));
  const mistakeKey=Object.keys((await local(page)).mistakes)[0];
  await page.locator('[data-action=hint]').click();check('answer explanation available',await page.locator('#modal[open]').count()===1);await page.locator('[data-action=modal-close]').last().click();
  await next(page);
  const seen=[first];while(await page.locator('#question').count()){const id=await page.locator('#question').getAttribute('data-qid');seen.push(id);await answer(page);await next(page);}
  const retry=seen.lastIndexOf(first);check('vocabulary retry after at least three intervening questions',retry>=4&&seen.indexOf(first)===0);
  check('mission completion, stars and mastery persist',(await local(page)).completed[1].stars>=1&&(await local(page)).mastery[mistakeKey]>=1);
  check('resolved vocabulary mistake removed',!(await local(page)).mistakes[mistakeKey]);
  for(const id of [2,3,4,5]){await mission(page,id);
    let count=0,builderChecked=false;
    while(await page.locator('#question').count()){
      const q=answerFor(await page.locator('#question').getAttribute('data-qid'));
      if(q.type==='build'&&!builderChecked){
        const firstToken=page.locator('#token-bank button').first();await firstToken.click();
        check('builder selects a token by tap',await page.locator('#builder-answer button').count()===1);
        await page.locator('#builder-answer button').first().click();check('builder removes selected token by tap',await page.locator('#builder-answer button').count()===0);
        await page.locator('#token-bank button').first().click();await page.locator('[data-action=builder-clear]').click();check('builder clear and disabled incomplete check',await page.locator('#builder-answer button').count()===0&&await page.locator('#builder-check').isDisabled());
        builderChecked=true;
      }
      await answer(page);await next(page);count++;
    }
    check(`mission ${id} finished through actual clicks (${count} questions)`,(await local(page)).completed[id]?.stars===3);
  }
  check('answer positions randomized',positions.size===4);
  await page.locator('[data-action=map]').first().click();check('boss unlocked after all five missions',await page.locator('.mission-card.final.locked').count()===0);
  await page.locator('[data-action=dictionary]').first().click();await page.locator('#word-search').fill('плавание');
  check('dictionary Russian search',await page.locator('.vocab-card').count()===1&&await page.locator('.vocab-card h2').textContent()==='swimming');
  await page.locator('[data-action=speak]').first().click();check('speech synthesis button does not throw',errors.length===0);
  await page.locator('#word-search').fill('');await page.locator('#unit-filter').selectOption('6.7');check('dictionary unit filter',await page.locator('.vocab-card').count()===12);
  await page.locator('#mastery-filter').selectOption('3');const levels=(await local(page)).mastery;check('dictionary mastery filter',await page.locator('.vocab-card').count()===D.vocabulary.filter(v=>v.unit==='6.7'&&levels[v.id]===3).length);
  await page.locator('[data-action=rules]').first().click();check('grammar reference includes all 16 verbs',await page.locator('.verb-table tr').count()===16);
  await page.locator('[data-action=rule-tab][data-tab=expressions]').click();check('all 15 expression models in reference',await page.locator('.rule-card').count()===15);
  await page.locator('[data-action=rule-tab][data-tab=sport]').click();check('sport reference navigation',await page.locator('.rule-card').count()===4);
  await page.locator('[data-action=map]').first().click();await page.locator('[data-action=boss-intro]').click();await page.locator('[data-action=boss-begin]').click();
  await page.screenshot({path:path.join(output,'boss-desktop.png'),fullPage:true});await assertLayout(page,'Desktop boss');
  await answer(page,true);check('correct boss answer deals exactly 10 HP',await page.locator('#boss-hp').textContent()==='90 / 100 HP');await next(page);
  await answer(page,false);check('wrong boss answer loses one heart',await page.locator('#hearts .heart.lost').count()===1);await next(page);
  await page.clock.fastForward(7100);check('last three seconds timer becomes urgent',await page.locator('#timer-row.urgent').count()===1);await page.clock.fastForward(3100);
  check('timeout loses one heart and reveals answer',await page.locator('#hearts .heart.lost').count()===2&&await page.locator('#feedback-slot').textContent().then(t=>t.includes('Время вышло')));await next(page);
  await page.locator('[data-action=settings]').click();const beforePause=await page.locator('#timer-number').textContent();await page.clock.fastForward(15000);check('timer pauses inside settings',await page.locator('#timer-number').textContent()===beforePause);
  await page.locator('[data-action=calm]').click();check('calm mode saved',(await local(page)).calm===true);await page.locator('[data-action=modal-close]').last().click();
  await answer(page);await next(page);check('calm boss timer starts at 20 seconds',await page.locator('#timer-number').textContent()==='20');
  await finishRound(page);check('boss victory at ten correct answers',(await local(page)).bossDefeated===true&&(await local(page)).lastResult.correct===10);
  const result=await local(page);check('victory statistics include vocabulary and Past Simple',!!result.lastResult.categories.vocabulary&&!!result.lastResult.categories.grammar&&result.lastResult.win);
  await page.screenshot({path:path.join(output,'victory-desktop.png'),fullPage:true});
  await page.locator('[data-action=boss-begin]').click();for(let i=0;i<5;i++){await answer(page,false);await next(page);}
  check('defeat after five errors with supportive retry screen',(await local(page)).lastResult.win===false&&await page.locator('[data-action=boss-begin]').count()===1);
  await page.screenshot({path:path.join(output,'defeat-mobile-before.png'),fullPage:true});
  const mistakes=Object.keys((await local(page)).mistakes);check('boss mistakes saved',mistakes.length>=4);
  await page.locator('[data-action=practice]').click();const practiceIds=[];while(await page.locator('#question').count()){practiceIds.push(await page.locator('#question').getAttribute('data-qid'));check('mistake practice has no active timed countdown',await page.locator('#timer-row').count()===0);await answer(page);await next(page);}
  check('mistake practice uses saved problem questions',practiceIds.some(id=>mistakes.includes(id)||id.startsWith('v:')));
  check('practice improves unresolved mistakes',Object.keys((await local(page)).mistakes).length<mistakes.length);
  // Save / close / reopen the actual local page with the same browser context.
  const saved=await local(page);await page.close();const reopened=await context.newPage();reopened.on('pageerror',e=>errors.push(e.message));reopened.setDefaultTimeout(7000);
  await reopened.goto(pathToFileURL(path.join(root,'index.html')).href);
  check('progress survives page close and reopen',JSON.stringify(await local(reopened))===JSON.stringify(saved));
  await reopened.locator('[data-action=settings]').click();const soundState=(await local(reopened)).sound;await reopened.locator('#modal [data-action=sound]').click();check('sound off/on persists',(await local(reopened)).sound!==soundState);await reopened.locator('#modal [data-action=sound]').click();check('sound can be restored',(await local(reopened)).sound===soundState);await reopened.locator('[data-action=modal-close]').last().click();
  // Layout and tap controls at tablet, iPhone and narrow phone widths.
  for(const [label,width,height] of [['tablet',820,1180],['mobile',390,844],['narrow',360,800]]){
    await reopened.setViewportSize({width,height});await reopened.locator('[data-action=home]').first().click();await assertLayout(reopened,label+' home');await reopened.screenshot({path:path.join(output,`home-${label}.png`),fullPage:true});
    await reopened.locator('[data-action=map]').first().click();await assertLayout(reopened,label+' map');await reopened.screenshot({path:path.join(output,`map-${label}.png`),fullPage:true});
    await reopened.locator('[data-action=boss-intro]').click();await reopened.locator('[data-action=boss-begin]').click();await assertLayout(reopened,label+' boss');
    const bottom=await reopened.locator('#boss-page').evaluate(el=>el.getBoundingClientRect().bottom);check(label+' boss fits viewport',bottom<=height);
    await reopened.screenshot({path:path.join(output,`boss-${label}.png`),fullPage:true});await answer(reopened,false);await assertLayout(reopened,label+' boss feedback');
    await reopened.locator('#boss-page [data-action=map]').click();await reopened.locator('#leave-mission').click();
  }
  await reopened.locator('[data-action=settings]').click();await reopened.locator('[data-action=reset-confirm]').click();await reopened.locator('#modal [data-action=settings]').click();check('reset can be cancelled without data loss',Object.keys((await local(reopened)).completed).length>=5);
  await reopened.locator('[data-action=reset-confirm]').click();await reopened.locator('[data-action=reset]').click();check('confirmed reset clears only game progress',(await local(reopened)).name===''&&Object.keys((await local(reopened)).completed).length===0);
  check('no console or runtime errors',errors.length===0);
  const summary={date:new Date().toISOString(),root,browser:'Microsoft Edge / Chromium via Playwright',launch:'file:// (no server)',passed:passed.length,checks:passed,errors};
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(summary,null,2));
  console.log(`ALL ${passed.length} CHECKS PASSED`);
 }finally{await browser.close();}
})().catch(error=>{fs.writeFileSync(path.join(output,'verification-failure.txt'),error.stack);console.error(error);process.exitCode=1;});
