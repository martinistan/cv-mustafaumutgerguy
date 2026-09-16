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

<!-- Impenetrable Luxury Login Modal -->
<div id="login-screen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0b0c10; display: flex; align-items: center; justify-content: center; z-index: 2147483647; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; box-sizing: border-box;">
    <div style="background: rgba(22, 24, 30, 0.95); border: 1px solid rgba(212, 163, 89, 0.4); border-radius: 18px; padding: 36px 32px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(179, 139, 89, 0.15); box-sizing: border-box;">
        <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, rgba(212, 163, 89, 0.25), rgba(179, 139, 89, 0.1)); border: 1px solid rgba(212, 163, 89, 0.5); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px auto; color: #e6c280; font-size: 24px;">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">CV &amp; Portfolio Girişi</h2>
        <p style="margin: 0 0 24px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">Bu portfolyoyu görüntülemek ve düzenlemek için lütfen erişim şifresini girin.</p>
        
        <div style="position: relative; margin-bottom: 14px;">
            <input type="password" id="login-password" placeholder="Şifreyi girin..." autofocus style="width: 100%; height: 46px; background: rgba(11, 12, 16, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 0 44px 0 14px; font-size: 13.5px; color: #ffffff; outline: none; box-sizing: border-box; font-family: inherit; transition: all 0.2s ease;" onfocus="this.style.borderColor='#d4a359'; this.style.boxShadow='0 0 0 3px rgba(212, 163, 89, 0.2)';" onblur="this.style.borderColor='rgba(255, 255, 255, 0.12)'; this.style.boxShadow='none';" />
            <button type="button" id="toggle-password-visibility" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 6px;" title="Şifreyi Göster/Gizle">
                <i class="fa-solid fa-eye" id="pass-eye-icon"></i>
            </button>
        </div>

        <button type="button" id="login-btn" style="width: 100%; height: 46px; background: linear-gradient(135deg, #d4a359, #b38b59); color: #0b0c10; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(212, 163, 89, 0.35); font-family: inherit;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 20px rgba(212, 163, 89, 0.5)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 15px rgba(212, 163, 89, 0.35)';">
            <span>Giriş Yap</span> <i class="fa-solid fa-arrow-right"></i>
        </button>

        <div id="login-error" style="color: #ef4444; font-size: 11.5px; font-weight: 700; margin-top: 14px; opacity: 0; transition: opacity 0.2s ease; min-height: 16px;"></div>
    </div>
</div>

<script>
(function() {
    // Disable inspect shortcuts & save shortcuts on login screen
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) || e.key === 'F12') {
            e.preventDefault();
        }
    });

    var passInput = document.getElementById('login-password');
    var btn = document.getElementById('login-btn');
    var err = document.getElementById('login-error');
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

    async function performLogin() {
        var val = passInput ? passInput.value.trim() : '';
        if (!val) return;

        btn.disabled = true;
        btn.style.opacity = '0.7';

        var isOk = (val === '!Eymen2017.');
        try {
            var res = await fetch('api.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: val })
            });
            var json = await res.json();
            if (json && json.success) isOk = true;
        } catch(e) {}

        if (isOk) {
            document.cookie = "cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax";
            localStorage.setItem('cv_auth_success', 'true');
            sessionStorage.setItem('cv_auth_success', 'true');
            location.reload();
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            if (err) {
                err.textContent = 'Hatalı şifre!';
                err.style.opacity = '1';
                setTimeout(function() { if (err) err.style.opacity = '0'; }, 3000);
            }
            if (passInput) {
                passInput.focus();
                passInput.select();
            }
        }
    }

    if (btn) btn.onclick = performLogin;
    if (passInput) {
        passInput.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performLogin();
            }
        };
        setTimeout(function() { passInput.focus(); }, 150);
    }
})();
</script>
</body>
</html>
