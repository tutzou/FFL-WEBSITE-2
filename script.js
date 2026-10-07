const FFL_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_PUBLISHABLE_KEY: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};

const $ = (id) => document.getElementById(id);
const show = (el) => { if (el) el.hidden = false; };
const hide = (el) => { if (el) el.hidden = true; };

const groups = {
  A: ["Pays Bas", "Italie", "Uruguay", "Égypte"],
  B: ["Espagne", "Argentine", "Croatie", "Norvège"],
  C: ["Algérie", "Colombie", "Allemagne", "Belgique"],
  D: ["Sénégal", "Japon", "Tunisie", "Brésil"],
  E: ["Grèce", "Angleterre", "États Unis", "Madagascar"],
  F: ["Comores", "Maroc", "France", "Canada"]
};

const flags = {
  "Pays Bas":"🇳🇱","Italie":"🇮🇹","Uruguay":"🇺🇾","Égypte":"🇪🇬",
  "Espagne":"🇪🇸","Argentine":"🇦🇷","Croatie":"🇭🇷","Norvège":"🇳🇴",
  "Algérie":"🇩🇿","Colombie":"🇨🇴","Allemagne":"🇩🇪","Belgique":"🇧🇪",
  "Sénégal":"🇸🇳","Japon":"🇯🇵","Tunisie":"🇹🇳","Brésil":"🇧🇷",
  "Grèce":"🇬🇷","Angleterre":"🏴","États Unis":"🇺🇸","Madagascar":"🇲🇬",
  "Comores":"🇰🇲","Maroc":"🇲🇦","France":"🇫🇷","Canada":"🇨🇦"
};

const teamLogo = {
  "Pays Bas":"assets/team-A1.png","Italie":"assets/team-A2.png","Uruguay":"assets/team-A3.png","Égypte":"assets/team-A4.png",
  "Espagne":"assets/team-B1.png","Argentine":"assets/team-B2.png","Croatie":"assets/team-B3.png","Norvège":"assets/team-B4.png",
  "Algérie":"assets/team-C1.png","Colombie":"assets/team-C2.png","Allemagne":"assets/team-C3.png","Belgique":"assets/team-C4.png",
  "Sénégal":"assets/team-D1.png","Japon":"assets/team-D2.png","Tunisie":"assets/team-D3.png","Brésil":"assets/team-D4.png",
  "Grèce":"assets/team-E1.png","Angleterre":"assets/team-E2.png","États Unis":"assets/team-E3.png","Madagascar":"assets/team-E4.png",
  "Comores":"assets/team-F1.png","Maroc":"assets/team-F2.png","France":"assets/team-F3.png","Canada":"assets/team-F4.png"
};

const initial = {
  A:[["Pays Bas",3,1,1,0,0,7,0],["Italie",3,1,1,0,0,5,0],["Uruguay",0,1,0,0,1,0,5],["Égypte",0,1,0,0,1,0,7]],
  B:[["Espagne",3,1,1,0,0,7,4],["Argentine",3,1,1,0,0,3,2],["Croatie",0,1,0,0,1,2,3],["Norvège",0,1,0,0,1,4,7]],
  C:[["Algérie",3,1,1,0,0,10,1],["Colombie",0,0,0,0,0,0,0],["Allemagne",0,0,0,0,0,0,0],["Belgique",0,1,0,0,1,1,10]],
  D:[["Sénégal",3,1,1,0,0,4,0],["Japon",0,0,0,0,0,0,0],["Tunisie",0,0,0,0,0,0,0],["Brésil",0,1,0,0,1,0,4]],
  E:[["Grèce",3,1,1,0,0,5,4],["Angleterre",0,0,0,0,0,0,0],["États Unis",0,0,0,0,0,0,0],["Madagascar",0,1,0,0,1,4,5]],
  F:[["Comores",3,1,1,0,0,3,0],["Maroc",0,0,0,0,0,0,0],["France",0,0,0,0,0,0,0],["Canada",0,1,0,0,1,0,3]]
};

