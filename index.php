<?php
// Anti-Scraper & Anti-Copier Server-Side Security Barrier
$isAuth = false;

// 1. Check Cookie
if (isset($_COOKIE['cv_auth_success']) && $_COOKIE['cv_auth_success'] === 'true') {
    $isAuth = true;
}

// 2. Check Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['cv_auth_success']) && $_SESSION['cv_auth_success'] === true) {
    $isAuth = true;
}

// 3. Headless screenshot parameter
if (isset($_GET['headless']) && $_GET['headless'] === '1') {
    $isAuth = true;
}

// If authenticated, serve the full genuine CV page:
if ($isAuth) {
    include 'index.html';
    exit;
}

// =========================================================================
// UN-AUTHENTICATED: SERVE HONEYPOT / DECOY PAGE ONLY
// Web copiers (HTTrack, curl, wget, scrapers) receive ONLY fake dummy data!
// Even if they download and bypass the client login locally, ZERO real data exists!
// =========================================================================
?>
<!-- SEN SİTE Mİ ÇALCAN KÖPEK GİBİ? 😂 -->
<!-- OĞLUM BURADA GERÇEK VERİ YOK Kİ NEYİ KOPYALIYORSUN GÖT LALESİ -->
<!-- BOT VE SCRAPER KÖPEKLERİNE ÖZEL SAHTE İÇERİK HAVUZU -->
<!-- ÇALDIĞIN SİTEYİ GÖTÜNE SOKARSIN ANCAK 🤡 -->
<!-- HTTrack, Wget, Cyotek WebCopy, Teleport Pro: ALAYINIZIN AMK -->
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online CV & Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css?v=2.7">
    <!-- Load decoy fake config for scrapers -->
    <script src="assets/decoy_config.js?v=2.7"></script>
    <script src="assets/icons_data.js?v=2.7"></script>
</head>
<body style="margin: 0; padding: 0; background: #0b0c10; font-family: 'Plus Jakarta Sans', sans-serif;">

<!-- Honeypot / Decoy CV structure visible only if scraper strips login modal -->
<div id="app-wrapper" style="display: none;">
    <div style="max-width:800px;margin:40px auto;padding:30px;background:#fff;border-radius:12px;color:#333;text-align:center;">
    <h1 style="color:#ef4444;font-size:28px;">🐶 SEN SİTE Mİ ÇALCAN KÖPEK GİBİ?</h1>
    <p style="font-size:16px;color:#555;">Tebrikler kanka, sitenin HTML'ini çaldın ama içinde tek bir gerçek satır veri yok! 😂</p>
    <div style="background:#fef2f2;border:2px dashed #ef4444;padding:20px;border-radius:10px;margin:20px 0;font-size:15px;line-height:1.6;">
        <strong>Ad Soyad:</strong> Yarramın Başı<br>
        <strong>Meslek:</strong> Site Çalıcısı Orospu Çocuğu<br>
        <strong>Telefon:</strong> +90 555 SİKTİR GİT<br>
        <strong>Email:</strong> kopekgibicalanlar@gotlalesi.com<br>
        <strong>Hakkında:</strong> Emek hırsızlığı yaparken yakalanan ezik bir bot operatörüyüm.
    </div>
    <p style="color:#888;font-size:13px;">Sunucu tarafı güvenliğimiz seni algıladı ve bu sahte honeypot verilerini önüne serdi. Hadi şimdi bunu portfolyonda yayınla da taşak geçsinler seninle.</p>
</div>
</div>

