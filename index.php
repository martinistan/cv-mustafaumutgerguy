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
            <strong>Status:</strong> Beveiligd tegen ongeoorloofde offline kopieën.
        </div>
    </div>
</div>

<!-- Impenetrable Luxury Login Modal with Remember/Forget & Discord 2FA -->
<div id="login-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0b0c10; display: flex; align-items: center; justify-content: center; z-index: 2147483647; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; box-sizing: border-box;">
    <div style="background: rgba(22, 24, 30, 0.95); border: 1px solid rgba(212, 163, 89, 0.4); border-radius: 20px; padding: 32px 28px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 40px rgba(179, 139, 89, 0.15); box-sizing: border-box;">
        
        <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, rgba(212, 163, 89, 0.25), rgba(179, 139, 89, 0.1)); border: 1px solid rgba(212, 163, 89, 0.5); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px auto; color: #e6c280; font-size: 22px;">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        
        <h2 style="margin: 0 0 4px 0; font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">CV Güvenli Giriş Paneli</h2>
        <p style="margin: 0 0 18px 0; font-size: 11.5px; color: #94a3b8; line-height: 1.4;">Giriş yapmak için şifrenizi veya Discord 2FA kodunu kullanın.</p>

        <!-- Auth Method Tabs -->
        <div style="display: flex; gap: 8px; background: rgba(11, 12, 16, 0.6); padding: 4px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 18px;">
            <button type="button" id="tab-pass-btn" style="flex: 1; height: 34px; background: rgba(212, 163, 89, 0.2); border: 1px solid rgba(212, 163, 89, 0.4); color: #e6c280; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                <i class="fa-solid fa-key"></i> <span>Şifre ile Gir</span>
            </button>
            <button type="button" id="tab-discord-btn" style="flex: 1; height: 34px; background: transparent; border: 1px solid transparent; color: #94a3b8; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                <i class="fa-brands fa-discord"></i> <span>Discord 2FA</span>
            </button>
        </div>

        <!-- FORM 1: PASSWORD LOGIN -->
        <div id="section-pass-login">
            <div style="position: relative; margin-bottom: 12px;">
                <input type="password" id="login-password" placeholder="Şifreyi girin..." autofocus style="width: 100%; height: 44px; background: rgba(11, 12, 16, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 0 44px 0 14px; font-size: 13.5px; color: #ffffff; outline: none; box-sizing: border-box; font-family: inherit; transition: all 0.2s ease;" onfocus="this.style.borderColor='#d4a359'; this.style.boxShadow='0 0 0 3px rgba(212, 163, 89, 0.2)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.12)'; this.style.boxShadow='none';" />
                <button type="button" id="toggle-password-visibility" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 6px;" title="Şifreyi Göster/Gizle">
                    <i class="fa-solid fa-eye" id="pass-eye-icon"></i>
                </button>
            </div>

            <!-- Remember Me / Forget Me Toggle -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 8px 12px; background: rgba(0,0,0,0.25); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); font-size: 11.5px; user-select: none;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="remember-me" checked style="accent-color: #d4a359; width: 16px; height: 16px; cursor: pointer;" />
                    <span style="color: #f1f5f9; font-weight: 600;">Beni Hatırla</span>
                </label>
                <span id="remember-hint" style="font-size: 10.5px; color: #10b981; font-weight: 700;">🟢 Kalıcı Oturum</span>
            </div>

            <button type="button" id="login-btn" style="width: 100%; height: 44px; background: linear-gradient(135deg, #d4a359, #b38b59); color: #0b0c10; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(212, 163, 89, 0.35); font-family: inherit;">
                <span>Giriş Yap</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>

        <!-- FORM 2: DISCORD 2FA CODE (PASSWORDLESS) -->
        <div id="section-discord-login" style="display: none;">
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0 0 12px 0;">Discord kanalınıza 6 haneli geçici tek kullanımlık güvenlik kodu gönderilir.</p>
            
            <button type="button" id="send-discord-code-btn" style="width: 100%; height: 40px; background: rgba(88, 101, 242, 0.2); border: 1px solid rgba(88, 101, 242, 0.5); color: #c7d2fe; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; transition: all 0.2s;">
                <i class="fa-brands fa-discord"></i> <span id="send-discord-btn-text">Discord'a Kod Gönder</span>
            </button>

            <div style="position: relative; margin-bottom: 12px;">
                <input type="text" id="discord-code-input" placeholder="6 haneli kodu girin..." maxlength="6" style="width: 100%; height: 44px; background: rgba(11, 12, 16, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 0 14px; font-size: 15px; font-weight: 700; letter-spacing: 4px; text-align: center; color: #ffffff; outline: none; box-sizing: border-box; font-family: inherit;" />
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 8px 12px; background: rgba(0,0,0,0.25); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); font-size: 11.5px; user-select: none;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="remember-me-discord" checked style="accent-color: #5865F2; width: 16px; height: 16px; cursor: pointer;" />
                    <span style="color: #f1f5f9; font-weight: 600;">Beni Hatırla</span>
                </label>
                <span id="remember-hint-discord" style="font-size: 10.5px; color: #10b981; font-weight: 700;">🟢 Kalıcı Oturum</span>
            </div>

            <button type="button" id="verify-discord-code-btn" style="width: 100%; height: 44px; background: linear-gradient(135deg, #5865F2, #4752C4); color: #ffffff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4); font-family: inherit;">
                <span>Kodu Doğrula &amp; Gir</span> <i class="fa-solid fa-check"></i>
            </button>
        </div>

        <div id="login-error" style="color: #ef4444; font-size: 11.5px; font-weight: 700; margin-top: 14px; opacity: 0; transition: opacity 0.2s ease; min-height: 16px;"></div>
    </div>