function freshStandings(){
  return Object.fromEntries(Object.entries(initial).map(([g, arr]) => [g, arr.map(x => ({
    team_name:x[0], points:x[1], played:x[2], wins:x[3], draws:x[4], losses:x[5], goals_for:x[6], goals_against:x[7]
  }))]));
}

function safeJSON(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch (_) {
    localStorage.removeItem(key);
    return fallback;
  }
}

let standings = safeJSON("ffl_standings", freshStandings());

function normaliseStandings(data){
  const out = {};
  for (const g of Object.keys(groups)) {
    const source = Array.isArray(data?.[g]) ? data[g] : [];
    const byName = Object.fromEntries(source.map(r => [r.team_name, r]));
    out[g] = groups[g].map(name => byName[name] || {
      team_name:name, points:0, played:0, wins:0, draws:0, losses:0, goals_for:0, goals_against:0
    });
  }
  return out;
}

function renderStandings(data = standings){
  const root = $("standingsGroups");
  if (!root) return;
  const safe = normaliseStandings(data);
  root.innerHTML = "";
  for (const g of Object.keys(groups)) {
    const rows = [...safe[g]].sort((a,b) =>
      (Number(b.points)||0)-(Number(a.points)||0) ||
      ((Number(b.goals_for)||0)-(Number(b.goals_against)||0))-((Number(a.goals_for)||0)-(Number(a.goals_against)||0)) ||
      (Number(b.goals_for)||0)-(Number(a.goals_for)||0)
    );
    const card = document.createElement("article");
    card.className = "group-card";
    card.innerHTML = `
      <h3>GROUPE ${g}</h3>
      <div class="standings-table">
        <div class="st-head"><span>Pos</span><span>ÉQUIPES</span><span>PTS</span><span>J</span><span>G</span><span>N</span><span>P</span><span>BP</span><span>BC</span><span>DIF</span><span>%</span></div>
        ${rows.map((r,i) => {
          const gf = Number(r.goals_for)||0, ga = Number(r.goals_against)||0, played = Number(r.played)||0, pts = Number(r.points)||0;
          const dif = gf-ga;
          const pct = played ? Math.round((pts/(played*3))*100) : 0;
          const logo = teamLogo[r.team_name];
          const visual = logo ? `<img class="standing-logo" src="${logo}" alt="Logo ${r.team_name}" onerror="this.style.display='none'">` : `<span class="standing-flag">${flags[r.team_name]||"⚽"}</span>`;
          return `<div class="st-row"><b>${i+1}</b><strong>${visual}<span>${r.team_name}</span></strong><span>${pts}</span><span>${played}</span><span>${Number(r.wins)||0}</span><span>${Number(r.draws)||0}</span><span>${Number(r.losses)||0}</span><span>${gf}</span><span>${ga}</span><span>${dif}</span><span>${pct}</span></div>`;
        }).join("")}
      </div>`;
    root.appendChild(card);
  }
}

// Toujours afficher le classement local immédiatement, même si Supabase n'est pas configuré.
standings = normaliseStandings(standings);
renderStandings();

let adminPassword = "";
let adminUnlocked = false;
const localAdminStateKey = "ffl_local_admin_state";
const defaultLocalState = {
  breaking_news:"Bienvenue sur le site de la FFL — la Coupe du Monde est en cours.",
  announcement_title:"Annonce FFL", announcement_message:"", maintenance:false
};

function getLocalAdminState(){
  const state = safeJSON(localAdminStateKey, defaultLocalState);
  return {...defaultLocalState, ...state};
}
function setLocalAdminState(patch){
  const next = {...getLocalAdminState(), ...patch};
  localStorage.setItem(localAdminStateKey, JSON.stringify(next));
  applyState(next);
  return next;
}

