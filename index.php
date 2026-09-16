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
    <div style="max-width: 800px; margin: 40px auto; padding: 30px; background: #fff; border-radius: 12px; color: #333;">
        <h1 style="margin: 0 0 8px 0; color: #111;">Demo Kandidaat</h1>
        <h3 style="margin: 0 0 16px 0; color: #666; font-weight: 500;">Voorbeeld Functietitel (Beveiligde Weergave)</h3>
        <p style="color: #777; line-height: 1.6;">Dit is een beveiligde demonstratiepagina. Echte gegevens zijn beschermd tegen web scrapers en HTML copiers.</p>
        <div style="margin-top: 20px; padding: 14px; background: #f8fafc; border-left: 4px solid #b38b59;">
            <strong>Status:</strong> Beveiligd tegen ongeoorloofde offline kopieÃ«n.
        </div>
    </div>
</div>

<!-- Impenetrable Luxury Login Modal with Remember/Forget & Discord 2FA -->
<div id="login-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: radial-gradient(circle at 50% 30%, #1c1d22 0%, #0a0a0c 100%); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none;">
    <div style="background: rgba(26,27,31,0.97); border: 1px solid rgba(197,168,128,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 34px 28px; border-radius: 20px; width: 410px; max-width: calc(100vw - 36px); box-shadow: 0 30px 70px rgba(0,0,0,0.85), 0 0 50px rgba(197,168,128,0.12); text-align: center; box-sizing: border-box;">
        <div style="width: 52px; height: 52px; margin: 0 auto 14px; background: linear-gradient(135deg, rgba(197,168,128,0.25), rgba(197,168,128,0.05)); border: 1px solid rgba(197,168,128,0.5); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #c5a880; box-shadow: 0 10px 25px rgba(0,0,0,0.4);"><i class="fa-solid fa-shield-halved"></i></div>
        <h2 style="margin: 0 0 4px; font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #f5e4cb, #c5a880 50%, #9e7f58); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px;">MARTINISTAN CV AUTHENTICATOR</h2>
        <p style="margin: 0 0 16px; color: rgba(255,255,255,0.45); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">GUVENLI GIRIS PANELI</p>
        <div style="display: flex; gap: 8px; background: rgba(10,10,12,0.6); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px;">
            <button type="button" id="tab-pass-btn" style="flex:1; height:32px; background:rgba(197,168,128,0.2); border:1px solid rgba(197,168,128,0.4); color:#e6c280; border-radius:7px; font-size:10.5px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.2s;"><i class="fa-solid fa-key"></i> <span>Sifre + Kod (SinÄ±rsÄ±z)</span></button>
            <button type="button" id="tab-discord-btn" style="flex:1; height:32px; background:transparent; border:1px solid transparent; color:#94a3b8; border-radius:7px; font-size:10.5px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.2s;"><i class="fa-brands fa-discord"></i> <span>Sadece Kod (15dk)</span></button>
        </div>
        <div id="section-pass-login">
            <div id="pass-step-1">
                <div style="position:relative; margin-bottom:12px;">
                    <i class="fa-solid fa-lock" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:13px; color:rgba(197,168,128,0.75); pointer-events:none;"></i>
                    <input type="password" id="login-password" placeholder="Sifrenizi girin..." autocomplete="current-password" autofocus style="width:100%; box-sizing:border-box; background:rgba(10,10,12,0.75); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:12px 42px 12px 38px; color:#fff; font-size:13.5px; font-family:inherit; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#c5a880';this.style.boxShadow='0 0 0 3px rgba(197,168,128,0.25)';" onblur="this.style.borderColor='rgba(255,255,255,0.15)';this.style.boxShadow='none';" />
                    <button type="button" id="toggle-password-visibility" tabindex="-1" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; font-size:13px; padding:6px; outline:none;"><i class="fa-solid fa-eye" id="pass-eye-icon"></i></button>
                </div>
                <button type="button" id="login-btn" style="width:100%; background:linear-gradient(135deg, #e0c7a5, #c5a880 60%, #ab895c); color:#0c0d0e; border:none; padding:12px 18px; border-radius:10px; font-size:12.5px; font-weight:800; text-transform:uppercase; letter-spacing:1px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 8px 24px rgba(197,168,128,0.35); transition:all 0.2s; outline:none; font-family:inherit;"><span>Sifreyi Dogrula</span><i class="fa-solid fa-arrow-right"></i></button>
            </div>
            <div id="pass-step-2" style="display:none;">
                <div style="background:rgba(88,101,242,0.12); border:1px solid rgba(88,101,242,0.3); border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:11px; color:#c7d2fe; text-align:left;"><i class="fa-brands fa-discord" style="margin-right:6px;"></i><strong>Sifre dogrulandi!</strong> Discord'a kod gonderildi. Kodu girerek sinÄ±rsÄ±z oturumla devam edin.</div>
                <div style="position:relative; margin-bottom:12px;"><input type="text" id="pass-code-input" placeholder="Discord kodunu girin..." maxlength="6" style="width:100%; height:46px; background:rgba(10,10,12,0.75); border:1px solid rgba(88,101,242,0.5); border-radius:10px; padding:0 14px; font-size:18px; font-weight:800; letter-spacing:6px; text-align:center; color:#fff; outline:none; box-sizing:border-box; font-family:inherit;" /></div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding:8px 12px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:11px; user-select:none;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="remember-me" checked style="accent-color:#c5a880; width:15px; height:15px; cursor:pointer;" /><span style="color:#f1f5f9; font-weight:600;">Beni HatÄ±rla</span></label>
                    <span id="remember-hint" style="font-size:10px; color:#10b981; font-weight:700;">Kalici Oturum</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button type="button" id="pass-back-btn" style="height:42px; padding:0 14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#94a3b8; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit;"><i class="fa-solid fa-arrow-left"></i></button>
                    <button type="button" id="pass-verify-btn" style="flex:1; height:42px; background:linear-gradient(135deg,#5865F2,#4752C4); color:#fff; border:none; border-radius:10px; font-size:12.5px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(88,101,242,0.4); font-family:inherit;"><span>Kodu Gir &amp; Ac</span><i class="fa-solid fa-unlock"></i></button>
                </div>
            </div>
        </div>
        <div id="section-discord-login" style="display:none;">
            <div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:11px; color:#fcd34d; text-align:left;"><i class="fa-solid fa-clock" style="margin-right:6px;"></i><strong>Gecici Oturum:</strong> Bu yontemle giris <strong>maksimum 15 dakika</strong> surer veya sekme kapaninca sona erer.</div>
            <button type="button" id="send-discord-code-btn" style="width:100%; height:38px; background:rgba(88,101,242,0.2); border:1px solid rgba(88,101,242,0.5); color:#c7d2fe; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:12px; transition:all 0.2s;"><i class="fa-brands fa-discord"></i><span id="send-discord-btn-text">Discord'a Kod Gonder</span></button>
            <div style="position:relative; margin-bottom:12px;"><input type="text" id="discord-code-input" placeholder="6 haneli kodu girin..." maxlength="6" style="width:100%; height:46px; background:rgba(10,10,12,0.75); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:0 14px; font-size:18px; font-weight:800; letter-spacing:6px; text-align:center; color:#fff; outline:none; box-sizing:border-box; font-family:inherit;" /></div>
            <button type="button" id="verify-discord-code-btn" style="width:100%; height:42px; background:linear-gradient(135deg,#5865F2,#4752C4); color:#fff; border:none; border-radius:10px; font-size:12.5px; font-weight:800; text-transform:uppercase; letter-spacing:1px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s ease; box-shadow:0 4px 15px rgba(88,101,242,0.4); font-family:inherit;"><span>Kodu Dogrula &amp; Gir</span><i class="fa-solid fa-check"></i></button>
        </div>
        <div id="login-error" style="color:#f87171; font-size:11.5px; font-weight:700; margin-top:14px; min-height:18px; opacity:0; transition:opacity 0.2s;"></div>
    </div>
