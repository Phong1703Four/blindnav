/* ============================================
   Màn hình 3 — SOS — FULL INTERACTIVE
   i18n + Audio Integrated
   ============================================ */

const SOSScreen = {
  initialized: false,
  audioPlaying: false,
  audioInterval: null,

  init() {
    if (!this.initialized) {
      this.setupActions();
      this.refreshContactsDisplay();
      this.refreshSOSHistory();
      this.initialized = true;
    }
  },

  setupActions() {
    document.getElementById('sos-demo-btn')?.addEventListener('click', () => App.triggerSOS());
    document.getElementById('sos-resolve-btn')?.addEventListener('click', () => this.resolvesSOS());
    document.getElementById('edit-contacts-btn')?.addEventListener('click', () => this.editContacts());
    document.getElementById('edit-checkin-btn')?.addEventListener('click', () => this.editCheckIn());

    // SOS overlay buttons
    document.getElementById('sos-view-map-btn')?.addEventListener('click', () => this.showSOSOnMap());
    document.getElementById('sos-audio-play-btn')?.addEventListener('click', () => this.toggleAudioPlayback());

    // Connection lost banner
    document.getElementById('connection-lost-contact-btn')?.addEventListener('click', () => {
      App.simulateCall(BlindNavData.glasses.pairedUser);
    });
  },

  startSOSSequence() {
    // Update overlay with current time and location
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    document.querySelector('.sos-alert-location').textContent = `${timeStr} · ${BlindNavData.glasses.location.address}`;

    setTimeout(() => {
      const step1 = document.getElementById('sos-step-sms');
      if (step1) { step1.querySelector('.sos-timeline-icon').textContent = '✅'; step1.querySelector('.sos-timeline-text').textContent = I18n.t('sos.smsSentDyn', { count: BlindNavData.emergencyContacts.length }); }
    }, 1000);
    setTimeout(() => {
      const step2 = document.getElementById('sos-step-call1');
      if (step2) { 
        step2.querySelector('.sos-timeline-icon').textContent = '🔄'; 
        step2.querySelector('.sos-timeline-text').textContent = I18n.t('sos.callingDyn', { name: BlindNavData.emergencyContacts[0].name }); 
        step2.querySelector('.sos-timeline-text').classList.add('calling'); 
        // 🔊 Play ringtone for SOS call
        if (typeof AudioManager !== 'undefined') AudioManager.playRingtone();
      }
    }, 2000);
    setTimeout(() => {
      // 🔊 Stop ringtone, play connect sound
      if (typeof AudioManager !== 'undefined') {
        AudioManager.stopRingtone();
        AudioManager.playCallConnect();
      }
      const step2 = document.getElementById('sos-step-call1');
      if (step2) { step2.querySelector('.sos-timeline-icon').textContent = '✅'; step2.querySelector('.sos-timeline-text').textContent = I18n.t('sos.answeredDyn', { name: BlindNavData.emergencyContacts[0].name }); step2.querySelector('.sos-timeline-text').classList.remove('calling'); }
      const step3 = document.getElementById('sos-step-backup');
      if (step3) { step3.querySelector('.sos-timeline-icon').textContent = '✅'; step3.querySelector('.sos-timeline-text').textContent = I18n.t('sos.noBackupDyn'); }
    }, 5000);
    this.startAudioWave();
  },

  startAudioWave() {
    const container = document.getElementById('sos-audio-wave');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const bar = document.createElement('div');
      bar.className = 'sos-audio-bar';
      bar.style.animationDelay = `${i * 0.05}s`;
      bar.style.height = `${Math.random() * 20 + 4}px`;
      container.appendChild(bar);
    }
  },

  // ═══════ SOS MAP VIEW ═══════
  showSOSOnMap() {
    const loc = BlindNavData.glasses.location;
    App.showModal(I18n.t('sos.mapTitle'), `
      <div style="padding:0 20px 20px;">
        <div id="sos-location-map" style="width:100%;height:250px;border-radius:12px;overflow:hidden;margin-bottom:16px;"></div>
        <div style="background:var(--color-danger-light);border-radius:12px;padding:16px;margin-bottom:12px;">
          <div style="font-weight:700;color:var(--color-danger);margin-bottom:4px;">${I18n.t('sos.sosLocationLabel')}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">📍 ${loc.address}</div>
          <div style="font-size:0.8125rem;color:var(--color-text-tertiary);margin-top:4px;">${I18n.t('sos.coordsLabel', { lat: loc.lat.toFixed(6), lng: loc.lng.toFixed(6) })}</div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="
            const url='https://maps.google.com/?q=${loc.lat},${loc.lng}';
            window.open(url, '_blank');
          ">${I18n.t('sos.openGMaps')}</button>
          <button class="btn btn-outline btn-lg" style="flex:1;" onclick="App.closeModal();">${I18n.t('common.close')}</button>
        </div>
      </div>
    `);

    // Init mini map
    setTimeout(() => {
      const mapEl = document.getElementById('sos-location-map');
      if (!mapEl) return;
      const miniMap = L.map(mapEl, { zoomControl: false, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(miniMap);
      miniMap.setView([loc.lat, loc.lng], 17);
      const sosIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#E24B4A;border-radius:50%;border:3px solid white;box-shadow:0 4px 16px rgba(226,75,74,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;animation: pulse-dot-danger 1.5s infinite;">🚨</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18]
      });
      L.marker([loc.lat, loc.lng], { icon: sosIcon }).addTo(miniMap);
    }, 400);
  },

  // ═══════ AUDIO PLAYBACK SIM ═══════
  toggleAudioPlayback() {
    const btn = document.getElementById('sos-audio-play-btn');
    const timeEl = document.getElementById('sos-audio-time');
    if (!btn) return;

    if (this.audioPlaying) {
      // Stop
      this.audioPlaying = false;
      btn.textContent = '▶';
      clearInterval(this.audioInterval);
      return;
    }

    // Play simulation
    this.audioPlaying = true;
    btn.textContent = '⏸';
    let seconds = 0;
    const totalSeconds = 30;

    // 🔊 Play a subtle notification to indicate playback started
    if (typeof AudioManager !== 'undefined') AudioManager.playNotification('info');

    // Animate bars
    const bars = document.querySelectorAll('.sos-audio-bar');
    bars.forEach(bar => bar.style.animation = 'audioWave 0.5s ease-in-out infinite alternate');

    this.audioInterval = setInterval(() => {
      seconds++;
      if (timeEl) {
        const remaining = totalSeconds - seconds;
        const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
        const ss = String(remaining % 60).padStart(2, '0');
        timeEl.textContent = `${mm}:${ss}`;
      }
      if (seconds >= totalSeconds) {
        this.audioPlaying = false;
        btn.textContent = '▶';
        if (timeEl) timeEl.textContent = '00:30';
        clearInterval(this.audioInterval);
        bars.forEach(bar => bar.style.animation = '');
        App.showToast(I18n.t('sos.audioPlayed'), 'info');
      }
    }, 1000);
  },

  resolvesSOS() {
    App.dismissSOS();
    this.audioPlaying = false;
    clearInterval(this.audioInterval);
    // 🔊 Play success notification
    if (typeof AudioManager !== 'undefined') AudioManager.playNotification('success');
    App.showToast(I18n.t('sos.resolvedToast'), 'success');
    // Add to history
    const now = new Date();
    const event = {
      id: 'sos_' + Date.now(),
      timestamp: now.getTime(),
      timeStr: now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'}),
      location: { ...BlindNavData.glasses.location },
      address: BlindNavData.glasses.location.address,
      status: 'resolved',
      respondedBy: BlindNavData.user.name,
      respondedAt: now.toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'}),
      note: ''
    };
    BlindNavData.sosEvents.unshift(event);
    this.refreshSOSHistory();
    this.resetTimeline();
  },

  resetTimeline() {
    setTimeout(() => {
      const defaults = [
        { id: 'sos-step-sms', icon: '⏳', text: I18n.t('sos.sendingSMS') },
        { id: 'sos-step-call1', icon: '⏳', text: I18n.t('sos.preparingCall') },
        { id: 'sos-step-backup', icon: '⏳', text: I18n.t('sos.backupDyn', { name: BlindNavData.emergencyContacts[1]?.name || I18n.t('sos.contactDefault', { n: 2 }) }) }
      ];
      defaults.forEach(d => {
        const el = document.getElementById(d.id);
        if (el) { el.querySelector('.sos-timeline-icon').textContent = d.icon; const t = el.querySelector('.sos-timeline-text'); t.textContent = d.text; t.classList.remove('calling'); }
      });
    }, 500);
  },

  refreshSOSHistory() {
    const container = document.getElementById('sos-history-list');
    if (!container) return;
    let html = '';
    BlindNavData.sosEvents.forEach(ev => {
      html += `
        <div class="sos-event-item" onclick="SOSScreen.showSOSDetail('${ev.id}')" style="cursor:pointer;">
          <div class="sos-event-time">🚨 ${ev.timeStr}</div>
          <div class="sos-event-location">📍 ${ev.address}</div>
          <div class="sos-event-resolved">${I18n.t('sos.resolvedDyn', { name: ev.respondedBy, time: ev.respondedAt })}</div>
        </div>
      `;
    });
    if (BlindNavData.sosEvents.length === 0) {
      html = `<div style="text-align:center;padding:20px;color:var(--color-text-tertiary);font-size:0.875rem;">${I18n.t('sos.noEventsDyn')}</div>`;
    }
    container.innerHTML = html;
  },

  showSOSDetail(sosId) {
    const ev = BlindNavData.sosEvents.find(e => e.id === sosId);
    if (!ev) return;
    App.showModal(I18n.t('sos.detailTitle'), `
      <div style="padding:0 20px 20px;">
        <div style="background:var(--color-danger-light);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;color:var(--color-danger);margin-bottom:4px;">🚨 ${ev.timeStr}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">📍 ${ev.address}</div>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-size:0.875rem;font-weight:600;margin-bottom:4px;">${I18n.t('sos.respondedByLabel')}</div>
          <div style="font-size:0.9375rem;">${I18n.t('sos.respondedAtLabel', { name: ev.respondedBy, time: ev.respondedAt })}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:0.875rem;font-weight:600;margin-bottom:6px;">${I18n.t('sos.noteLabel')}</div>
          <textarea id="sos-note-input" placeholder="${I18n.t('sos.notePlaceholder')}" style="width:100%;height:80px;border:2px solid var(--color-border);border-radius:10px;padding:12px;font-size:0.9375rem;font-family:inherit;resize:none;">${ev.note || ''}</textarea>
        </div>
        <button class="btn btn-primary btn-block" onclick="
          const note=document.getElementById('sos-note-input').value;
          const ev=BlindNavData.sosEvents.find(e=>e.id==='${sosId}');
          if(ev)ev.note=note;
          App.closeModal();
          App.showToast(I18n.t('sos.noteSaved'),'success');
        ">${I18n.t('sos.saveNoteBtn')}</button>
      </div>
    `);
  },

  // ═══════ EDIT EMERGENCY CONTACTS ═══════
  editContacts() {
    let html = '<div style="padding:0 20px 20px;">';
    html += `<p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('sos.contactsDesc')}</p>`;

    BlindNavData.emergencyContacts.forEach((c, i) => {
      html += `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--color-bg);border-radius:12px;margin-bottom:8px;" id="contact-row-${i}">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${c.order}</div>
          <div style="flex:1;">
            <input type="text" value="${c.name}" class="contact-name-input" style="width:100%;padding:8px;border:1px solid var(--color-border);border-radius:8px;font-size:0.9375rem;font-weight:600;margin-bottom:4px;">
            <input type="tel" value="${c.phone}" class="contact-phone-input" style="width:100%;padding:8px;border:1px solid var(--color-border);border-radius:8px;font-size:0.875rem;">
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${i > 0 ? `<button style="background:none;border:none;font-size:1rem;cursor:pointer;" onclick="SOSScreen.moveContact(${i},-1)">⬆️</button>` : '<div style="height:24px;"></div>'}
            ${i < BlindNavData.emergencyContacts.length - 1 ? `<button style="background:none;border:none;font-size:1rem;cursor:pointer;" onclick="SOSScreen.moveContact(${i},1)">⬇️</button>` : '<div style="height:24px;"></div>'}
          </div>
          <button style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--color-danger);" onclick="SOSScreen.removeContact(${i})">✕</button>
        </div>
      `;
    });

    html += `
      <button class="btn btn-outline btn-block" style="margin-bottom:16px;" onclick="SOSScreen.addContact()">${I18n.t('sos.addContact')}</button>
      <div style="background:var(--color-warning-light);border-radius:10px;padding:12px;margin-bottom:16px;font-size:0.8125rem;color:var(--color-warning-dark);">
        ${I18n.t('sos.fallback')}
      </div>
      <button class="btn btn-primary btn-block btn-lg" onclick="SOSScreen.saveContacts()">${I18n.t('sos.saveChanges')}</button>
    `;
    html += '</div>';
    App.showModal(I18n.t('sos.contactsTitle'), html);
  },

  moveContact(idx, dir) {
    const arr = BlindNavData.emergencyContacts;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    arr.forEach((c, i) => c.order = i + 1);
    this.editContacts(); // Re-render
  },

  removeContact(idx) {
    if (BlindNavData.emergencyContacts.length <= 1) { App.showToast(I18n.t('sos.contactMin'), 'danger'); return; }
    BlindNavData.emergencyContacts.splice(idx, 1);
    BlindNavData.emergencyContacts.forEach((c, i) => c.order = i + 1);
    this.editContacts();
  },

  addContact() {
    const newOrder = BlindNavData.emergencyContacts.length + 1;
    BlindNavData.emergencyContacts.push({ id: Date.now(), name: '', phone: '', order: newOrder });
    this.editContacts();
  },

  saveContacts() {
    const names = document.querySelectorAll('.contact-name-input');
    const phones = document.querySelectorAll('.contact-phone-input');
    names.forEach((n, i) => {
      if (BlindNavData.emergencyContacts[i]) {
        BlindNavData.emergencyContacts[i].name = n.value.trim() || I18n.t('sos.contactDefault', { n: i+1 });
        BlindNavData.emergencyContacts[i].phone = phones[i]?.value.trim() || '';
      }
    });
    // Remove empty
    BlindNavData.emergencyContacts = BlindNavData.emergencyContacts.filter(c => c.phone);
    BlindNavData.emergencyContacts.forEach((c, i) => c.order = i + 1);
    App.closeModal();
    this.refreshContactsDisplay();
    App.showToast(I18n.t('sos.contactsSaved'), 'success');
  },

  refreshContactsDisplay() {
    const container = document.getElementById('contacts-display');
    if (!container) return;
    let html = '';
    BlindNavData.emergencyContacts.forEach(c => {
      html += `
        <div class="contact-item">
          <div class="contact-order">${c.order}</div>
          <div class="contact-info">
            <div class="contact-name">${c.name}</div>
            <div class="contact-phone">${c.phone}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  // ═══════ EDIT CHECK-IN SETTINGS ═══════
  editCheckIn() {
    const ci = BlindNavData.settings.checkIn;
    App.showModal(I18n.t('sos.checkinTitle'), `
      <div style="padding:0 20px 20px;">
        <p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('sos.checkinDesc2')}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <span style="font-weight:600;">${I18n.t('sos.enableCheckin')}</span>
          <label class="toggle-switch">
            <input type="checkbox" id="checkin-enabled" ${ci.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('sos.maxTime')}</span>
          <select id="checkin-hours" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
            <option value="1" ${ci.maxHours===1?'selected':''}>${I18n.t('sos.hoursN', { n: 1 })}</option>
            <option value="2" ${ci.maxHours===2?'selected':''}>${I18n.t('sos.hoursN', { n: 2 })}</option>
            <option value="3" ${ci.maxHours===3?'selected':''}>${I18n.t('sos.hoursN', { n: 3 })}</option>
            <option value="4" ${ci.maxHours===4?'selected':''}>${I18n.t('sos.hoursN', { n: 4 })}</option>
          </select>
        </label>
        <label style="display:block;margin-bottom:20px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('sos.actionOvertime')}</span>
          <select id="checkin-action" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
            <option value="notify" ${ci.action==='notify'?'selected':''}>${I18n.t('sos.notifyOnly')}</option>
            <option value="notify_then_call" ${ci.action==='notify_then_call'?'selected':''}>${I18n.t('sos.notifyThenCall')}</option>
            <option value="full_sos" ${ci.action==='full_sos'?'selected':''}>${I18n.t('sos.fullSOSAlert')}</option>
          </select>
        </label>
        <button class="btn btn-primary btn-block btn-lg" onclick="SOSScreen.saveCheckIn()">${I18n.t('sos.saveSettings')}</button>
      </div>
    `);
  },

  saveCheckIn() {
    BlindNavData.settings.checkIn.enabled = document.getElementById('checkin-enabled')?.checked ?? true;
    BlindNavData.settings.checkIn.maxHours = parseInt(document.getElementById('checkin-hours')?.value) || 2;
    BlindNavData.settings.checkIn.action = document.getElementById('checkin-action')?.value || 'notify_then_call';
    App.closeModal();
    // Update SOS screen display
    const ci = BlindNavData.settings.checkIn;
    const badge = document.getElementById('checkin-badge');
    const desc = document.getElementById('checkin-desc');
    if (badge) { badge.textContent = ci.enabled ? I18n.t('sos.active') : I18n.t('sos.disabled'); badge.className = `badge ${ci.enabled ? 'badge-success' : 'badge-warning'}`; }
    if (desc) desc.textContent = ci.enabled ? I18n.t('sos.checkinOnDesc', { hours: ci.maxHours }) : I18n.t('sos.checkinOffDesc');
    // Also update settings screen check-in badge
    const settingBadge = document.getElementById('setting-checkin-badge');
    if (settingBadge) { settingBadge.textContent = ci.enabled ? I18n.t('settings.onLabel') : I18n.t('settings.offLabel'); settingBadge.className = `badge ${ci.enabled ? 'badge-success' : 'badge-warning'}`; }
    App.showToast(I18n.t('sos.checkinSaved'), 'success');
  }
};