function applyState(s){
  if (!s) return;
  const news = $("breakingNewsText");
  if (news) news.textContent = s.breaking_news || defaultLocalState.breaking_news;
  if (s.announcement_message) {
    $("announcementTitle").textContent = s.announcement_title || "Annonce FFL";
    $("announcementMessage").textContent = s.announcement_message;
    show($("globalAnnouncement"));
  } else hide($("globalAnnouncement"));
  if (s.maintenance) {
    show($("maintenanceOverlay"));
    if ($("siteState")) $("siteState").textContent = "MAINTENANCE";
    if ($("siteStateHint")) $("siteStateHint").textContent = "Le site est fermé temporairement";
  } else {
    hide($("maintenanceOverlay"));
    if ($("siteState")) $("siteState").textContent = "EN LIGNE";
    if ($("siteStateHint")) $("siteStateHint").textContent = "Le site fonctionne normalement";
  }
}

// En test local, une ancienne maintenance ne doit jamais bloquer définitivement le bouton Admin.
if (location.protocol === "file:") {
  const localState = getLocalAdminState();
  localState.maintenance = false;
  localStorage.setItem(localAdminStateKey, JSON.stringify(localState));
  applyState(localState);
}

const adminModal = $("adminModal");
function openAdmin(){
  show(adminModal);
  document.body.classList.add("modal-open");
  if (adminUnlocked) {
    hide($("adminLoginView")); show($("adminDashboard")); refreshMatchSelectors();
  } else {
    show($("adminLoginView")); hide($("adminDashboard"));
    setTimeout(() => $("adminPassword")?.focus(), 80);
  }
}
function closeAdmin(){ hide(adminModal); document.body.classList.remove("modal-open"); }
function bindButton(id, fn){
  const el = $(id); if (!el) return;
  el.addEventListener("click", fn);
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); } });
}
bindButton("adminOpenTop", e => { e?.preventDefault?.(); openAdmin(); });
bindButton("adminOpenFooter", e => { e?.preventDefault?.(); openAdmin(); });
bindButton("maintenanceAdmin", e => { e?.preventDefault?.(); e?.stopPropagation?.(); openAdmin(); });
// Le bouton Administration reste disponible même lorsque la maintenance globale est active.
$("maintenanceOverlay")?.addEventListener("click", e => {
  if (e.target?.id === "maintenanceAdmin") return;
});
$("adminClose")?.addEventListener("click", closeAdmin);
$("adminBackdrop")?.addEventListener("click", closeAdmin);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAdmin(); });

function showToast(message, error=false){
  const t = $("toast"); if (!t) return;
  t.textContent = message; t.classList.toggle("error", error); show(t);
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => hide(t), 3200);
}

