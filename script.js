const FFL_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_PUBLISHABLE_KEY: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};

const $ = id => document.getElementById(id);
const show = el => { if (el) el.hidden = false; };
const hide = el => { if (el) el.hidden = true; };
const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));

const groups = {
  A:["Pays Bas","Italie","Uruguay","Égypte"], B:["Espagne","Argentine","Croatie","Norvège"],
  C:["Algérie","Colombie","Allemagne","Belgique"], D:["Sénégal","Japon","Tunisie","Brésil"],
  E:["Grèce","Angleterre","États Unis","Madagascar"], F:["Comores","Maroc","France","Canada"]
};
const teamLogo = {
  "Pays Bas":"/assets/team-A1.png","Italie":"/assets/team-A2.png","Uruguay":"/assets/team-A3.png","Égypte":"/assets/team-A4.png",
  "Espagne":"/assets/team-B1.png","Argentine":"/assets/team-B2.png","Croatie":"/assets/team-B3.png","Norvège":"/assets/team-B4.png",
  "Algérie":"/assets/team-C1.png","Colombie":"/assets/team-C2.png","Allemagne":"/assets/team-C3.png","Belgique":"/assets/team-C4.png",
  "Sénégal":"/assets/team-D1.png","Japon":"/assets/team-D2.png","Tunisie":"/assets/team-D3.png","Brésil":"/assets/team-D4.png",
  "Grèce":"/assets/team-E1.png","Angleterre":"/assets/team-E2.png","États Unis":"/assets/team-E3.png","Madagascar":"/assets/team-E4.png",
  "Comores":"/assets/team-F1.png","Maroc":"/assets/team-F2.png","France":"/assets/team-F3.png","Canada":"/assets/team-F4.png"
};
const initial = {
  A:[["Pays Bas",3,1,1,0,0,7,0],["Italie",3,1,1,0,0,5,0],["Uruguay",0,1,0,0,1,0,5],["Égypte",0,1,0,0,1,0,7]],
  B:[["Espagne",3,1,1,0,0,7,4],["Argentine",3,1,1,0,0,3,2],["Croatie",0,1,0,0,1,2,3],["Norvège",0,1,0,0,1,4,7]],
  C:[["Algérie",3,1,1,0,0,10,1],["Colombie",0,0,0,0,0,0,0],["Allemagne",0,0,0,0,0,0,0],["Belgique",0,1,0,0,1,1,10]],
  D:[["Sénégal",3,1,1,0,0,4,0],["Japon",0,0,0,0,0,0,0],["Tunisie",0,0,0,0,0,0,0],["Brésil",0,1,0,0,1,0,4]],
  E:[["Grèce",3,1,1,0,0,5,4],["Angleterre",0,0,0,0,0,0,0],["États Unis",0,0,0,0,0,0,0],["Madagascar",0,1,0,0,1,4,5]],
  F:[["Comores",3,1,1,0,0,3,0],["Maroc",0,0,0,0,0,0,0],["France",0,0,0,0,0,0,0],["Canada",0,1,0,0,1,0,3]]
};
function freshStandings(){return Object.fromEntries(Object.entries(initial).map(([g,a])=>[g,a.map(x=>({team_name:x[0],points:x[1],played:x[2],wins:x[3],draws:x[4],losses:x[5],goals_for:x[6],goals_against:x[7]}))]));}
function safeJSON(key,fallback){try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback;}catch(_){return fallback;}}
let standings = safeJSON("ffl_standings",freshStandings());
let matches = [];
let stats = [];
let supabaseClient = null;
let realtimeChannel = null;
let presenceChannel = null;
let adminPassword = "";
let adminUnlocked = false;

