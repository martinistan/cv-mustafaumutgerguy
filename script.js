document.addEventListener('DOMContentLoaded', () => {
    if (typeof CV_CONFIG === 'undefined') return;
    const $ = id => document.getElementById(id);

    // ─── LOGOUT (tanımla — startApp beklenmez) ───────────────────────────────
    window.performLogout = async (skipConfirm) => {
        if (!skipConfirm && !confirm('Oturumu kapatmak istediğinize emin misiniz?\n\nYeniden giriş yapmak için şifre veya Discord 2FA kodu gerekecek.')) return;

        try {
            await fetch('api.php?action=logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch(e) {}

        localStorage.removeItem('cv_auth_success');
        localStorage.removeItem('cv_remember_me');
        sessionStorage.removeItem('cv_auth_success');
        sessionStorage.removeItem('cv_discord_auth_expiry');
        document.cookie = 'cv_auth_success=; max-age=0; path=/; SameSite=Lax';

        const toastEl = document.getElementById('cv-toast');
        if (toastEl) {
            toastEl.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> <span>Güvenli çıkış yapıldı. Yönlendiriliyorsunuz...</span>';
            toastEl.classList.add('show');
        }
        setTimeout(() => { location.reload(); }, 1200);
    };

    // ─── DİSCORD 2FA 15 DAKİKA OTOMATİK ÇIKIŞ ───────────────────────────────
    (function checkDiscordSessionExpiry() {
        var expiry = sessionStorage.getItem('cv_discord_auth_expiry');
        if (!expiry) return;
        var remaining = parseInt(expiry, 10) - Date.now();
        if (remaining <= 0) {
            // Süre zaten dolmuş, hemen çıkış
            window.performLogout(true);
            return;
        }
        // Kalan süre kadar bekle sonra otomatik çıkış
        setTimeout(function() {
            if (sessionStorage.getItem('cv_discord_auth_expiry')) {
                window.performLogout(true);
            }
        }, remaining);
    })();
    // ─────────────────────────────────────────────────────────────────────────

    const startApp = () => {
        const getProfileFromHash = () => {
            const h = (window.location.hash || '').toLowerCase();
            if (h === '#student') return 'student';
            if (h === '#bk' || h === '#boekhouder' || h === '#boekhoudkundigassistent') return 'boekhoudkundigassistent';
            return null;
        };

        const syncHashWithProfile = (key) => {
            const targetHash = (key === 'student') ? '#student' : '#bk';
            if (window.location.hash !== targetHash) {
                history.replaceState(null, '', targetHash);
            }
        };

        const hashProfile = getProfileFromHash();
        let activeKey = hashProfile || localStorage.getItem('activeProfile') || CV_CONFIG.activeProfile || 'boekhoudkundigassistent';
        if (activeKey === 'umut') {
            activeKey = 'boekhoudkundigassistent';
            localStorage.setItem('activeProfile', activeKey);
        }
        const baseProfiles = window.CV_PROFILES_DATA || {};
        if (!window.FACTORY_DEFAULTS) {
            window.FACTORY_DEFAULTS = JSON.parse(JSON.stringify(baseProfiles));
        }
        
        let liveData = JSON.parse(localStorage.getItem('cv_profiles')) || {};
        let draftData = JSON.parse(localStorage.getItem('cv_profiles_draft'));

        Object.keys(baseProfiles).forEach(k => { 
            if (!liveData[k]) liveData[k] = JSON.parse(JSON.stringify(baseProfiles[k])); 
            if (draftData && !draftData[k]) draftData[k] = JSON.parse(JSON.stringify(baseProfiles[k]));
        });

        if (!draftData) { 
            draftData = JSON.parse(JSON.stringify(liveData)); 
            localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData)); 
        }
        
        let editMode = localStorage.getItem('cv_edit_mode') === 'true';
        let showHidden = localStorage.getItem('cv_show_hidden') === 'true';
        let profileData = editMode ? draftData : liveData;
        
        let updateBackupUI = null;
        const syncFromMySQL = async (isManual = false) => {
            try {
                const res = await fetch('api.php?action=get_data');
                const json = await res.json();
                if (json && json.success && json.data && typeof json.data === 'object' && Object.keys(json.data).length > 0) {
                    let updated = false;
                    Object.keys(json.data).forEach(k => {
                        liveData[k] = json.data[k];
                        updated = true;
                    });
                    if (json.activeProfile && !getProfileFromHash() && !localStorage.getItem('activeProfile_custom')) {
                        if (liveData[json.activeProfile]) {
                            activeKey = json.activeProfile;
                        }
                    }
                    if (updated) {
                        localStorage.setItem('cv_profiles', JSON.stringify(liveData));
                        if (!editMode) {
                            profileData = liveData;
                            renderCV();
                        }
                    }
                    if (isManual) {
                        window.showToast('☁️ MySQL canlı verileri başarıyla çekildi ve yüklendi!', 'fa-solid fa-cloud-arrow-down');
                        if (typeof updateBackupUI === 'function') updateBackupUI();
                    }
                } else if (isManual) {
                    window.showToast('MySQL sunucusunda henüz kayıtlı veri yok.', 'fa-solid fa-circle-info');
                }
            } catch(e) {
                if (isManual) {
                    window.showToast('MySQL sunucusuna bağlanılamadı!', 'fa-solid fa-triangle-exclamation');
                }
            }
        };
        syncFromMySQL();

        if (!profileData[activeKey]) activeKey = Object.keys(profileData).find(k => k !== 'umut') || 'boekhoudkundigassistent';

        const getDisplayName = (key) => {
            if (key === 'boekhoudkundigassistent') return 'Boekhoudkundig Assistent';
            if (key === 'student') return 'Student';
            return key.charAt(0).toUpperCase() + key.slice(1);
        };

        let historyStack=[]; let historyPointer=-1; let isUndoingRedoing=false;
        const pushHistory=()=>{if(isUndoingRedoing)return;const d=JSON.stringify(profileData);if(historyPointer<historyStack.length-1)historyStack=historyStack.slice(0,historyPointer+1);historyStack.push(d);if(historyStack.length>50)historyStack.shift();historyPointer=historyStack.length-1;updateHistoryUI();};
        const initHistory=()=>{historyStack=[JSON.stringify(profileData)];historyPointer=0;updateHistoryUI();};
        const updateHistoryUI=()=>{const u=$('undo-btn'),r=$('redo-btn');if(!u||!r)return;u.disabled=historyPointer<=0;u.style.opacity=u.disabled?'0.4':'1';r.disabled=historyPointer>=historyStack.length-1;r.style.opacity=r.disabled?'0.4':'1';};
        
        let autoDutchFix = localStorage.getItem('cv_auto_dutch_fix') !== 'false';
        const cleanDutchChars = (text) => {
            if (typeof text !== 'string') return text;
            return text.replace(/İ/g, 'I').replace(/ı/g, 'i');
        };
        const deepCleanDutch = (obj) => {
            if (!obj) return obj;
            if (typeof obj === 'string') return cleanDutchChars(obj);
            if (Array.isArray(obj)) return obj.map(deepCleanDutch);
            if (typeof obj === 'object') {
                const res = {};
                for (const k of Object.keys(obj)) {
                    res[k] = deepCleanDutch(obj[k]);
                }
                return res;
            }
            return obj;
        };

        const syncCurrentStateToStorage=()=>{
            if(editMode){draftData=profileData;localStorage.setItem('cv_profiles_draft',JSON.stringify(draftData));}
            else{liveData=profileData;localStorage.setItem('cv_profiles',JSON.stringify(liveData));}
        };
        const commitData=()=>{
            if (editMode && autoDutchFix && profileData && profileData[activeKey]) {
                profileData[activeKey] = deepCleanDutch(profileData[activeKey]);
            }
            syncCurrentStateToStorage();
            pushHistory();
        };

        window.appUndo=()=>{if(historyPointer>0){isUndoingRedoing=true;historyPointer--;profileData=JSON.parse(historyStack[historyPointer]);syncCurrentStateToStorage();renderCV();updateHistoryUI();isUndoingRedoing=false;}};
        window.appRedo=()=>{if(historyPointer<historyStack.length-1){isUndoingRedoing=true;historyPointer++;profileData=JSON.parse(historyStack[historyPointer]);syncCurrentStateToStorage();renderCV();updateHistoryUI();isUndoingRedoing=false;}};
        
        window.showToast = (msg, icon = 'fa-solid fa-check') => {
            let t = document.getElementById('cv-toast');
            if (!t) {
                t = document.createElement('div');
                t.id = 'cv-toast';
                t.className = 'cv-toast';
                document.body.appendChild(t);
            }
            t.innerHTML = `<i class="${icon}"></i> <span>${msg}</span>`;
            t.classList.add('show');
            clearTimeout(window.cvToastTimer);
            window.cvToastTimer = setTimeout(() => {
                t.classList.remove('show');
            }, 3500);
        };

        window.publishEdits = async () => {
            if (!confirm('Tüm değişiklikler MySQL veritabanına ve canlı siteye kaydedilip yayınlansın mı?\n\n(Siteyi ziyaret eden tüm kullanıcılar ve cihazlar bu sürümü görecek)')) return;
            
            const btn = $('publish-btn');
            const originalHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Kaydediliyor...</span>';
            }

            liveData = JSON.parse(JSON.stringify(draftData));
            localStorage.setItem('cv_profiles', JSON.stringify(liveData));

            // Auto-save local PC cookie backup whenever publishing to MySQL
            if (typeof saveCookieBackup === 'function') {
                saveCookieBackup('Canlı Yayına Alınan Sürüm (' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ')', true);
            }

            try {
                const res = await fetch('api.php?action=save_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profiles: liveData, activeProfile: activeKey })
                });
                const data = await res.json();
                if (data.success) {
                    window.showToast('Değişiklikler MySQL ve canlı siteye kaydedildi! 🚀', 'fa-solid fa-cloud-arrow-up');
                } else {
                    window.showToast('MySQL Uyarısı: ' + (data.error || 'Kaydedilemedi'), 'fa-solid fa-triangle-exclamation');
                }
            } catch(err) {
                window.showToast('Yerel kaydedildi (Sunucuya ulaşılamadı)', 'fa-solid fa-floppy-disk');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
                editMode = false;
                localStorage.setItem('cv_edit_mode', 'false');
                profileData = liveData;
                initHistory();
                updateEditUI();
                renderCV();
                if (typeof updateBackupUI === 'function') updateBackupUI();
            }
        };

        window.revertDraft = () => {
            if (confirm('Taslaktaki değişiklikler silinsin ve canlı sürüme dönülsün mü?')) {
                draftData = JSON.parse(JSON.stringify(liveData));
                localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData));
                profileData = liveData;
                editMode = false;
                localStorage.setItem('cv_edit_mode', 'false');
                initHistory();
                updateEditUI();
                renderCV();
                window.showToast('Canlı sürüme dönüldü.', 'fa-solid fa-rotate-left');
            }
        };
        
        window.addNewProfile = () => {
            const name = prompt("Yeni profil adı (Örn: ahmet):");
            if (!name) return;
            const key = name.toLowerCase().replace(/\s+/g, '_');
            if (profileData[key]) { alert("Bu isimde bir profil zaten var!"); return; }
            profileData[key] = JSON.parse(JSON.stringify(profileData[activeKey]));
            profileData[key].profile.firstName = name; profileData[key].profile.lastName = "";
            commitData(); activeKey = key; localStorage.setItem('activeProfile', activeKey); renderCV();
        };

        window.deleteCurrentProfile = () => {
            if (Object.keys(profileData).length <= 1) { alert("Son profili silemezsiniz!"); return; }
            if (confirm(`${activeKey} profilini silmek istediğinize emin misiniz?`)) {
                delete profileData[activeKey]; activeKey = Object.keys(profileData)[0];
                localStorage.setItem('activeProfile', activeKey); commitData(); renderCV();
            }
        };
        
        window.exportProfileJS = () => {
            const data = profileData[activeKey];
            const content = `window.CV_PROFILES_DATA = window.CV_PROFILES_DATA || {};\nwindow.CV_PROFILES_DATA.${activeKey} = ${JSON.stringify(data, null, 4)};`;
            const blob = new Blob([content], {type: "text/javascript"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${activeKey}.js`; a.click();
            alert(`Dosya indirildi: ${activeKey}.js\nBu dosyayı config/users/ klasörüne atarak kalıcı hale getirebilirsiniz.`);
        };

        const starsHtml=(val)=>Array.from({length:3},(_,i)=>{let c=val>=i+1?'fa-solid fa-star':(val>=i+0.5?'fa-solid fa-star-half-stroke':'fa-regular fa-star');return `<i class="${c}" style="font-size:8px;color:var(--accent);margin-right:1.5px;width:8px;"></i>`;}).join('');
        const setPath=(obj,path,value)=>{
            const p=path.split('.');let c=obj;for(let i=0;i<p.length-1;i++){if(!c[p[i]])c[p[i]]={};c=c[p[i]];}c[p[p.length-1]]=value;
        };
        const getPath=(obj,path)=>{
            if(!obj||!path)return undefined;
            const p=path.split('.');let c=obj;
            for(let i=0;i<p.length;i++){
                if(c===null||c===undefined||typeof c!=='object')return undefined;
                c=c[p[i]];
            }
            return c;
        };
        const toggleSec=(cfg,id)=>{
            const el=$(id);if(!el)return;const isV=(cfg&&cfg.visible!==false);const show=isV||(editMode&&showHidden);el.style.display=show?'block':'none';
            const row=el.closest('[class^="grid-row-"]');
            if(row){
                const secs=Array.from(row.children).filter(s=>s.tagName==='SECTION');const vis=secs.filter(s=>s.style.display!=='none');
                row.style.display=vis.length>0?'grid':'none';
                if(vis.length===1){row.classList.add('single-column');row.style.gridTemplateColumns='100%';}
                else{row.classList.remove('single-column');row.style.gridTemplateColumns='50% 50%';}
            }
        };

        const addSectionControls=(key,id)=>{
            const sec=$(id);if(!sec)return;const ex=sec.querySelector('.section-edit-actions');if(ex)ex.remove();
            const C=profileData[activeKey];const cfg=C[key]||{visible:false};if(!editMode)return;
            const actions=document.createElement('div');actions.className='section-edit-actions no-print';
            const hideBtn=document.createElement('button');hideBtn.className=`section-edit-btn ${!cfg.visible?'active':''}`;
            hideBtn.innerHTML=cfg.visible?`<i class="fa-solid fa-eye-slash"></i>`:`<i class="fa-solid fa-eye"></i>`;
            hideBtn.onclick=(e)=>{e.stopPropagation();cfg.visible=!cfg.visible;commitData();renderCV();};
            actions.appendChild(hideBtn);
            if(key==='werkervaring'||key.startsWith('extra')){
                const typeBtn=document.createElement('button');typeBtn.className='section-edit-btn';typeBtn.innerHTML=`<i class="fa-solid fa-boxes-stacked"></i>`;
                typeBtn.onclick=(e)=>{e.stopPropagation();const types=['text','items','skills','stars'];let idx=types.indexOf(cfg.type||'text');cfg.type=types[(idx+1)%types.length];if((cfg.type==='items'||cfg.type==='skills'||cfg.type==='stars')&&!Array.isArray(cfg.items))cfg.items=[{year:"2026",school:"YENİ",desc:"AÇIKLAMA",name:"YENİ",badge:"İYİ",stars:3}];commitData();renderCV();};
                actions.appendChild(typeBtn);
            }
            if(cfg.items&&Array.isArray(cfg.items)){
                const addBtn=document.createElement('button');addBtn.className='section-edit-btn';addBtn.innerHTML=`<i class="fa-solid fa-plus"></i>`;
                addBtn.onclick=(e)=>{e.stopPropagation();if(key==='softSkills'||key==='languages')cfg.items.push({name:"YENİ",badge:"İYİ",stars:3});else cfg.items.push({year:"2026",school:"YENİ",desc:"DESC"});commitData();renderCV();};
                actions.appendChild(addBtn);
                const rmBtn=document.createElement('button');rmBtn.className='section-edit-btn';rmBtn.innerHTML=`<i class="fa-solid fa-minus"></i>`;
                rmBtn.onclick=(e)=>{e.stopPropagation();if(cfg.items.length>0){cfg.items.pop();commitData();renderCV();}};
                actions.appendChild(rmBtn);
            }
            sec.appendChild(actions);
        };

        const renderSectionTitle = (cfg, id, defaultIcon) => {
            const t = $(id + '-title');
            if (!t) return;
            if (!cfg.title) { t.style.display = 'none'; return; }
            t.style.display = 'flex';
            const iconCls = cfg.icon || (defaultIcon.startsWith('fa-') ? 'fa-solid ' + defaultIcon : defaultIcon);
            const secKey = id.replace('-sec', '');
            const editAttr = editMode ? `data-icon-path="${secKey}.icon" title="İkonu Değiştirmek İçin Tıklayın"` : '';
            t.innerHTML = `<i class="${iconCls}" ${editAttr}></i> <span data-path="${secKey}.title">${cfg.title}</span>`;
        };

        const renderCV=()=>{
            const C=profileData[activeKey];if(!C)return;
            syncHashWithProfile(activeKey);
            const r=document.documentElement.style;
            r.setProperty('--accent',C.theme.accent);r.setProperty('--accent-dim',C.theme.accentDim);
            r.setProperty('--accent-bg',C.theme.accentBg);r.setProperty('--accent-text',C.theme.accentText);
            const container=document.querySelector('.cv-container');
            container.className = 'cv-container theme-' + activeKey;
            $('first-name').textContent=C.profile.firstName.toUpperCase();$('last-name').textContent=C.profile.lastName.toUpperCase();
            $('first-name').setAttribute('data-path','profile.firstName');$('last-name').setAttribute('data-path','profile.lastName');

            if ($('role-subtitle')) {
                const sub = C.profile.subtitle || (activeKey === 'student' ? 'Student' : 'Boekhoudkundig Assistent');
                $('role-subtitle').textContent = sub.toUpperCase();
                $('role-subtitle').setAttribute('data-path', 'profile.subtitle');
                $('role-subtitle').style.display = sub ? 'block' : 'none';
            }

            const toggleBtn = $('profile-toggle');
            if (toggleBtn) {
                const span = $('current-profile-name') || toggleBtn.querySelector('span');
                if (span) span.textContent = `Sayfa: ${getDisplayName(activeKey)}`;
            }

            const dlHeaderLabel = $('dl-header-label');
            if (dlHeaderLabel) {
                dlHeaderLabel.textContent = `${getDisplayName(activeKey).toUpperCase()} (DOKÜMAN & PDF)`;
            }
            const dlPdf = $('dl-umut-pdf');
            if (dlPdf) {
                const pdfName = (activeKey === 'student') ? 'Mustafa_Umut_Gerguy_student_cv.pdf' : 'Mustafa_Umut_Gerguy_cv.pdf';
                dlPdf.href = pdfName;
                dlPdf.download = pdfName;
            }
            const dlPng = $('dl-umut-png');
            if (dlPng) {
                const pngName = (activeKey === 'student') ? 'Mustafa_Umut_Gerguy_student_cv.png' : 'Mustafa_Umut_Gerguy_cv.png';
                dlPng.href = pngName;
                dlPng.download = pngName;
            }

            const contactInfo=document.querySelector('.contact-info');contactInfo.innerHTML='';
            const CL = C.contactLabels || {phone:"GSM", email:"E-MAIL", address:"ADRES", birth:"GEBOORTE", drivingLicense:"RIJBEWIJS", nationality:"NATIONALITEIT"};
            if(editMode){
                const addBtns=document.createElement('div');addBtns.className='sidebar-add-btns no-print';
                addBtns.innerHTML=`<button onclick="window.addContactRow('phone')">+ ${CL.phone}</button><button onclick="window.addContactRow('email')">+ ${CL.email}</button><button onclick="window.addContactRow('address')">+ ${CL.address}</button><button onclick="window.addContactRow('birth')">+ ${CL.birth||'GEBOORTE'}</button><button onclick="window.addContactRow('drivingLicense')">+ ${CL.drivingLicense||'RIJBEWIJS'}</button><button onclick="window.addContactRow('nationality')">+ ${CL.nationality||'NATIONALITEIT'}</button>`;
                contactInfo.appendChild(addBtns);
            }
            const addContactRow=(icon,value,path,href,canRemove,label,labelPath,isFieldVisible,visKey)=>{
                const isVisible = (isFieldVisible !== false);
                if(!value && !editMode) return; 
                if(!isVisible && !editMode) return;

                const row=document.createElement('div');
                row.className='contact-row'; row.style.padding = '3px 0';
                if(!isVisible && editMode){
                    row.style.opacity = '0.55';
                    row.style.border = '1px dashed var(--accent-dim)';
                    row.style.borderRadius = '3px';
                    row.style.padding = '2px 4px';
                }
                row.innerHTML=`<div class="contact-header" style="gap:4px; display:flex; align-items:center; width:100%;">
                    <i class="fa-solid ${icon}" style="width:8px;"></i>
                    <div class="contact-label" style="font-size:6.5px;" ${editMode?`data-path="${labelPath}"`:''}>${label}</div>
                    ${editMode && visKey ? `
                        <button class="contact-toggle-vis no-print" onclick="window.toggleContactVisibility('${visKey}')" title="${isVisible?'Gizle':'Göster'}" style="margin-left:auto; background:none; border:none; color:var(--accent); cursor:pointer; font-size:7px; opacity:0.85; padding:0 2px;">
                            <i class="fa-solid ${isVisible?'fa-eye':'fa-eye-slash'}"></i>
                        </button>
                    `:''}
                </div>
                <div class="contact-body" style="gap:4px;">
                    <span class="contact-divider-vertical" style="font-size:8px;">|</span>
                    <div class="contact-value" style="font-size:7px; white-space: nowrap;"><span data-path="${path}">${value||'...'}</span></div>
                </div>
                ${editMode&&canRemove?`<button class="sidebar-row-rm no-print" onclick="window.removeContactRow('${path}')" style="margin-left:auto;"><i class="fa-solid fa-trash" style="font-size:6px;"></i></button>`:''}`;
                contactInfo.appendChild(row);
            };
            const cd=C.contact;
            if(cd.phone) addContactRow('fa-phone',cd.phone,'contact.phone',null,false,CL.phone, 'contactLabels.phone');
            Object.keys(cd).filter(k=>k.startsWith('phone') && k!=='phone').forEach(k=>{
                const n=k.replace('phone','');
                addContactRow('fa-phone',cd[k],'contact.'+k,null,true,CL.phone + ' ' + n, 'contactLabels.phone');
            });
            if(cd.email) addContactRow('fa-envelope',cd.email,'contact.email',null,false,CL.email, 'contactLabels.email');
            Object.keys(cd).filter(k=>k.startsWith('email') && k!=='email').forEach(k=>{
                const n=k.replace('email','');
                addContactRow('fa-envelope',cd[k],'contact.'+k,null,true,CL.email + ' ' + n, 'contactLabels.email');
            });
            if(cd.street) {
                const fullAddr = `${cd.street}, ${cd.zip ? cd.zip + ' ' : ''}${cd.city||''}`;
                addContactRow('fa-location-dot', fullAddr, 'contact.street', null, false, CL.address, 'contactLabels.address');
            }
            Object.keys(cd).filter(k=>k.startsWith('street') && k!=='street').forEach(k=>{
                const n=k.replace('street','');
                addContactRow('fa-location-dot',`${cd[k]}, ${cd['zip'+n] ? cd['zip'+n]+' ' : ''}${cd['city'+n]||''}`,'contact.'+k,null,true,CL.address + ' ' + n, 'contactLabels.address');
            });
            if(cd.birth) addContactRow('fa-calendar-days', cd.birth, 'contact.birth', null, false, CL.birth || 'GEBOORTE', 'contactLabels.birth', cd.birthVisible, 'birthVisible');
            if(cd.drivingLicense) addContactRow('fa-id-card', cd.drivingLicense, 'contact.drivingLicense', null, false, CL.drivingLicense || 'RIJBEWIJS', 'contactLabels.drivingLicense', cd.drivingLicenseVisible, 'drivingLicenseVisible');
            if(cd.nationality) addContactRow('fa-flag', cd.nationality, 'contact.nationality', null, false, CL.nationality || 'NATIONALITEIT', 'contactLabels.nationality', cd.nationalityVisible, 'nationalityVisible');

            window.toggleContactVisibility = (visKey) => {
                const contactData = profileData[activeKey].contact;
                contactData[visKey] = (contactData[visKey] === false) ? true : false;
                commitData();
                renderCV();
            };

            window.toggleCompanyPlaceholder = () => {
                const sb = profileData[activeKey].sollicitatiebrief;
                if (sb) {
                    sb.companyPlaceholderVisible = !sb.companyPlaceholderVisible;
                    commitData();
                    renderCV();
                }
            };

            window.addContactRow=(type)=>{
                if(type==='phone'){let n=2;while(cd['phone'+n])n++;cd['phone'+n]="+32 ...";}
                else if(type==='email'){let n=2;while(cd['email'+n])n++;cd['email'+n]="...@gmail.com";}
                else if(type==='address'){let n=2;while(cd['street'+n])n++;cd['street'+n]="Straat...";cd['zip'+n]="9000";cd['city'+n]="Gent";}
                else if(type==='birth'){cd.birth="18/05/2008"; cd.birthVisible=true;}
                else if(type==='drivingLicense'){cd.drivingLicense="Rijbewijs B"; cd.drivingLicenseVisible=true;}
                else if(type==='nationality'){cd.nationality="Belg"; cd.nationalityVisible=true;}
                commitData();renderCV();
            };
            window.removeContactRow=(path)=>{const key=path.replace('contact.','');delete cd[key];if(key.startsWith('street')){const n=key.replace('street','');delete cd['zip'+n];delete cd['city'+n];}commitData();renderCV();};

            const mobCfg = C.mobility;
            const mobSec = $('sidebar-mobility-sec');
            if (mobSec) {
                const isMobVis = mobCfg && mobCfg.visible !== false;
                mobSec.style.display = (isMobVis || (editMode && showHidden)) ? 'block' : 'none';
                const mobTitle = $('sidebar-mobility-title');
                if (mobTitle && mobCfg) {
                    mobTitle.textContent = mobCfg.title || "MOBILITEIT";
                }
                const mobList = $('sidebar-mobility-list');
                if (mobList && mobCfg && mobCfg.items) {
                    mobList.innerHTML = '';
                    mobCfg.items.forEach((item, idx) => {
                        const el = document.createElement('div');
                        el.className = 'sidebar-mobility-col';
                        const mobIconCls = item.icon || 'fa-solid fa-circle-check';
                        const mobEditAttr = editMode ? `data-icon-path="mobility.items.${idx}.icon" title="İkonu Değiştir"` : '';
                        const iconMarkup = item.svg ? `<div class="mob-svg-wrap" ${mobEditAttr}>${item.svg}</div>` : `<i class="${mobIconCls}" ${mobEditAttr}></i>`;
                        el.innerHTML = `
                            ${iconMarkup}
                            <span class="sidebar-mobility-name" ${editMode ? `data-path="mobility.items.${idx}.name"` : ''}>${item.name}</span>
                        `;
                        mobList.appendChild(el);
                    });
                }
            }

            const intCfg = C.interests;
            const intSec = $('sidebar-interests-sec');
            if (intSec) {
                const isIntVis = intCfg && intCfg.visible !== false;
                intSec.style.display = (isIntVis || (editMode && showHidden)) ? 'block' : 'none';
                const intTitle = $('sidebar-interests-title');
                if (intTitle && intCfg) {
                    intTitle.textContent = intCfg.title || "INTERESSES & HOBBY'S";
                }
                const intList = $('sidebar-interests-list');
                if (intList && intCfg && intCfg.items) {
                    intList.innerHTML = '';
                    intCfg.items.forEach((item, idx) => {
                        const el = document.createElement('div');
                        el.className = 'sidebar-interest-col';
                        const intEditAttr = editMode ? `data-icon-path="interests.items.${idx}.icon" title="İkonu Değiştir"` : '';
                        el.innerHTML = `
                            <i class="${item.icon || 'fa-solid fa-star'}" ${intEditAttr}></i>
                            <span class="sidebar-interest-name" ${editMode ? `data-path="interests.items.${idx}.name"` : ''}>${item.name}</span>
                        `;
                        intList.appendChild(el);
                    });
                }
            }

            $('sidebar-footer').textContent=C.footer.text;$('sidebar-footer').setAttribute('data-path','footer.text');
            if(C.overMezelf){toggleSec(C.overMezelf,'over-mezelf-sec');renderSectionTitle(C.overMezelf,'over-mezelf','fa-user-tie');$('over-mezelf-text').textContent=C.overMezelf.text;$('over-mezelf-text').setAttribute('data-path','overMezelf.text');}
            if(C.werkervaring){
                toggleSec(C.werkervaring,'werkervaring-sec');
                renderSectionTitle(C.werkervaring,'werkervaring','fa-briefcase');
                const wvList=$('werkervaring-list');
                if(wvList){
                    wvList.innerHTML='';
                    if(C.werkervaring.type==='items'&&C.werkervaring.items){
                        C.werkervaring.items.forEach((item,index)=>{
                            const el=document.createElement('div');
                            el.className='edu-card';
                            el.innerHTML=`
                                <div class="edu-card-header">
                                    <div class="edu-card-title-group">
                                        ${item.logo ? `<img src="${item.logo}" alt="${item.school}" class="exp-company-logo">` : ''}
                                        <span class="edu-school" data-path="werkervaring.items.${index}.school">${item.school}</span>
                                    </div>
                                    <span class="edu-year-badge" data-path="werkervaring.items.${index}.year"><i class="fa-solid fa-calendar-days"></i> ${item.year}</span>
                                </div>
                                <div class="edu-desc" data-path="werkervaring.items.${index}.desc">${item.desc}</div>`;
                            wvList.appendChild(el);
                        });
                    } else if(C.werkervaring.text){
                        const el=document.createElement('div');
                        el.className='edu-card edu-card-text text-content';
                        el.setAttribute('data-path','werkervaring.text');
                        el.textContent=C.werkervaring.text;
                        wvList.appendChild(el);
                    }
                }
            }
            if(C.education){
                toggleSec(C.education,'education-sec');
                renderSectionTitle(C.education,'education','fa-graduation-cap');
                const eduList=$('education-list');
                eduList.innerHTML='';
                (C.education.items||[]).forEach((item,index)=>{
                    const el=document.createElement('div');
                    el.className='edu-card';
                    const yearOnly=(item.year||'').replace(/\((gestopt|Gestopt met school)\)/gi,'').trim();
                    const hasGestopt=/\((gestopt|Gestopt met school)\)/gi.test(item.year||'');
                    el.innerHTML=`
                        <div class="edu-card-header">
                            <span class="edu-school" data-path="education.items.${index}.school">${item.school}</span>
                            <span class="edu-year-badge" data-path="education.items.${index}.year"><i class="fa-solid fa-calendar-days"></i> ${yearOnly} ${hasGestopt?'<span class="gestopt-label">(Gestopt)</span>':''}</span>
                        </div>
                        ${item.desc?`<div class="edu-desc" data-path="education.items.${index}.desc">${item.desc}</div>`:''}`;
                    eduList.appendChild(el);
                });
            }
            if(C.softSkills){toggleSec(C.softSkills,'soft-skills-sec');renderSectionTitle(C.softSkills,'soft-skills','fa-lightbulb');const softList=$('soft-skills-list');softList.innerHTML='';C.softSkills.items.forEach((item,index)=>{if(!item.name)return;const el=document.createElement('div');el.className='skill-item-row';el.innerHTML=`<span class="skill-name" data-path="softSkills.items.${index}.name">${item.name}</span><span class="skill-badge" data-path="softSkills.items.${index}.badge">${item.badge}</span>`;softList.appendChild(el);});}
            if(C.languages){toggleSec(C.languages,'languages-sec');renderSectionTitle(C.languages,'languages','fa-globe');const langList=$('languages-list');langList.innerHTML='';C.languages.items.forEach((item,index)=>{if(!item.name)return;const el=document.createElement('div');el.className='lang-item-row';el.innerHTML=`<span class="lang-name" data-path="languages.items.${index}.name">${item.name}</span><div class="stars-row ${editMode?'editable-stars':''}" data-stars-path="languages.items.${index}.stars">${starsHtml(item.stars)}</div><span class="lang-badge skill-badge" data-path="languages.items.${index}.badge">${item.badge}</span>`;langList.appendChild(el);});}
            const handleExtra=(key,id)=>{
                const cfg=C[key];if(!cfg)return;
                toggleSec(cfg,id+'-sec');
                const icon = cfg.icon || (cfg.title && (cfg.title.toLowerCase().includes('software') || cfg.title.toLowerCase().includes('it')) ? 'fa-laptop-code' : 'fa-star');
                renderSectionTitle(cfg,id,icon);
                const cnt=$(id+'-content');cnt.innerHTML='';
                if(cfg.type==='text'){
                    cnt.innerHTML=`<p class="text-content" data-path="${key}.text">${cfg.text}</p>`;
                } else if(cfg.type==='items'&&cfg.items){
                    cfg.items.forEach((item,idx)=>{
                        const el=document.createElement('div');el.className='edu-item';
                        el.innerHTML=`<div class="experience-header" style="display:flex;align-items:baseline;gap:4px;margin-bottom:4px;width:100%;"><span class="edu-school" data-path="${key}.items.${idx}.school" style="font-size:7.8px;font-weight:800;color:var(--text-main);text-transform:uppercase;white-space:nowrap;">${item.school}</span><span style="color:var(--accent-text);font-size:8px;font-weight:800;opacity:0.5;">|</span><span class="edu-year" data-path="${key}.items.${idx}.year" style="font-size:7.8px;font-weight:700;color:var(--accent-text);white-space:nowrap;"><i class="fa-solid fa-calendar-days" style="font-size:7px;"></i> ${item.year}</span></div><div class="experience-address" data-path="${key}.items.${idx}.desc" style="font-size:8.5px;font-weight:500;color:var(--text-sub);">${item.desc}</div>`;
                        cnt.appendChild(el);
                    });
                } else if(cfg.type==='skills'&&cfg.items){
                    const grid=document.createElement('div');
                    grid.className='skills-grid-2col';
                    cfg.items.forEach((item,idx)=>{
                        if(!item.name) return;
                        const el=document.createElement('div');
                        el.className='skill-item-row';
                        el.innerHTML=`<span class="skill-name" data-path="${key}.items.${idx}.name">${item.name}</span><span class="skill-badge" style="width: auto !important; min-width: 34px; padding: 0 4px;" data-path="${key}.items.${idx}.badge">${item.badge}</span>`;
                        grid.appendChild(el);
                    });
                    cnt.appendChild(grid);
                } else if(cfg.type==='stars'&&cfg.items){
                    const list=document.createElement('div');
                    list.className='skills-list';
                    cfg.items.forEach((item,idx)=>{
                        if(!item.name) return;
                        const el=document.createElement('div');
                        el.className='lang-item-row';
                        el.innerHTML=`<span class="lang-name" data-path="${key}.items.${idx}.name">${item.name}</span><div class="stars-row ${editMode?'editable-stars':''}" data-stars-path="${key}.items.${idx}.stars">${starsHtml(item.stars)}</div><span class="lang-badge skill-badge" data-path="${key}.items.${idx}.badge">${item.badge}</span>`;
                        list.appendChild(el);
                    });
                    cnt.appendChild(list);
                }
            };
            handleExtra('extra1','extra1');handleExtra('extra2','extra2');handleExtra('extra3','extra3');handleExtra('extra4','extra4');

            const motivCfg = C.motivatie || C.motivatiebrief;
            if(motivCfg){
                toggleSec(motivCfg,'motivatie-sec');
                renderSectionTitle(motivCfg,'motivatie','fa-chart-line');
                const mText=$('motivatie-text');
                if(mText){
                    mText.textContent=motivCfg.text||'';
                    mText.setAttribute('data-path', C.motivatie ? 'motivatie.text' : 'motivatiebrief.text');
                }
            } else {
                toggleSec({visible:false},'motivatie-sec');
            }

            if(C.sollicitatiebrief){
                toggleSec(C.sollicitatiebrief,'sollicitatiebrief-sec');
                const sbTitle=$('sollicitatiebrief-title');
                if(sbTitle){
                    sbTitle.style.display='flex';
                    sbTitle.innerHTML=`<i class="fa-solid fa-file-signature"></i> <span data-path="sollicitatiebrief.title">${C.sollicitatiebrief.title||'SOLLICITATIEBRIEF'}</span>`;
                }
                const sbMeta=$('sollicitatiebrief-meta');
                if(sbMeta){
                    const isVis = C.sollicitatiebrief.companyPlaceholderVisible !== false && !!C.sollicitatiebrief.companyPlaceholder;
                    if (editMode) {
                        sbMeta.style.display = 'flex';
                        sbMeta.style.alignItems = 'center';
                        sbMeta.style.gap = '6px';
                        sbMeta.style.marginBottom = '6px';
                        sbMeta.innerHTML = `<span class="editable-content" contenteditable="true" data-path="sollicitatiebrief.companyPlaceholder" style="opacity:${isVis ? '1' : '0.4'}; font-weight:700; color:var(--accent); font-size:7.5px;">${C.sollicitatiebrief.companyPlaceholder || '[Bedrijfsnaam]'}</span><span onclick="window.toggleCompanyPlaceholder()" style="cursor:pointer; font-size:9px; color:var(--accent);" title="${isVis ? 'Gizle' : 'Göster'}"><i class="fa-solid ${isVis ? 'fa-eye' : 'fa-eye-slash'}"></i></span>`;
                    } else if (isVis) {
                        sbMeta.style.display = 'block';
                        sbMeta.textContent = C.sollicitatiebrief.companyPlaceholder;
                        sbMeta.setAttribute('data-path', 'sollicitatiebrief.companyPlaceholder');
                    } else {
                        sbMeta.style.display = 'none';
                    }
                }
                const sbText=$('sollicitatiebrief-text');
                if(sbText){
                    sbText.textContent=C.sollicitatiebrief.text||'';
                    sbText.setAttribute('data-path','sollicitatiebrief.text');
                }
            } else {
                toggleSec({visible:false},'sollicitatiebrief-sec');
            }

            if(C.waaromIk){
                toggleSec(C.waaromIk,'waarom-ik-sec');
                const wiTitle=$('waarom-ik-title');
                if(wiTitle){
                    wiTitle.style.display='flex';
                    const wiIcon = C.waaromIk.icon || 'fa-solid fa-circle-question';
                    const wiEditAttr = editMode ? 'data-icon-path="waaromIk.icon" title="İkonu Değiştir"' : '';
                    wiTitle.innerHTML=`<i class="${wiIcon}" ${wiEditAttr}></i> <span data-path="waaromIk.title">${C.waaromIk.title||'WAAROM IK?'}</span>`;
                }
                const wiGrid=$('waarom-ik-grid');
                if(wiGrid && C.waaromIk.items){
                    wiGrid.innerHTML='';
                    C.waaromIk.items.forEach((item,idx)=>{
                        const el=document.createElement('div');
                        el.className='why-me-item';
                        const itemEditAttr = editMode ? `data-icon-path="waaromIk.items.${idx}.icon" title="İkonu Değiştir"` : '';
                        el.innerHTML=`
                            <div class="why-me-icon-circle" ${itemEditAttr}>
                                <i class="${item.icon}"></i>
                            </div>
                            <span class="why-me-label" data-path="waaromIk.items.${idx}.title">${item.title}</span>
                        `;
                        wiGrid.appendChild(el);
                    });
                }
            } else {
                toggleSec({visible:false},'waarom-ik-sec');
            }

            const secs=[
                {k:'overMezelf',i:'over-mezelf-sec'},
                {k:'werkervaring',i:'werkervaring-sec'},
                {k:'education',i:'education-sec'},
                {k:'softSkills',i:'soft-skills-sec'},
                {k:'languages',i:'languages-sec'},
                {k:'extra1',i:'extra1-sec'},
                {k:'extra2',i:'extra2-sec'},
                {k:'extra3',i:'extra3-sec'},
                {k:'extra4',i:'extra4-sec'},
                {k: C.motivatie ? 'motivatie' : 'motivatiebrief', i:'motivatie-sec'},
                {k:'sollicitatiebrief',i:'sollicitatiebrief-sec'},
                {k:'waaromIk',i:'waarom-ik-sec'}
            ];
            secs.forEach(s=>addSectionControls(s.k,s.i));
        };

        let zoom = 1.0; 
        let panX = 0; 
        let panY = 0; 
        let isDragging = false; 
        let dragStart = { x: 0, y: 0 };
        const layer = $('scaling-layer');

        const updateTransform = () => {
            const isM = window.innerWidth <= 768;
            const targetW = 680;
            const container = document.querySelector('.cv-container');
            const targetH = container ? Math.max(container.scrollHeight, 962) : 962;
            const padX = isM ? 16 : 40;
            const padY = isM ? 20 : 40;
            const scaleX = (window.innerWidth - padX) / targetW;
            const scaleY = (window.innerHeight - padY) / targetH;
            const baseS = isM ? scaleX : Math.min(scaleX, scaleY);
            const finalS = Math.max(baseS, 0.2) * zoom;
            
            const limitX = window.innerWidth * 0.6; 
            const limitY = Math.max(window.innerHeight * 0.8, targetH * finalS * 0.6);
            panX = Math.min(Math.max(panX, -limitX), limitX);
            panY = Math.min(Math.max(panY, -limitY), limitY);

            const dL = (window.innerWidth - targetW * finalS) / 2;
            const dT = (window.innerHeight - targetH * finalS) / 2;
            layer.style.transform = `translate(${dL + panX}px, ${dT + panY}px) scale(${finalS})`;
        };

        window.addEventListener('resize', updateTransform);
        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const zoomSpeed = 0.0015;
                const delta = -e.deltaY;
                const oldZoom = zoom;
                zoom = Math.min(Math.max(zoom + delta * zoomSpeed, 0.3), 5.0);
                
                const rect = layer.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                if (oldZoom !== zoom) {
                    const ratio = zoom / oldZoom;
                    panX -= (mouseX * ratio - mouseX) / (zoom * (rect.width/680/zoom));
                    panY -= (mouseY * ratio - mouseY) / (zoom * (rect.height/962/zoom));
                }
                updateTransform();
            } else {
                panY -= e.deltaY * 0.8;
                updateTransform();
            }
        }, { passive: false });

        window.addEventListener('load', () => { zoom = 1.0; panX = 0; panY = 0; updateTransform(); });
        
        let clickCount = 0;
        let clickTimer = null;
        let lastClickTarget = null;

        document.addEventListener('mousedown', (e) => {
            // UI elements should not trigger canvas drag or icon picking
            if (e.target.closest('#actions-container, #publish-controls, .custom-modal-overlay, #login-screen, button, input, textarea, select, .action-btn, .pub-btn, .modal-btn')) {
                return;
            }

            // Middle click or Ctrl+Left click always starts dragging/panning
            if (e.button === 1 || (e.ctrlKey && e.button === 0)) {
                isDragging = true;
                dragStart = { x: e.clientX - panX, y: e.clientY - panY };
                layer.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }

            if (e.button !== 0) return;

            // In edit mode: single click on an icon should NOT open the picker, nor drag the canvas
            if (editMode && e.target.closest('[data-icon-path]')) {
                return;
            }

            // Detect if clicked on a text / copyable / editable area
            const isTextEl = !!e.target.closest('[data-path], [contenteditable], p, span, h1, h2, h3, h4, .editable-content, .edu-desc, .experience-address, .mot-body, .sb-body, .why-me-label, .skill-name, .lang-name, .contact-value, .contact-label, .edu-school, .edu-year');

            const nowTarget = isTextEl ? (e.target.closest('[data-path]') || e.target) : e.target;
            if (lastClickTarget === nowTarget) {
                clickCount++;
            } else {
                clickCount = 1;
                lastClickTarget = nowTarget;
            }

            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
                lastClickTarget = null;
            }, 450);

            // Rule 3: 3 tıklama = metin üstündeyken bile CV hareket ettirme
            if (clickCount >= 3) {
                isDragging = true;
                dragStart = { x: e.clientX - panX, y: e.clientY - panY };
                layer.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }

            // Rule 1 & 2: Çift tıklama
            if (clickCount === 2) {
                if (!isTextEl) {
                    // Boş yerlere çift tıklamak CV'yi hareket ettirir (pan modu)
                    isDragging = true;
                    dragStart = { x: e.clientX - panX, y: e.clientY - panY };
                    layer.style.cursor = 'grabbing';
                    e.preventDefault();
                } else {
                    // Metin üstüne çift tıklamak CV'yi ASLA hareket ettirmez!
                    isDragging = false;
                    // edit kapalıyken: normal metin seçimi (tarayıcı doğal davranışı, preventDefault yok)
                    // edit modundayken: dblclick listener metni contentEditable yapacak
                }
                return;
            }

            // Single click:
            // Sadece boş alana (cv-container dışı veya scaling-layer arka planına) tıklandığında sürükleme adayı
            if (!e.target.closest('.cv-container') || e.target.id === 'scaling-layer') {
                isDragging = true;
                dragStart = { x: e.clientX - panX, y: e.clientY - panY };
                layer.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                panX = e.clientX - dragStart.x;
                panY = e.clientY - dragStart.y;
                updateTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            layer.style.cursor = '';
        });

        document.addEventListener('dblclick', (e) => {
            // In edit mode: double click on an icon also opens icon picker
            if (editMode) {
                const iconEl = e.target.closest('[data-icon-path]');
                if (iconEl) {
                    const iconPath = iconEl.getAttribute('data-icon-path');
                    const curCls = iconEl.className || '';
                    window.showIconPicker(iconPath, curCls);
                    e.preventDefault();
                    return;
                }
            }

            const target = e.target.closest('[data-path]');
            if (editMode && target) {
                // Edit modunda çift tıklanırsa metin değiştirilebilir olsun
                target.contentEditable = "true";
                target.focus();
                const range = document.createRange();
                range.selectNodeContents(target);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                const onInput = () => {
                    if (autoDutchFix) {
                        const txt = target.textContent;
                        if (txt.includes('İ') || txt.includes('ı')) {
                            const curSel = window.getSelection();
                            let offset = 0;
                            if (curSel.rangeCount > 0) {
                                offset = curSel.getRangeAt(0).startOffset;
                            }
                            target.textContent = cleanDutchChars(txt);
                            try {
                                const newRange = document.createRange();
                                const node = target.firstChild || target;
                                newRange.setStart(node, Math.min(offset, node.length || 0));
                                newRange.collapse(true);
                                curSel.removeAllRanges();
                                curSel.addRange(newRange);
                            } catch(err) {}
                        }
                    }
                };
                target.addEventListener('input', onInput);

                const onBlur = () => {
                    target.removeEventListener('input', onInput);
                    target.contentEditable = "false";
                    let val = target.textContent.trim();
                    if (autoDutchFix) val = cleanDutchChars(val);
                    setPath(profileData[activeKey], target.getAttribute('data-path'), val);
                    commitData();
                    renderCV();
                };
                target.addEventListener('blur', onBlur, { once: true });
                target.addEventListener('keydown', (evt) => {
                    if (evt.key === 'Enter') {
                        evt.preventDefault();
                        target.blur();
                    }
                });
            }
        });

        // ==========================================================================
        // ICON PICKER MODAL (1400+ ICONS)
        // ==========================================================================
        // ==========================================================================
        // ICON PICKER MODAL (1400+ ICONS) & INSPECTOR / QUICK COPY
        // ==========================================================================
        let activeEditingIconPath = null;
        let selectedIconCat = 'all';
        window.currentInspectedIconCls = 'fa-solid fa-star';

        const fallbackCopy = (text, callback) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                ta.style.top = '0';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                if (callback) callback();
            } catch (err) {
                window.showToast(`İkon: ${text}`, 'fa-solid fa-info');
            }
        };

        const copyIconIdToClipboard = (text) => {
            if (!text) return;
            window.currentInspectedIconCls = text;
            const finish = () => {
                const copyBtn = $('icon-inspector-copy-btn');
                if (copyBtn) {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i> <span>Kopyalandı!</span>';
                    setTimeout(() => {
                        if (copyBtn) copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>ID Kopyala</span>';
                    }, 1800);
                }
                window.showToast(`📋 İkon ID Kopyalandı: ${text}`, 'fa-solid fa-copy');
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(finish).catch(() => {
                    fallbackCopy(text, finish);
                });
            } else {
                fallbackCopy(text, finish);
            }
        };

        const updateHoverInspector = (cls, name, catKey) => {
            if (!cls) return;
            window.currentInspectedIconCls = cls;
            const prev = $('icon-hover-preview');
            const nameEl = $('icon-hover-name');
            const badgeEl = $('icon-hover-cat');
            const codeEl = $('icon-hover-code');
            const cats = window.CV_ICON_CATEGORIES || {};
            const catLabel = (cats[catKey] && cats[catKey].label) || catKey || 'Katalog';

            if (prev) prev.innerHTML = `<i class="${cls}"></i>`;
            if (nameEl) nameEl.textContent = name ? `${name}` : cls;
            if (badgeEl) badgeEl.textContent = catLabel;
            if (codeEl) codeEl.textContent = cls;
        };

        window.hideIconPicker = () => {
            const modal = $('icon-picker-modal');
            if (modal) modal.style.display = 'none';
            hideModal();
            activeEditingIconPath = null;
        };

        window.showIconCatalog = () => {
            window.showIconPicker(null, null);
        };

        window.showIconPicker = (path, currentClass) => {
            activeEditingIconPath = path;
            const modal = $('icon-picker-modal');
            if (!modal) return;
            showModal('icon-picker-modal');

            const titleEl = modal.querySelector('.icon-picker-title');
            const subtitleEl = modal.querySelector('.icon-picker-subtitle');
            const resetBtn = $('icon-reset-default-btn');

            if (path) {
                if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-icons"></i> İkon Değiştir';
                if (subtitleEl) subtitleEl.textContent = 'Sayfadaki ikonu değiştirmek için bir ikona tıklayın veya ID seçin.';
                if (resetBtn) resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> <span>Bu İkonu Varsayılana Sıfırla</span>';
            } else {
                if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-icons"></i> 2000+ İkon Listesi &amp; ID Kopyala';
                if (subtitleEl) subtitleEl.textContent = 'İkonların üzerine gelerek ID\'lerini görebilir, tıklayarak anında kopyalayabilirsiniz.';
                if (resetBtn) resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> <span>Tüm İkonları Varsayılana Sıfırla</span>';
            }

            const customInput = $('icon-custom-input');
            const preview = $('icon-custom-preview');
            const cls = currentClass ? currentClass.split(' ').filter(c => c.startsWith('fa-') || c === 'cv-icon-estep').join(' ') : 'fa-solid fa-star';
            if (customInput) customInput.value = cls || '';
            if (preview) preview.innerHTML = `<i class="${cls || 'fa-solid fa-star'}"></i>`;

            updateHoverInspector(cls, currentClass ? 'Mevcut İkon' : 'Örnek İkon', 'Katalog');

            renderIconCategories();
            filterAndRenderIcons('');
            const searchInp = $('icon-search-input');
            if (searchInp) {
                searchInp.value = '';
                setTimeout(() => searchInp.focus(), 120);
            }
        };

        const renderIconCategories = () => {
            const tabs = $('icon-categories-tabs');
            if (!tabs) return;
            const cats = window.CV_ICON_CATEGORIES || {};
            let html = `<button type="button" class="icon-cat-pill ${selectedIconCat==='all'?'active':''}" data-cat="all"><i class="fa-solid fa-border-all"></i> Tümü</button>`;
            Object.keys(cats).forEach(k => {
                const c = cats[k];
                html += `<button type="button" class="icon-cat-pill ${selectedIconCat===k?'active':''}" data-cat="${k}"><i class="${c.icon}"></i> ${c.label}</button>`;
            });
            tabs.innerHTML = html;
            tabs.querySelectorAll('.icon-cat-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    tabs.querySelectorAll('.icon-cat-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedIconCat = btn.getAttribute('data-cat');
                    const term = ($('icon-search-input')?.value || '').trim();
                    filterAndRenderIcons(term);
                });
            });
        };

        const filterAndRenderIcons = (term = '') => {
            const grid = $('icon-picker-grid');
            const countBadge = $('icon-search-count');
            if (!grid) return;
            const catalog = window.CV_ICON_CATALOG || [];
            const q = term.toLowerCase();

            const filtered = catalog.filter(item => {
                const matchCat = (selectedIconCat === 'all' || item.cat === selectedIconCat);
                if (!matchCat) return false;
                if (!q) return true;
                return item.cls.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
            });

            if (countBadge) countBadge.textContent = `${filtered.length} ikon`;

            const itemsToRender = filtered.slice(0, 500);
            let html = '';
            itemsToRender.forEach(item => {
                html += `<button type="button" class="icon-picker-item" data-icon-cls="${item.cls}" data-icon-name="${item.name}" data-icon-cat="${item.cat}" title="${item.cls} (${item.name}) - Tıkla ve Kopyala">
                    <i class="${item.cls}"></i>
                </button>`;
            });
            if (filtered.length === 0) {
                html = '<div style="grid-column: 1/-1; text-align: center; padding: 28px; color: var(--text-sub); font-size: 12px;"><i class="fa-solid fa-magnifying-glass" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i><br>Eşleşen ikon bulunamadı. Yukarıdaki özel sınıf kutusuna istediğiniz FontAwesome sınıfını yazabilirsiniz.</div>';
            }
            grid.innerHTML = html;

            grid.querySelectorAll('.icon-picker-item').forEach(btn => {
                const cls = btn.getAttribute('data-icon-cls');
                const name = btn.getAttribute('data-icon-name');
                const cat = btn.getAttribute('data-icon-cat');

                btn.addEventListener('mouseenter', () => {
                    updateHoverInspector(cls, name, cat);
                    const inp = $('icon-custom-input');
                    if (inp && document.activeElement !== inp) {
                        inp.value = cls;
                        const prev = $('icon-custom-preview');
                        if (prev) prev.innerHTML = `<i class="${cls}"></i>`;
                    }
                });

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    copyIconIdToClipboard(cls);
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 400);

                    grid.querySelectorAll('.icon-picker-item.selected').forEach(el => el.classList.remove('selected'));
                    btn.classList.add('selected');

                    if (activeEditingIconPath) {
                        applySelectedIcon(cls);
                    }
                });
            });
        };

        const applySelectedIcon = (iconClass) => {
            if (!activeEditingIconPath) return;
            setPath(profileData[activeKey], activeEditingIconPath, iconClass);
            
            // If editing mobility item that had svg, check if restoring e-step or custom icon
            if (activeEditingIconPath.startsWith('mobility.items.')) {
                const p = activeEditingIconPath.replace('.icon', '.svg');
                if (iconClass === 'cv-icon-estep') {
                    setPath(profileData[activeKey], p, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="17" r="2"/><circle cx="6" cy="17" r="2"/><path d="M8 17h5a6 6 0 0 1 5 -5v-5a2 2 0 0 0 -2 -2h-1"/><path d="M10 4l-2 4h3l-2 4"/></svg>');
                } else {
                    setPath(profileData[activeKey], p, null);
                }
            }

            commitData();
            renderCV();
            window.hideIconPicker();
            window.showToast(`İkon güncellendi: ${iconClass}`, 'fa-solid fa-check');
        };

        const customInputEl = $('icon-custom-input');
        if (customInputEl) {
            customInputEl.addEventListener('input', (e) => {
                const cls = e.target.value.trim() || 'fa-solid fa-star';
                const preview = $('icon-custom-preview');
                if (preview) preview.innerHTML = `<i class="${cls}"></i>`;
                updateHoverInspector(cls, 'Özel İkon', 'Özel');
            });
            customInputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = customInputEl.value.trim();
                    if (!val) return;
                    if (activeEditingIconPath) {
                        applySelectedIcon(val);
                    } else {
                        copyIconIdToClipboard(val);
                    }
                }
            });
        }

        $('icon-custom-apply-btn')?.addEventListener('click', () => {
            const val = ($('icon-custom-input')?.value || '').trim();
            if (!val) return;
            if (activeEditingIconPath) {
                applySelectedIcon(val);
            } else {
                copyIconIdToClipboard(val);
            }
        });

        $('icon-inspector-copy-btn')?.addEventListener('click', () => {
            if (window.currentInspectedIconCls) {
                copyIconIdToClipboard(window.currentInspectedIconCls);
            }
        });

        $('icon-hover-code')?.addEventListener('click', () => {
            if (window.currentInspectedIconCls) {
                copyIconIdToClipboard(window.currentInspectedIconCls);
            }
        });

        // Reset icon(s) to factory defaults
        $('icon-reset-default-btn')?.addEventListener('click', () => {
            const rawDefault = (window.FACTORY_DEFAULTS && window.FACTORY_DEFAULTS[activeKey]) ||
                               (window.CV_PROFILES_DATA && window.CV_PROFILES_DATA[activeKey]);
            if (!rawDefault) {
                window.showToast('Varsayılan profil verisi bulunamadı.', 'fa-solid fa-triangle-exclamation');
                return;
            }

            if (activeEditingIconPath) {
                // Reset this specific icon
                const defIcon = getPath(rawDefault, activeEditingIconPath);
                if (activeEditingIconPath.startsWith('mobility.items.')) {
                    const svgPath = activeEditingIconPath.replace('.icon', '.svg');
                    const defSvg = getPath(rawDefault, svgPath);
                    setPath(profileData[activeKey], svgPath, defSvg || null);
                }
                setPath(profileData[activeKey], activeEditingIconPath, defIcon || 'fa-solid fa-star');
                commitData();
                renderCV();
                window.hideIconPicker();
                window.showToast('✨ İkon orijinal varsayılana sıfırlandı!', 'fa-solid fa-rotate-left');
            } else {
                // Reset all icons on the active CV page
                const iconPaths = [
                    'profile.icon', 'experience.icon', 'education.icon', 'skills.icon',
                    'languages.icon', 'strengths.icon', 'waaromIk.icon', 'mobility.icon',
                    'interests.icon', 'contact.icon'
                ];
                iconPaths.forEach(p => {
                    const v = getPath(rawDefault, p);
                    if (v !== undefined) setPath(profileData[activeKey], p, v);
                });

                // Mobility items
                if (rawDefault.mobility && rawDefault.mobility.items && profileData[activeKey].mobility) {
                    profileData[activeKey].mobility.items.forEach((item, idx) => {
                        const orig = rawDefault.mobility.items[idx];
                        if (orig) {
                            item.icon = orig.icon;
                            item.svg = orig.svg || null;
                        }
                    });
                }

                // WaaromIk items
                if (rawDefault.waaromIk && rawDefault.waaromIk.items && profileData[activeKey].waaromIk) {
                    profileData[activeKey].waaromIk.items.forEach((item, idx) => {
                        const orig = rawDefault.waaromIk.items[idx];
                        if (orig) item.icon = orig.icon;
                    });
                }

                // Interests items
                if (rawDefault.interests && rawDefault.interests.items && profileData[activeKey].interests) {
                    profileData[activeKey].interests.items.forEach((item, idx) => {
                        const orig = rawDefault.interests.items[idx];
                        if (orig) item.icon = orig.icon;
                    });
                }

                commitData();
                renderCV();
                window.hideIconPicker();
                window.showToast('✨ Tüm ikonlar orijinal varsayılanlarına sıfırlandı!', 'fa-solid fa-rotate-left');
            }
        });

        $('icon-search-input')?.addEventListener('input', (e) => {
            filterAndRenderIcons(e.target.value.trim());
        });

        const showModal=(id)=>{
            $('custom-modal-container').style.display='flex';
            setTimeout(()=>$('custom-modal-container').classList.add('active'),10);
            document.querySelectorAll('.custom-modal').forEach(m=>m.style.display='none');
            const target = $(id);
            if (target) target.style.display = (id === 'icon-picker-modal') ? 'flex' : 'block';
            window.activeModalId=id;
        };
        const hideModal=()=>{$('custom-modal-container').classList.remove('active');setTimeout(()=>{$('custom-modal-container').style.display='none';window.activeModalId=null;},300);};
        $('custom-modal-container').addEventListener('mousedown',(e)=>{if(e.target===$('custom-modal-container'))hideModal();});
        document.addEventListener('keydown',(e)=>{if(window.activeModalId){if(e.key==='Escape')hideModal();if(e.key==='Enter'&&window.activeModalId==='confirm-edit-modal')$('confirm-edit-yes').click();}});

        $('edit-toggle').addEventListener('click',()=>{if(!editMode)showModal('confirm-edit-modal');else{editMode=false;localStorage.setItem('cv_edit_mode','false');profileData=liveData;initHistory();updateEditUI();renderCV();}});
        $('confirm-edit-yes').addEventListener('click',()=>{editMode=true;localStorage.setItem('cv_edit_mode','true');draftData=JSON.parse(localStorage.getItem('cv_profiles_draft'))||JSON.parse(JSON.stringify(liveData));profileData=draftData;initHistory();updateEditUI();renderCV();hideModal();});
        $('confirm-edit-no').addEventListener('click',hideModal);

        const updateEditUI=()=>{
            const btn=$('edit-toggle');const editEls=document.querySelectorAll('.group-edit, .divider-edit, .divider-edit-extra');const pgGroup=$('page-management-group');
            if(editMode){btn.classList.add('accent');btn.querySelector('span').textContent='Live';btn.querySelector('i').className='fa-solid fa-eye';document.body.classList.add('edit-active');editEls.forEach(el=>el.style.display=el.classList.contains('action-divider')?'block':'flex');$('publish-controls').style.display='flex';if(pgGroup)pgGroup.style.display='flex';}
            else{btn.classList.remove('accent');btn.querySelector('span').textContent='Edit';btn.querySelector('i').className='fa-solid fa-pen';document.body.classList.remove('edit-active');editEls.forEach(el=>el.style.display='none');$('publish-controls').style.display='none';if(pgGroup)pgGroup.style.display='none';}
        };

        $('reset-btn')?.addEventListener('click', () => {
            const rawDefault = (window.FACTORY_DEFAULTS && window.FACTORY_DEFAULTS[activeKey]) ||
                               (window.CV_PROFILES_DATA && window.CV_PROFILES_DATA[activeKey]);
            if (!rawDefault) {
                window.showToast('Varsayılan profil verisi bulunamadı.', 'fa-solid fa-triangle-exclamation');
                return;
            }

            if (confirm('Bu sayfadaki tüm değişiklikleri sıfırlayıp orijinal fabrika şablonuna dönmek istediğinize emin misiniz?')) {
                profileData[activeKey] = JSON.parse(JSON.stringify(rawDefault));
                draftData[activeKey] = JSON.parse(JSON.stringify(rawDefault));
                localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData));
                commitData();
                renderCV();
                window.showToast('✨ Tüm CV başarıyla varsayılana sıfırlandı!', 'fa-solid fa-rotate-left');
            }
        });

        $('hidden-toggle').addEventListener('click',()=>{showHidden=!showHidden;localStorage.setItem('cv_show_hidden',showHidden);$('hidden-toggle').classList.toggle('primary',showHidden);renderCV();});
        
        // ==========================================
        // COOKIE & LOCAL BACKUP SYSTEM
        // ==========================================
        const setCookie = (name, value, days = 365) => {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
        };

        const getCookie = (name) => {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        };

        const saveCookieBackup = (customName, silent = false) => {
            try {
                const dataToSave = editMode ? draftData : (profileData || liveData);
                const timestamp = Date.now();
                const now = new Date();
                const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                const name = customName || ('Cookie Yedeği ' + dateStr);
                const profileKeys = Object.keys(dataToSave || {});

                // 1. Save main backup to localStorage
                const backupPayload = {
                    timestamp,
                    dateStr,
                    name,
                    profiles: profileKeys,
                    data: dataToSave
                };
                localStorage.setItem('cv_cookie_backup', JSON.stringify(backupPayload));

                // 2. Set long-lived cookie with metadata
                const metaObj = {
                    time: timestamp,
                    date: dateStr,
                    name: name.slice(0, 30),
                    count: profileKeys.length
                };
                setCookie('cv_cookie_backup_meta', JSON.stringify(metaObj), 365);

                // 3. Add to snapshot history list
                let list = [];
                try {
                    list = JSON.parse(localStorage.getItem('cv_saved_backups_list')) || [];
                } catch(e) {}
                list.unshift({
                    id: 'b_' + timestamp,
                    name,
                    dateStr,
                    timestamp,
                    count: profileKeys.length,
                    data: dataToSave
                });
                if (list.length > 25) list = list.slice(0, 25);
                localStorage.setItem('cv_saved_backups_list', JSON.stringify(list));

                if (typeof updateBackupUI === 'function') updateBackupUI();

                if (!silent) {
                    window.showToast('🍪 Cookie / Cihaz Yedeği Başarıyla Alındı!', 'fa-solid fa-cookie-bite');
                }
                return true;
            } catch(e) {
                if (!silent) {
                    window.showToast('Yedek alınırken hata oluştu: ' + e.message, 'fa-solid fa-triangle-exclamation');
                }
                return false;
            }
        };

        const restoreCookieBackup = () => {
            let backup = null;
            try {
                const raw = localStorage.getItem('cv_cookie_backup');
                if (raw) backup = JSON.parse(raw);
            } catch(e) {}

            if (!backup || !backup.data || Object.keys(backup.data).length === 0) {
                window.showToast('Bu bilgisayarda kayıtlı cookie yedeği bulunamadı.', 'fa-solid fa-circle-info');
                return;
            }

            const confirmMsg = `Bu bilgisayardaki son Cookie Yedeği geri yüklensin mi?\n\nYedek Adı: ${backup.name || 'Cookie Yedeği'}\nTarih: ${backup.dateStr}\n\nMevcut çalışma alanınız bu yedeğe dönecektir.`;
            if (!confirm(confirmMsg)) return;

            const cloned = JSON.parse(JSON.stringify(backup.data));
            profileData = cloned;
            if (editMode) {
                draftData = cloned;
                localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData));
            } else {
                liveData = cloned;
                localStorage.setItem('cv_profiles', JSON.stringify(liveData));
            }

            initHistory();
            renderCV();
            hideModal();
            window.showToast('✨ Cookie Yedeğinden Başarıyla Geri Yüklendi!', 'fa-solid fa-rotate-left');
        };

        window.restoreSnapshot = (id) => {
            let list = [];
            try {
                list = JSON.parse(localStorage.getItem('cv_saved_backups_list')) || [];
            } catch(e) {}

            const found = list.find(item => item.id === id);
            if (!found || !found.data) {
                window.showToast('Yedek kaydı bulunamadı.', 'fa-solid fa-triangle-exclamation');
                return;
            }

            if (!confirm(`"${found.name}" (${found.dateStr}) yedeği geri yüklensin mi?`)) return;

            const cloned = JSON.parse(JSON.stringify(found.data));
            profileData = cloned;
            if (editMode) {
                draftData = cloned;
                localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData));
            } else {
                liveData = cloned;
                localStorage.setItem('cv_profiles', JSON.stringify(liveData));
            }

            initHistory();
            renderCV();
            hideModal();
            window.showToast('✨ Yedek başarıyla geri yüklendi!', 'fa-solid fa-rotate-left');
        };

        window.deleteSnapshot = (id) => {
            let list = [];
            try {
                list = JSON.parse(localStorage.getItem('cv_saved_backups_list')) || [];
            } catch(e) {}

            const found = list.find(item => item.id === id);
            const name = found ? found.name : 'bu';
            if (!confirm(`"${name}" yedeğini listeden silmek istediğinize emin misiniz?`)) return;

            list = list.filter(item => item.id !== id);
            localStorage.setItem('cv_saved_backups_list', JSON.stringify(list));
            if (typeof updateBackupUI === 'function') updateBackupUI();
            window.showToast('🗑️ Yedek listeden silindi.', 'fa-solid fa-trash');
        };

        updateBackupUI = () => {
            const statusEl = $('cookie-backup-time-text');
            let backup = null;
            try {
                const raw = localStorage.getItem('cv_cookie_backup');
                if (raw) backup = JSON.parse(raw);
            } catch(e) {}

            if (statusEl) {
                if (backup && backup.dateStr) {
                    statusEl.textContent = `Son Yedek: ${backup.dateStr} (${backup.name || 'Cookie Yedeği'})`;
                } else {
                    const cookieMeta = getCookie('cv_cookie_backup_meta');
                    if (cookieMeta) {
                        try {
                            const meta = JSON.parse(cookieMeta);
                            statusEl.textContent = `Son Yedek: ${meta.date || ''} (${meta.name || 'Cookie'})`;
                        } catch(e) {
                            statusEl.textContent = 'Son Cookie Yedeği: Henüz bu bilgisayara yedek alınmadı.';
                        }
                    } else {
                        statusEl.textContent = 'Son Cookie Yedeği: Henüz bu bilgisayara yedek alınmadı.';
                    }
                }
            }

            const listEl = $('backup-list');
            if (listEl) {
                let list = [];
                try {
                    list = JSON.parse(localStorage.getItem('cv_saved_backups_list')) || [];
                } catch(e) {}

                if (list.length === 0) {
                    listEl.innerHTML = '<div style="text-align: center; font-size: 11px; color: var(--text-sub); padding: 12px 6px;">Henüz kayıtlı ek PC yedeği yok. Yukarıdan isim girip "Ekle" butonuna basabilirsiniz.</div>';
                } else {
                    listEl.innerHTML = list.map(item => `
                        <div class="backup-item">
                            <div class="backup-info">
                                <div class="backup-item-name" title="${item.name}">${item.name}</div>
                                <div class="backup-item-date">${item.dateStr} • ${item.count || 2} Profil</div>
                            </div>
                            <div class="backup-item-actions">
                                <button type="button" class="backup-action-btn" title="Geri Yükle" onclick="window.restoreSnapshot('${item.id}')">
                                    <i class="fa-solid fa-rotate-left"></i>
                                </button>
                                <button type="button" class="backup-action-btn delete-btn" title="Sil" onclick="window.deleteSnapshot('${item.id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        };

        const downloadJsonBackup = () => {
            const dataToSave = editMode ? draftData : (profileData || liveData);
            const str = JSON.stringify(dataToSave, null, 2);
            const blob = new Blob([str], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10);
            a.href = url;
            a.download = `cv_backup_${activeKey}_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            window.showToast('📁 JSON yedeği başarıyla indirildi!', 'fa-solid fa-download');
        };

        const uploadJsonBackup = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (!parsed || typeof parsed !== 'object') throw new Error('Geçersiz JSON');
                    
                    if (!confirm('Yüklenen JSON dosyasındaki veriler çalışma alanınıza uygulansın mı?')) return;

                    profileData = parsed;
                    if (editMode) {
                        draftData = parsed;
                        localStorage.setItem('cv_profiles_draft', JSON.stringify(draftData));
                    } else {
                        liveData = parsed;
                        localStorage.setItem('cv_profiles', JSON.stringify(liveData));
                    }

                    saveCookieBackup('JSON Dosyasından İçe Aktarma (' + new Date().toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'}) + ')', true);
                    initHistory();
                    renderCV();
                    hideModal();
                    window.showToast('📁 JSON yedeği başarıyla yüklendi!', 'fa-solid fa-check');
                } catch(err) {
                    window.showToast('JSON dosyası okunamadı veya geçersiz!', 'fa-solid fa-triangle-exclamation');
                }
            };
            reader.readAsText(file);
        };

        window.saveCookieBackup = saveCookieBackup;
        window.restoreCookieBackup = restoreCookieBackup;
        window.showBackupModal = () => {
            if (typeof updateBackupUI === 'function') updateBackupUI();
            showModal('backup-modal');
        };

        // performLogout is already defined at DOMContentLoaded level (top of script)
        // so it works even before startApp() runs. No redefinition needed here.

        if ($('backup-toggle')) $('backup-toggle').addEventListener('click', window.showBackupModal);
        if ($('backup-pub-btn')) $('backup-pub-btn').addEventListener('click', window.showBackupModal);
        if ($('close-backup-modal')) $('close-backup-modal').addEventListener('click', hideModal);

        if ($('btn-save-cookie-backup')) {
            $('btn-save-cookie-backup').addEventListener('click', () => saveCookieBackup());
        }
        if ($('btn-restore-cookie-backup')) {
            $('btn-restore-cookie-backup').addEventListener('click', restoreCookieBackup);
        }
        if ($('save-backup-btn')) {
            $('save-backup-btn').addEventListener('click', () => {
                const input = $('backup-name-input');
                const val = input ? input.value.trim() : '';
                saveCookieBackup(val || undefined);
                if (input) input.value = '';
            });
        }
        if ($('btn-fetch-mysql-modal')) {
            $('btn-fetch-mysql-modal').addEventListener('click', () => syncFromMySQL(true));
        }
        if ($('btn-download-json')) {
            $('btn-download-json').addEventListener('click', downloadJsonBackup);
        }
        if ($('btn-upload-json')) {
            $('btn-upload-json').addEventListener('click', () => {
                const fileInput = $('backup-file-input');
                if (fileInput) fileInput.click();
            });
        }
        if ($('backup-file-input')) {
            $('backup-file-input').addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    uploadJsonBackup(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }

        if ($('settings-toggle')) {
            $('settings-toggle').addEventListener('click', () => {
                if ($('setting-auto-dutch-fix')) $('setting-auto-dutch-fix').checked = autoDutchFix;
                if ($('settings-toast-msg')) $('settings-toast-msg').style.display = 'none';
                showModal('settings-modal');
            });
        }
        if ($('close-settings-modal')) $('close-settings-modal').addEventListener('click', hideModal);
        if ($('setting-auto-dutch-fix')) {
            $('setting-auto-dutch-fix').addEventListener('change', (e) => {
                autoDutchFix = e.target.checked;
                localStorage.setItem('cv_auto_dutch_fix', autoDutchFix ? 'true' : 'false');
                if (autoDutchFix && profileData && profileData[activeKey]) {
                    profileData[activeKey] = deepCleanDutch(profileData[activeKey]);
                    commitData();
                    renderCV();
                }
            });
        }
        if ($('btn-fix-all-chars-now')) {
            $('btn-fix-all-chars-now').addEventListener('click', () => {
                if (profileData && profileData[activeKey]) {
                    profileData[activeKey] = deepCleanDutch(profileData[activeKey]);
                    commitData();
                    renderCV();
                }
                const toast = $('settings-toast-msg');
                if (toast) {
                    toast.style.display = 'block';
                    setTimeout(() => { if (toast) toast.style.display = 'none'; }, 3000);
                }
            });
        }
        $('profile-toggle').addEventListener('click',()=>{
            const keys=Object.keys(profileData).filter(k => k !== 'umut');
            const idx=keys.indexOf(activeKey);
            activeKey=keys[(idx+1)%keys.length];
            localStorage.setItem('activeProfile',activeKey);
            syncHashWithProfile(activeKey);
            renderCV();
        });

        window.addEventListener('hashchange', () => {
            const hp = getProfileFromHash();
            if (hp && hp !== activeKey && profileData[hp]) {
                activeKey = hp;
                localStorage.setItem('activeProfile', activeKey);
                renderCV();
            }
        });

        const UI_CLASSES_TO_IGNORE = [
            'actions-container', 'publish-controls-container', 'app-tooltip',
            'section-edit-actions', 'section-edit-btn', 'sidebar-add-btns',
            'sidebar-row-rm', 'add-item-btn', 'controls-panel', 'custom-modal-overlay',
            'download-dropdown', 'contact-toggle-vis', 'no-print'
        ];
        const isUIElement = el =>
            el.id === 'actions-container' || el.id === 'app-tooltip' ||
            UI_CLASSES_TO_IGNORE.some(cls => el.classList && el.classList.contains(cls));

        const downloadPDF = async () => {
            $('download-dropdown')?.classList.remove('active');

            const element = document.querySelector('.cv-container');
            document.body.classList.add('pdf-export-mode');
            const scalingLayer = $('scaling-layer');
            const origTransform = scalingLayer.style.transform;
            const origWidth = scalingLayer.style.width;
            const origHeight = element.style.height;
            scalingLayer.style.transform = 'none';
            scalingLayer.style.width = '680px';
            element.style.height = 'auto';

            const C = profileData[activeKey] || {};
            const fn = (C.profile && C.profile.firstName) ? C.profile.firstName.trim().replace(/\s+/g, '_') : 'Mustafa_Umut';
            const ln = (C.profile && C.profile.lastName) ? C.profile.lastName.trim().replace(/\s+/g, '_') : 'Gerguy';
            const pageSuffix = activeKey === 'student' ? '_Student' : '';
            const fileName = (fn && ln) ? `${fn}_${ln}${pageSuffix}_cv.pdf` : `${activeKey}_cv.pdf`;

            const restore = () => {
                document.body.classList.remove('pdf-export-mode');
                scalingLayer.style.transform = origTransform;
                scalingLayer.style.width = origWidth;
                element.style.height = origHeight;
            };

            if ((activeKey === 'boekhoudkundigassistent' || activeKey === 'umut') && !isEditing) {
                const link = document.createElement('a');
                link.href = 'Mustafa_Umut_Gerguy_cv.pdf';
                link.download = fileName;
                link.click();
                restore();
                return;
            }

            try {
                const canvas = await html2canvas(element, {
                    scale: 4,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    ignoreElements: isUIElement
                });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'pt', 'a4');
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                doc.save(fileName);
            } catch (err) {
                console.error('PDF Export Error:', err);
            } finally {
                restore();
            }
        };

        const downloadPNG = async () => {
            $('download-dropdown')?.classList.remove('active');

            const C = profileData[activeKey] || {};
            const fn = (C.profile && C.profile.firstName) ? C.profile.firstName.trim().replace(/\s+/g, '_') : 'Mustafa_Umut';
            const ln = (C.profile && C.profile.lastName) ? C.profile.lastName.trim().replace(/\s+/g, '_') : 'Gerguy';
            const pageSuffix = activeKey === 'student' ? '_Student' : '';
            const fileName = (fn && ln) ? `${fn}_${ln}${pageSuffix}_cv.png` : `${activeKey}_cv.png`;

            if ((activeKey === 'boekhoudkundigassistent' || activeKey === 'umut') && !isEditing) {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = 'Mustafa_Umut_Gerguy_cv.png';
                link.click();
                return;
            }

            const element = document.querySelector('.cv-container');
            document.body.classList.add('pdf-export-mode');
            const scalingLayer = $('scaling-layer');
            const origTransform = scalingLayer.style.transform;
            scalingLayer.style.transform = 'none';

            try {
                const canvas = await html2canvas(element, {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    ignoreElements: isUIElement
                });
                const link = document.createElement('a');
                link.download = fileName;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('PNG Export Error:', err);
            } finally {
                document.body.classList.remove('pdf-export-mode');
                scalingLayer.style.transform = origTransform;
            }
        };

        const downloadDocx = async (key) => {
            const activeK = key || activeKey || 'umut';
            const C = profileData[activeK];
            if (!C) return;

            const fn = (C.profile && C.profile.firstName) ? C.profile.firstName.trim().replace(/\s+/g, '_') : 'Mustafa_Umut';
            const ln = (C.profile && C.profile.lastName) ? C.profile.lastName.trim().replace(/\s+/g, '_') : 'Gerguy';
            const fileName = (fn && ln) ? `${fn}_${ln}_cv.docx` : `${activeK}_cv.docx`;

            if (window.docx) {
                try {
                    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType } = window.docx;
                    const ACCENT = "B38B59";
                    const TEXT_D = "1A1A1A";
                    const TEXT_M = "555555";
                    const BG_L = "F9F8F6";

                    const secTitle = (txt, ico) => new Paragraph({
                        spacing: { before: 240, after: 120 },
                        children: [
                            new TextRun({ text: ico ? ico + "  " : "", font: "Segoe UI", size: 20, color: ACCENT }),
                            new TextRun({ text: txt.toUpperCase(), bold: true, font: "Segoe UI", size: 22, color: ACCENT }),
                        ],
                        border: { bottom: { color: ACCENT, space: 4, style: BorderStyle.SINGLE, size: 12 } }
                    });

                    const bullet = (t, b) => new Paragraph({
                        spacing: { before: 50, after: 50 },
                        children: [
                            new TextRun({ text: "•  " + t, bold: true, font: "Segoe UI", size: 19, color: TEXT_D }),
                            ...(b ? [new TextRun({ text: "  [" + b + "]", bold: true, font: "Segoe UI", size: 17, color: ACCENT })] : [])
                        ]
                    });

                    const children = [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 40 },
                            children: [new TextRun({ text: `${(C.profile.firstName||'').toUpperCase()} ${(C.profile.lastName||'').toUpperCase()}`, bold: true, size: 36, font: "Segoe UI", color: TEXT_D })]
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 120 },
                            children: [new TextRun({ text: (C.profile.subtitle||'Boekhoudkundig Assistent').toUpperCase(), bold: true, size: 22, font: "Segoe UI", color: ACCENT })]
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 40, after: 200 },
                            children: [
                                ...(C.contact && C.contact.phone ? [new TextRun({ text: "GSM: ", bold: true, size: 18, color: ACCENT }), new TextRun({ text: C.contact.phone + "    |    ", size: 18 })] : []),
                                ...(C.contact && C.contact.email ? [new TextRun({ text: "E-MAIL: ", bold: true, size: 18, color: ACCENT }), new TextRun({ text: C.contact.email + "    |    ", size: 18 })] : []),
                                ...(C.contact && C.contact.street ? [new TextRun({ text: "ADRES: ", bold: true, size: 18, color: ACCENT }), new TextRun({ text: `${C.contact.street}, ${C.contact.zip||''} ${C.contact.city||''}`.trim(), size: 18 })] : [])
                            ]
                        })
                    ];

                    if (C.overMezelf && C.overMezelf.visible !== false) {
                        children.push(secTitle("Over Mezelf", "👤"));
                        children.push(new Paragraph({
                            spacing: { before: 60, after: 140 },
                            children: [new TextRun({ text: C.overMezelf.text || '', size: 19, font: "Segoe UI" })]
                        }));
                    }

                    const eduCells = [];
                    if (C.education && C.education.visible !== false) {
                        const eduChildren = [secTitle("Opleiding", "🎓")];
                        (C.education.items || []).forEach(it => {
                            eduChildren.push(new Paragraph({
                                spacing: { before: 40, after: 20 },
                                children: [
                                    new TextRun({ text: it.school, bold: true, size: 20, color: TEXT_D }),
                                    new TextRun({ text: "  |  " + it.year, size: 18, color: ACCENT, bold: true })
                                ]
                            }));
                            if (it.desc) {
                                eduChildren.push(new Paragraph({
                                    spacing: { before: 0, after: 80 },
                                    children: [new TextRun({ text: it.desc, size: 18, color: TEXT_M })]
                                }));
                            }
                        });
                        eduCells.push(new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: eduChildren }));
                    }

                    if (C.werkervaring && C.werkervaring.visible !== false) {
                        const expChildren = [secTitle("Werkervaring", "💼")];
                        if (C.werkervaring.type === 'items' && C.werkervaring.items) {
                            C.werkervaring.items.forEach(it => {
                                expChildren.push(new Paragraph({
                                    spacing: { before: 40, after: 20 },
                                    children: [
                                        new TextRun({ text: it.school, bold: true, size: 20, color: TEXT_D }),
                                        new TextRun({ text: "  |  " + it.year, size: 18, color: ACCENT, bold: true })
                                    ]
                                }));
                                if (it.desc) expChildren.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: it.desc, size: 18, color: TEXT_M })] }));
                            });
                        } else {
                            expChildren.push(new Paragraph({
                                spacing: { before: 40, after: 80 },
                                children: [new TextRun({ text: C.werkervaring.text || '', size: 18, font: "Segoe UI" })]
                            }));
                        }
                        eduCells.push(new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: expChildren }));
                    }

                    if (eduCells.length > 0) {
                        children.push(new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                            rows: [new TableRow({ children: eduCells })]
                        }));
                    }

                    const skillCells = [];
                    if (C.softSkills && C.softSkills.visible !== false) {
                        const skChildren = [secTitle(C.softSkills.title || "Competenties", "💡")];
                        (C.softSkills.items || []).forEach(it => {
                            if (it.name) skChildren.push(bullet(it.name, it.badge || ""));
                        });
                        skillCells.push(new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: skChildren }));
                    }
                    if (C.languages && C.languages.visible !== false) {
                        const langChildren = [secTitle(C.languages.title || "Talenkennis", "🌐")];
                        (C.languages.items || []).forEach(it => {
                            if (it.name) langChildren.push(bullet(`${it.name}: ${it.badge || ''}`, it.stars ? '★'.repeat(it.stars) : ''));
                        });
                        skillCells.push(new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: langChildren }));
                    }
                    if (skillCells.length > 0) {
                        children.push(new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                            rows: [new TableRow({ children: skillCells })]
                        }));
                    }

                    if (C.extra1 && C.extra1.visible !== false) {
                        children.push(secTitle(C.extra1.title || "IT & Digitale Vaardigheden", "💻"));
                        (C.extra1.items || []).forEach(it => {
                            if (it.name) children.push(bullet(it.name, it.badge || ""));
                        });
                    }

                    const motiv = C.motivatie || C.motivatiebrief;
                    if (motiv && motiv.visible !== false) {
                        children.push(secTitle(motiv.title || "Motivatie & Doelstelling", "🎯"));
                        (motiv.text || '').split('\n\n').forEach(par => {
                            children.push(new Paragraph({
                                spacing: { before: 60, after: 80 },
                                children: [new TextRun({ text: par, size: 19 })]
                            }));
                        });
                    }

                    if (C.sollicitatiebrief && C.sollicitatiebrief.visible !== false) {
                        children.push(secTitle(C.sollicitatiebrief.title || "Sollicitatiebrief", "📜"));
                        const sbPars = [];
                        if (C.sollicitatiebrief.companyPlaceholder) {
                            sbPars.push(new Paragraph({
                                spacing: { before: 0, after: 60 },
                                children: [new TextRun({ text: C.sollicitatiebrief.companyPlaceholder + "\n", size: 17, color: ACCENT, bold: true })]
                            }));
                        }
                        (C.sollicitatiebrief.text || '').split('\n\n').forEach(p => {
                            sbPars.push(new Paragraph({
                                spacing: { before: 50, after: 50 },
                                children: [new TextRun({ text: p, size: 18 })]
                            }));
                        });
                        children.push(new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT }, bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT }, left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT }, right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
                            rows: [new TableRow({ children: [new TableCell({ shading: { type: ShadingType.CLEAR, fill: BG_L }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: sbPars })] })]
                        }));
                    }

                    if (C.waaromIk && C.waaromIk.visible !== false) {
                        children.push(secTitle(C.waaromIk.title || "Waarom Ik?", "🌟"));
                        (C.waaromIk.items || []).forEach((it, i) => {
                            children.push(bullet(`${i + 1}. ${it.title}`));
                        });
                    }

                    const doc = new Document({
                        styles: { default: { document: { run: { font: "Segoe UI", color: TEXT_D } } } },
                        sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 800, right: 800 } } }, children }]
                    });

                    const blob = await Packer.toBlob(doc);
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = fileName;
                    link.click();
                    return;
                } catch (e) {
                    console.error("Docx generation error:", e);
                }
            }

            const link = document.createElement('a');
            link.href = 'Mustafa_Umut_Gerguy_cv.docx';
            link.download = fileName;
            link.click();
        };

        const bulkDownload = async (type) => {
            const keys = Object.keys(profileData);
            const originalKey = activeKey;
            for (const key of keys) {
                activeKey = key;
                renderCV();
                await new Promise(r => setTimeout(r, 600));
                if (type === 'pdf') await downloadPDF();
                else if (type === 'docx') await downloadDocx(key);
                else await downloadPNG();
                await new Promise(r => setTimeout(r, 600));
            }
            activeKey = originalKey;
            renderCV();
        };

        const printPNG = () => {
            const win = window.open('', '_blank');
            if (!win) {
                window.print();
                return;
            }
            win.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>Mustafa Umut Gerguy - CV (Görsel Baskı)</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; min-height: 100vh; }
        img { width: 100%; height: auto; max-height: 100vh; object-fit: contain; display: block; }
    </style>
</head>
<body>
    <img src="Mustafa_Umut_Gerguy_cv.png" onload="setTimeout(()=>{ window.print(); }, 250);" />
</body>
</html>`);
            win.document.close();
        };

        const btnDocx = $('dl-umut-docx');
        if (btnDocx) btnDocx.addEventListener('click', (e) => {
            if (isEditing || (activeKey !== 'boekhoudkundigassistent' && activeKey !== 'umut')) {
                e.preventDefault();
                downloadDocx(activeKey);
            }
            $('download-dropdown').classList.remove('active');
        });

        const btnVecPdf = $('dl-vector-pdf');
        if (btnVecPdf) btnVecPdf.addEventListener('click', () => {
            $('download-dropdown').classList.remove('active');
            setTimeout(() => window.print(), 150);
        });

        const btnUmutPdf = $('dl-umut-pdf');
        if (btnUmutPdf) btnUmutPdf.addEventListener('click', (e) => {
            if (isEditing || (activeKey !== 'boekhoudkundigassistent' && activeKey !== 'umut')) {
                e.preventDefault();
                $('download-dropdown').classList.remove('active');
                setTimeout(() => window.print(), 150);
                return;
            }
            $('download-dropdown').classList.remove('active');
        });

        const btnUmutPng = $('dl-umut-png');
        if (btnUmutPng) btnUmutPng.addEventListener('click', (e) => {
            if (isEditing || (activeKey !== 'boekhoudkundigassistent' && activeKey !== 'umut')) {
                e.preventDefault();
                renderCV();
                setTimeout(downloadPNG, 200);
            }
            $('download-dropdown').classList.remove('active');
        });

        const btnUmutPngPrint = $('dl-umut-png-print');
        if (btnUmutPngPrint) btnUmutPngPrint.addEventListener('click', () => {
            $('download-dropdown').classList.remove('active');
            printPNG();
        });



        $('dl-bulk-pdf').addEventListener('click', () => bulkDownload('pdf'));
        $('dl-bulk-png').addEventListener('click', () => bulkDownload('png'));
        $('dl-bulk-mixed').addEventListener('click', async () => { await bulkDownload('pdf'); await bulkDownload('png'); });

        $('download-menu-btn').addEventListener('click', () => $('download-dropdown').classList.toggle('active'));
        
        initHistory();renderCV();updateEditUI();updateTransform();
    };

    // ==========================================================================
    // SECURE AUTHENTICATION GATEKEEPER (!Eymen2017.)
    // ==========================================================================
    const isAuthorized = () => {
        const p = new URLSearchParams(window.location.search);
        if (p.get('headless') === '1') return true;
        return localStorage.getItem('cv_auth_success') === 'true' || 
               sessionStorage.getItem('cv_auth_success') === 'true' || 
               document.cookie.includes('cv_auth_success=true');
    };

    const setAuthorized = () => {
        localStorage.setItem('cv_auth_success', 'true');
        sessionStorage.setItem('cv_auth_success', 'true');
        document.cookie = "cv_auth_success=true; max-age=315360000; path=/; SameSite=Lax";
        document.documentElement.classList.add('is-authenticated');
    };

    const proceedToApp = () => {
        const ls = document.getElementById('login-screen');
        if (ls) ls.remove();
        const app = document.getElementById('app-wrapper');
        if (app) app.style.display = 'block';
        startApp();
    };

    if (isAuthorized()) {
        proceedToApp();
    } else {
        const loginBtn = document.getElementById('login-btn');
        const loginPass = document.getElementById('login-password');
        const loginErr = document.getElementById('login-error');
        const passToggleBtn = document.getElementById('toggle-password-visibility');
        const passEyeIcon = document.getElementById('pass-eye-icon');

        if (passToggleBtn && loginPass) {
            passToggleBtn.addEventListener('click', () => {
                if (loginPass.type === 'password') {
                    loginPass.type = 'text';
                    if (passEyeIcon) passEyeIcon.className = 'fa-solid fa-eye-slash';
                } else {
                    loginPass.type = 'password';
                    if (passEyeIcon) passEyeIcon.className = 'fa-solid fa-eye';
                }
            });
        }

        const doLogin = async () => {
            const pass = loginPass ? loginPass.value.trim() : '';
            let isOk = (pass === '!Eymen2017.');

            if (!isOk) {
                try {
                    const r = await fetch('api.php?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: pass })
                    });
                    const res = await r.json();
                    if (res && res.success) isOk = true;
                } catch(e) {}
            } else {
                try {
                    fetch('api.php?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: pass })
                    }).catch(() => {});
                } catch(e) {}
            }

            if (isOk) {
                setAuthorized();
                proceedToApp();
            } else {
                if (loginErr) {
                    loginErr.textContent = 'Hatalı şifre!';
                    loginErr.style.opacity = '1';
                    setTimeout(() => { if (loginErr) loginErr.style.opacity = '0'; }, 3000);
                }
                if (loginPass) {
                    loginPass.focus();
                    loginPass.select();
                }
            }
        };

        if (loginBtn) loginBtn.addEventListener('click', doLogin);
        if (loginPass) {
            loginPass.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doLogin();
                }
            });
            setTimeout(() => loginPass.focus(), 150);
        }
    }
});