async function adminRequest(action, payload={}){
  const r = await fetch("/api/admin", {
    method:"POST", headers:{"Content-Type":"application/json","x-admin-password":adminPassword},
    body:JSON.stringify({action,...payload})
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Erreur serveur");
  return d;
}

$("adminLoginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const p = $("adminPassword").value.trim();
  const err = $("adminLoginError"); hide(err);
  try {
    if (p !== "93240") throw new Error("Mot de passe incorrect.");
    adminPassword = p;
    adminUnlocked = true;
    hide($("adminLoginView")); show($("adminDashboard")); refreshMatchSelectors();
    if (location.protocol !== "file:") {
      try { await refreshAdminState(); await loadLogs(); await loadStandings(); } catch (_) {}
    }
    showToast("Panneau admin ouvert.");
  } catch (x) {
    if (err) { err.textContent = x.message; show(err); }
  }
});

async function loadStandings(){
  if (!supabase) return;
  try {
    const {data,error} = await supabase.from("ffl_standings").select("*");
    if (error || !Array.isArray(data) || !data.length) return;
    const grouped = {};
    data.forEach(r => (grouped[r.group_name] ??= []).push(r));
    standings = normaliseStandings(grouped);
    localStorage.setItem("ffl_standings", JSON.stringify(standings));
    renderStandings(standings);
  } catch (_) {}
}

function refreshMatchSelectors(){
  const g = $("matchGroup")?.value; if (!g) return;
  const a = $("teamA"), b = $("teamB");
  a.innerHTML = groups[g].map(t => `<option value="${t}">${t}</option>`).join("");
  b.innerHTML = groups[g].map(t => `<option value="${t}">${t}</option>`).join("");
  if (b.options.length > 1) b.selectedIndex = 1;
}
$("matchGroup")?.addEventListener("change", refreshMatchSelectors);
refreshMatchSelectors();

function localMatch(group,a,b,result,sa,sb){
  standings = normaliseStandings(standings);
  const ra = standings[group].find(x=>x.team_name===a), rb = standings[group].find(x=>x.team_name===b);
  if (!ra || !rb || a===b) throw new Error("Choisis deux équipes différentes de la même poule.");
  ra.played++; rb.played++;
  ra.goals_for += sa; ra.goals_against += sb; rb.goals_for += sb; rb.goals_against += sa;
  if (result === "DRAW") { ra.draws++; rb.draws++; ra.points++; rb.points++; }
  else if (result === "A") { ra.wins++; rb.losses++; ra.points += 3; }
  else { rb.wins++; ra.losses++; rb.points += 3; }
  localStorage.setItem("ffl_standings", JSON.stringify(standings));
  renderStandings(standings);
}

$("saveMatch")?.addEventListener("click", async () => {
  const group=$("matchGroup").value, a=$("teamA").value, b=$("teamB").value, result=$("matchResult").value;
  const sa=Number($("scoreA").value), sb=Number($("scoreB").value);
  try {
    if (a===b) throw new Error("Choisis deux équipes différentes.");
    if (!Number.isInteger(sa)||!Number.isInteger(sb)||sa<0||sb<0) throw new Error("Entre deux scores valides.");
    if (result==="A" && sa<=sb) throw new Error("Pour une victoire équipe 1, son score doit être supérieur.");
    if (result==="B" && sb<=sa) throw new Error("Pour une victoire équipe 2, son score doit être supérieur.");
    if (result==="DRAW" && sa!==sb) throw new Error("Pour un nul, les deux scores doivent être identiques.");
    if (!supabase || location.protocol === "file:") {
      localMatch(group,a,b,result,sa,sb); showToast("Résultat ajouté au classement.");
    } else {
      await adminRequest("record_match",{group,teamA:a,teamB:b,result,scoreA:sa,scoreB:sb});
      // Mise à jour immédiate à l'écran, puis resynchronisation avec Supabase.
      localMatch(group,a,b,result,sa,sb);
      await loadStandings(); await loadLogs();
      showToast("Résultat enregistré : classement mis à jour.");
    }
    $("scoreA").value=""; $("scoreB").value="";
  } catch (x) { showToast(x.message,true); }
});

$("saveBreaking")?.addEventListener("click", async () => {
  const text=$("breakingInput").value.trim(); if(!text) return showToast("Écris une phrase avant de sauvegarder.",true);
  try {
    if (!supabase || location.protocol === "file:") { setLocalAdminState({breaking_news:text}); showToast("Breaking news mise à jour."); }
    else { await adminRequest("set_breaking_news",{text}); showToast("Breaking news mise à jour."); }
  } catch(e){ showToast(e.message,true); }
});

$("sendAnnouncement")?.addEventListener("click", async () => {
  const title=$("announcementTitleInput").value.trim()||"Annonce FFL", message=$("announcementMessageInput").value.trim();
  if(!message) return showToast("Écris un message avant de l’envoyer.",true);
  try {
    if (!supabase || location.protocol === "file:") { setLocalAdminState({announcement_title:title,announcement_message:message}); showToast("Annonce affichée."); }
    else { await adminRequest("announce",{title,message}); showToast("Annonce envoyée à tout le monde."); }
    $("announcementMessageInput").value="";
  } catch(e){ showToast(e.message,true); }
});

$("maintenanceOn")?.addEventListener("click", async () => {
  if(!confirm("Mettre le site en maintenance pour tout le monde ?")) return;
  try {
    if (!supabase || location.protocol === "file:") { setLocalAdminState({maintenance:true}); showToast("Maintenance activée."); }
    else { await adminRequest("maintenance",{enabled:true}); showToast("Maintenance activée."); }
  } catch(e){ showToast(e.message,true); }
});
$("maintenanceOff")?.addEventListener("click", async () => {
  try {
    if (!supabase || location.protocol === "file:") { setLocalAdminState({maintenance:false}); showToast("Site rouvert."); }
    else { await adminRequest("maintenance",{enabled:false}); showToast("Site rouvert."); }
  } catch(e){ showToast(e.message,true); }
});

async function refreshAdminState(){
  const d=await adminRequest("get_state");
  applyState(d.state);
  if(d.state) $("breakingInput").value=d.state.breaking_news||"";
}
async function loadLogs(){
  try { const d=await adminRequest("get_logs"); renderLogs(d.logs||[]); }
  catch(_) { renderLogs([]); }
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
function renderLogs(logs){
  const box=$("adminLogs"); if(!box)return;
  if(!logs.length){box.innerHTML='<div class="log-empty">Aucun log pour le moment.</div>';return;}
  box.innerHTML=logs.map(l=>`<div class="log-item"><span class="log-dot"></span><div><b>${escapeHtml(l.action||"ACTION")}</b><p>${escapeHtml(l.message||"")}</p></div><time>${escapeHtml(new Date(l.created_at).toLocaleString("fr-FR"))}</time></div>`).join("");
}

$("closeAnnouncement")?.addEventListener("click",()=>hide($("globalAnnouncement")));

let presenceChannel=null;
async function startRealtime(){
  if(!supabase){ $("onlineCount").textContent="Local"; return; }
  try {
    const key=(window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    presenceChannel=supabase.channel("ffl-online",{config:{presence:{key}}});
    presenceChannel
      .on("presence",{event:"sync"},()=>{ $("onlineCount").textContent=String(Object.keys(presenceChannel.presenceState()).length); })
      .on("postgres_changes",{event:"*",schema:"public",table:"ffl_admin_state",filter:"id=eq.1"},p=>{applyState(p.new);if(adminUnlocked){$("breakingInput").value=p.new.breaking_news||"";loadLogs();}})
      .on("postgres_changes",{event:"*",schema:"public",table:"ffl_standings"},()=>loadStandings())
      .subscribe(async status=>{if(status==="SUBSCRIBED") await presenceChannel.track({online_at:new Date().toISOString(),page:location.pathname});});
    const {data}=await supabase.from("ffl_admin_state").select("*").eq("id",1).maybeSingle();
    if(data) applyState(data);
    await loadStandings();
  } catch(_) { $("onlineCount").textContent="—"; }
}

const links=[...document.querySelectorAll(".nav-link")], sections=[...document.querySelectorAll("main section[id]")];
if("IntersectionObserver" in window){const ob=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(v)links.forEach(l=>l.classList.toggle("active",l.getAttribute("href")==="#"+v.target.id));},{threshold:[.15,.35,.6]});sections.forEach(s=>ob.observe(s));}

const audio=$("bgMusic"), musicBtn=$("musicToggle");
let musicOn=localStorage.getItem("ffl_music")!=="off";
function updateMusic(){if(musicBtn){musicBtn.classList.toggle("muted",!musicOn);musicBtn.innerHTML=musicOn?'♫ <span>Musique</span>':'🔇 <span>Musique coupée</span>';}}
async function playMusic(){if(!audio||!musicOn)return;try{audio.volume=.16;await audio.play();}catch(_){} }
musicBtn?.addEventListener("click",async()=>{musicOn=!musicOn;localStorage.setItem("ffl_music",musicOn?"on":"off");if(musicOn)await playMusic();else audio.pause();updateMusic();});
["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,()=>playMusic(),{once:true,passive:true}));
updateMusic(); playMusic();

startRealtime();