function normaliseStandings(data){
  const out={};
  for(const g of Object.keys(groups)){
    const source=Array.isArray(data?.[g])?data[g]:[];
    const byName=Object.fromEntries(source.map(r=>[r.team_name,r]));
    out[g]=groups[g].map(name=>byName[name]||{team_name:name,points:0,played:0,wins:0,draws:0,losses:0,goals_for:0,goals_against:0});
  }
  return out;
}
function renderStandings(data=standings){
  const root=$("standingsGroups"); if(!root)return;
  const safe=normaliseStandings(data); root.innerHTML="";
  for(const g of Object.keys(groups)){
    const rows=[...safe[g]].sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0)||((Number(b.goals_for)||0)-(Number(b.goals_against)||0))-((Number(a.goals_for)||0)-(Number(a.goals_against)||0))||(Number(b.goals_for)||0)-(Number(a.goals_for)||0));
    const card=document.createElement("article"); card.className="group-card";
    card.innerHTML=`<h3>GROUPE ${g}</h3><div class="standings-table"><div class="st-head"><span>Pos</span><span>ÉQUIPES</span><span>PTS</span><span>J</span><span>G</span><span>N</span><span>P</span><span>BP</span><span>BC</span><span>DIF</span><span>%</span></div>${rows.map((r,i)=>{const gf=+r.goals_for||0,ga=+r.goals_against||0,p=+r.played||0,pts=+r.points||0,dif=gf-ga,pct=p?Math.round(pts/(p*3)*100):0;const logo=teamLogo[r.team_name];return `<div class="st-row"><b>${i+1}</b><strong>${logo?`<img class="standing-logo" src="${logo}" alt="">`:""}<span>${esc(r.team_name)}</span></strong><span>${pts}</span><span>${p}</span><span>${+r.wins||0}</span><span>${+r.draws||0}</span><span>${+r.losses||0}</span><span>${gf}</span><span>${ga}</span><span>${dif}</span><span>${pct}</span></div>`;}).join("")}</div>`;
    root.appendChild(card);
  }
}

function renderMatches(){
  const root=$("recentMatches"); if(!root)return;
  const list=[...matches].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,12);
  root.innerHTML=list.length?list.map(m=>`<article class="match-card"><span class="match-group">GROUPE ${esc(m.group_name)}</span><div class="match-team"><img src="${teamLogo[m.home_team]||"/assets/ffl.png"}" alt=""><b>${esc(m.home_team)}</b><strong>${m.home_score} — ${m.away_score}</strong><b>${esc(m.away_team)}</b><img src="${teamLogo[m.away_team]||"/assets/ffl.png"}" alt=""></div><small>${new Date(m.created_at||Date.now()).toLocaleString("fr-FR")}</small></article>`).join(""):"<div class='log-empty'>Aucun résultat enregistré.</div>";
}
function renderStats(){
  const make=(category,id,label)=>{const root=$(id);if(!root)return;const rows=stats.filter(s=>s.category===category).sort((a,b)=>(+b.value||0)-(+a.value||0)).slice(0,15);root.innerHTML=rows.length?rows.map((s,i)=>`<div class="stat-row"><b>${i+1}</b>${s.club_logo_url?`<img src="${esc(s.club_logo_url)}" alt="">`:``}<div><strong>${esc(s.player_name)}</strong><small>${esc(s.club)}</small></div><span>${+s.value||0} ${label}</span></div>`).join(""):"<div class='log-empty'>Aucun joueur enregistré.</div>";};
  make("buteur","topScorers","but"); make("passeur","topAssists","passe");
}
function renderLogs(logs){const box=$("adminLogs");if(!box)return;box.innerHTML=logs?.length?logs.map(l=>`<div class="log-item"><span class="log-dot"></span><div><b>${esc(l.action||"ACTION")}</b><p>${esc(l.message||"")}</p></div><time>${esc(new Date(l.created_at).toLocaleString("fr-FR"))}</time></div>`).join(""):"<div class='log-empty'>Aucun log pour le moment.</div>";}

function applyState(s){
  if(!s)return;
  $("breakingNewsText").textContent=s.breaking_news||"";
  if(s.announcement_message){$("announcementTitle").textContent=s.announcement_title||"Annonce FFL";$("announcementMessage").textContent=s.announcement_message;show($("globalAnnouncement"));}
  else hide($("globalAnnouncement"));
  if(s.maintenance){show($("maintenanceOverlay"));$("siteState").textContent="MAINTENANCE";$("siteStateHint").textContent="Le site est fermé temporairement";}
  else {hide($("maintenanceOverlay"));$("siteState").textContent="EN LIGNE";$("siteStateHint").textContent="Le site fonctionne normalement";}
}
function showToast(message,error=false){const t=$("toast");if(!t)return;t.textContent=message;t.classList.toggle("error",error);show(t);clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>hide(t),3000);}

async function adminRequest(action,payload={}){
  const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json","x-admin-password":adminPassword},body:JSON.stringify({action,...payload})});
  const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||"Erreur serveur"); return d;
}

