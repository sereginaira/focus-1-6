/* Material transcribed from the two supplied textbook photographs, Unit 6.
   Translations describe the meaning used in this sport unit. */
(() => {
  'use strict';
  const sections = {
    '6.1': ['Спорт и спортсмены', `badminton|бадминтон|sport
basketball|баскетбол|sport
basketball player|баскетболист|person
champion|чемпион|person
climbing|скалолазание|sport
cycling|езда на велосипеде|sport
cyclist|велосипедист|person
do stretching exercises|делать упражнения на растяжку|action
do yoga|заниматься йогой|action
do karate|заниматься карате|action
do kung fu|заниматься кунг-фу|action
do Zumba|заниматься зумбой|action
football|футбол|sport
footballer|футболист|person
go cycling|кататься на велосипеде|action
go skiing|кататься на лыжах|action
go ice skating|кататься на коньках|action
go swimming|ходить плавать|action
go running|ходить на пробежку|action
go kayaking|кататься на каяке|action
go sailing|ходить под парусом|action
ice skating|катание на коньках|sport
karate|карате|sport
kayaking|каякинг|sport
kite surfing|кайтсёрфинг|sport
kung fu|кунг-фу|sport
long-distance runner|бегун на длинные дистанции|person
play for a team|играть за команду|action
play for your school|играть за свою школу|action
play table tennis|играть в настольный теннис|action
play tennis|играть в теннис|action
play badminton|играть в бадминтон|action
play basketball|играть в баскетбол|action
play hockey|играть в хоккей|action
play football|играть в футбол|action
play volleyball|играть в волейбол|action
runner|бегун|person
running|бег|sport
sailing|парусный спорт|sport
sailor|яхтсмен; моряк|person
skateboarding|катание на скейтборде|sport
skier|лыжник|person
skiing|катание на лыжах|sport
sportsperson|спортсмен|person
summer sports|летние виды спорта|group
swimmer|пловец|person
swimming|плавание|sport
swimming pool|плавательный бассейн|place
table tennis|настольный теннис|sport
tennis|теннис|sport
volleyball|волейбол|sport
winter sports|зимние виды спорта|group
yoga|йога|sport
Zumba|зумба|sport`],
    '6.2': ['Истории успеха', `at the same time|в то же время|phrase
believe|верить|verb
climb|взбираться|verb
climber|скалолаз|person
climbing partner|напарник по скалолазанию|person
competition|соревнование|event
die|умирать|verb
half way up|на полпути к вершине|phrase
make a way|прокладывать путь|phrase
reach the peak|достичь вершины|action
get to the top|добраться до вершины|action
succeed|добиться успеха|verb
success story|история успеха|phrase
support|поддерживать|verb
tennis match|теннисный матч|event`],
    '6.3': ['Интересы и предпочтения', `be into|увлекаться|verb
can't stand|не выносить|verb
enjoy|получать удовольствие от|verb
have fun|веселиться|action
hate|ненавидеть|verb
individual sports|индивидуальные виды спорта|group
martial arts|боевые искусства|group
not care about|не придавать значения|verb
care about|придавать значение|verb
prefer|предпочитать|verb
rugby|регби|sport
squash|сквош|sport
team sports|командные виды спорта|group
team games|командные игры|group
water sports|водные виды спорта|group
would love|очень хотелось бы|phrase
yell|кричать|verb`],
    '6.4': ['Движение и фитнес', `aerobics instructor|инструктор по аэробике|person
fitness instructor|инструктор по фитнесу|person
dance instructor|инструктор по танцам|person
at the age of ten|в возрасте десяти лет|phrase
be interested in|интересоваться|verb
boxing|бокс|sport
by accident|случайно|phrase
dance lessons|уроки танцев|event
dance steps|танцевальные движения|phrase
fitness centre|фитнес-центр|place
imitate|подражать|verb
instructor|инструктор|person
join a class|записаться на занятия|action
join a gym|записаться в спортзал|action
keep fit|поддерживать хорошую физическую форму|action
Latin dance|латиноамериканский танец|sport
run classes|проводить занятия|action
run classes for adults|проводить занятия для взрослых|action
run classes for children|проводить занятия для детей|action
run classes for all age groups|проводить занятия для всех возрастов|action
support your family|поддерживать свою семью|action
train|тренироваться|verb
training video|обучающее видео|thing
win a competition|выиграть соревнование|action
workout|тренировка|event`],
    '6.5': ['Олимпийские игры', `ancient|древний|adjective
athlete|атлет|person
bungee jumping|прыжки с эластичным канатом|sport
chariot race|гонки на колесницах|event
competitor|участник соревнования|person
disabled|имеющий инвалидность|adjective
golf|гольф|sport
gymnast|гимнаст|person
honour|честь|thing
Olympic sport|олимпийский вид спорта|group
Olympics|Олимпиада|event
Olympic Games|Олимпийские игры|event
Paralympics|Паралимпийские игры|event
prize|приз|thing
silver cup|серебряный кубок|thing
sports event|спортивное мероприятие|event
take place|проходить; состояться|verb
triathlon|триатлон|sport
win a gold medal|выиграть золотую медаль|action
win an Olympic medal|выиграть олимпийскую медаль|action`],
    '6.6': ['Забота о себе', `get enough sleep|высыпаться|action
health problem|проблема со здоровьем|phrase
rest|отдыхать|verb
stretchy top|эластичный топ|thing
towel|полотенце|thing`],
    '6.7': ['Забег добрых дел', `charity|благотворительность|thing
complete|завершать|verb
finishing line|финишная черта|place
first half|первая половина|phrase
second half|вторая половина|phrase
get a medal|получить медаль|action
goal line|линия ворот|place
marathon|марафон|event
raise money|собирать деньги|action
run fast|быстро бегать|action
score ten points|набрать десять очков|action
speed|скорость|thing`]
  };
  const vocabulary = Object.entries(sections).flatMap(([unit,[title,rows]]) => rows.split('\n').map(row => {
    const [en,ru,group]=row.split('|'); return {en,ru,group,unit,title,id:`v:${en}`};
  }));
  const expressions = [
    {en:"can't stand", ru:'не выносить', model:"can't stand + существительное / -ing", example:"She can't stand team sports.", translation:'Она не выносит командные виды спорта.'},
    {en:'care about',ru:'придавать значение',model:'care about + существительное / -ing',example:"He doesn't care about winning.",translation:'Он не придаёт значения победе.'},
    {en:'enjoy',ru:'получать удовольствие от',model:'enjoy + существительное / -ing',example:'She enjoys PE lessons.',translation:'Ей нравятся уроки физкультуры.'},
    {en:'prefer',ru:'предпочитать',model:'prefer A to B',example:'She prefers Science to PE.',translation:'Она предпочитает естествознание физкультуре.'},
    {en:'think',ru:'считать',model:'think + предложение',example:'She thinks all students need PE.',translation:'Она считает, что всем ученикам нужна физкультура.'},
    {en:"shouldn't",ru:'не следует',model:"shouldn't + исходная форма",example:"He thinks they shouldn't get grades for PE.",translation:'Он считает, что им не следует получать оценки по физкультуре.'},
    {en:'be into',ru:'увлекаться',model:'am / is / are into + существительное / -ing',example:'She is into individual sports at school.',translation:'Она увлекается индивидуальными видами спорта в школе.'},
    {en:'would love',ru:'очень хотелось бы',model:'would love to + глагол',example:'He would love to do kung fu at school.',translation:'Ему очень хотелось бы заниматься кунг-фу в школе.'},
    {en:'be interested in',ru:'интересоваться',model:'am / is / are interested in + существительное / -ing',example:'Marinette is interested in swimming.',translation:'Маринетт интересуется плаванием.'},
    {en:'hate',ru:'ненавидеть',model:'hate + существительное / -ing',example:'I hate losing my towel.',translation:'Ненавижу терять своё полотенце.'},
    {en:'have fun',ru:'веселиться',model:'have fun + -ing',example:'We have fun playing tennis.',translation:'Мы весело проводим время, играя в теннис.'},
    {en:'keep fit',ru:'поддерживать форму',model:'keep fit',example:'I do yoga to keep fit.',translation:'Я занимаюсь йогой, чтобы поддерживать форму.'},
    {en:'join a gym',ru:'записаться в спортзал',model:'join + место / группу',example:'I would love to join a gym.',translation:'Мне очень хотелось бы записаться в спортзал.'},
    {en:'join a class',ru:'записаться на занятия',model:'join a class',example:'I would love to join a dance class.',translation:'Мне очень хотелось бы записаться на танцы.'},
    {en:'support',ru:'поддерживать',model:'support + кого / что',example:'We support our team.',translation:'Мы поддерживаем свою команду.'}
  ];
  const verbs = [
    ['go','went','ходить, идти'],['do','did','делать'],['have','had','иметь'],['win','won','выигрывать'],['run','ran','бегать'],['get','got','получать'],['take','took','брать'],['make','made','делать, создавать'],['come','came','приходить'],['see','saw','видеть'],['be','was / were','быть'],['play','played','играть'],['climb','climbed','взбираться'],['support','supported','поддерживать'],['train','trained','тренироваться'],['finish','finished','заканчивать']
  ].map(([base,past,ru])=>({base,past,ru}));
  const q = (id,category,topic,prompt,answer,wrong,explanation,extra={})=>({id,category,topic,prompt,answer,options:[answer,...wrong],explanation,...extra});
  const eq=(id,topic,prompt,answer,wrong,explanation,extra)=>q(`e:${id}`,'expressions',topic,prompt,answer,wrong,explanation,extra);
  const expressionQuestions = [
    eq('into','be into','Marinette ___ individual sports.','is into',['does into','is on','plays into'],'Be into = увлекаться. С she: is into.'),
    eq('prefer','prefer A to B','Tom prefers football ___ basketball.','to',['than','from','at'],'Prefer A to B = предпочитать A, а не B.'),
    eq('love','would love to','I would love ___ kung fu at school.','to do',['doing','do','did'],'Would love to + исходная форма: to do.'),
    eq('enjoy','enjoy + -ing','She enjoys ___ in the pool.','swimming',['swim','to swim','swam'],'После enjoy: существительное или -ing.'),
    eq('care','care about + -ing',"He doesn't care ___ winning.",'about',['to','for','in'],'Care about winning = придавать значение победе.'),
    eq('stand',"can't stand",'Что значит “can’t stand team sports”?','не выносить командные виды спорта',['обожать командные виды спорта','побеждать в командных видах спорта','играть за команду'],'Can’t stand = не выносить.'),
    eq('pe','enjoy + noun','She ___ PE lessons. Ей нравится физкультура.','enjoys',['wins','joins','trains'],'Enjoy PE lessons = получать удовольствие от уроков физкультуры.'),
    eq('science','prefer A to B','She prefers Science to PE. Что ей нравится больше?','естествознание',['физкультура','оба предмета одинаково','ни один предмет'],'Science — естествознание, PE — физкультура. A в prefer A to B нравится больше.'),
    eq('need','think + sentence','She thinks all students need PE.','Она считает, что всем ученикам нужна физкультура.',['Она считает, что физкультура никому не нужна.','Она предпочитает физкультуре естествознание.','Она не выносит физкультуру.'],'All students = все ученики; need = нуждаются.'),
    eq('grades','grades for PE',"He thinks they shouldn't get grades for PE.",'Он считает, что им не следует получать оценки по физкультуре.',['Он считает, что им нужно больше уроков физкультуры.','Он считает, что все ученики любят физкультуру.','Он хочет заниматься кунг-фу в школе.'],'Shouldn’t = не следует; grades = оценки.'),
    eq('interested','be interested in','Ladybug is interested ___ climbing.','in',['on','at','to'],'Be interested in = интересоваться.'),
    eq('interest-ing','be interested in + -ing','I am interested in ___ a gym.','joining',['join','to join','joined'],'После предлога in: joining, форма -ing.'),
    eq('hate','hate','Не люблю проигрывать! I ___ losing.','hate',['prefer','support','join'],'Hate = ненавидеть.'),
    eq('fun','have fun','Мы весело проводим время. We ___.','have fun',['make fun','do fun','go fun'],'Have fun = веселиться, хорошо проводить время.'),
    eq('fit','keep fit','I do yoga to ___. Я хочу быть в форме.','keep fit',['win a cup','raise money','get a towel'],'Keep fit = поддерживать форму.'),
    eq('gym','join a gym','Хочу заниматься на тренажёрах. I would love to ___.','join a gym',['reach the peak','score ten points','play for my school'],'Join a gym = записаться в спортзал.'),
    eq('class','join a class','Хочу учиться танцевать вместе с группой. I want to ___.','join a dance class',['win a gold medal','get enough sleep','go sailing'],'Join a class = записаться на занятия.'),
    eq('support','support','Друзья верят в нашу команду. They ___ our team.','support',['climb','imitate','complete'],'Support = поддерживать.'),
    eq('not-care','not care about',"He doesn't care about winning. Для него победа…",'не так важна',['важнее всего','уже состоялась','невозможна'],'Doesn’t care about = не придаёт значения.'),
    eq('school','be into','She is into individual sports at school.','Она увлекается индивидуальными видами спорта в школе.',['Она не выносит индивидуальные виды спорта.','Она предпочитает командные виды спорта.','Она хочет стать учителем.'],'Is into = увлекается; individual = индивидуальные.'),
    eq('kungfu','would love to','He would love to do kung fu at school.','Ему очень хотелось бы заниматься кунг-фу в школе.',['Он уже занимался кунг-фу вчера.','Он не выносит кунг-фу.','Он предпочитает кунг-фу физкультуре.'],'Would love to говорит о желании.'),
    eq('care-noun','care about + noun','I care ___ my team.','about',['in','to','at'],'Care about + существительное: my team.'),
    eq('build-love','would love to','Собери фразу: Леди Баг очень хотелось бы попробовать карате.','Ladybug would love to try karate.',[],'Would love to + try.',{type:'build',tokens:['Ladybug','would','love','to','try','karate.']}),
    eq('build-prefer','prefer A to B','Собери: Я предпочитаю плавание боксу.','I prefer swimming to boxing.',[],'Prefer A to B.',{type:'build',tokens:['I','prefer','swimming','to','boxing.']}),
    eq('build-enjoy','enjoy + -ing','Собери: Маринетт любит играть в теннис.','Marinette enjoys playing tennis.',[],'Enjoy + playing.',{type:'build',tokens:['Marinette','enjoys','playing','tennis.']})
  ];
  const gq=(id,topic,prompt,answer,wrong,explanation,extra)=>q(`g:${id}`,'grammar',topic,prompt,answer,wrong,explanation,extra);
  const grammarQuestions = [
    ...[
      ['go','Yesterday Ladybug ___ to the sports centre.','went',['go','goed','goes']],
      ['do','Yesterday I ___ yoga.','did',['do','does','doed']],
      ['have','We ___ a tennis match yesterday.','had',['have','has','haved']],
      ['win','Last week she ___ the competition.','won',['win','winned','wins']],
      ['run','Yesterday Cat Noir ___ very fast.','ran',['run','runned','runs']],
      ['get','Yesterday I ___ a medal.','got',['get','getted','gets']],
      ['take','Yesterday she ___ her towel to the pool.','took',['take','taked','takes']],
      ['make','Yesterday we ___ a training video.','made',['make','maked','makes']],
      ['come','Yesterday he ___ to our school.','came',['come','comed','comes']],
      ['see','Yesterday I ___ a cyclist in the park.','saw',['see','seed','sees']],
      ['play','Yesterday they ___ basketball.','played',['play','plays','playing']],
      ['climb','Last week we ___ a mountain.','climbed',['climb','climbs','climbing']],
      ['support','Yesterday we ___ our team.','supported',['support','supports','supporting']],
      ['train','Yesterday Ladybug ___ at the gym.','trained',['train','trains','training']],
      ['finish','Yesterday he ___ the marathon.','finished',['finish','finishes','finishing']]
    ].map(([id,prompt,answer,wrong])=>gq(id,`${id} → ${answer}`,prompt,answer,wrong,`В прошлом: ${id} → ${answer}. Yesterday = вчера.`)),
    gq('didnt-go',"didn't + go",'Найди исправление: Cat Noir didn’t went swimming.',"Cat Noir didn't go swimming.",["Cat Noir didn't went swimming.","Cat Noir didn't goes swimming.","Cat Noir didn't going swimming."],"После didn't нужна исходная форма: go."),
    gq('negative',"didn't + base",'Сделай отрицание: She played tennis.',"She didn't play tennis.",["She didn't played tennis.","She doesn't played tennis.","She not played tennis."],"Didn't + play. Прошедшее время уже выражено в did."),
    gq('question','Did + base','___ he win the competition yesterday?','Did',['Does','Was','Were'],'Did + подлежащее + исходная форма.'),
    gq('question-go','Did + go','Did she ___ swimming yesterday?','go',['went','goes','going'],'После did: go, без изменения.'),
    gq('was','was / were','She ___ tired yesterday.','was',['were','did','be'],'I / he / she / it → was.'),
    gq('were','was / were','They ___ at the sports centre yesterday.','were',['was','did','be'],'You / we / they → were.'),
    gq('wasnt',"wasn't",'Она не была в спортзале вчера.',"She wasn't at the gym yesterday.",["She weren't at the gym yesterday.","She didn't was at the gym yesterday.","She not was at the gym yesterday."],"Wasn't = was not. С be не нужен didn't."),
    gq('werent',"weren't",'They ___ tired yesterday. Они не были уставшими.',"weren't",["wasn't","didn't were","not were"],"They were → they weren't."),
    gq('was-question','Was + subject','___ she at the gym yesterday?','Was',['Were','Did','Does'],'Вопрос с be: Was she…?'),
    gq('were-question','Were + subject','___ they tired after the match?','Were',['Was','Did','Do'],'Вопрос с be: Were they…?'),
    gq('translate','win → won','Вчера она выиграла соревнование.','She won the competition yesterday.',['She win the competition yesterday.','She winned the competition yesterday.','She did won the competition yesterday.'],'Win → won. Выбирай грамматически правильный перевод.'),
    gq('negative-do',"didn't + do",'Yesterday I ___ karate. Я не занимался карате.',"didn't do",["didn't did","wasn't do","not did"],"После didn't → do."),
    gq('build-question','Did + base','Собери вопрос: Ты бегал вчера?','Did you run yesterday?',[],'Did + you + run + yesterday?',{type:'build',tokens:['Did','you','run','yesterday?']}),
    gq('build-neg',"didn't + base",'Собери: Она не ходила плавать.',"She didn't go swimming.",[],"Didn't + go.",{type:'build',tokens:['She',"didn't",'go','swimming.']}),
    gq('build-were','Were + subject','Собери: Они были уставшими?','Were they tired?',[],'Were ставим перед they.',{type:'build',tokens:['Were','they','tired?']})
  ];
  const sports = [
    ['swimming','go'],['cycling','go'],['skiing','go'],['ice skating','go'],['running','go'],['kayaking','go'],['sailing','go'],
    ['basketball','play'],['football','play'],['tennis','play'],['table tennis','play'],['badminton','play'],['hockey','play'],['volleyball','play'],
    ['karate','do'],['kung fu','do'],['yoga','do'],['Zumba','do'],['stretching exercises','do']
  ];
  const sportQuestions = sports.map(([sport,verb])=>q(`s:${sport}`,'sport','play / go / do',`___ ${sport}`,verb,['play','go','do'].filter(v=>v!==verb),`${verb} ${sport}. ${verb==='play'?'Play — игры с мячом и ракеткой.':verb==='go'?'Go + спортивное действие на -ing.':'Do — упражнения и боевые искусства.'}`,{speak:`${verb} ${sport}`}));
  const classifications=[
    ['football','TEAM SPORT','INDIVIDUAL SPORT','Футбол — игра двух команд.'],
    ['basketball','TEAM SPORT','INDIVIDUAL SPORT','Баскетбол — командный вид спорта.'],
    ['volleyball','TEAM SPORT','INDIVIDUAL SPORT','В волейбол играют командами.'],
    ['одиночный забег на 100 метров','INDIVIDUAL SPORT','TEAM SPORT','В одиночном забеге каждый бежит за себя.'],
    ['skiing • катание на лыжах по снегу','WINTER','SUMMER','На снежных лыжах катаются зимой.'],
    ['плавание на летних Олимпийских играх','SUMMER','WINTER','Плавание входит в программу летних Игр.'],
    ['sailing','WATER SPORT','NOT WATER SPORT','Парусный спорт проходит на воде.'],
    ['kayaking','WATER SPORT','NOT WATER SPORT','Каякинг — передвижение по воде на каяке.'],
    ['basketball на площадке','NOT WATER SPORT','WATER SPORT','В баскетбол играют на площадке.'],
    ['karate в зале','NOT WATER SPORT','WATER SPORT','Карате — боевое искусство, не водный спорт.']
  ];
  sportQuestions.push(...classifications.map(([sport,answer,wrong,explanation],i)=>q(`s:class${i}`,'sport',answer.includes('WATER')?'water sports':answer.includes('SPORT')?'team / individual':'summer / winter',`Определи категорию: ${sport}`,answer,[wrong],explanation)));
  const contextQuestions = [
    q('c:pool','context','по смыслу','I want to swim. Let’s go to the ___.','swimming pool',['finishing line','goal line','mountain'],'Swimming pool = плавательный бассейн.'),
    q('c:charity','context','charity','We run a charity marathon to ___.','raise money',['score ten points','play hockey','do kung fu'],'На благотворительном марафоне собирают деньги: raise money.'),
    q('c:sleep','context','get enough sleep','I am tired. I need to ___.','get enough sleep',['run fast','win a cup','reach the peak'],'Get enough sleep = высыпаться.'),
    q('c:finish','context','finishing line','The runner finished the race. She crossed the ___.','finishing line',['goal line','swimming pool','fitness centre'],'Finishing line = финишная черта.'),
    q('c:instructor','context','instructor','She teaches dance steps. She is a ___.','dance instructor',['cyclist','sailor','long-distance runner'],'Dance instructor = инструктор по танцам.')
  ];
  const missions = [
    {id:1,icon:'🐞',tag:'WORD POWER',title:'Ladybug Vocabulary',ru:'Спаси спортивные слова',desc:'Переводы, быстрые карточки и ловушка для забытых слов.',count:20,color:'red',image:'ladybug-victory.jpg',guide:'Леди Баг',intro:'Бражник спрятал слова на крышах Парижа. Верни им смысл: выбирай перевод, а иногда — английское слово. Ошибки вернутся позже для закрепления.',tips:['English → русский и обратно','На быстрых карточках — 12 секунд','Слова из всех разделов 6.1–6.7']},
    {id:2,icon:'🐈',tag:'CAT-TASTIC',title:'Cat Noir Sport Challenge',ru:'Тренировка с Супер-Котом',desc:'Выбери play, go или do. Собери спортивные команды.',count:14,color:'green',image:'cat-noir.jpg',guide:'Супер-Кот',intro:'Парижу нужна спортивная команда! Сначала выбери правильный глагол, затем распредели виды спорта по категориям.',tips:['PLAY — игры: play football','GO — действия на -ing: go swimming','DO — упражнения: do yoga']},
    {id:3,icon:'💬',tag:'SECRET PHRASES',title:'Marinette’s Expressions',ru:'Расшифруй секретные фразы',desc:'Увлечения, предпочтения и предложения из кусочков.',count:16,color:'blue',image:'marinette.jpg',guide:'Маринетт',intro:'Поможешь восстановить дневник Маринетт? Выбирай выражения по смыслу и нажимай на слова по порядку, чтобы собрать предложение.',tips:['enjoy + -ing: enjoy swimming','prefer A to B: prefer tennis to football','would love to + глагол: would love to try']},
    {id:4,icon:'⏱',tag:'TIME TRAVEL',title:'Past Simple Mission',ru:'Вернись во вчерашний день',desc:'Расскажи о прошлом. Did, was, were и глаголы-герои.',count:22,color:'gold',image:'marinette.jpg',guide:'Маринетт',intro:'Вчера герои тоже тренировались! Научимся рассказывать о прошлом. Подсказка доступна во время каждого задания.',tips:['+ I played. She went. They won.',"− I didn’t play. She didn’t go.",'? Did you play? Was she tired?']},
    {id:5,icon:'⚡',tag:'CATCH THE AKUMA',title:'Akuma Challenge',ru:'Поймай акуму',desc:'Смешай все суперсилы. Три верных ответа — удар йо-йо!',count:12,color:'purple',image:'duo.jpg',guide:'Команда героев',intro:'Акума уже близко! Здесь встретятся слова, фразы, спорт и Past Simple. Каждые три правильных ответа подряд запускают суперудар.',tips:['12 смешанных заданий','Ошибки не отправляют в начало','Набери 60%, чтобы открыть путь к боссу']}
  ];
  window.GameData={sections,vocabulary,expressions,verbs,expressionQuestions,grammarQuestions,sportQuestions,contextQuestions,missions};
})();
