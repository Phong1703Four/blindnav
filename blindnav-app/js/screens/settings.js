/* ============================================
   Màn hình 6 — Cài đặt — FULL INTERACTIVE
   i18n + Audio Integrated
   ============================================ */

const SettingsScreen = {
  initialized: false,

  init() {
    if (!this.initialized) {
      this.setupToggles();
      this.setupRows();
      this.initialized = true;
    }
    // Always update dynamic values
    this.updateDynamicValues();
  },

  updateDynamicValues() {
    // Update geofence count
    const geoCount = document.getElementById('geofence-count-value');
    if (geoCount) geoCount.textContent = I18n.t('settings.zonesDyn', { count: BlindNavData.geofences.length });
    // Update check-in badge in settings
    const ci = BlindNavData.settings.checkIn;
    const settingBadge = document.getElementById('setting-checkin-badge');
    if (settingBadge) {
      settingBadge.textContent = ci.enabled ? I18n.t('settings.onLabel') : I18n.t('settings.offLabel');
      settingBadge.className = `badge ${ci.enabled ? 'badge-success' : 'badge-warning'}`;
    }
    // Update GPS interval display
    const gpsVal = document.getElementById('gps-interval-value');
    if (gpsVal) gpsVal.textContent = I18n.t('settings.gpsEveryDyn', { sec: BlindNavData.settings.gpsInterval });
    // Update language display
    const langVal = document.getElementById('language-value');
    if (langVal) langVal.textContent = I18n.getCurrentName();
  },

  setupToggles() {
    document.querySelectorAll('.ai-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const feature = e.target.dataset.feature;
        if (feature && BlindNavData.settings.ai.hasOwnProperty(feature)) {
          BlindNavData.settings.ai[feature] = e.target.checked;
          App.showToast(e.target.checked ? I18n.t('settings.featureOn') : I18n.t('settings.featureOff'), e.target.checked ? 'success' : 'info');
        }
      });
    });
    document.querySelectorAll('.notif-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const notif = e.target.dataset.notif;
        if (notif && BlindNavData.settings.notifications.hasOwnProperty(notif)) {
          BlindNavData.settings.notifications[notif] = e.target.checked;
          App.showToast(e.target.checked ? I18n.t('common.notifOn') : I18n.t('common.notifOff'), e.target.checked ? 'success' : 'info');
        }
      });
    });
    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
      BlindNavData.settings.voice.volume = parseInt(e.target.value);
    });
  },

  setupRows() {
    document.getElementById('setting-voice-gender')?.addEventListener('click', () => this.selectVoice());
    document.getElementById('setting-voice-speed')?.addEventListener('click', () => this.selectSpeed());
    document.getElementById('setting-gps-interval')?.addEventListener('click', () => this.selectGPSInterval());
    document.getElementById('setting-geofence')?.addEventListener('click', () => {
      if (typeof TrackingScreen !== 'undefined') TrackingScreen.showGeofenceEditor();
    });
    document.getElementById('setting-checkin')?.addEventListener('click', () => {
      if (typeof SOSScreen !== 'undefined') SOSScreen.editCheckIn();
    });
    document.getElementById('view-medical-btn')?.addEventListener('click', () => this.showMedicalProfile());
    document.getElementById('setting-theme-mode')?.addEventListener('click', () => this.selectTheme());
    document.getElementById('setting-language')?.addEventListener('click', () => this.selectLanguage());
  },

  // ═══════ TEST VOICE ═══════
  testVoice() {
    // 🔊 Speak a sample sentence using AudioManager
    if (typeof AudioManager !== 'undefined') {
      AudioManager.speakSample(I18n.currentLang);
    } else {
      App.showToast(I18n.t('audio.ttsNotSupported'), 'danger');
    }
  },

  // ═══════ VOICE SELECTOR ═══════
  selectVoice() {
    const voices = [
      { gender: 'Nữ', region: 'miền Bắc', key: 'voice.femaleNorth' },
      { gender: 'Nam', region: 'miền Bắc', key: 'voice.maleNorth' },
      { gender: 'Nữ', region: 'miền Nam', key: 'voice.femaleSouth' },
      { gender: 'Nam', region: 'miền Nam', key: 'voice.maleSouth' }
    ];
    const current = `${BlindNavData.settings.voice.gender} ${BlindNavData.settings.voice.region}`;

    let html = '<div style="padding:0 20px 20px;">';
    voices.forEach(v => {
      const label = I18n.t(v.key);
      const isActive = `${v.gender} ${v.region}` === current;
      html += `
        <div onclick="SettingsScreen.setVoice('${v.gender}','${v.region}','${v.key}')" 
          style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:12px;margin-bottom:8px;cursor:pointer;
          background:${isActive ? 'var(--color-primary-light)' : 'var(--color-bg)'};
          border:2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};
          transition:all 0.15s;">
          <span style="font-weight:${isActive ? '700' : '500'};font-size:1.0625rem;">${label}</span>
          ${isActive ? '<span style="color:var(--color-primary);font-weight:700;">✓</span>' : ''}
        </div>
      `;
    });
    html += '</div>';
    App.showModal(I18n.t('settings.voiceSelectTitle'), html);
  },

  setVoice(gender, region, key) {
    BlindNavData.settings.voice.gender = gender;
    BlindNavData.settings.voice.region = region;
    const label = I18n.t(key);
    const el = document.getElementById('voice-gender-value');
    if (el) el.textContent = `${gender} ${region}`;
    App.closeModal();
    App.showToast(I18n.t('settings.voiceSelected', { voice: label }), 'success');
  },

  // ═══════ SPEED SELECTOR ═══════
  selectSpeed() {
    const speeds = [
      { val: 'Rất chậm', key: 'voice.verySlow' },
      { val: 'Chậm', key: 'voice.slow' },
      { val: 'Bình thường', key: 'voice.normal' },
      { val: 'Nhanh', key: 'voice.fast' }
    ];
    const current = BlindNavData.settings.voice.speed;

    let html = '<div style="padding:0 20px 20px;">';
    html += `<p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('settings.speedNote2')}</p>`;
    speeds.forEach(s => {
      const label = I18n.t(s.key);
      const isActive = s.val === current;
      html += `
        <div onclick="SettingsScreen.setSpeed('${s.val}','${s.key}')"
          style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:12px;margin-bottom:8px;cursor:pointer;
          background:${isActive ? 'var(--color-primary-light)' : 'var(--color-bg)'};
          border:2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};">
          <span style="font-weight:${isActive ? '700' : '500'};">${label}</span>
          ${isActive ? '<span style="color:var(--color-primary);font-weight:700;">✓</span>' : ''}
        </div>
      `;
    });
    html += '</div>';
    App.showModal(I18n.t('settings.speedSelectTitle'), html);
  },

  setSpeed(speed, key) {
    BlindNavData.settings.voice.speed = speed;
    const label = I18n.t(key);
    const el = document.getElementById('voice-speed-value');
    if (el) el.textContent = label;
    App.closeModal();
    App.showToast(I18n.t('settings.speedSet', { speed: label }), 'success');
  },

  // ═══════ GPS INTERVAL SELECTOR ═══════
  selectGPSInterval() {
    const intervals = [
      { val: 5, labelKey: 'settings.gps5s', descKey: 'settings.gps5sDesc' },
      { val: 10, labelKey: 'settings.gps10s', descKey: 'settings.gps10sDesc' },
      { val: 30, labelKey: 'settings.gps30s', descKey: 'settings.gps30sDesc' }
    ];
    const current = BlindNavData.settings.gpsInterval;

    let html = '<div style="padding:0 20px 20px;">';
    html += `<p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('settings.gpsDesc')}</p>`;
    intervals.forEach(i => {
      const label = I18n.t(i.labelKey);
      const desc = I18n.t(i.descKey);
      const isActive = i.val === current;
      html += `
        <div onclick="SettingsScreen.setGPSInterval(${i.val},'${i.labelKey}')"
          style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:12px;margin-bottom:8px;cursor:pointer;
          background:${isActive ? 'var(--color-primary-light)' : 'var(--color-bg)'};
          border:2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};">
          <div>
            <div style="font-weight:${isActive ? '700' : '500'};">${label}</div>
            <div style="font-size:0.8125rem;color:var(--color-text-secondary);">${desc}</div>
          </div>
          ${isActive ? '<span style="color:var(--color-primary);font-weight:700;">✓</span>' : ''}
        </div>
      `;
    });
    html += '</div>';
    App.showModal(I18n.t('settings.gpsTitle'), html);
  },

  setGPSInterval(val, labelKey) {
    BlindNavData.settings.gpsInterval = val;
    const el = document.getElementById('gps-interval-value');
    if (el) el.textContent = I18n.t('settings.gpsEveryDyn', { sec: val });
    App.closeModal();
    App.showToast(I18n.t('settings.gpsSet', { label: I18n.t(labelKey) }), 'success');
  },

  // ═══════ THEME SELECTOR ═══════
  selectTheme() {
    const themes = [
      { val: 'light', key: 'themeSelect.light', descKey: 'themeSelect.lightDesc' },
      { val: 'dark', key: 'themeSelect.dark', descKey: 'themeSelect.darkDesc' },
      { val: 'system', key: 'themeSelect.system', descKey: 'themeSelect.systemDesc' }
    ];
    const current = ThemeManager?.currentTheme || 'light';

    let html = '<div style="padding:0 20px 20px;">';
    themes.forEach(t => {
      const label = I18n.t(t.key);
      const desc = I18n.t(t.descKey);
      const isActive = t.val === current;
      html += `
        <div onclick="SettingsScreen.setTheme('${t.val}','${t.key}')"
          style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:12px;margin-bottom:8px;cursor:pointer;
          background:${isActive ? 'var(--color-primary-light)' : 'var(--color-bg)'};
          border:2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};">
          <div>
            <div style="font-weight:${isActive ? '700' : '500'};">${label}</div>
            <div style="font-size:0.8125rem;color:var(--color-text-secondary);">${desc}</div>
          </div>
          ${isActive ? '<span style="color:var(--color-primary);font-weight:700;">✓</span>' : ''}
        </div>
      `;
    });
    html += '</div>';
    App.showModal(I18n.t('themeSelect.title'), html);
  },

  setTheme(val, key) {
    if (typeof ThemeManager !== 'undefined') {
      ThemeManager.setTheme(val);
    }
    const el = document.getElementById('theme-mode-value');
    if (el) el.textContent = I18n.t(key);
    App.closeModal();
    App.showToast(I18n.t('themeSelect.set', { theme: I18n.t(key) }), 'success');
  },

  // ═══════ LANGUAGE SELECTOR ═══════
  selectLanguage() {
    const langs = [
      { val: 'vi', label: '🇻🇳 Tiếng Việt' },
      { val: 'en', label: '🇬🇧 English' }
    ];
    const current = I18n.currentLang;

    let html = '<div style="padding:0 20px 20px;">';
    langs.forEach(l => {
      const isActive = l.val === current;
      html += `
        <div onclick="SettingsScreen.setLanguage('${l.val}','${l.label}')"
          style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:12px;margin-bottom:8px;cursor:pointer;
          background:${isActive ? 'var(--color-primary-light)' : 'var(--color-bg)'};
          border:2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};">
          <span style="font-weight:${isActive ? '700' : '500'};font-size:1.0625rem;">${l.label}</span>
          ${isActive ? '<span style="color:var(--color-primary);font-weight:700;">✓</span>' : ''}
        </div>
      `;
    });
    html += '</div>';
    App.showModal(I18n.t('langSelect.title'), html);
  },

  setLanguage(lang, label) {
    I18n.setLanguage(lang);
    const el = document.getElementById('language-value');
    if (el) el.textContent = label;
    App.closeModal();
    // Update all dynamic values after language change
    this.updateDynamicValues();
    // Re-render screens that have dynamic content
    if (typeof TrackingScreen !== 'undefined') {
      TrackingScreen.renderStatusBar();
      TrackingScreen.renderLocationInfo();
      TrackingScreen.updateStatusHeader();
    }
    App.showToast(I18n.t('langSelect.set', { lang: label }), 'success');
  },

  // ═══════ MEDICAL PROFILE ═══════
  showMedicalProfile() {
    const profile = BlindNavData.medicalProfile;
    const name = BlindNavData.glasses.pairedUser;
    let allergiesHtml = profile.allergies.map(a => `<span class="medical-tag">⚠️ ${a}</span>`).join(' ');
    let medsHtml = profile.medications.map(m => `
      <div class="medical-row">
        <span class="medical-label">${m.name}</span>
        <span class="medical-value">${m.schedule}</span>
      </div>
    `).join('');

    const overlay = document.getElementById('medical-modal');
    const content = overlay.querySelector('.modal-content');
    content.innerHTML = `
      <div class="modal-handle"></div>
      <div class="modal-header">
        <div class="modal-title">${I18n.t('settings.medTitle', { name })}</div>
        <button class="modal-close" onclick="SettingsScreen.closeMedical()">✕</button>
      </div>
      <div style="padding: 0 20px 20px;">
        <div class="medical-row"><span class="medical-label">${I18n.t('settings.medFullName')}</span><span class="medical-value">${profile.fullName}</span></div>
        <div class="medical-row"><span class="medical-label">${I18n.t('settings.medBirthYear')}</span><span class="medical-value">${profile.birthYear} (${I18n.t('settings.ageYears', { age: profile.age })})</span></div>
        <div class="medical-row"><span class="medical-label">${I18n.t('settings.medBloodType')}</span><span class="medical-value" style="color:var(--color-danger);font-weight:700;">${profile.bloodType}</span></div>
        <div class="section-label" style="padding-left:0;">${I18n.t('settings.medAllergies')}</div>
        <div style="margin-bottom:16px;">${allergiesHtml}</div>
        <div class="section-label" style="padding-left:0;">${I18n.t('settings.medConditions')}</div>
        ${profile.conditions.map(c => `<div class="medical-row"><span class="medical-label">•</span><span class="medical-value">${c}</span></div>`).join('')}
        <div class="section-label" style="padding-left:0;">${I18n.t('settings.medMedications')}</div>
        ${medsHtml}
        <div class="section-label" style="padding-left:0;">${I18n.t('settings.medDoctor')}</div>
        <div class="medical-row">
          <span class="medical-label">${profile.doctor.name}</span>
          <span class="medical-value">${profile.doctor.phone}</span>
        </div>
        <div style="display:flex;gap:12px;margin-top:20px;">
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="SettingsScreen.editMedical()">${I18n.t('settings.medEditBtn')}</button>
          <button class="btn btn-outline btn-lg" style="flex:1;" onclick="App.simulateCall('${profile.doctor.name.replace(/'/g, "\\'")}');">${I18n.t('settings.medCallDoc')}</button>
        </div>
      </div>
    `;
    overlay.classList.add('active');
  },

  closeMedical() { document.getElementById('medical-modal')?.classList.remove('active'); },

  editMedical() {
    this.closeMedical();
    const p = BlindNavData.medicalProfile;
    App.showModal(I18n.t('settings.medEditTitle'), `
      <div style="padding:0 20px 20px;">
        <label style="display:block;margin-bottom:10px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medFullName')}</span>
          <input type="text" id="med-name" value="${p.fullName}" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
        </label>
        <div style="display:flex;gap:12px;margin-bottom:10px;">
          <label style="flex:1;">
            <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medBirthYear')}</span>
            <input type="number" id="med-birth" value="${p.birthYear}" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
          </label>
          <label style="flex:1;">
            <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medBloodType')}</span>
            <select id="med-blood" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
              ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => `<option ${b===p.bloodType?'selected':''}>${b}</option>`).join('')}
            </select>
          </label>
        </div>
        <label style="display:block;margin-bottom:10px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medAllergiesSep')}</span>
          <input type="text" id="med-allergy" value="${p.allergies.join(', ')}" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:10px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medConditionsSep')}</span>
          <input type="text" id="med-conditions" value="${p.conditions.join(', ')}" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:10px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medMedsLabel')}</span>
          <div id="med-meds-list">
            ${p.medications.map((m, i) => `
              <div style="display:flex;gap:8px;margin-bottom:8px;">
                <input type="text" class="med-name-input" value="${m.name}" placeholder="${I18n.t('settings.medNamePlaceholder')}" style="flex:2;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:0.9375rem;">
                <input type="text" class="med-schedule-input" value="${m.schedule}" placeholder="${I18n.t('settings.medSchedulePlaceholder')}" style="flex:1;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:0.9375rem;">
              </div>
            `).join('')}
          </div>
          <button class="btn btn-outline" style="width:100%;height:36px;font-size:0.8125rem;margin-bottom:8px;" onclick="SettingsScreen.addMedRow()">${I18n.t('settings.medAddMed')}</button>
        </label>
        <label style="display:block;margin-bottom:16px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:4px;">${I18n.t('settings.medDoctorLabel')}</span>
          <div style="display:flex;gap:8px;">
            <input type="text" id="med-doctor" value="${p.doctor.name}" style="flex:1;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
            <input type="tel" id="med-doctor-phone" value="${p.doctor.phone}" style="flex:1;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:1rem;">
          </div>
        </label>
        <button class="btn btn-primary btn-block btn-lg" onclick="SettingsScreen.saveMedical()">${I18n.t('settings.medSave')}</button>
      </div>
    `);
  },

  addMedRow() {
    const container = document.getElementById('med-meds-list');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
    div.innerHTML = `
      <input type="text" class="med-name-input" value="" placeholder="${I18n.t('settings.medNamePlaceholder')}" style="flex:2;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:0.9375rem;">
      <input type="text" class="med-schedule-input" value="" placeholder="${I18n.t('settings.medSchedulePlaceholder')}" style="flex:1;padding:10px;border:2px solid var(--color-border);border-radius:8px;font-size:0.9375rem;">
    `;
    container.appendChild(div);
  },

  saveMedical() {
    const p = BlindNavData.medicalProfile;
    p.fullName = document.getElementById('med-name')?.value || p.fullName;
    p.birthYear = parseInt(document.getElementById('med-birth')?.value) || p.birthYear;
    p.age = new Date().getFullYear() - p.birthYear;
    p.bloodType = document.getElementById('med-blood')?.value || p.bloodType;
    p.allergies = (document.getElementById('med-allergy')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    p.conditions = (document.getElementById('med-conditions')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
    p.doctor.name = document.getElementById('med-doctor')?.value || p.doctor.name;
    p.doctor.phone = document.getElementById('med-doctor-phone')?.value || p.doctor.phone;
    // Save medications
    const medNames = document.querySelectorAll('.med-name-input');
    const medSchedules = document.querySelectorAll('.med-schedule-input');
    p.medications = [];
    medNames.forEach((nameEl, i) => {
      const name = nameEl.value.trim();
      const schedule = medSchedules[i]?.value.trim() || '';
      if (name) {
        p.medications.push({ name, schedule });
      }
    });
    App.closeModal();
    App.showToast(I18n.t('settings.medSaved'), 'success');
  }
};