async function loadStandings(){
  if(!supabaseClient)return;
  const {data,error}=await supabaseClient.from("ffl_standings").select("*");
  if(error||!data)return;
  const grouped={};data.forEach(r=>(grouped[r.group_name]??=[]).push(r));standings=normaliseStandings(grouped);renderStandings(standings);
}
async function loadMatches(){if(!supabaseClient)return;const {data,error}=await supabaseClient.from("ffl_matches").select("*").order("created_at",{ascending:false}).limit(50);if(!error&&data){matches=data;renderMatches();}}
async function loadStats(){if(!supabaseClient)return;const {data,error}=await supabaseClient.from("fyfl_stats").select("*");if(!error&&data){stats=data;renderStats();}}
async function loadState(){if(!supabaseClient)return;const {data,error}=await supabaseClient.from("ffl_admin_state").select("*").eq("id",1).maybeSingle();if(!error&&data){applyState(data);if(adminUnlocked&&$("breakingInput"))$("breakingInput").value=data.breaking_news||"";}}
async function loadLogs(){if(!supabaseClient)return;const {data,error}=await supabaseClient.from("ffl_admin_logs").select("*").order("created_at",{ascending:false}).limit(100);if(!error)renderLogs(data||[]);}

async function startRealtime(){
  if(!supabaseClient)return;
  if(realtimeChannel)await supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel=supabaseClient.channel("ffl-global-live");
  realtimeChannel
    .on("postgres_changes",{event:"*",schema:"public",table:"ffl_admin_state"},p=>applyState(p.new))
    .on("postgres_changes",{event:"*",schema:"public",table:"ffl_standings"},()=>loadStandings())
    .on("postgres_changes",{event:"*",schema:"public",table:"ffl_matches"},()=>loadMatches())
    .on("postgres_changes",{event:"*",schema:"public",table:"fyfl_stats"},()=>loadStats())
    .on("postgres_changes",{event:"*",schema:"public",table:"ffl_admin_logs"},()=>{if(adminUnlocked)loadLogs();})
    .subscribe();

  if(presenceChannel)await supabaseClient.removeChannel(presenceChannel);
  const key=window.crypto?.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
  presenceChannel=supabaseClient.channel("ffl-online",{config:{presence:{key}}});
  presenceChannel.on("presence",{event:"sync"},()=>{$("onlineCount").textContent=String(Object.keys(presenceChannel.presenceState()).length);});
  presenceChannel.subscribe(async status=>{if(status==="SUBSCRIBED")await presenceChannel.track({online_at:new Date().toISOString(),page:location.pathname});});

  await Promise.all([loadState(),loadStandings(),loadMatches(),loadStats()]);
}

function refreshMatchSelectors(){const g=$("matchGroup")?.value;if(!g)return;const a=$("teamA"),b=$("teamB");a.innerHTML=groups[g].map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");b.innerHTML=groups[g].map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");if(b.options.length>1)b.selectedIndex=1;}
function openAdmin(){show($("adminModal"));document.body.classList.add("modal-open");if(adminUnlocked){hide($("adminLoginView"));show($("adminDashboard"));refreshMatchSelectors();loadLogs();}else{show($("adminLoginView"));hide($("adminDashboard"));setTimeout(()=>$("adminPassword")?.focus(),50);}}
function closeAdmin(){hide($("adminModal"));document.body.classList.remove("modal-open");}

bindButton("adminOpenTop",openAdmin);bindButton("adminOpenFooter",openAdmin);bindButton("maintenanceAdmin",openAdmin);
function bindButton(id,fn){const el=$(id);if(!el)return;el.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();fn(e);});}
$("adminClose")?.addEventListener("click",closeAdmin);$("adminBackdrop")?.addEventListener("click",closeAdmin);document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAdmin();});
$("matchGroup")?.addEventListener("change",refreshMatchSelectors);refreshMatchSelectors();

$("adminLoginForm")?.addEventListener("submit",async e=>{e.preventDefault();const p=$("adminPassword").value.trim();hide($("adminLoginError"));try{adminPassword=p;await adminRequest("login");adminUnlocked=true;hide($("adminLoginView"));show($("adminDashboard"));refreshMatchSelectors();await Promise.all([loadState(),loadLogs()]);showToast("Panneau admin ouvert.");}catch(err){adminPassword="";$("adminLoginError").textContent=err.message;show($("adminLoginError"));}});

$("saveMatch")?.addEventListener("click",async()=>{const group=$("matchGroup").value,a=$("teamA").value,b=$("teamB").value,result=$("matchResult").value,sa=Number($("scoreA").value),sb=Number($("scoreB").value);try{if(a===b)throw Error("Choisis deux équipes différentes.");if(!Number.isInteger(sa)||!Number.isInteger(sb)||sa<0||sb<0)throw Error("Entre deux scores valides.");if(result==="A"&&sa<=sb)throw Error("Le score de l'équipe 1 doit être supérieur.");if(result==="B"&&sb<=sa)throw Error("Le score de l'équipe 2 doit être supérieur.");if(result==="DRAW"&&sa!==sb)throw Error("Pour un nul, les scores doivent être identiques.");await adminRequest("record_match",{group,teamA:a,teamB:b,result,scoreA:sa,scoreB:sb});$("scoreA").value="";$("scoreB").value="";showToast("Résultat enregistré en direct pour tout le monde.");}catch(err){showToast(err.message,true);}});

