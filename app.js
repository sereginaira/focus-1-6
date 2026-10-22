(() => {
  'use strict';
  const D = window.GameData;
  const $ = (selector, root=document) => root.querySelector(selector);
  const app = $('#app'), modal = $('#modal');
  const KEY = 'miraculous-sport-v1';
  const categoryNames = {vocabulary:'Словарь',sport:'Play / go / do',expressions:'Выражения',grammar:'Past Simple',context:'По смыслу'};
  const masteryLabels=['Новое','Учим','Почти выучено','Выучено'];
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = list => {const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick = list => list[Math.floor(Math.random()*list.length)];
  const defaults=()=>({version:1,name:'',completed:{},highScore:0,bestCombo:0,lastResult:null,mastery:{},mistakes:{},history:[],bossDefeated:false,sound:true,calm:false});
  let storageOK=true, progress=loadProgress(), session=null, screen='home', ruleTab='past', audioContext, toastTimeout;
  let dictionaryFilter={search:'',unit:'all',mastery:'all'}, timerHandle=null, deadline=0, remaining=0, advancing=false;
  const bank=[...D.expressionQuestions,...D.grammarQuestions,...D.sportQuestions,...D.contextQuestions];
  function loadProgress(){
    try{
      const p=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!p || p.version!==1) return defaults();
      const result={...defaults(),...p};
      result.name=typeof result.name==='string'?result.name.slice(0,24):'';
      for(const key of ['completed','mastery','mistakes']) if(!result[key]||typeof result[key]!=='object'||Array.isArray(result[key]))result[key]={};
      if(!Array.isArray(result.history))result.history=[];
      return result;
    }catch{storageOK=false;return defaults();}
  }
  function saveProgress(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{if(storageOK)toast('Браузер не разрешает сохранение. Не закрывай игру до конца миссии.');storageOK=false;}updateHeader();}
  function updateHeader(){
    $('#header-score').textContent=`✦ ${progress.highScore}`;
    const sound=$('#sound-toggle');sound.textContent=progress.sound?'♪':'♫̸';sound.setAttribute('aria-pressed',String(progress.sound));sound.setAttribute('aria-label',progress.sound?'Выключить звук':'Включить звук');
    document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.id===`nav-${screen}`));
  }
  function sound(type='click'){
    if(!progress.sound)return;
    try{
      audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
      const sequences={click:[520],correct:[523,659,784],wrong:[230,175],combo:[523,659,784,1047],hit:[330,660,990],victory:[523,659,784,1047,784,1047]};
      (sequences[type]||sequences.click).forEach((frequency,i)=>{
        const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+i*.09;
        oscillator.type=type==='wrong'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,t);
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+.17);
        oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t);oscillator.stop(t+.19);
      });
    }catch{/* Sound is optional, including in older browsers. */}
  }
  function speak(text){
    if(!('speechSynthesis'in window)){toast('Озвучивание недоступно в этом браузере.');return;}
    if(!progress.sound){toast('Сначала включи звук кнопкой ♪.');return;}
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.83;const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en-GB'))||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)u.voice=voice;speechSynthesis.speak(u);}catch{toast('Голос недоступен. Можно продолжать без озвучивания.');}
  }
  function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),3500);}
  function announce(text){$('#announcer').textContent=text;}
  function render(html,newScreen){
    stopTimer();if(newScreen)screen=newScreen;
    document.body.classList.toggle('battle-route',screen==='boss');
    app.innerHTML=`${!storageOK?'<div class="storage-warning">Сохранение недоступно в этом браузере. Текущая игра работает, но прогресс может исчезнуть после закрытия.</div>':''}<div class="page-enter">${html}</div>`;
    updateHeader();app.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
  }
  function stars(n=0){return `<span class="stars" aria-label="${n} из 3 звёзд">${'★'.repeat(n)}<span class="empty">${'☆'.repeat(3-n)}</span></span>`;}
  function showHome(){session=null;render(`
    <section class="hero">
      <div class="hero-copy">
        <span class="tag"><span>✦</span> SPORT MISSION · UNIT 6</span>
        <h1>${progress.name?`Привет,<br>${esc(progress.name)}!<br>`:'Твоя суперсила —<br>'}<em>английский.</em></h1>
        <p class="hero-description">Бражник похитил английские слова.<br>Пройди миссии с Леди Баг и Супер-Котом,<br>верни суперсилы и спаси Париж!</p>
        <div class="hero-actions"><button class="button" data-action="start">${Object.keys(progress.completed).length?'ПРОДОЛЖИТЬ':'НАЧАТЬ МИССИЮ'} <span class="arrow">↗</span></button><button class="button secondary" data-action="dictionary">Словарь <span>↗</span></button></div>
        <div class="hero-note"><span>✦ 5 миссий + супербосс</span><span>♥ Учимся в своём темпе</span></div>
      </div>
      <div class="hero-art"><div class="hero-halo"></div><span class="speech-sticker">Ready, superhero?</span><img class="hero-character" src="assets/ladybug.png" alt="Леди Баг готова к спортивной миссии"><div class="orbit-label">Твоя новая сила<b>ENGLISH ⚡</b></div><span class="small-star">✧</span><div class="hero-dots"></div></div>
    </section>
    <div class="home-bottom"><article class="briefing"><img class="briefing-image" src="assets/duo.jpg" alt="Леди Баг и Супер-Кот в полёте"><div><span class="eyebrow">СООБЩЕНИЕ ИЗ ШТАБА</span><h3>Paris is in danger!</h3><p class="briefing-english">Hawk Moth has stolen the English words. Complete the missions and defeat him!</p><p>Пять суперсил: слова, спорт, фразы, прошлое время и твоя уверенность.</p></div></article><article class="save-city"><div class="icon">✦</div><div><b>Маленькие шаги. Большая победа.</b><p>Ошибаться можно. Герои тоже учатся!</p></div></article></div>
  `,'home');}
  function showMap(){session=null;const done=D.missions.filter(m=>progress.completed[m.id]).length;const unlocked=done===5;
    render(`<div class="section-heading"><div><span class="eyebrow"><span class="line"></span> ШТАБ ГЕРОЕВ</span><h1>${progress.name?`${esc(progress.name)}, твои миссии`:'Карта миссий'}</h1><p>Выбирай суперсилу. Собери пять значков и брось вызов Бражнику.</p></div><div class="progress-summary"><div class="progress-ring" style="--p:${done*20}"><b>${done}/5</b></div><div><strong>${unlocked?'Босс ждёт тебя!':'Париж верит в тебя'}</strong><small>${unlocked?'Все суперсилы собраны':'60% верных ответов открывают значок'}</small></div></div></div>
      <div class="map-layout"><div class="mission-grid">${D.missions.map(m=>`<button class="mission-card ${m.color} ${progress.completed[m.id]?'complete':''}" data-action="intro" data-id="${m.id}"><span class="mission-num">MISSION 0${m.id} ${progress.completed[m.id]?'✓':''}</span><span class="mission-icon">${m.icon}</span><h2>${m.title}</h2><p>${m.desc}</p><div class="card-bottom">${stars(progress.completed[m.id]?.stars||0)}<span class="round-arrow">↗</span></div></button>`).join('')}
      <button class="mission-card final ${unlocked?'':'locked'}" data-action="boss-intro" aria-disabled="${!unlocked}"><span class="mission-num">FINAL BATTLE ${unlocked?'':'♙'}</span><span class="mission-icon">🦋</span><h2>Hawk Moth</h2><p>${progress.bossDefeated?'Париж спасён! Сыграем ещё раз?':unlocked?'Твои знания сильнее его акумы. Время сражаться!':`Заверши пять миссий.<br>До битвы осталось: ${5-done}`}</p><div class="card-bottom">${stars(progress.bossDefeated?(progress.completed.boss?.stars||3):0)}<span class="round-arrow">${unlocked?'↗':'⌑'}</span></div></button></div>
      <aside class="side-panel"><img class="panel-image" src="assets/ladybug-victory.jpg" alt="Леди Баг на фоне Парижа"><div class="panel-copy"><span class="eyebrow">ТВОЙ ПЛАН НА ПОБЕДУ</span><h3>Каждое слово —<br>суперсила.</h3><p>Забылось слово? Загляни в словарь или потренируй ошибки. Мы рядом!</p><button class="button secondary small" data-action="practice">Повторить ошибки <span>↗</span></button><div class="panel-metrics"><div><b>${Object.values(progress.mastery).filter(n=>n===3).length}</b><small>выучено</small></div><div><b>${progress.bestCombo}</b><small>лучший combo</small></div><div><b>${Object.keys(progress.mistakes).length}</b><small>повторить</small></div></div></div></aside></div>`,'map');
  }
  function showIntro(id){const m=D.missions.find(m=>m.id===id);if(!m)return;
    render(`<div class="back-row"><button class="text-button" data-action="map">← К миссиям</button><span class="count-label">MISSION 0${id} / 05</span></div><section class="mission-intro"><div class="intro-art"><img src="assets/${m.image}" alt="${m.guide}"><div class="intro-art-label"><span>ТВОЙ НАПАРНИК</span><b>${m.guide}</b></div></div><div class="intro-copy"><span class="tag">${m.icon} ${m.tag}</span><h1>${m.ru}</h1><p>${m.intro}</p><ul class="tip-list">${m.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><button class="button ${m.color==='green'?'green':''}" data-action="begin" data-id="${id}">ВПЕРЁД, ГЕРОЙ! <span>→</span></button><p class="result-note">${m.count} заданий · Для значка нужно 60% · Повтор ошибок — бонус</p></div></section>`,'intro');
  }
  function showBossIntro(){if(!bossUnlocked()){toast('Сначала получи значки всех пяти миссий — нужно 60% в каждой.');return;}
    render(`<div class="back-row"><button class="text-button" data-action="map">← К миссиям</button><span class="count-label">ПОСЛЕДНЯЯ МИССИЯ</span></div><section class="mission-intro"><div class="intro-art"><img src="assets/hawk-moth.jpg" alt="Бражник"><div class="intro-art-label"><span>FINAL BATTLE</span><b>DEFEAT HAWK MOTH</b></div></div><div class="intro-copy"><span class="tag purple">🦋 БРАЖНИК ЖДЁТ</span><h1>Париж рассчитывает<br>на тебя.</h1><p>Бражник: «Ваш английский меня не остановит!»<br>Леди Баг: «Ещё как остановит. Покажем ему?»</p><ul class="tip-list"><li>Бражник: 100 HP. Верный ответ: −10 HP.</li><li>У тебя 5 сердец. Ошибка или время: −1 ♥.</li><li>${progress.calm?'20':'10'} секунд на ответ. Десять попаданий — победа!</li><li>Слова, фразы, Past Simple и play / go / do.</li></ul><button class="button dark" data-action="boss-begin">НАЧАТЬ БИТВУ <span>⚡</span></button><p class="result-note">Нужен запас времени? В настройках есть спокойный режим.</p></div></section>`,'intro');
  }
  function bossUnlocked(){return D.missions.every(m=>!!progress.completed[m.id]);}
  function weightedSample(list,n){
    return list.map(item=>({item,key:Math.pow(Math.random(),1/(4-(progress.mastery[item.id]||0)))})).sort((a,b)=>b.key-a.key).slice(0,n).map(v=>v.item);
  }
  function generateVocabularyQuestion(item=null,direction=null,quick=false){
    item ||= weightedSample(D.vocabulary,1)[0];direction ||= Math.random()<.5?'en':'ru';
    const field=direction==='en'?'ru':'en',same=D.vocabulary.filter(v=>v.id!==item.id&&v.group===item.group&&v[field]!==item[field]);
    let candidates=shuffle(same);if(candidates.length<3)candidates.push(...shuffle(D.vocabulary.filter(v=>v.id!==item.id&&!candidates.includes(v)&&v[field]!==item[field])));
    const wrong=[...new Set(candidates.map(v=>v[field]))].slice(0,3);
    return {id:`${item.id}:${direction}`,masteryKey:item.id,word:item.en,category:'vocabulary',topic:`${item.en} — ${item.ru}`,prompt:direction==='en'?`Что значит “${item.en}”?`:`Как по-английски «${item.ru}»?`,answer:item[field],options:[item[field],...wrong],explanation:`${item.en} — ${item.ru}.`,speak:item.en,quick,type:'choice',unit:item.unit};
  }
  function generateExpressionQuestion(buildAllowed=true){return pick(D.expressionQuestions.filter(q=>buildAllowed||q.type!=='build'));}
  function generatePastSimpleQuestion(buildAllowed=true){return pick(D.grammarQuestions.filter(q=>buildAllowed||q.type!=='build'));}
  function balancedMixed(n,boss=false){
    // A 20-question boss deck uses exact 30 / 25 / 20 / 15 / 10 proportions.
    const counts=boss?[6,5,4,3,2]:[Math.round(n*.3),Math.round(n*.25),Math.round(n*.2),Math.round(n*.15)];
    if(!boss)counts.push(n-counts.reduce((a,b)=>a+b,0));
    const vocab=weightedSample(D.vocabulary,counts[0]).map((v,i)=>generateVocabularyQuestion(v,i%2?'ru':'en'));
    return shuffle([...vocab,...shuffle(D.grammarQuestions.filter(q=>q.type!=='build')).slice(0,counts[1]),...shuffle(D.expressionQuestions.filter(q=>q.type!=='build')).slice(0,counts[2]),...shuffle(D.sportQuestions.filter(q=>q.options.length>=3)).slice(0,counts[3]),...shuffle(D.contextQuestions).slice(0,counts[4])]);
  }
  function generateMixedQuestion(){return balancedMixed(12)[0];}
  function buildMissionQueue(id){
    if(id===1){
      // Start with core sport vocabulary, then cover every textbook section.
      const core=weightedSample(D.vocabulary.filter(v=>v.unit==='6.1'),10);
      const rest=Object.keys(D.sections).filter(s=>s!=='6.1').flatMap(unit=>weightedSample(D.vocabulary.filter(v=>v.unit===unit),unit==='6.3'||unit==='6.4'?2:1));
      const selected=[...core,...rest];
      const fill=weightedSample(D.vocabulary.filter(v=>!selected.includes(v)),20-selected.length);
      return shuffle([...selected,...fill]).map((v,i)=>generateVocabularyQuestion(v,i%2?'ru':'en',i%5===3));
    }
    if(id===2)return shuffle([...shuffle(D.sportQuestions.filter(q=>q.options.length===3)).slice(0,9),...shuffle(D.sportQuestions.filter(q=>q.options.length===2)).slice(0,5)]);
    if(id===3){
      const required=['e:stand','e:not-care','e:pe','e:science','e:need','e:grades','e:school','e:kungfu','e:prefer','e:enjoy','e:interested','e:interest-ing','e:build-love','e:build-prefer','e:build-enjoy'];
      return shuffle([...required.map(id=>bank.find(q=>q.id===id)),pick(D.expressionQuestions.filter(q=>!required.includes(q.id)))]);
    }
    if(id===4){
      const required=['g:go','g:do','g:have','g:win','g:run','g:get','g:take','g:make','g:come','g:see','g:didnt-go','g:negative','g:was','g:were','g:wasnt','g:werent','g:was-question','g:were-question','g:build-question'];
      return shuffle([...required.map(id=>bank.find(q=>q.id===id)),...shuffle(D.grammarQuestions.filter(q=>!required.includes(q.id))).slice(0,3)]);
    }
    return balancedMixed(12);
  }
  function startMission(id){
    const m=D.missions.find(m=>m.id===id);if(!m)return;newSession('mission',buildMissionQueue(id),m);
  }
  function startBossBattle(){if(!bossUnlocked())return;newSession('boss',balancedMixed(20,true),{id:'boss',title:'Final Battle',image:'duo.jpg',guide:'Команда героев'});}
  function newSession(mode,queue,mission){
    stopTimer();session={mode,mission,queue:queue.map(q=>({...q})),index:0,baseCount:queue.length,correct:0,mistakes:0,combo:0,bestCombo:0,score:0,hp:100,hearts:5,records:[],reviewed:new Set(),selected:[],answered:false,finished:false,uniqueCorrect:new Set(),firstCorrect:0,firstAnswers:0,previousId:null};
    screen=mode==='boss'?'boss':'game';advancing=false;renderQuestion();
  }
  function currentQuestion(){return session?.queue[session.index];}
  function questionMarkup(q,boss=false){
    const index=session.index,baseDone=session.records.filter(r=>!r.review).length;
    const meta=session.mode==='practice'?'ПОВТОРЕНИЕ ОШИБОК':q.review?'ВТОРОЙ ШАНС':q.quick?'QUICK CARD':q.type==='build'?'СОБЕРИ ПРЕДЛОЖЕНИЕ':categoryNames[q.category].toUpperCase();
    const speakButton=q.speak?`<button class="speak-button" data-action="speak" data-text="${esc(q.speak)}" aria-label="Произнести ${esc(q.speak)}">🔊</button>`:'';
    return `<section class="quiz-card" id="question" data-qid="${esc(q.id)}"><div class="question-meta"><span class="tag ${q.review?'gold':q.category==='grammar'?'purple':''}">${q.quick?'⚡ ':''}${meta}</span><small>${boss?`Удар ${11-session.hp/10} из 10`:q.review?'Бонус: закрепляем ошибку':`${Math.min(baseDone+1,session.baseCount)} / ${session.baseCount}`}</small></div>
      <div class="word-display"><h2 class="question-heading" id="question-title">${esc(q.prompt)}</h2>${speakButton}</div>
      <p class="question-hint">${q.type==='build'?'Нажимай слова по порядку. Слово в ответе можно убрать нажатием.':q.category==='sport'?'Нажми на подходящую категорию.':q.quick?'Успей выбрать перевод. Можно включить спокойный режим.':'Выбери один правильный ответ.'}</p>
      ${boss||q.quick?'<div class="timer-row" id="timer-row"><div class="timer-track" role="progressbar" aria-label="Время на ответ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span id="timer-fill"></span></div><b class="time-number" id="timer-number">'+(boss?(progress.calm?20:10):(progress.calm?'∞':12))+'</b></div>':''}
      ${q.type==='build'?`<div class="builder-zone" id="builder-answer" aria-label="Собранное предложение"><span class="placeholder">Здесь появится твоё предложение…</span></div><div class="token-bank" id="token-bank">${session.tokens.map((token,i)=>`<button class="word-token" data-action="token" data-index="${i}">${esc(token)}</button>`).join('')}</div><div class="builder-controls"><button class="text-button" data-action="builder-clear">↺ Очистить</button><button class="button" data-action="builder-check" id="builder-check" disabled>Проверить <span>→</span></button></div>`:
      `<div class="answer-grid">${session.options.map((option,i)=>`<button class="answer" data-action="answer" data-index="${i}" aria-label="${esc(option)}"><span class="answer-key">${String.fromCharCode(65+i)}</span><span>${esc(option)}</span></button>`).join('')}</div>`}
      <div id="feedback-slot" aria-live="polite"></div><div class="quiz-bottom"><small>${boss?'Верно: −10 HP · Ошибка: −1 ♥':q.review?'Повтор помогает запомнить. Бонус не влияет на значок.':'Ошибаться можно — мы всё объясним.'}</small><button class="text-button" data-action="hint">✧ Подсказка</button></div></section>`;
  }
  function renderQuestion(){
    const s=session,q=currentQuestion();if(!q){finishMission();return;}
    s.answered=false;s.selected=[];s.options=shuffle(q.options);s.tokens=q.type==='build'?shuffle(q.tokens):[];
    const m=s.mission;
    if(s.mode==='boss'){
      render(`<div class="boss-page" id="boss-page"><div class="boss-header"><div><span class="eyebrow">FINAL BATTLE · SPORT MISSION</span><h1>DEFEAT HAWK MOTH</h1></div><span class="score-pill" id="battle-combo">COMBO ×${s.combo}</span><button class="text-button" data-action="map">← Выход</button></div><div class="arena"><div class="arena-side"><div class="arena-team" id="heroes"><img id="heroes-image" src="assets/duo.jpg" alt="Леди Баг и Супер-Кот"><span class="team-label">ТВОЯ КОМАНДА</span></div><div class="hearts" id="hearts" role="img" aria-label="${s.hearts} из 5 жизней">${Array.from({length:5},(_,i)=>`<span class="heart ${i>=s.hearts?'lost':''}" aria-hidden="true">♥</span>`).join('')}</div></div><span class="versus">VS</span><div class="arena-side"><div class="arena-boss" id="boss"><img src="assets/hawk-moth.jpg" alt="Бражник"><span class="team-label">HAWK MOTH</span></div><div class="hp-label"><span>ЭНЕРГИЯ БРАЖНИКА</span><b id="boss-hp">${s.hp} / 100 HP</b></div><div class="hp-track" role="progressbar" aria-label="Здоровье Бражника" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.hp}"><span id="hp-fill" style="width:${s.hp}%"></span></div></div></div>${questionMarkup(q,true)}<p class="battle-caption">Твои знания — <b>твоя суперсила.</b> Десять точных попаданий спасут Париж.</p></div>`,'boss');
    }else{
      const done=s.records.filter(r=>!r.review).length;
      render(`<div class="game-shell"><div class="back-row"><button class="text-button" data-action="map">← К миссиям</button><span class="count-label">${s.mode==='practice'?'ТРЕНИРОВКА БЕЗ СПЕШКИ':`MISSION 0${m.id}`}</span></div><div class="game-top"><img class="avatar" src="assets/${m.image}" alt="${esc(m.guide)}"><div class="game-title"><h1>${esc(m.title)}</h1><small>${s.mode==='practice'?'Ошибки превращаются в суперсилы.':m.ru}</small></div><div class="game-status"><span class="combo-badge" id="game-combo">⚡ ×${s.combo}</span><div class="mini-stat"><b id="game-score">${s.score}</b>очков</div></div></div><div class="progress-track" role="progressbar" aria-label="Прогресс миссии" aria-valuemin="0" aria-valuemax="${s.baseCount}" aria-valuenow="${done}"><span style="width:${done/s.baseCount*100}%"></span></div>${questionMarkup(q)}<div class="coach-tip"><img src="assets/${q.category==='grammar'||q.category==='expressions'?'marinette.jpg':m.image}" alt=""><span><strong>${q.review?'Супергеройская память!':m.guide+' на связи.'}</strong> ${q.review?'Попробуй ещё раз. Теперь это слово станет знакомым.':q.type==='build'?'Предложение собирается нажатием — перетаскивать ничего не нужно.':'Не торопись. После ответа появится короткое объяснение.'}</span></div></div>`, 'game');
    }
    if(s.mode==='boss')startTimer(progress.calm?20:10);
    else if(q.quick&&s.mode!=='practice'&&!progress.calm)startTimer(12);
    announce(q.prompt);
  }
  function stopTimer(){if(timerHandle!==null)clearInterval(timerHandle);timerHandle=null;}
  function startTimer(seconds){stopTimer();remaining=seconds*1000;session.timerTotal=remaining;resumeTimer();}
  function pauseTimer(){if(timerHandle!==null){remaining=Math.max(0,deadline-performance.now());stopTimer();}}
  function resumeTimer(){
    if(!session||session.answered||session.finished||remaining<=0||document.hidden||modal.open||!$('#timer-fill'))return;
    deadline=performance.now()+remaining;stopTimer();timerHandle=setInterval(()=>{
      const left=Math.max(0,deadline-performance.now()),seconds=Math.ceil(left/1000);remaining=left;
      const fill=$('#timer-fill'),number=$('#timer-number'),row=$('#timer-row');if(!fill){stopTimer();return;}
      fill.style.width=`${left/session.timerTotal*100}%`;number.textContent=seconds;fill.parentElement.setAttribute('aria-valuenow',String(Math.round(left/session.timerTotal*100)));
      row.classList.toggle('urgent',seconds<=3);
      if(left<=0){stopTimer();answerQuestion(null,true);}
    },80);
  }
  function chooseToken(index){
    if(!session||session.answered||session.selected.includes(index))return;
    session.selected.push(index);updateBuilder();
  }
  function updateBuilder(){
    const s=session;$('#builder-answer').innerHTML=s.selected.length?s.selected.map(i=>`<button class="word-token selected" data-action="remove-token" data-index="${i}" aria-label="Убрать ${esc(s.tokens[i])}">${esc(s.tokens[i])}</button>`).join(''):'<span class="placeholder">Здесь появится твоё предложение…</span>';
    document.querySelectorAll('#token-bank button').forEach((b,i)=>b.disabled=s.answered||s.selected.includes(i));
    $('#builder-check').disabled=s.answered||s.selected.length!==s.tokens.length;
  }
  const normalize=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?]/g,'').replace(/\s+/g,' ').trim();
  function answerQuestion(selected,timeout=false){
    if(!session||session.answered||session.finished)return;stopTimer();remaining=0;
    const s=session,q=currentQuestion();s.answered=true;
    const correct=!timeout&&normalize(selected||'')===normalize(q.answer);
    if(correct){s.correct++;s.combo++;s.bestCombo=Math.max(s.combo,s.bestCombo);s.score+=100+Math.min(s.combo-1,5)*10;s.uniqueCorrect.add(q.masteryKey||q.id);if(!q.review)s.firstCorrect++;sound(s.mode==='boss'?'hit':'correct');}
    else{s.mistakes++;s.combo=0;sound('wrong');}
    if(!q.review)s.firstAnswers++;
    const record={category:q.category,question:q.prompt,correctAnswer:q.answer,selectedAnswer:timeout?'Время вышло':selected,whetherCorrect:correct,qid:q.id,topic:q.topic,review:!!q.review,timeout,time:new Date().toISOString()};
    s.records.push(record);progress.history.push(record);progress.history=progress.history.slice(-600);
    const masteryKey=q.masteryKey||q.id;progress.mastery[masteryKey]=Math.max(0,Math.min(3,(progress.mastery[masteryKey]||0)+(correct?1:-1)));
    if(correct)delete progress.mistakes[masteryKey];
    else progress.mistakes[masteryKey]={...record,questionData:{...q,review:false,quick:false},attempts:(progress.mistakes[masteryKey]?.attempts||0)+1};
    progress.bestCombo=Math.max(progress.bestCombo,s.bestCombo);
    if(!correct&&s.mode==='mission'&&q.category==='vocabulary'&&!s.reviewed.has(masteryKey)){
      // Leave at least three other questions before a retry, including near the end.
      s.reviewed.add(masteryKey);
      while(s.queue.length<s.index+4){const other=weightedSample(D.vocabulary.filter(v=>v.id!==masteryKey),1)[0];s.queue.push({...generateVocabularyQuestion(other),review:true});}
      s.queue.splice(Math.min(s.index+4,s.queue.length),0,{...q,quick:false,review:true});
    }
    saveProgress();
    document.querySelectorAll('.answer').forEach((b,i)=>{b.disabled=true;if(s.options[i]===q.answer)b.classList.add('correct');else if(s.options[i]===selected&&!correct)b.classList.add('wrong');});
    if(q.type==='build'){document.querySelectorAll('.word-token').forEach(b=>b.disabled=true);$('#builder-check').disabled=true;}
    if(s.mode==='boss'){if(correct)damageBoss();else damagePlayer();$('#battle-combo').textContent=`COMBO ×${s.combo}`;}
    else{$('#game-score').textContent=s.score;$('#game-combo').textContent=`⚡ ×${s.combo}`;}
    const label=timeout?'Время вышло — попробуем дальше!':correct?pick(['Great! Отлично!','Amazing! Так держать!','Cat-tastic!','Miraculous!']):'Почти! Давай разберёмся.';
    const ending=s.mode==='boss'?(s.hp<=0?'СПАСТИ ПАРИЖ ✦':s.hearts<=0?'К ГЕРОЯМ →':'Следующий удар →'):(s.index>=s.queue.length-1?'Завершить миссию ✦':'Дальше →');
    $('#feedback-slot').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><img src="assets/${correct?'ladybug-victory.jpg':'reaction.jpg'}" alt="${correct?'Леди Баг радуется':'Герои поддерживают тебя'}"><div class="feedback-text"><b>${esc(label)}</b>${!correct?`<div class="feedback-correct">✓ ${esc(q.answer)}</div>`:''}<p>${esc(q.explanation)}</p></div><button class="button ${correct?'green':'secondary'} small" data-action="next" id="next-question">${ending}</button></div>`;
    if(correct&&s.combo%3===0){sound('combo');comic(`COMBO ×${s.combo}!`,true);}
    announce(`${correct?'Правильно!':timeout?'Время вышло.':'Попробуем ещё.'} ${q.explanation}`);
    // Move keyboard focus without scrolling away from the question or arena.
    $('#next-question').focus({preventScroll:true});
  }
  function damageBoss(){
    const s=session;s.hp=Math.max(0,s.hp-10);$('#boss-hp').textContent=`${s.hp} / 100 HP`;$('#hp-fill').style.width=`${s.hp}%`;$('#hp-fill').parentElement.setAttribute('aria-valuenow',String(s.hp));
    $('#boss').classList.add('attack-effect');$('#heroes').classList.add('hero-attack');
    $('#heroes-image').src=s.correct%2?'assets/cat-attack.jpg':'assets/duo.jpg';
    const hit=document.createElement('span');hit.className='floating-hit';hit.textContent='−10 HP';$('#boss').append(hit);setTimeout(()=>hit.remove(),950);
    if(s.hp===0){flash();sound('victory');}
  }
  function damagePlayer(){
    const s=session;s.hearts=Math.max(0,s.hearts-1);$('#hearts').setAttribute('aria-label',`${s.hearts} из 5 жизней`);$('#hearts').innerHTML=Array.from({length:5},(_,i)=>`<span class="heart ${i>=s.hearts?'lost':''}" aria-hidden="true">♥</span>`).join('');
    $('#heroes-image').src='assets/reaction.jpg';$('#boss-page').classList.add('attacked');
    const hit=document.createElement('span');hit.className='floating-hit';hit.textContent='Watch out!';$('#heroes').append(hit);setTimeout(()=>hit.remove(),950);
  }
  function nextQuestion(){
    if(!session||!session.answered||advancing)return;advancing=true;
    const s=session;if(s.mode==='boss'&&(s.hp<=0||s.hearts<=0)){finishMission();advancing=false;return;}
    s.previousId=currentQuestion().id;s.index++;
    if(s.mode==='boss'&&s.index>=s.queue.length){let extra=balancedMixed(20,true);if(extra[0].id===s.previousId)[extra[0],extra[1]]=[extra[1],extra[0]];s.queue.push(...extra);}
    if(s.index>=s.queue.length)finishMission();else renderQuestion();advancing=false;
  }
  function finishMission(){
    if(!session||session.finished)return;stopTimer();const s=session;s.finished=true;
    const boss=s.mode==='boss',accuracy=Math.round(s.correct/Math.max(1,s.records.length)*100),baseAccuracy=Math.round(s.firstCorrect/Math.max(1,s.firstAnswers)*100),win=boss?s.hp===0:s.mode==='practice'||baseAccuracy>=60;
    const starCount=win?(accuracy>=90?3:accuracy>=75?2:1):0;
    if(win&&s.mode==='mission'){const old=progress.completed[s.mission.id];progress.completed[s.mission.id]={stars:Math.max(old?.stars||0,starCount),accuracy:Math.max(old?.accuracy||0,baseAccuracy)};}
    if(win&&boss){progress.bossDefeated=true;progress.completed.boss={stars:Math.max(progress.completed.boss?.stars||0,starCount),accuracy};}
    progress.highScore=Math.max(progress.highScore,s.score);progress.bestCombo=Math.max(progress.bestCombo,s.bestCombo);
    const categories={};s.records.forEach(r=>{categories[r.category]||={correct:0,total:0};categories[r.category].total++;if(r.whetherCorrect)categories[r.category].correct++;});
    const topics=[...new Set(s.records.filter(r=>!r.whetherCorrect).map(r=>r.topic))];
    const result={mode:s.mode,mission:s.mission.id,correct:s.correct,mistakes:s.mistakes,accuracy,baseAccuracy,bestCombo:s.bestCombo,score:s.score,stars:starCount,win,categories,topics,date:new Date().toISOString()};
    progress.lastResult=result;saveProgress();
    const title=boss?(win?'MIRACULOUS!':'Мы ещё вернёмся!'):s.mode==='practice'?'Суперсила крепнет!':win?'Миссия выполнена!':'Ещё немного практики!';
    const description=boss?(win?'You saved Paris and completed the Sport Unit!':"Бражник: «Not this time…» Леди Баг: «Don’t give up! Let’s try again.»"):s.mode==='practice'?'Ошибки помогают учиться. Сегодня ты знаешь больше, чем вчера.':win?'Ещё один значок в твоей коллекции. Париж стал ближе к спасению.':'Для значка нужно 60% первых ответов. Потренируем сложные места вместе?';
    render(`<section class="result-card"><div class="result-banner ${win?'':'defeat'}"><img src="assets/${win?'ladybug-victory.jpg':'reaction.jpg'}" alt="${win?'Леди Баг празднует победу':'Леди Баг и Супер-Кот готовы помочь'}"><div><span class="eyebrow">${boss&&win?'MISSION COMPLETE · PARIS IS SAFE':s.mode==='practice'?'PRACTICE COMPLETE':win?'ТЫ НАСТОЯЩИЙ СУПЕРГЕРОЙ':'ГЕРОИ НИКОГДА НЕ СДАЮТСЯ'}</span><h1>${title}</h1><p>${description}</p>${stars(starCount)}</div></div><div class="result-content"><div class="result-stats"><div class="result-stat"><b>${s.correct}</b><span>верных ответов</span></div><div class="result-stat"><b>${s.mistakes}</b><span>ошибок</span></div><div class="result-stat"><b>${accuracy}%</b><span>точность</span></div><div class="result-stat"><b>×${s.bestCombo}</b><span>лучший combo</span></div></div><div class="result-breakdown">${Object.entries(categories).map(([name,c])=>`<span>${categoryNames[name]}: ${c.correct} / ${c.total}</span>`).join('')}<span>✦ ${s.score} очков</span></div>${s.mode==='mission'&&s.mission.id===1?`<p class="result-note">Vocabulary rescued: ${s.firstCorrect} / ${s.firstAnswers} · Повторено дополнительно: ${s.records.filter(r=>r.review).length}</p>`:''}${topics.length?`<div class="needs-practice"><h3>✧ Need more practice — что повторим</h3><p>${topics.slice(0,7).map(esc).join(' · ')}${topics.length>7?' и ещё…':''}</p></div>`:'<div class="needs-practice"><h3>✦ Чистая победа!</h3><p>Все ответы верные. Попробуй новую миссию или проверь себя ещё раз.</p></div>'}<div class="result-buttons"><button class="button" data-action="${boss?'boss-begin':s.mode==='practice'?'practice':'begin'}" ${s.mode==='mission'?`data-id="${s.mission.id}"`:''}>${boss?(win?'PLAY AGAIN':'TRY AGAIN'):'СЫГРАТЬ ЕЩЁ'} <span>↻</span></button><button class="button secondary" data-action="practice">PRACTISE ${boss&&!win?'MY ':''}MISTAKES</button><button class="button secondary" data-action="map">К миссиям <span>→</span></button></div><p class="result-note">${!storageOK?'Сохранение недоступно.':win?'Прогресс сохранён. Можно закрыть игру и вернуться позже.':'Знания и ошибки сохранены. Попробуй снова, когда будешь готов.'}</p></div></section>`,'result');
    if(win){sound('victory');confetti();if(boss)flash();}
  }
  function startMistakePractice(){
    const errors=Object.values(progress.mistakes).sort((a,b)=>b.attempts-a.attempts);let queue=[];
    for(const e of errors.slice(0,8)){
      const old=e.questionData;if(!old)continue;
      if(old.category==='vocabulary'){const v=D.vocabulary.find(v=>v.id===old.masteryKey);if(v)queue.push(generateVocabularyQuestion(v,old.id.endsWith(':en')?'ru':'en'));}
      else{const relatives=bank.filter(q=>q.topic===old.topic&&q.id!==old.id);queue.push({...old,review:false,quick:false});if(relatives.length&&queue.length<10)queue.push(pick(relatives));}
    }
    if(!queue.length){queue=weightedSample(D.vocabulary.filter(v=>(progress.mastery[v.id]||0)<3),8).map((v,i)=>generateVocabularyQuestion(v,i%2?'ru':'en'));if(queue.length<4)queue=balancedMixed(8);toast('Нет нерешённых ошибок! Повторим слова, которые ещё учим.');}
    // In practice, separate related questions instead of showing the same one twice.
    queue=shuffle(queue).filter((q,i,a)=>a.findIndex(v=>v.id===q.id)===i).map(q=>({...q,quick:false,review:false}));
    newSession('practice',queue,{id:'practice',title:'Суперсила: повторение',ru:'Твои сложные слова и темы',image:'marinette.jpg',guide:'Маринетт'});
  }
  function showDictionary(){
    render(`<div class="section-heading"><div><span class="eyebrow"><span class="line"></span> СЕКРЕТНЫЙ СЛОВАРЬ</span><h1>Слова — твоя сила.</h1><p>Весь Sport Unit с фотографий учебника. Слушай, запоминай и возвращайся к сложному.</p></div><button class="button secondary small" data-action="practice">✧ Повторить ошибки</button></div><div class="dictionary-tools"><input class="search-input" type="search" id="word-search" placeholder="Найти слово: swimming или плавание…" aria-label="Поиск по английским и русским словам" value="${esc(dictionaryFilter.search)}"><select class="filter-select" id="unit-filter" aria-label="Раздел учебника"><option value="all">Все разделы</option>${Object.entries(D.sections).map(([id,[name]])=>`<option value="${id}" ${dictionaryFilter.unit===id?'selected':''}>${id} · ${name}</option>`).join('')}</select><select class="filter-select" id="mastery-filter" aria-label="Уровень запоминания"><option value="all">Все слова</option>${masteryLabels.map((s,i)=>`<option value="${i}" ${dictionaryFilter.mastery===String(i)?'selected':''}>${s}</option>`).join('')}</select></div><p class="dictionary-count" id="dictionary-count"></p><div class="word-grid" id="word-grid"></div>`,'dictionary');renderWords();
  }
  function renderWords(){
    const query=dictionaryFilter.search.toLowerCase().trim().replace(/[’‘]/g,"'");
    const words=D.vocabulary.filter(v=>(dictionaryFilter.unit==='all'||v.unit===dictionaryFilter.unit)&&(dictionaryFilter.mastery==='all'||(progress.mastery[v.id]||0)===+dictionaryFilter.mastery)&&(!query||`${v.en} ${v.ru}`.toLowerCase().includes(query)));
    $('#dictionary-count').textContent=`${words.length} / ${D.vocabulary.length} слов и выражений · Уровень растёт после верных ответов в миссиях`;
    $('#word-grid').innerHTML=words.length?words.map(v=>{const level=progress.mastery[v.id]||0;return `<article class="vocab-card"><h2>${esc(v.en)}</h2><button class="speak-button" data-action="speak" data-text="${esc(v.en)}" aria-label="Произнести ${esc(v.en)}">🔊</button><p>${esc(v.ru)}</p><div class="vocab-card-bottom"><span>UNIT ${v.unit}</span><div class="mastery" aria-label="${masteryLabels[level]}"><span>${masteryLabels[level]}</span>${[1,2,3].map(i=>`<i class="${i<=level?'filled':''}"></i>`).join('')}</div></div></article>`;}).join(''):'<p class="empty-state">Таких слов пока нет. Попробуй другой запрос или раздел.</p>';
  }
  function showRules(tab=ruleTab){ruleTab=tab;
    const content=tab==='past'?`<article class="rule-card"><h2>+ Расскажи о прошлом</h2><span class="rule">Глагол + -ed / особая форма</span><span class="example">I played football yesterday.</span><span class="example">Ladybug won the competition.</span><p>Yesterday — вчера. Last week — на прошлой неделе.</p></article><article class="rule-card"><h2>− Скажи «не»</h2><span class="rule">didn't + исходная форма</span><span class="example">I didn't play football.</span><span class="example">She didn't go swimming.</span><p>Не didn't went! Время уже спрятано в did.</p></article><article class="rule-card"><h2>? Задай вопрос</h2><span class="rule">Did + кто + исходная форма?</span><span class="example">Did you play tennis?</span><span class="example">Did he win the competition?</span><p>После Did: play, win, go — без изменений.</p></article><article class="rule-card"><h2>Was / were — был, были</h2><span class="rule">I / he / she / it → was<br>you / we / they → were</span><span class="example">She was tired. They were at the gym.</span><span class="example">She wasn't tired. They weren't tired.</span><span class="example">Was she at the gym? Were they tired?</span><p>С was / were не используем did.</p></article><article class="rule-card rule-wide"><h2>Глаголы, которые помогают героям</h2><table class="verb-table"><caption class="sr-only">Исходная форма, форма Past Simple и перевод</caption><tbody>${D.verbs.map(v=>`<tr><td><button class="text-button" data-action="speak" data-text="${v.base}, ${v.past}">${v.base} ♫</button></td><td>${v.past}</td><td>${v.ru}</td></tr>`).join('')}</tbody></table></article>`:tab==='expressions'?D.expressions.map(e=>`<article class="rule-card"><h2>${esc(e.en)} <button class="speak-button" data-action="speak" data-text="${esc(e.example)}" aria-label="Произнести пример">🔊</button></h2><span class="rule">${esc(e.model)}</span><span class="example">${esc(e.example)}</span><p>${esc(e.translation)}</p></article>`).join(''):`<article class="rule-card"><h2>PLAY 🏀</h2><span class="rule">Игры с мячом и ракеткой</span><span class="example">play football / tennis / badminton</span><p>Ещё: basketball, volleyball, hockey, table tennis.</p></article><article class="rule-card"><h2>GO 🏊</h2><span class="rule">Спортивные действия на -ing</span><span class="example">go swimming / cycling / skiing</span><p>Ещё: running, sailing, kayaking, ice skating.</p></article><article class="rule-card"><h2>DO 🥋</h2><span class="rule">Упражнения и боевые искусства</span><span class="example">do karate / yoga / kung fu</span><p>Ещё: do Zumba, do stretching exercises.</p></article><article class="rule-card"><h2>Смотри на контекст</h2><span class="example">Football — team sport.</span><span class="example">Sailing — water sport.</span><p>Теннис бывает одиночным и парным. Такие спорные категории в заданиях не используем.</p></article>`;
    render(`<div class="section-heading"><div><span class="eyebrow"><span class="line"></span> МАРИНЕТТ ОБЪЯСНЯЕТ</span><h1>Шпаргалка супергероя</h1><p>Короткие правила, чтобы чувствовать себя увереннее.</p></div></div><div class="rules-tabs" role="tablist" aria-label="Тема шпаргалки">${[['past','Past Simple'],['expressions','Выражения'],['sport','Play / go / do']].map(([id,name])=>`<button role="tab" aria-selected="${tab===id}" class="${tab===id?'active':''}" data-action="rule-tab" data-tab="${id}">${name}</button>`).join('')}</div><div class="rules-layout"><div class="rules-content" role="tabpanel">${content}</div><aside class="side-panel"><img class="panel-image" src="assets/marinette.jpg" alt="Маринетт"><div class="panel-copy"><span class="eyebrow">ЗАПОМНИ ОДНО</span><h3>You can do it!</h3><p>Не нужно учить всё сразу. Прочитай пример и попробуй применить его в миссии.</p><button class="button small" data-action="map">К миссиям →</button></div></aside></div>`,'rules');
  }
  function openModal(content){pauseTimer();modal.innerHTML=`<button class="modal-close" data-action="modal-close" aria-label="Закрыть">×</button>${content}`;if(!modal.open)modal.showModal();}
  function closeModal(){modal.close();}
  modal.addEventListener('close',()=>resumeTimer());
  function askName(after='map'){
    openModal(`<h2 id="modal-title">Как тебя зовут, герой?</h2><p>Леди Баг ждёт нового напарника. Имя и прогресс останутся в этом браузере.</p><form id="name-form" data-after="${after}"><label class="input-label" for="hero-name">Твоё имя или псевдоним</label><input id="hero-name" name="name" maxlength="24" value="${esc(progress.name)}" placeholder="Например, Аня" autocomplete="given-name" required><div class="modal-actions"><button class="button" type="submit">Я ГОТОВ! <span>→</span></button></div></form>`);setTimeout(()=>$('#hero-name')?.focus(),50);
  }
  function showSettings(){
    openModal(`<h2 id="modal-title">Настройки штаба</h2><p>Герой: <span class="settings-name">${esc(progress.name||'Новый напарник')}</span> <button class="text-button" data-action="rename">Изменить</button></p><div class="setting-row"><div>Звуки игры<small>Сигналы ответов и победы</small></div><button class="toggle ${progress.sound?'on':''}" data-action="sound" role="switch" aria-checked="${progress.sound}" aria-label="Звуки игры"></button></div><div class="setting-row"><div>Спокойный режим<small>Без таймера в словаре · 20 секунд у босса</small></div><button class="toggle ${progress.calm?'on':''}" data-action="calm" role="switch" aria-checked="${progress.calm}" aria-label="Спокойный режим"></button></div><p class="modal-footnote">Настройка времени применяется со следующего вопроса. Пока открыто это окно, таймер на паузе.</p><div class="modal-actions"><button class="danger-button" data-action="reset-confirm">Сбросить прогресс</button><button class="button" data-action="modal-close">Готово</button></div>`);
  }
  function showHint(){
    const q=currentQuestion();if(!q)return;
    if(session.answered){openModal(`<h2 id="modal-title">✧ Разбор ответа</h2><p>${esc(q.explanation)}</p><div class="modal-actions"><button class="button" data-action="modal-close">Понятно →</button></div>`);return;}
    let hint=q.category==='grammar'?"После didn't и Did используй исходную форму. He/she/it → was, you/we/they → were. В утверждении нужен глагол прошедшего времени.":q.category==='sport'?'PLAY — игры с мячом и ракеткой. GO — действия на -ing. DO — упражнения и боевые искусства. В классификации смотри на весь контекст.':q.category==='expressions'?'Enjoy + -ing. Prefer A to B. Would love to + глагол. Be into и be interested in — увлекаться и интересоваться.':q.category==='vocabulary'?`Раздел ${q.unit}: ${D.sections[q.unit]?.[0]||'Sport'}. Прочитай все варианты и исключи незнакомые виды спорта. Можно прослушать английское слово.`:'Прочитай предложение целиком. Какое место, действие или человек подходит по смыслу?';
    openModal(`<h2 id="modal-title">✧ Маринетт подсказывает</h2><p>${esc(hint)}</p><div class="modal-actions"><button class="button" data-action="modal-close">Продолжить →</button></div>`);
  }
  function navigate(action,param){
    const go=()=>{session=null;remaining=0;stopTimer();try{speechSynthesis.cancel();}catch{}if(action==='home')showHome();if(action==='map')showMap();if(action==='dictionary')showDictionary();if(action==='rules')showRules();if(action==='intro')showIntro(+param);if(action==='practice')startMistakePractice();};
    if(session&&!session.finished){
      openModal(`<h2 id="modal-title">Вернуться в штаб?</h2><p>Ответы и сложные слова уже сохранены. Текущую миссию нужно будет начать заново.</p><div class="modal-actions"><button class="button secondary" data-action="modal-close">Остаться</button><button class="button" id="leave-mission">Выйти</button></div>`);
      $('#leave-mission').addEventListener('click',()=>{session=null;remaining=0;closeModal();go();},{once:true});
    }else go();
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const action=b.dataset.action;sound();
    if(['home','map','dictionary','rules','intro','practice'].includes(action)){navigate(action,b.dataset.id);return;}
    if(action==='start'){if(!progress.name)askName();else showMap();}
    if(action==='begin')startMission(+b.dataset.id);
    if(action==='boss-intro')showBossIntro();
    if(action==='boss-begin')startBossBattle();
    if(action==='answer')answerQuestion(session.options[+b.dataset.index]);
    if(action==='next')nextQuestion();
    if(action==='token')chooseToken(+b.dataset.index);
    if(action==='remove-token'&&!session.answered){session.selected=session.selected.filter(i=>i!==+b.dataset.index);updateBuilder();}
    if(action==='builder-clear'&&!session.answered){session.selected=[];updateBuilder();}
    if(action==='builder-check'&&!session.answered)answerQuestion(session.selected.map(i=>session.tokens[i]).join(' '));
    if(action==='speak')speak(b.dataset.text);
    if(action==='hint')showHint();
    if(action==='rule-tab')showRules(b.dataset.tab);
    if(action==='sound'){
      progress.sound=!progress.sound;if(!progress.sound){try{speechSynthesis.cancel();audioContext?.suspend();}catch{}}else sound('correct');saveProgress();
      const toggle=$('[data-action="sound"][role="switch"]',modal);if(toggle){toggle.classList.toggle('on',progress.sound);toggle.setAttribute('aria-checked',String(progress.sound));}
    }
    if(action==='settings')showSettings();
    if(action==='modal-close')closeModal();
    if(action==='rename')askName('settings');
    if(action==='calm'){progress.calm=!progress.calm;saveProgress();b.classList.toggle('on',progress.calm);b.setAttribute('aria-checked',String(progress.calm));}
    if(action==='reset-confirm')openModal('<h2 id="modal-title">Сбросить весь прогресс?</h2><p>Имя, значки, звёзды, рекорды и история ошибок будут удалены. Это действие нельзя отменить.</p><div class="modal-actions"><button class="button secondary" data-action="settings">Сохранить прогресс</button><button class="danger-button" data-action="reset">Да, начать заново</button></div>');
    if(action==='reset'){session=null;remaining=0;progress=defaults();saveProgress();closeModal();showHome();toast('Новая история героя начинается!');}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='name-form')return;event.preventDefault();const name=$('#hero-name').value.trim();if(!name){$('#hero-name').setCustomValidity('Впиши имя или псевдоним.');$('#hero-name').reportValidity();return;}
    progress.name=name.slice(0,24);saveProgress();const after=event.target.dataset.after;
    if(after==='settings'){showSettings();}else{closeModal();showMap();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='hero-name')event.target.setCustomValidity('');if(event.target.id==='word-search'){dictionaryFilter.search=event.target.value;renderWords();}});
  document.addEventListener('change',event=>{if(event.target.id==='unit-filter'){dictionaryFilter.unit=event.target.value;renderWords();}if(event.target.id==='mastery-filter'){dictionaryFilter.mastery=event.target.value;renderWords();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseTimer();else resumeTimer();});
  window.addEventListener('pagehide',()=>{stopTimer();try{speechSynthesis.cancel();}catch{}});
  document.addEventListener('keydown',event=>{
    if(modal.open||!session||session.finished||['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;
    if(!session.answered&&/^[1-4]$/.test(event.key)&&currentQuestion().type!=='build'){const index=+event.key-1;if(session.options[index]){event.preventDefault();answerQuestion(session.options[index]);}}
  });
  function flash(){const el=document.createElement('div');el.className='flash-screen';$('#effects').append(el);setTimeout(()=>el.remove(),850);}
  function confetti(){
    const effects=$('#effects');for(let i=0;i<65;i++){const bit=document.createElement('i');bit.className='confetti';bit.style.cssText=`--left:${Math.random()*100}%;--delay:${Math.random()*.7}s;--duration:${2+Math.random()*1.5}s;--color:${pick(['#ef3855','#f5c855','#87c97a','#9d74df','#74aedf'])};--rotate:${Math.random()*360}deg`;effects.append(bit);setTimeout(()=>bit.remove(),4700);}
  }
  function comic(text,yoyo=false){
    const el=document.createElement('div');el.className='comic-pop';el.textContent=text;$('#effects').append(el);setTimeout(()=>el.remove(),1100);
    if(yoyo){const yo=document.createElement('i');yo.className='yoyo';$('#effects').append(yo);setTimeout(()=>yo.remove(),1000);}
  }
  showHome();
})();