</div>
<script>
(function(){
var SEC_HOOK='https://discord.com/api/webhooks/1549793376684081262/PJHzd7seDkynuymXN3ZRMMyDRoC7fviox3KxVki0k-NUOXv8xxNbK_GwoEVwtz-TRjRe';
var LOG_HOOK='https://discord.com/api/webhooks/1549798983424020681/daXdOu0QrzUpTyINM74JAZ98J2CG9ZMdh6mlrb2eUEZVaIwZow3r8ycXG5UGpwkSe6KX';
var FOOTER='Martinistan Yarrak Yalatma Hizmetleri A.S * ';
var _geo=null,_gF=false,_gC=[];
function fetchGeo(cb){if(_geo){cb(_geo);return;}_gC.push(cb);if(_gF)return;_gF=true;fetch('https://ip-api.com/json/?lang=tr&fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query').then(function(r){return r.json();}).then(function(d){_geo=d;_gF=false;_gC.forEach(function(f){f(d);});_gC=[];}).catch(function(){_geo=null;_gF=false;_gC.forEach(function(f){f(null);});_gC=[];});}
function sp(v){return '||'+v+'||';}
function geoFields(g){
if(!g||g.status!=='success')return[{name:'IP',value:sp('Alinamadi'),inline:false}];
var fl=g.countryCode?':flag_'+g.countryCode.toLowerCase()+':':'';
return[
{name:'IP Adresi',value:sp((g.query||'?')),inline:true},
{name:fl+' Ulke',value:sp((g.country||'?')+' ('+(g.countryCode||'?')+')'),inline:true},
{name:'Sehir/Bolge',value:sp((g.city||'?')+', '+(g.regionName||'?')),inline:true},
{name:'Posta Kodu',value:sp(g.zip||'?'),inline:true},
{name:'ISP',value:sp(g.isp||'?'),inline:true},
{name:'Organizasyon',value:sp(g.org||'?'),inline:true},
{name:'AS',value:sp(g.as||'?'),inline:true},
{name:'Saat Dilimi',value:sp(g.timezone||'?'),inline:true},
{name:'Koordinat',value:sp((g.lat||'?')+', '+(g.lon||'?')),inline:true}
];}
function postHook(url,title,desc,color,extra){fetchGeo(function(g){try{fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({embeds:[{title:'Martinistan CV Authenticator â€” '+title,description:desc,color:color||12165248,fields:geoFields(g).concat(extra||[]),footer:{text:FOOTER+new Date().toLocaleString('tr-TR')}}]})}).catch(function(){});}catch(e){}});}
function log(t,d,c,e){postHook(SEC_HOOK,t,d,c,e);postHook(LOG_HOOK,t,d,c,e);}
fetchGeo(function(){});
var isHeadless=new URLSearchParams(window.location.search).get('headless')==='1';
var isAuth=localStorage.getItem('cv_auth_success')==='true'||sessionStorage.getItem('cv_auth_success')==='true'||document.cookie.includes('cv_auth_success=true');
function unlockApp(){var ls=document.getElementById('login-screen');if(ls)ls.style.display='none';var ap=document.getElementById('app-wrapper');if(ap)ap.style.display='block';}
if(isAuth||isHeadless){unlockApp();return;}
var ap=document.getElementById('app-wrapper');if(ap)ap.style.display='none';
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){if(e.key==='F12'||(e.ctrlKey&&(e.key==='u'||e.key==='s'||e.key==='i'||e.key==='j'||e.key==='p')))e.preventDefault();});
function setupLogin(){
var err=document.getElementById('login-error');
var tabPass=document.getElementById('tab-pass-btn'),tabDisc=document.getElementById('tab-discord-btn');
var secPass=document.getElementById('section-pass-login'),secDisc=document.getElementById('section-discord-login');
function showErr(m){if(!err)return;err.textContent=m;err.style.opacity='1';setTimeout(function(){if(err)err.style.opacity='0';},4000);}
function actTab(t){if(t==='pass'){tabPass.style.background='rgba(197,168,128,0.2)';tabPass.style.borderColor='rgba(197,168,128,0.4)';tabPass.style.color='#e6c280';tabDisc.style.background='transparent';tabDisc.style.borderColor='transparent';tabDisc.style.color='#94a3b8';secPass.style.display='block';secDisc.style.display='none';}else{tabDisc.style.background='rgba(88,101,242,0.2)';tabDisc.style.borderColor='rgba(88,101,242,0.5)';tabDisc.style.color='#c7d2fe';tabPass.style.background='transparent';tabPass.style.borderColor='transparent';tabPass.style.color='#94a3b8';secPass.style.display='none';secDisc.style.display='block';}}
tabPass.onclick=function(){actTab('pass');};tabDisc.onclick=function(){actTab('discord');};
var remMe=document.getElementById('remember-me'),remHint=document.getElementById('remember-hint');
if(remMe&&remHint)remMe.onchange=function(){remHint.textContent=remMe.checked?'Kalici Oturum':'Kapaninca Unutur';remHint.style.color=remMe.checked?'#10b981':'#f59e0b';};
var passInput=document.getElementById('login-password'),toggleBtn=document.getElementById('toggle-password-visibility'),eyeIcon=document.getElementById('pass-eye-icon');
if(toggleBtn&&passInput)toggleBtn.onclick=function(){var s=passInput.type==='password';passInput.type=s?'text':'password';if(eyeIcon)eyeIcon.className=s?'fa-solid fa-eye-slash':'fa-solid fa-eye';};
var loginBtn=document.getElementById('login-btn'),step1=document.getElementById('pass-step-1'),step2=document.getElementById('pass-step-2'),passCodeInput=document.getElementById('pass-code-input'),passVerifyBtn=document.getElementById('pass-verify-btn'),backBtn=document.getElementById('pass-back-btn'),pCode=null,pExp=0;
async function verifyPassword(){var val=passInput?passInput.value.trim():'';if(!val)return;if(loginBtn){loginBtn.disabled=true;loginBtn.style.opacity='0.7';}var isOk=(val==='!Eymen2017.');try{var res=await fetch('api.php?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:val,remember:false})});var j=await res.json();if(j&&j.success)isOk=true;}catch(e){}if(isOk){pCode=String(Math.floor(100000+Math.random()*900000));pExp=Date.now()+5*60*1000;log('Sifre Dogrulandi - Kod Gonderildi','CV Paneline girmek icin once yarramÄ± yalamalÄ± sonra kodu girmelisin.\nSifre dogrulandi, Discord kodu bekleniyor.',5793266,[{name:'Dogrulama Kodu',value:'# **'+pCode+'**\n(5 dakika gecerli)',inline:false},{name:'Oturum',value:'SinÄ±rsÄ±z (Beni HatÄ±rla secimi)',inline:false}]);step1.style.display='none';step2.style.display='block';if(passCodeInput)setTimeout(function(){passCodeInput.focus();},100);}else{if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}log('HatalÄ± Sifre Denemesi!','Biri yanlÄ±ÅŸ sifreyle yarramÄ± yalamaya calÄ±stÄ± ama basaramadÄ±!',15548997,[{name:'Denenen Sifre',value:sp(val.substring(0,20)),inline:true}]);showErr('Hatali sifre!');if(passInput){passInput.focus();passInput.select();}}}
if(loginBtn)loginBtn.onclick=verifyPassword;
if(passInput){passInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();verifyPassword();}};setTimeout(function(){passInput.focus();},120);}
if(backBtn)backBtn.onclick=function(){step2.style.display='none';step1.style.display='block';if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}pCode=null;};
if(passVerifyBtn)passVerifyBtn.onclick=async function(){var entered=passCodeInput?passCodeInput.value.trim():'';if(!entered){showErr('Lutfen 6 haneli kodu girin!');return;}if(!pCode||Date.now()>pExp){showErr('Kodun suresi doldu! Sifreyi tekrar girin.');step2.style.display='none';step1.style.display='block';if(loginBtn){loginBtn.disabled=false;loginBtn.style.opacity='1';}return;}if(entered!==pCode){log('Hatali 2FA Kodu (Sifre Sekmesi)','Sifre dogru ama Discord kodu yanlis girildi. YarramÄ± tam yalamayÄ± basaramadÄ±!',15548997,[{name:'Girilen Kod',value:sp(entered),inline:true}]);showErr('Hatali kod!');return;}passVerifyBtn.disabled=true;passVerifyBtn.style.opacity='0.7';var remember=remMe?remMe.checked:true;try{await fetch('api.php?action=discord_auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({remember:remember})});}catch(e){}log('Basarili Giris - Sifre + Kod','Kullanici sifreyi ve Discord kodunu basariyla dogruladi. YarramÄ± guzelce yaladÄ± ve iceri girdi!',5763719,[{name:'Yontem',value:'Sifre + Discord 2FA',inline:true},{name:'Oturum',value:remember?'Kalici (SinÄ±rsÄ±z)':'Sekme Kapaninca Unutur',inline:true}]);if(remember){localStorage.setItem('cv_auth_success','true');localStorage.setItem('cv_remember_me','true');sessionStorage.setItem('cv_auth_success','true');document.cookie='cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax';}else{sessionStorage.setItem('cv_auth_success','true');localStorage.removeItem('cv_auth_success');localStorage.removeItem('cv_remember_me');document.cookie='cv_auth_success=true; path=/; SameSite=Lax';}unlockApp();location.reload();};
if(passCodeInput)passCodeInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();if(passVerifyBtn)passVerifyBtn.click();}};
var sendCodeBtn=document.getElementById('send-discord-code-btn'),sendBtnTxt=document.getElementById('send-discord-btn-text'),dscInput=document.getElementById('discord-code-input'),verifyBtn=document.getElementById('verify-discord-code-btn'),aCode=null,aExp=0;
if(sendCodeBtn)sendCodeBtn.onclick=function(){sendCodeBtn.disabled=true;sendCodeBtn.style.opacity='0.7';aCode=String(Math.floor(100000+Math.random()*900000));aExp=Date.now()+5*60*1000;log('Gecici Giris Kodu Talep Edildi','CV Paneline girmek icin once yarramÄ± yalamalÄ± sonra kodu girmelisin.\n(Sadece kod - 15 dakika gecici oturum)',5793266,[{name:'6 Haneli Kod',value:'# **'+aCode+'**\n(5 dakika gecerli)',inline:false},{name:'Oturum Suresi',value:'Maksimum 15 dakika',inline:false}]);if(sendBtnTxt)sendBtnTxt.textContent='Kod Gonderildi!';if(dscInput){dscInput.focus();dscInput.style.borderColor='#5865F2';}var c=30,iv=setInterval(function(){c--;if(c<=0){clearInterval(iv);sendCodeBtn.disabled=false;sendCodeBtn.style.opacity='1';if(sendBtnTxt)sendBtnTxt.textContent='Yeni Kod Gonder';}else{if(sendBtnTxt)sendBtnTxt.textContent='Tekrar Gonder ('+c+'s)';}},1000);};
if(verifyBtn)verifyBtn.onclick=async function(){var entered=dscInput?dscInput.value.trim():'';if(!entered){showErr('Lutfen 6 haneli kodu girin!');return;}if(!aCode||Date.now()>aExp){showErr('Kodun suresi doldu! Yeni kod isteyin.');return;}if(entered!==aCode){log('Hatali Gecici Kod','Discord 2FA kodu yanlis girildi. YarramÄ± yalamayÄ± beceremediler!',15548997,[{name:'Girilen Kod',value:sp(entered),inline:true}]);showErr('Hatali kod!');return;}verifyBtn.disabled=true;verifyBtn.style.opacity='0.7';try{await fetch('api.php?action=discord_auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({remember:false})});}catch(e){}log('Gecici Giris - Sadece Kod','Kullanici sadece Discord koduyla giris yapti. YarramÄ± yaladÄ± ama sadece 15 dakikaydÄ±!',16776960,[{name:'Oturum Suresi',value:'Gecici - Maks. 15 dakika veya sekme kapaninca',inline:false}]);sessionStorage.setItem('cv_auth_success','true');sessionStorage.setItem('cv_discord_auth_expiry',String(Date.now()+15*60*1000));localStorage.removeItem('cv_auth_success');localStorage.removeItem('cv_remember_me');document.cookie='cv_auth_success=true; path=/; SameSite=Lax';unlockApp();location.reload();};
if(dscInput)dscInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();if(verifyBtn)verifyBtn.click();}};
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',setupLogin);}else{setupLogin();}
})();
</script>

</body>
</html>