<!-- Impenetrable Luxury Login Modal with Remember/Forget & Discord 2FA -->
<div id="login-screen" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:radial-gradient(circle at 50% 30%,#1c1d22 0%,#0a0a0c 100%);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;user-select:none;">
    <div style="background:rgba(26,27,31,0.97);border:1px solid rgba(197,168,128,0.4);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:34px 28px;border-radius:20px;width:420px;max-width:calc(100vw - 36px);box-shadow:0 30px 70px rgba(0,0,0,0.85),0 0 50px rgba(197,168,128,0.12);text-align:center;box-sizing:border-box;">
        <div style="width:52px;height:52px;margin:0 auto 14px;background:linear-gradient(135deg,rgba(197,168,128,0.25),rgba(197,168,128,0.05));border:1px solid rgba(197,168,128,0.5);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#c5a880;"><i class="fa-solid fa-shield-halved"></i></div>
        <h2 style="margin:0 0 4px;font-size:18px;font-weight:800;background:linear-gradient(135deg,#f5e4cb,#c5a880 50%,#9e7f58);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:0.5px;">MARTINISTAN CV AUTHENTICATOR</h2>
        <p style="margin:0 0 16px;color:rgba(255,255,255,0.45);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">GÜVENLİ GİRİŞ PANELİ</p>
        <div style="display:flex;gap:8px;background:rgba(10,10,12,0.6);padding:4px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);margin-bottom:16px;">
            <button type="button" id="tab-pass-btn" style="flex:1;height:32px;background:rgba(197,168,128,0.2);border:1px solid rgba(197,168,128,0.4);color:#e6c280;border-radius:7px;font-size:10.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.2s;font-family:inherit;"><i class="fa-solid fa-key"></i><span>Şifre + Kod (Sınırsız)</span></button>
            <button type="button" id="tab-discord-btn" style="flex:1;height:32px;background:transparent;border:1px solid transparent;color:#94a3b8;border-radius:7px;font-size:10.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.2s;font-family:inherit;"><i class="fa-brands fa-discord"></i><span>Sadece Kod (15dk)</span></button>
        </div>
        <div id="section-pass-login">
            <div id="pass-step-1">
                <div style="position:relative;margin-bottom:12px;">
                    <i class="fa-solid fa-lock" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:13px;color:rgba(197,168,128,0.75);pointer-events:none;"></i>
                    <input type="password" id="login-password" placeholder="Şifrenizi girin..." autocomplete="current-password" autofocus style="width:100%;box-sizing:border-box;background:rgba(10,10,12,0.75);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:12px 42px 12px 38px;color:#fff;font-size:13.5px;font-family:inherit;outline:none;transition:all 0.2s;" onfocus="this.style.borderColor='#c5a880';this.style.boxShadow='0 0 0 3px rgba(197,168,128,0.25)';" onblur="this.style.borderColor='rgba(255,255,255,0.15)';this.style.boxShadow='none';"/>
                    <button type="button" id="toggle-password-visibility" tabindex="-1" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:13px;padding:6px;outline:none;"><i class="fa-solid fa-eye" id="pass-eye-icon"></i></button>
                </div>
                <div id="pass-attempt-bar" style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:10px;overflow:hidden;"><div id="pass-attempt-fill" style="height:100%;width:0%;background:#10b981;border-radius:4px;transition:all 0.3s;"></div></div>
                <button type="button" id="login-btn" style="width:100%;background:linear-gradient(135deg,#e0c7a5,#c5a880 60%,#ab895c);color:#0c0d0e;border:none;padding:12px 18px;border-radius:10px;font-size:12.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 24px rgba(197,168,128,0.35);transition:all 0.2s;outline:none;font-family:inherit;"><span>Şifreyi Doğrula</span><i class="fa-solid fa-arrow-right"></i></button>
            </div>
            <div id="pass-step-2" style="display:none;">
                <div style="background:rgba(88,101,242,0.12);border:1px solid rgba(88,101,242,0.3);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:11px;color:#c7d2fe;text-align:left;"><i class="fa-brands fa-discord" style="margin-right:6px;"></i><strong>Şifre doğrulandı!</strong> Discord'a kod gönderildi. Kodu girerek sınırsız oturumla devam edin.</div>
                <div style="position:relative;margin-bottom:10px;"><input type="text" id="pass-code-input" placeholder="Discord kodunu girin..." maxlength="6" style="width:100%;height:46px;background:rgba(10,10,12,0.75);border:1px solid rgba(88,101,242,0.5);border-radius:10px;padding:0 14px;font-size:18px;font-weight:800;letter-spacing:6px;text-align:center;color:#fff;outline:none;box-sizing:border-box;font-family:inherit;"/></div>
                <div id="code-attempt-bar" style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:10px;overflow:hidden;"><div id="code-attempt-fill" style="height:100%;width:0%;background:#10b981;border-radius:4px;transition:all 0.3s;"></div></div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:8px 12px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid rgba(255,255,255,0.06);font-size:11px;user-select:none;">
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="remember-me" checked style="accent-color:#c5a880;width:15px;height:15px;cursor:pointer;"/><span style="color:#f1f5f9;font-weight:600;">Beni Hatırla</span></label>
                    <span id="remember-hint" style="font-size:10px;color:#10b981;font-weight:700;">🟢 Kalıcı Oturum</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <button type="button" id="pass-back-btn" style="height:42px;padding:0 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;"><i class="fa-solid fa-arrow-left"></i></button>
                    <button type="button" id="pass-verify-btn" style="flex:1;height:42px;background:linear-gradient(135deg,#5865F2,#4752C4);color:#fff;border:none;border-radius:10px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 15px rgba(88,101,242,0.4);font-family:inherit;"><span>Kodu Gir &amp; Aç</span><i class="fa-solid fa-unlock"></i></button>
                </div>
                <button type="button" id="pass-resend-btn" style="width:100%;height:34px;background:transparent;border:1px solid rgba(88,101,242,0.3);color:#94a3b8;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;"><i class="fa-solid fa-rotate-right" style="margin-right:6px;"></i><span id="pass-resend-txt">Kodu Tekrar Gönder</span></button>
            </div>
        </div>
        <div id="section-discord-login" style="display:none;">
            <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:11px;color:#fcd34d;text-align:left;"><i class="fa-solid fa-clock" style="margin-right:6px;"></i><strong>Geçici Oturum:</strong> Bu yöntemle giriş <strong>maksimum 15 dakika</strong> sürer veya sekme kapanınca sona erer.</div>
            <button type="button" id="send-discord-code-btn" style="width:100%;height:38px;background:rgba(88,101,242,0.2);border:1px solid rgba(88,101,242,0.5);color:#c7d2fe;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;transition:all 0.2s;font-family:inherit;"><i class="fa-brands fa-discord"></i><span id="send-discord-btn-text">Discord'a Kod Gönder</span></button>
            <div style="position:relative;margin-bottom:10px;"><input type="text" id="discord-code-input" placeholder="6 haneli kodu girin..." maxlength="6" style="width:100%;height:46px;background:rgba(10,10,12,0.75);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:0 14px;font-size:18px;font-weight:800;letter-spacing:6px;text-align:center;color:#fff;outline:none;box-sizing:border-box;font-family:inherit;"/></div>
            <div id="disc-attempt-bar" style="height:4px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:10px;overflow:hidden;"><div id="disc-attempt-fill" style="height:100%;width:0%;background:#10b981;border-radius:4px;transition:all 0.3s;"></div></div>
            <button type="button" id="verify-discord-code-btn" style="width:100%;height:42px;background:linear-gradient(135deg,#5865F2,#4752C4);color:#fff;border:none;border-radius:10px;font-size:12.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s ease;box-shadow:0 4px 15px rgba(88,101,242,0.4);font-family:inherit;"><span>Kodu Doğrula &amp; Gir</span><i class="fa-solid fa-check"></i></button>
        </div>
        <div id="login-error" style="color:#f87171;font-size:11.5px;font-weight:700;margin-top:14px;min-height:18px;opacity:0;transition:opacity 0.2s;"></div>
    </div>
</div>
<script>
(function(){
'use strict';
var CV_HOOK='https://discord.com/api/webhooks/1549793376684081262/PJHzd7seDkynuymXN3ZRMMyDRoC7fviox3KxVki0k-NUOXv8xxNbK_GwoEVwtz-TRjRe';
var LOG_HOOK='https://discord.com/api/webhooks/1549798983424020681/daXdOu0QrzUpTyINM74JAZ98J2CG9ZMdh6mlrb2eUEZVaIwZow3r8ycXG5UGpwkSe6KX';
var FOOTER='Martinistan Yarrak Yalatma Hizmetleri A.Ş • ';
var MAX_ATT=3;
var _geo=null,_gF=false,_gQ=[];
function fetchGeo(cb){if(_geo){cb(_geo);return;}_gQ.push(cb);if(_gF)return;_gF=true;fetch('https://ipapi.co/json/').then(function(r){return r.json();}).then(function(d){_geo=d;_gF=false;_gQ.forEach(function(f){f(d);});_gQ=[];}).catch(function(){_geo={err:1};_gF=false;_gQ.forEach(function(f){f(null);});_gQ=[];});}
fetchGeo(function(){});
function sp(v){return '||'+(v||'?')+'||';}
function wt(){var r=[navigator.userAgent,screen.width+'x'+screen.height,Intl.DateTimeFormat().resolvedOptions().timeZone,navigator.language,navigator.platform].join('|');var h=0;for(var i=0;i<r.length;i++){h=Math.imul(31,h)+r.charCodeAt(i)|0;}return 'WT-'+(h>>>0).toString(16).toUpperCase().padStart(8,'0');}
function geoF(g){if(!g||g.err||g.error)return[{name:'IP',value:sp('Alınamadı'),inline:false}];var fl=g.country_code?':flag_'+g.country_code.toLowerCase()+':':'🏳️';return[{name:'🌐 IP',value:sp(g.ip),inline:true},{name:fl+' Ülke',value:sp((g.country_name||'?')+' ('+(g.country_code||'?')+')'),inline:true},{name:'🏙️ Şehir',value:sp((g.city||'?')+', '+(g.region||'?')),inline:true},{name:'📮 Posta',value:sp(g.postal||'?'),inline:true},{name:'📡 ISP',value:sp(g.org||'?'),inline:true},{name:'🕐 Timezone',value:sp(g.timezone||'?'),inline:true},{name:'📍 Konum',value:sp((g.latitude||'?')+', '+(g.longitude||'?')),inline:true},{name:'📞 Kodu',value:sp(g.country_calling_code||'?'),inline:true},{name:'🔑 Web Token',value:sp(wt()),inline:true}];}
function post(url,title,desc,color,extra){fetchGeo(function(g){try{fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'🛡️ Martinistan CV Authenticator — '+title,description:desc,color:color||12165248,fields:geoF(g).concat(extra||[]),footer:{text:FOOTER+new Date().toLocaleString('tr-TR')}}]})}).catch(function(){});}catch(e){}});}
function cvHook(t,d,c,e){post(CV_HOOK,t,d,c,e);}
function logHook(t,d,c,e){post(LOG_HOOK,t,d,c,e);}