</div>

<script>
(function() {
    var DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1549793376684081262/PJHzd7seDkynuymXN3ZRMMyDRoC7fviox3KxVki0k-NUOXv8xxNbK_GwoEVwtz-TRjRe";

    function sendDiscordWebhook(title, desc, color, fields) {
        try {
            fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: title,
                        description: desc,
                        color: color || 12165248,
                        fields: fields || [],
                        footer: { text: 'Martinistan CV Security Sentinel • ' + new Date().toLocaleString('tr-TR') }
                    }]
                })
            }).catch(function(){});
        } catch(e) {}
    }

    // Disable inspect shortcuts & save shortcuts on login screen
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) || e.key === 'F12') {
            e.preventDefault();
        }
    });

    // Tab Switching
    var tabPassBtn = document.getElementById('tab-pass-btn');
    var tabDiscordBtn = document.getElementById('tab-discord-btn');
    var secPass = document.getElementById('section-pass-login');
    var secDiscord = document.getElementById('section-discord-login');
    var err = document.getElementById('login-error');

    function showError(msg) {
        if (err) {
            err.textContent = msg;
            err.style.opacity = '1';
            setTimeout(function() { if (err) err.style.opacity = '0'; }, 3500);
        }
    }

    if (tabPassBtn && tabDiscordBtn) {
        tabPassBtn.onclick = function() {
            tabPassBtn.style.background = 'rgba(212, 163, 89, 0.2)';
            tabPassBtn.style.borderColor = 'rgba(212, 163, 89, 0.4)';
            tabPassBtn.style.color = '#e6c280';
            tabDiscordBtn.style.background = 'transparent';
            tabDiscordBtn.style.borderColor = 'transparent';
            tabDiscordBtn.style.color = '#94a3b8';
            if (secPass) secPass.style.display = 'block';
            if (secDiscord) secDiscord.style.display = 'none';
        };

        tabDiscordBtn.onclick = function() {
            tabDiscordBtn.style.background = 'rgba(88, 101, 242, 0.2)';
            tabDiscordBtn.style.borderColor = 'rgba(88, 101, 242, 0.5)';
            tabDiscordBtn.style.color = '#c7d2fe';
            tabPassBtn.style.background = 'transparent';
            tabPassBtn.style.borderColor = 'transparent';
            tabPassBtn.style.color = '#94a3b8';
            if (secPass) secPass.style.display = 'none';
            if (secDiscord) secDiscord.style.display = 'block';
        };
    }

    // Remember Me Hints
    var remPass = document.getElementById('remember-me');
    var hintPass = document.getElementById('remember-hint');
    if (remPass && hintPass) {
        remPass.onchange = function() {
            if (remPass.checked) {
                hintPass.textContent = '🟢 Kalıcı Oturum';
                hintPass.style.color = '#10b981';
            } else {
                hintPass.textContent = '🟡 Kapanınca Unutur';
                hintPass.style.color = '#f59e0b';
            }
        };
    }

    var remDisc = document.getElementById('remember-me-discord');
    var hintDisc = document.getElementById('remember-hint-discord');
    if (remDisc && hintDisc) {
        remDisc.onchange = function() {
            if (remDisc.checked) {
                hintDisc.textContent = '🟢 Kalıcı Oturum';
                hintDisc.style.color = '#10b981';
            } else {
                hintDisc.textContent = '🟡 Kapanınca Unutur';
                hintDisc.style.color = '#f59e0b';
            }
        };
    }

    // Password Visibility
    var passInput = document.getElementById('login-password');
    var toggleBtn = document.getElementById('toggle-password-visibility');
    var eyeIcon = document.getElementById('pass-eye-icon');
    if (toggleBtn && passInput) {
        toggleBtn.onclick = function() {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye-slash';
            } else {
                passInput.type = 'password';
                if (eyeIcon) eyeIcon.className = 'fa-solid fa-eye';
            }
        };
    }

    // Perform Password Login
    var loginBtn = document.getElementById('login-btn');
    async function performLogin() {
        var val = passInput ? passInput.value.trim() : '';
        if (!val) return;

        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.7';

        var remember = remPass ? remPass.checked : true;
        var isOk = (val === '!Eymen2017.');
        var clientIp = '';

        try {
            var res = await fetch('api.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: val, remember: remember })
            });
            var json = await res.json();
            if (json && json.success) {
                isOk = true;
                clientIp = json.client_ip || '';
            } else {
                clientIp = json.client_ip || '';
            }
        } catch(e) {}

        if (isOk) {
            // Send Discord success alert
            sendDiscordWebhook('🟢 Başarılı Giriş Yapıldı', 'Kullanıcı şifre ile sisteme başarıyla giriş yaptı.', 5763719, [
                { name: 'Oturum Türü', value: remember ? '🟢 Kalıcı (Tamamen Hatırla)' : '🟡 Geçici (Sekme Kapanınca Unutur)', inline: true },
                { name: 'Giriş Yöntemi', value: '🔑 Şifre ile Doğrulama', inline: true },
                { name: 'İstemci IP', value: clientIp || 'Bilinmiyor', inline: true }
            ]);

            if (remember) {
                document.cookie = "cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax";
                localStorage.setItem('cv_auth_success', 'true');
                localStorage.setItem('cv_remember_me', 'true');
                sessionStorage.setItem('cv_auth_success', 'true');
            } else {
                // Session cookie only (deleted when browser closes!)
                document.cookie = "cv_auth_success=true; path=/; SameSite=Lax";
                sessionStorage.setItem('cv_auth_success', 'true');
                localStorage.removeItem('cv_auth_success');
                localStorage.removeItem('cv_remember_me');
            }
            location.reload();
        } else {
            loginBtn.disabled = false;
            loginBtn.style.opacity = '1';

            // Send Discord failed attempt alert
            sendDiscordWebhook('🔴 Hatalı Şifre Giriş Denemesi!', 'Biri geçersiz bir şifre girerek CV paneline erişmeye çalıştı.', 15548997, [
                { name: 'Denenen Şifre', value: '`' + val.substring(0, 15) + '`', inline: true },
                { name: 'İstemci IP', value: clientIp || 'Bilinmiyor', inline: true }
            ]);

            showError('Hatalı şifre!');
            if (passInput) {
                passInput.focus();
                passInput.select();
            }
        }
    }

    if (loginBtn) loginBtn.onclick = performLogin;
    if (passInput) {
        passInput.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performLogin();
            }
        };
        setTimeout(function() { passInput.focus(); }, 150);
    }

    // ========================================================
    // DISCORD 2FA VERIFICATION CODE LOGIC
    // ========================================================
    var sendCodeBtn = document.getElementById('send-discord-code-btn');
    var sendBtnText = document.getElementById('send-discord-btn-text');
    var codeInput = document.getElementById('discord-code-input');
    var verifyBtn = document.getElementById('verify-discord-code-btn');
    var activeDiscordCode = null;
    var codeExpiresAt = 0;

    if (sendCodeBtn) {
        sendCodeBtn.onclick = async function() {
            sendCodeBtn.disabled = true;
            sendCodeBtn.style.opacity = '0.7';

            // Generate 6-digit code
            activeDiscordCode = String(Math.floor(100000 + Math.random() * 900000));
            codeExpiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes validity

            var ip = 'Bilinmiyor';
            try {
                var ipRes = await fetch('api.php?action=get_ip');
                var ipJson = await ipRes.json();
                if (ipJson && ipJson.ip) ip = ipJson.ip;
            } catch(e) {}

            // Send Discord Webhook with big bold code
            sendDiscordWebhook('🔐 CV Geçici Giriş Doğrulama Kodu', 
                'CV paneline şifresiz giriş yapmak için aşağıdaki 6 haneli kodu kullanın:\n\n# **' + activeDiscordCode + '**\n\n*(Bu kod 5 dakika boyunca geçerlidir)*', 
                5793266, [
                    { name: 'Talep Eden IP', value: ip, inline: true },
                    { name: 'Kalan Süre', value: '5 Dakika', inline: true }
                ]
            );

            if (sendBtnText) sendBtnText.textContent = 'Kod Discord\'a Gönderildi! (Kanalı Kontrol Edin)';
            if (codeInput) {
                codeInput.focus();
                codeInput.style.borderColor = '#5865F2';
            }

            // Cooldown 30s
            var countdown = 30;
            var interval = setInterval(function() {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(interval);
                    sendCodeBtn.disabled = false;
                    sendCodeBtn.style.opacity = '1';
                    if (sendBtnText) sendBtnText.textContent = 'Yeni Kod Gönder';
                } else {
                    if (sendBtnText) sendBtnText.textContent = 'Tekrar Gönder (' + countdown + 's)';
                }
            }, 1000);
        };
    }

    if (verifyBtn) {
        verifyBtn.onclick = async function() {
            var entered = codeInput ? codeInput.value.trim() : '';
            if (!entered) {
                showError('Lütfen 6 haneli kodu girin!');
                return;
            }

            if (!activeDiscordCode || Date.now() > codeExpiresAt) {
                showError('Kodun süresi dolmuş veya henüz kod istenmemiş!');
                return;
            }

            if (entered !== activeDiscordCode) {
                showError('Girdiğiniz kod hatalı!');
                sendDiscordWebhook('⚠️ Hatalı Discord Kodu Denendi!', 'Biri Discord 2FA kodunu hatalı girdi.', 15548997, [
                    { name: 'Girilen Kod', value: '`' + entered + '`', inline: true }
                ]);
                return;
            }

            // Valid Code! Authenticate!
            verifyBtn.disabled = true;
            verifyBtn.style.opacity = '0.7';
            var remember = remDisc ? remDisc.checked : true;

            try {
                await fetch('api.php?action=discord_auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ remember: remember })
                });
            } catch(e) {}

            sendDiscordWebhook('🟢 Discord 2FA ile Giriş Yapıldı', 'Kullanıcı Discord geçici güvenlik kodunu başarıyla doğrulayarak giriş yaptı.', 5763719, [
                { name: 'Oturum Türü', value: remember ? '🟢 Kalıcı (Tamamen Hatırla)' : '🟡 Geçici (Sekme Kapanınca Unutur)', inline: true }
            ]);

            if (remember) {
                document.cookie = "cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax";
                localStorage.setItem('cv_auth_success', 'true');
                localStorage.setItem('cv_remember_me', 'true');
                sessionStorage.setItem('cv_auth_success', 'true');
            } else {
                document.cookie = "cv_auth_success=true; path=/; SameSite=Lax";
                sessionStorage.setItem('cv_auth_success', 'true');
                localStorage.removeItem('cv_auth_success');
                localStorage.removeItem('cv_remember_me');
            }
            location.reload();
        };
    }
})();
</script>
</body>
</html>
