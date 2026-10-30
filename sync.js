/* Synchro iPhone <-> Mac : fait croire à l'appli que window.claude existe, en s'appuyant sur Firebase (Auth + Firestore). */
(function(){
  var cfg = window.FIREBASE_CONFIG;
  if(!cfg || !cfg.apiKey || !window.firebase) return;           // pas configuré : mode local
  firebase.initializeApp(cfg);
  var auth = firebase.auth(), fs = firebase.firestore();
  var resolveUser; var ready = new Promise(function(r){ resolveUser = r; });

  var css = document.createElement("style");
  css.textContent = "#lg{position:fixed;inset:0;z-index:99999;background:#EDF0EA;display:none;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,system-ui,sans-serif}"+
  "#lg .c{width:100%;max-width:340px;background:#fff;border-radius:18px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.12)}"+
  "#lg h1{font-size:20px;margin:0 0 4px;color:#14201A}#lg p{margin:0 0 16px;font-size:14px;color:#5D6A62}"+
  "#lg input{width:100%;box-sizing:border-box;font-size:16px;padding:12px;border:1px solid #D8DED6;border-radius:10px;margin-bottom:10px}"+
  "#lg button{width:100%;font-size:16px;font-weight:600;padding:12px;border:0;border-radius:10px;background:#2448E8;color:#fff}"+
  "#lg .e{color:#C0392B;font-size:13px;min-height:18px;margin:4px 0 8px}";
  document.head.appendChild(css);
  var box = document.createElement("div"); box.id = "lg";
  box.innerHTML = '<form class="c" id="lgf"><h1>Le Vrai Restant</h1><p>Connecte-toi une fois : l\'appli restera synchronisée sur tes appareils.</p>'+
    '<input id="lg-m" type="email" autocomplete="username" placeholder="E-mail" required>'+
    '<input id="lg-p" type="password" autocomplete="current-password" placeholder="Mot de passe" required>'+
    '<div class="e" id="lg-e"></div><button type="submit">Se connecter</button></form>';
  function mount(){ document.body.appendChild(box); }
  if(document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  document.addEventListener("submit", function(ev){
    if(ev.target.id !== "lgf") return;
    ev.preventDefault();
    var e = document.getElementById("lg-e"); e.textContent = "";
    auth.signInWithEmailAndPassword(document.getElementById("lg-m").value.trim(), document.getElementById("lg-p").value)
      .catch(function(){ e.textContent = "E-mail ou mot de passe incorrect."; });
  });
  auth.onAuthStateChanged(function(u){
    if(u){ box.style.display = "none"; resolveUser(u); }
    else { box.style.display = "flex"; }
  });

  window.claude = { use: async function(name){
    var u = await ready;
    if(name === "user") return { id: async function(){ return u.uid; } };
    if(name === "db") return { doc: function(){ return fs.doc("vrai-restant/state"); } };
    return null;
  }};
})();