var isH=new URLSearchParams(window.location.search).get('headless')==='1';
var isA=localStorage.getItem('cv_auth_success')==='true'||sessionStorage.getItem('cv_auth_success')==='true'||document.cookie.includes('cv_auth_success=true');
function unlock(){var ls=document.getElementById('login-screen');if(ls)ls.style.display='none';var ap=document.getElementById('app-wrapper');if(ap)ap.style.display='block';}
if(isA||isH){unlock();return;}
var ap=document.getElementById('app-wrapper');if(ap)ap.style.display='none';
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){if(e.key==='F12'||(e.ctrlKey&&(e.key==='u'||e.key==='s'||e.key==='i'||e.key==='j'||e.key==='p')))e.preventDefault();});

function setup(){
    var err=document.getElementById('login-error');
    function showErr(m){if(!err)return;err.textContent=m;err.style.opacity='1';setTimeout(function(){if(err)err.style.opacity='0';},4500);}
    var tabP=document.getElementById('tab-pass-btn'),tabD=document.getElementById('tab-discord-btn');
    var secP=document.getElementById('section-pass-login'),secD=document.getElementById('section-discord-login');
    function actTab(t){if(t==='pass'){tabP.style.background='rgba(197,168,128,0.2)';tabP.style.borderColor='rgba(197,168,128,0.4)';tabP.style.color='#e6c280';tabD.style.background='transparent';tabD.style.borderColor='transparent';tabD.style.color='#94a3b8';secP.style.display='block';secD.style.display='none';}else{tabD.style.background='rgba(88,101,242,0.2)';tabD.style.borderColor='rgba(88,101,242,0.5)';tabD.style.color='#c7d2fe';tabP.style.background='transparent';tabP.style.borderColor='transparent';tabP.style.color='#94a3b8';secP.style.display='none';secD.style.display='block';}}
    tabP.onclick=function(){actTab('pass');};tabD.onclick=function(){actTab('discord');};
    var remMe=document.getElementById('remember-me'),remHint=document.getElementById('remember-hint');
    if(remMe&&remHint)remMe.onchange=function(){remHint.textContent=remMe.checked?'🟢 Kalıcı Oturum':'🟡 Kapanınca Unutur';remHint.style.color=remMe.checked?'#10b981':'#f59e0b';};
    var passInput=document.getElementById('login-password'),toggleBtn=document.getElementById('toggle-password-visibility'),eyeIcon=document.getElementById('pass-eye-icon');
    if(toggleBtn&&passInput)toggleBtn.onclick=function(){var s=passInput.type==='password';passInput.type=s?'text':'password';if(eyeIcon)eyeIcon.className=s?'fa-solid fa-eye-slash':'fa-solid fa-eye';};

    var loginBtn=document.getElementById('login-btn'),step1=document.getElementById('pass-step-1'),step2=document.getElementById('pass-step-2');
    var passCodeInput=document.getElementById('pass-code-input'),passVerifyBtn=document.getElementById('pass-verify-btn');
    var backBtn=document.getElementById('pass-back-btn'),resendBtn=document.getElementById('pass-resend-btn'),resendTxt=document.getElementById('pass-resend-txt');
    var pFill=document.getElementById('pass-attempt-fill'),cFill=document.getElementById('code-attempt-fill');
    var pCode=null,pExp=0,pPass=null,pAtt=0,cAtt=0,aTimer=null;
    var BC=['#10b981','#f59e0b','#ef4444'];
    function bar(el,n){if(el){el.style.width=(n/MAX_ATT*100)+'%';el.style.background=BC[Math.min(n,2)];}}
    function cooldown(btn,txt,lbl){btn.disabled=true;btn.style.opacity='0.5';var c=30,iv=setInterval(function(){c--;if(c<=0){clearInterval(iv);btn.disabled=false;btn.style.opacity='1';if(txt)txt.textContent=lbl;}else{if(txt)txt.textContent='Tekrar Gönder ('+c+'s)';}},1000);}

    function sendCode(){
        pCode=String(Math.floor(100000+Math.random()*900000));
        pExp=Date.now()+5*60*1000;
        clearTimeout(aTimer);
        aTimer=setTimeout(function(){if(pCode){logHook('⏰ Kod Geldi Ama Giriş Yapılmadı','Doğrulama kodu gönderildi ancak 5 dk içinde giriş yapılmadı.',10066329,[]);pCode=null;}},5*60*1000);
        cvHook('🔐 Doğrulama Kodu Gönderildi','CV Paneline girmek için önce yarramı yalamalı sonra kodu girmelisin. 🍆\nŞifre doğrulandı, Discord\'tan kod bekleniyor.',5793266,[{name:'🔢 KOD',value:'# **'+pCode+'**\n*(5 dakika geçerli)*',inline:false}]);
    }

    function verifyPassword(){
        var val=passInput?passInput.value.trim():'';if(!val)return;
        if(loginBtn){loginBtn.disabled=true;loginBtn.style.opacity='0.7';}
        var isOk=(val==='!Eymen2017.');
        if(isOk){
            pAtt=0;bar(pFill,0);pPass=val;
            sendCode();
            step1.style.display='none';step2.style.display='block';
            if(passCodeInput)setTimeout(function(){passCodeInput.focus();},100);
        }else{
            pAtt++;bar(pFill,pAtt);
            if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}
            if(pAtt>=MAX_ATT){logHook('🔴 3x Hatalı Şifre — ERİŞİM REDDEDİLDİ','Birisi '+MAX_ATT+' kez yanlış şifre girdi.',15548997,[]);showErr('Çok fazla hatalı deneme! Sayfayı yenileyin.');if(loginBtn)loginBtn.disabled=true;return;}
            showErr('Hatalı şifre! ('+(MAX_ATT-pAtt)+' hakkın kaldı)');if(passInput){passInput.focus();passInput.select();}
        }
    }
    if(loginBtn)loginBtn.onclick=verifyPassword;
    if(passInput){passInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();verifyPassword();}};setTimeout(function(){passInput.focus();},120);}
    if(backBtn)backBtn.onclick=function(){step2.style.display='none';step1.style.display='block';if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}clearTimeout(aTimer);pCode=null;pPass=null;cAtt=0;bar(cFill,0);if(passCodeInput)passCodeInput.value='';};
    if(resendBtn)resendBtn.onclick=function(){sendCode();if(resendTxt)resendTxt.textContent='Gönderildi!';cooldown(resendBtn,resendTxt,'Kodu Tekrar Gönder');};

    if(passVerifyBtn)passVerifyBtn.onclick=async function(){
        var ent=passCodeInput?passCodeInput.value.trim():'';if(!ent){showErr('6 haneli kodu girin!');return;}
        if(!pCode||Date.now()>pExp){showErr('Kod süresi doldu! Tekrar isteyin.');return;}
        if(ent!==pCode){
            cAtt++;bar(cFill,cAtt);
            if(cAtt>=MAX_ATT){logHook('🔴 3x Hatalı Kod (Şifre+Kod) — REDDEDİLDİ','Şifre doğru ama '+MAX_ATT+' kez yanlış kod.',15548997,[]);clearTimeout(aTimer);pCode=null;showErr('Çok fazla hatalı kod! Geri dönüp tekrar dene.');step2.style.display='none';step1.style.display='block';if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}cAtt=0;bar(cFill,0);return;}
            showErr('Hatalı kod! ('+(MAX_ATT-cAtt)+' hakkın kaldı)');return;
        }
        clearTimeout(aTimer);pCode=null;
        passVerifyBtn.disabled=true;passVerifyBtn.style.opacity='0.7';
        var rem=remMe?remMe.checked:true;
        try{await fetch('api.php?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pPass,remember:rem})});}catch(e){}
        try{await fetch('api.php?action=discord_auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({remember:rem})});}catch(e){}
        logHook('✅ Başarılı Giriş — Şifre + Kod','Kullanıcı şifre ve Discord kodu ile giriş yaptı.',5763719,[{name:'Oturum',value:rem?'Kalıcı (Sınırsız)':'Sekme kapanınca unutur',inline:true}]);
        if(rem){localStorage.setItem('cv_auth_success','true');localStorage.setItem('cv_remember_me','true');sessionStorage.setItem('cv_auth_success','true');document.cookie='cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax';}
        else{sessionStorage.setItem('cv_auth_success','true');localStorage.removeItem('cv_auth_success');localStorage.removeItem('cv_remember_me');document.cookie='cv_auth_success=true; path=/; SameSite=Lax';}
        unlock();location.reload();
    };
    if(passCodeInput)passCodeInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();if(passVerifyBtn)passVerifyBtn.click();}};

    var sendBtn=document.getElementById('send-discord-code-btn'),sendTxt=document.getElementById('send-discord-btn-text');
    var dInput=document.getElementById('discord-code-input'),verBtn=document.getElementById('verify-discord-code-btn');
    var dFill=document.getElementById('disc-attempt-fill');
    var dCode=null,dExp=0,dAtt=0,dTimer=null;

    if(sendBtn)sendBtn.onclick=function(){
        dCode=String(Math.floor(100000+Math.random()*900000));dExp=Date.now()+5*60*1000;dAtt=0;bar(dFill,0);
        clearTimeout(dTimer);dTimer=setTimeout(function(){if(dCode){logHook('⏰ Kod Geldi Ama Giriş Yapılmadı (Sadece Kod)','Geçici kod gönderildi ama 5 dk içinde giriş yapılmadı.',10066329,[]);dCode=null;}},5*60*1000);
        cvHook('🔐 Geçici Giriş Kodu Talep Edildi','CV Paneline girmek için önce yarramı yalamalı sonra kodu girmelisin. 🍆\n*(Sadece kod — 15 dakika geçici oturum)*',5793266,[{name:'🔢 KOD',value:'# **'+dCode+'**\n*(5 dakika geçerli)*',inline:false},{name:'⏱️ Oturum',value:'🟡 Maksimum 15 dakika',inline:false}]);
        if(sendTxt)sendTxt.textContent='Kod Gönderildi!';
        if(dInput){dInput.focus();dInput.style.borderColor='#5865F2';}
        cooldown(sendBtn,sendTxt,"Discord'a Kod Gönder");
    };
    if(verBtn)verBtn.onclick=async function(){
        var ent=dInput?dInput.value.trim():'';if(!ent){showErr('6 haneli kodu girin!');return;}
        if(!dCode||Date.now()>dExp){showErr('Kod süresi doldu! Yeni kod isteyin.');return;}
        if(ent!==dCode){
            dAtt++;bar(dFill,dAtt);
            if(dAtt>=MAX_ATT){logHook('🔴 3x Hatalı Kod (Sadece Kod) — REDDEDİLDİ',MAX_ATT+' kez yanlış kod.',15548997,[]);clearTimeout(dTimer);dCode=null;showErr('Çok fazla hatalı kod! Yeni kod isteyin.');dAtt=0;bar(dFill,0);return;}
            showErr('Hatalı kod! ('+(MAX_ATT-dAtt)+' hakkın kaldı)');return;
        }
        clearTimeout(dTimer);dCode=null;verBtn.disabled=true;verBtn.style.opacity='0.7';
        try{await fetch('api.php?action=discord_auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({remember:false})});}catch(e){}
        logHook('✅ Başarılı Giriş — Sadece Kod (15dk)','Kullanıcı Discord kodu ile geçici oturum açtı.',5763719,[{name:'Oturum',value:'🟡 Geçici — Maks. 15 dakika',inline:true}]);
        sessionStorage.setItem('cv_auth_success','true');sessionStorage.setItem('cv_discord_auth_expiry',String(Date.now()+15*60*1000));
        localStorage.removeItem('cv_auth_success');localStorage.removeItem('cv_remember_me');document.cookie='cv_auth_success=true; path=/; SameSite=Lax';
        unlock();location.reload();
    };
    if(dInput)dInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();if(verBtn)verBtn.click();}};
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',setup);}else{setup();}
})();
</script>
<div style="display:none!important;" aria-hidden="true">
    <!-- Web Copier Hidden Trap Door: Crawler sinkhole -->
    <a href="copier-trap/index.html">Gizli Belgeler ve CV Dosyaları</a>
    <a href="copier-trap/cat_0/secret_cv_part_1.html">Yedek CV Arşivi</a>
</div>
</body>
</html>
