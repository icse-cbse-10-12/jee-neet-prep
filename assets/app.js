const SUBJECTS={
  "biology":{title:"Biology",tag:"NEET · CLASS 11–12",desc:"Chapter-by-chapter revision quests and practice sets. Work through the learning plan, then test your recall.",file:"data/biology.json",kind:"campaign"},
  "chemistry-campaign":{title:"Chemistry Campaign",tag:"JEE + NEET · CLASS 11",desc:"A structured Class 11 Chemistry pathway with topic blocks, checkpoints and practice sets.",file:"data/chemistry-campaign.json",kind:"campaign"},
  "chemistry-mcqs":{title:"Chemistry MCQ Practice",tag:"QUESTION BANK · CHEMISTRY",desc:"Choose a module, attempt questions and use the explanations to review your reasoning.",file:"data/chemistry-mcqs.json",kind:"modules"},
  "maths":{title:"Maths Revision Vault",tag:"JEE · MATHEMATICS",desc:"Use the concept map, revision notes, formula reminders and question practice for each module.",file:"data/maths.json",kind:"modules"},
  "physics":{title:"Physics",tag:"JEE + NEET · CLASS 11–12",desc:"Chapter-wise Physics study blocks, checkpoint tasks and practice sets in one accessible workspace.",file:"data/physics.json",kind:"campaign"}
};
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
const key=params.get("subject")||"physics";
const subject=SUBJECTS[key]||SUBJECTS.physics;
const state={data:null,view:"browse",query:"",quiz:null,quizIndex:0,selected:null,answered:false,score:0,attempted:0,questionPool:[],sourceTitle:"Practice",done:new Set()};
const doneKey="icse_masterclass_done_v2_"+key;
try{state.done=new Set(JSON.parse(localStorage.getItem(doneKey)||"[]"))}catch{}
$("#subjectTag").textContent=subject.tag;
$("#subjectTitle").textContent=subject.title;
$("#subjectDesc").textContent=subject.desc;
document.title=subject.title+" | ICSE MasterClass";
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function allQuestions(data){
 const rows=[];
 if(data.type==="campaign"){
  data.chapters.forEach(ch=>ch.practiceSets.forEach(set=>set.questions.forEach((q,i)=>rows.push({...q,chapterTitle:ch.title,setTitle:set.name,sourceId:ch.id+"-"+set.id+"-"+i}))));
 }else{
  data.modules.forEach(m=>m.questions.forEach((q,i)=>rows.push({...q,chapterTitle:m.title,setTitle:m.title,sourceId:m.id+"-"+i})));
 }
 return rows.filter(q=>q.question&&Array.isArray(q.options)&&q.options.length>=2);
}
function countQs(item){return item.questions?.length||item.practiceSets?.reduce((n,s)=>n+s.questions.length,0)||0}
function saveDone(){try{localStorage.setItem(doneKey,JSON.stringify([...state.done]))}catch{}}
function setStatus(msg){$("#statusLine").textContent=msg}
async function init(){
 try{
  const res=await fetch(subject.file);
  if(!res.ok)throw new Error("Could not load subject data");
  state.data=await res.json();
  $("#topicSearch").addEventListener("input",e=>{state.query=e.target.value.toLowerCase().trim();renderBrowse()});
  document.querySelectorAll(".view-btn").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;document.querySelectorAll(".view-btn").forEach(x=>x.classList.toggle("active",x===b));state.quiz=null;if(state.view==="practice")startQuickPractice();else renderBrowse()}));
  renderBrowse();
 }catch(err){$("#contentArea").innerHTML='<div class="empty-panel">The study data could not load. Please open this site through GitHub Pages or a local web server, rather than opening study.html directly as a file.</div>';setStatus("Loading error");}
}
function renderBrowse(){
 if(!state.data)return;
 const d=state.data;
 const area=$("#contentArea");
 if(state.view==="practice"&&state.quiz){renderQuiz();return}
 if(d.type==="campaign"){
  const items=d.chapters.filter(ch=>!state.query||[ch.title,ch.tag,ch.group,ch.summary,...ch.quests.map(q=>q.title+" "+q.description)].join(" ").toLowerCase().includes(state.query));
  setStatus(`${items.length} of ${d.chapters.length} chapters · ${d.chapters.reduce((n,c)=>n+countQs(c),0).toLocaleString()} questions across chapter sets`);
  if(!items.length){area.innerHTML='<div class="empty-panel">No chapters match your search. Try a shorter keyword.</div>';return}
  area.innerHTML='<div class="content-grid">'+items.map(ch=>{
   const checked=ch.quests.filter(q=>state.done.has(q.id)).length;
   const sets=ch.practiceSets;
   return `<article class="resource-card"><div class="resource-top"><span class="small-tag">${escapeHtml(ch.group||ch.tag||"CHAPTER "+ch.number)}</span><span class="small-tag">${checked}/${ch.quests.length} tasks</span></div><h3>${escapeHtml(ch.icon)} ${escapeHtml(ch.number+". "+ch.title)}</h3><p>${escapeHtml(ch.summary||ch.tag||"Chapter revision and practice")}</p>
   <div class="quest-list">${ch.quests.map(q=>`<label class="quest ${state.done.has(q.id)?"done":""}"><input type="checkbox" data-quest="${escapeHtml(q.id)}" ${state.done.has(q.id)?"checked":""}><span><b>${escapeHtml(q.title)}</b><small>${escapeHtml(q.duration)}${q.description?" · "+escapeHtml(q.description):""}</small></span></label>`).join("")}</div>
   <div class="resource-actions">${sets.map((s,i)=>`<button class="small-btn primary" data-quiz-chapter="${escapeHtml(ch.id)}" data-quiz-set="${i}">${escapeHtml(s.name)} · ${s.questions.length} Q</button>`).join("")||'<span class="muted">No embedded practice set for this chapter.</span>'}</div></article>`;
  }).join("")+'</div>';
  area.querySelectorAll("[data-quest]").forEach(el=>el.addEventListener("change",()=>{const id=el.dataset.quest;el.checked?state.done.add(id):state.done.delete(id);saveDone();renderBrowse()}));
  area.querySelectorAll("[data-quiz-chapter]").forEach(btn=>btn.addEventListener("click",()=>{const ch=d.chapters.find(c=>String(c.id)===btn.dataset.quizChapter);const set=ch?.practiceSets[Number(btn.dataset.quizSet)];if(set)beginQuiz(set.questions,`${ch.title} — ${set.name}`)}));
 }else{
  const items=d.modules.filter(m=>!state.query||[m.title,m.tag,m.group,m.priority,...(m.mindmap.branches||[]).flatMap(b=>[b.title,...b.items]),...m.notes.flatMap(n=>[n.heading,...n.points])].join(" ").toLowerCase().includes(state.query));
  setStatus(`${items.length} of ${d.modules.length} modules · ${d.modules.reduce((n,m)=>n+m.questions.length,0).toLocaleString()} questions`);
  if(!items.length){area.innerHTML='<div class="empty-panel">No modules match your search. Try another keyword.</div>';return}
  area.innerHTML='<div class="content-grid">'+items.map(m=>`<article class="resource-card"><div class="resource-top"><span class="small-tag">${escapeHtml(m.group||m.tag||"MODULE")}</span><span class="small-tag">${m.questions.length.toLocaleString()} Q</span></div><h3>${escapeHtml(m.icon)} ${escapeHtml(m.title)}</h3><p>${escapeHtml(m.tag)} ${m.priority?"· "+escapeHtml(m.priority):""} ${m.weight?"· "+escapeHtml(m.weight):""}</p>
  <div class="resource-actions"><button class="small-btn" data-learn="${escapeHtml(m.id)}">Open revision notes</button><button class="small-btn primary" data-module-quiz="${escapeHtml(m.id)}">Practise module ↗</button></div><div id="learn-${escapeHtml(m.id)}"></div></article>`).join("")+'</div>';
  area.querySelectorAll("[data-learn]").forEach(btn=>btn.addEventListener("click",()=>{const m=d.modules.find(x=>x.id===btn.dataset.learn);const el=area.querySelector("#learn-"+CSS.escape(m.id));if(el.dataset.open==="yes"){el.innerHTML="";el.dataset.open="no";btn.textContent="Open revision notes";return}el.dataset.open="yes";btn.textContent="Hide revision notes";el.innerHTML=renderModuleNotes(m)}));
  area.querySelectorAll("[data-module-quiz]").forEach(btn=>btn.addEventListener("click",()=>{const m=d.modules.find(x=>x.id===btn.dataset.moduleQuiz);beginQuiz(m.questions,m.title)}));
 }
}
function renderModuleNotes(m){
 const branches=m.mindmap?.branches||[];
 const branchHtml=branches.length?`<div class="content-section"><h2>Concept map</h2><div class="branch-grid">${branches.map(b=>`<div class="branch"><h4>${escapeHtml(b.title)}</h4><ul>${b.items.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul></div>`).join("")}</div></div>`:"";
 const notes=(m.notes||[]).map(n=>`<div class="note-block"><h4>${escapeHtml(n.heading)}</h4><ul>${n.points.map(p=>`<li>${escapeHtml(p)}</li>`).join("")}</ul></div>`).join("");
 const formulas=(m.formulas||[]).length?`<div class="content-section"><h2>Formula reminders</h2>${m.formulas.map(f=>`<div class="note-block"><p>${escapeHtml(typeof f==="string"?f:JSON.stringify(f))}</p></div>`).join("")}</div>`:"";
 const traps=(m.traps||[]).length?`<div class="note-block"><h4>Common traps</h4><ul>${m.traps.map(t=>`<li>${escapeHtml(typeof t==="string"?t:JSON.stringify(t))}</li>`).join("")}</ul></div>`:"";
 return branchHtml+`<div class="content-section"><h2>Revision notes</h2>${notes||'<p class="muted">No separate note cards are available for this module.</p>'}</div>`+formulas+traps;
}
function beginQuiz(questions,title){
 const pool=questions.filter(q=>q.question&&q.options?.length>=2);
 if(!pool.length){setStatus("No questions available in this selection.");return}
 state.quiz=pool.slice().sort(()=>Math.random()-.5).slice(0,Math.min(10,pool.length));
 state.quizIndex=0;state.selected=null;state.answered=false;state.score=0;state.attempted=0;state.sourceTitle=title;state.view="practice";
 document.querySelectorAll(".view-btn").forEach(x=>x.classList.toggle("active",x.dataset.view==="practice"));
 $("#topicSearch").value="";
 renderQuiz();
}
function startQuickPractice(){
 const pool=allQuestions(state.data);
 if(!pool.length){$("#contentArea").innerHTML='<div class="empty-panel">No practice questions are available for this tool.</div>';return}
 beginQuiz(pool,"Quick mixed practice");
}
function renderQuiz(){
 const area=$("#contentArea");
 if(!state.quiz){area.innerHTML='<div class="empty-panel">Choose a module or chapter set to begin.</div>';return}
 const q=state.quiz[state.quizIndex];
 if(!q){
  const total=state.quiz.length;
  area.innerHTML=`<section class="quiz-panel"><div class="quiz-result"><div class="eyebrow">SESSION COMPLETE</div><div class="score">${state.score}/${total}</div><h2>${state.sourceTitle}</h2><p>You answered ${state.attempted} question${state.attempted===1?"":"s"}. Review explanations from the question flow, then try another set.</p><button class="small-btn primary" id="retryQuiz">Try another set</button> <button class="small-btn" id="backBrowse">Back to browse</button></div></section>`;
  $("#retryQuiz").addEventListener("click",startQuickPractice);$("#backBrowse").addEventListener("click",()=>{state.view="browse";document.querySelectorAll(".view-btn").forEach(x=>x.classList.toggle("active",x.dataset.view==="browse"));renderBrowse()});
  setStatus("Practice session complete");return;
 }
 setStatus(`${state.sourceTitle} · Answer carefully, then read the explanation.`);
 area.innerHTML=`<section class="quiz-panel"><div class="quiz-meta"><span>${escapeHtml(state.sourceTitle)}</span><span>Question ${state.quizIndex+1} of ${state.quiz.length}</span></div><div class="quiz-progress"><span style="width:${((state.quizIndex+(state.answered?1:0))/state.quiz.length)*100}%"></span></div><h2 class="quiz-question">${escapeHtml(q.question)}</h2><div class="option-list">${q.options.map((o,i)=>{let cls="option";if(state.answered&&i===q.answerIndex)cls+=" correct";else if(state.answered&&i===state.selected&&i!==q.answerIndex)cls+=" wrong";return `<button class="${cls}" data-option="${i}" ${state.answered?"disabled":""}><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(o)}</span></button>`}).join("")}</div>${state.answered?`<div class="explanation"><strong>${state.selected===q.answerIndex?"Correct! ✓":"Review this one"}</strong>${escapeHtml(q.explanation||"No explanation is provided for this question.")}</div>`:""}<div class="quiz-bottom"><span class="muted">${state.answered?`Score so far: ${state.score}/${state.attempted}`:"Select the best answer."}</span>${state.answered?'<button class="small-btn primary" id="nextQuestion">Next question →</button>':'<button class="small-btn" id="exitQuiz">Exit practice</button>'}</div></section>`;
 area.querySelectorAll("[data-option]").forEach(btn=>btn.addEventListener("click",()=>{if(state.answered)return;state.selected=Number(btn.dataset.option);state.answered=true;state.attempted++;if(state.selected===q.answerIndex)state.score++;renderQuiz()}));
 const next=$("#nextQuestion");if(next)next.addEventListener("click",()=>{state.quizIndex++;state.selected=null;state.answered=false;renderQuiz()});
 const exit=$("#exitQuiz");if(exit)exit.addEventListener("click",()=>{state.quiz=null;state.view="browse";document.querySelectorAll(".view-btn").forEach(x=>x.classList.toggle("active",x.dataset.view==="browse"));renderBrowse()});
}
init();