$("saveBreaking")?.addEventListener("click",async()=>{const text=$("breakingInput").value.trim();if(!text)return showToast("Écris une phrase.",true);try{await adminRequest("set_breaking_news",{text});showToast("Breaking news mise à jour en direct.");}catch(e){showToast(e.message,true);}});
$("sendAnnouncement")?.addEventListener("click",async()=>{const title=$("announcementTitleInput").value.trim()||"Annonce FFL",message=$("announcementMessageInput").value.trim();if(!message)return showToast("Écris un message.",true);try{await adminRequest("announce",{title,message});$("announcementMessageInput").value="";showToast("Annonce envoyée à tout le monde.");}catch(e){showToast(e.message,true);}});
$("clearAnnouncement")?.addEventListener("click",async()=>{try{await adminRequest("clear_announcement");showToast("Annonce retirée pour tout le monde.");}catch(e){showToast(e.message,true);}});
$("maintenanceOn")?.addEventListener("click",async()=>{if(!confirm("Mettre le site en maintenance pour tout le monde ?"))return;try{await adminRequest("maintenance",{enabled:true});showToast("Maintenance activée pour tout le monde.");}catch(e){showToast(e.message,true);}});
$("maintenanceOff")?.addEventListener("click",async()=>{try{await adminRequest("maintenance",{enabled:false});showToast("Site rouvert pour tout le monde.");}catch(e){showToast(e.message,true);}});
$("saveStat")?.addEventListener("click",async()=>{const category=$("statCategory").value,player_name=$("statPlayer").value.trim(),value=Number($("statValue").value),club=$("statClub").value.trim(),club_logo_url=$("statClubLogo").value.trim();try{if(!player_name||!club||!Number.isInteger(value)||value<0)throw Error("Remplis joueur, club et nombre correctement.");await adminRequest("add_stat",{category,player_name,value,club,club_logo_url});$("statPlayer").value="";$("statValue").value="";$("statClub").value="";$("statClubLogo").value="";showToast("Joueur ajouté aux STATS en direct.");}catch(e){showToast(e.message,true);}});

$("closeAnnouncement")?.addEventListener("click",()=>hide($("globalAnnouncement")));

const links=[...document.querySelectorAll(".nav-link")],sections=[...document.querySelectorAll("main section[id]")];if("IntersectionObserver"in window){const ob=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(v)links.forEach(l=>l.classList.toggle("active",l.getAttribute("href")==="#"+v.target.id));},{threshold:[.15,.35,.6]});sections.forEach(s=>ob.observe(s));}

const audio=$("bgMusic"),musicBtn=$("musicToggle");let musicOn=localStorage.getItem("ffl_music")!=="off";function updateMusic(){if(musicBtn){musicBtn.classList.toggle("muted",!musicOn);musicBtn.innerHTML=musicOn?'♫ <span>Musique</span>':'🔇 <span>Musique coupée</span>';}}async function playMusic(){if(!audio||!musicOn)return;try{audio.volume=.16;await audio.play();}catch(_){}}musicBtn?.addEventListener("click",async()=>{musicOn=!musicOn;localStorage.setItem("ffl_music",musicOn?"on":"off");if(musicOn)await playMusic();else audio.pause();updateMusic();});["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,()=>playMusic(),{once:true,passive:true}));updateMusic();playMusic();

standings=normaliseStandings(standings);renderStandings();renderMatches();renderStats();

async function initSupabase(){
  if(!window.supabase?.createClient){$("onlineCount").textContent="—";return;}
  try{
    let config=null;
    if(location.protocol!=="file:"){
      const response=await fetch('/api/config?ts='+Date.now(),{cache:'no-store'});
      if(response.ok)config=await response.json();
    }
    const url=config?.url || FFL_CONFIG.SUPABASE_URL;
    const key=config?.key || FFL_CONFIG.SUPABASE_PUBLISHABLE_KEY;
    if(!url?.startsWith("http") || url.includes("YOUR_") || !key || key.includes("YOUR_")){
      $("onlineCount").textContent="—";
      console.warn("Supabase non configuré.");
      return;
    }
    supabaseClient=window.supabase.createClient(url,key);
    await startRealtime();
  }catch(error){
    $("onlineCount").textContent="—";
    console.error("Initialisation Supabase impossible",error);
  }
}
initSupabase();
