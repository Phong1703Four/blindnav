/* ============================================
   Màn hình 2 — Lộ trình — FULL INTERACTIVE
   i18n Integrated
   ============================================ */

const RoutesScreen = {
  initialized: false,
  addRouteStep: 0,
  newRoute: null,

  init() {
    if (!this.initialized) {
      this.renderRouteList();
      this.initialized = true;
    }
  },

  renderRouteList() {
    const container = document.getElementById('route-list');
    if (!container) return;

    let html = '';
    BlindNavData.routes.forEach(route => {
      html += `
        <div class="route-card" onclick="RoutesScreen.showRouteDetail('${route.id}')">
          <div class="route-dot ${route.frequency}"></div>
          <div class="route-info">
            <div class="route-name">${route.name}</div>
            <div class="route-meta"><span>${route.distance} km</span><span>·</span><span>${I18n.t('routes.usedTimes', { count: route.usageCount })}</span></div>
            <div class="route-last">${I18n.t('routes.lastUsedLabel', { time: route.lastUsed })}</div>
          </div>
          <div class="route-arrow">›</div>
        </div>
      `;
    });
    html += `<div class="add-route-btn" onclick="RoutesScreen.startAddRoute()"><span>＋</span><span>${I18n.t('routes.addNew')}</span></div>`;
    container.innerHTML = html;
  },

  showRouteDetail(routeId) {
    const route = BlindNavData.routes.find(r => r.id === routeId);
    if (!route) return;
    const overlay = document.getElementById('route-detail-modal');
    if (!overlay) return;

    let landmarksHtml = '';
    route.landmarks.forEach(lm => {
      const isWarning = lm.alertLevel === 'warning';
      landmarksHtml += `
        <div class="landmark-item">
          <div class="landmark-icon ${isWarning ? 'warning' : 'info'}">${isWarning ? '⚠️' : 'ℹ️'}</div>
          <div class="landmark-content">
            <div class="landmark-distance">km ${lm.distanceFromStart}</div>
            <div class="landmark-note">${lm.note}</div>
          </div>
          <button style="background:none;border:none;font-size:1.2rem;cursor:pointer;padding:4px;" onclick="RoutesScreen.editLandmark('${routeId}','${lm.id}')">✏️</button>
        </div>
      `;
    });
    if (route.landmarks.length === 0) {
      landmarksHtml = `<div style="padding:12px 0;color:var(--color-text-tertiary);font-size:0.875rem;">${I18n.t('routes.noLandmarks')}</div>`;
    }

    let historyHtml = '';
    route.history.forEach(h => {
      historyHtml += `<div class="usage-item"><span>${h.date}</span><span>${h.duration}</span></div>`;
    });

    const content = overlay.querySelector('.modal-content');
    content.innerHTML = `
      <div class="modal-handle"></div>
      <div class="modal-header">
        <div class="modal-title">${route.name}</div>
        <button class="modal-close" onclick="RoutesScreen.closeDetail()">✕</button>
      </div>
      <div class="route-detail-map" id="route-detail-map-container"></div>
      <div class="route-detail-stats">
        <div class="route-stat"><span class="route-stat-icon">📏</span><span>${route.distance} km</span></div>
        <div class="route-stat"><span class="route-stat-icon">🚶</span><span>~${route.duration} ${I18n.t('tracking.minutes')}</span></div>
        <div class="route-stat"><span class="route-stat-icon">🔄</span><span>${I18n.t('routes.usedTimes', { count: route.usageCount })}</span></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0 20px;">
        <div class="section-label" style="padding:0;">${I18n.t('routes.landmarkCount', { count: route.landmarks.length })}</div>
        <button class="btn btn-ghost" style="height:32px;font-size:0.8125rem;" onclick="RoutesScreen.addLandmark('${routeId}')">${I18n.t('routes.addLandmarkShort')}</button>
      </div>
      <div class="landmarks-section">${landmarksHtml}</div>
      <div class="section-label">${I18n.t('routes.usageHistory')}</div>
      <div class="usage-history">${historyHtml}</div>
      <div class="section-label">${I18n.t('routes.voiceCommandLabel')}</div>
      <div style="padding:0 20px 16px;">
        <div style="background:var(--color-bg);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:8px;">
          <span>🎤</span>
          <span style="font-weight:600;">"${route.voiceCommand}"</span>
          <button style="margin-left:auto;background:none;border:none;font-size:1rem;cursor:pointer;" onclick="RoutesScreen.editVoiceCommand('${routeId}')">✏️</button>
        </div>
      </div>
      <div class="route-actions">
        <button class="btn btn-primary btn-block btn-lg sync-btn" onclick="RoutesScreen.syncRoute('${route.id}')">${I18n.t('routes.syncToGlasses')}</button>
        <button class="btn btn-outline btn-block" style="color:var(--color-danger);border-color:var(--color-danger);" onclick="RoutesScreen.deleteRoute('${routeId}')">${I18n.t('routes.deleteRoute')}</button>
      </div>
    `;
    overlay.classList.add('active');
    setTimeout(() => this.initRouteDetailMap(route), 400);
  },

  initRouteDetailMap(route) {
    const mapEl = document.getElementById('route-detail-map-container');
    if (!mapEl) return;
    const miniMap = L.map(mapEl, { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(miniMap);
    const coords = route.waypoints.map(w => [w.lat, w.lng]);
    const polyline = L.polyline(coords, { color: route.color, weight: 4, opacity: 0.8 }).addTo(miniMap);
    route.landmarks.forEach(lm => {
      const icon = L.divIcon({ className: '', html: `<div style="width:24px;height:24px;background:${lm.alertLevel === 'warning' ? '#F59E0B' : '#1A73E8'};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">${lm.alertLevel === 'warning' ? '⚠' : 'ℹ'}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
      L.marker([lm.lat, lm.lng], { icon }).addTo(miniMap).bindPopup(`<b>${lm.note}</b>`);
    });
    if (coords.length >= 2) {
      const sIcon = L.divIcon({ className:'', html:`<div style="width:20px;height:20px;background:#1D9E75;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:white;">A</div>`, iconSize:[20,20], iconAnchor:[10,10] });
      const eIcon = L.divIcon({ className:'', html:`<div style="width:20px;height:20px;background:#E24B4A;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:white;">B</div>`, iconSize:[20,20], iconAnchor:[10,10] });
      L.marker(coords[0], { icon: sIcon }).addTo(miniMap);
      L.marker(coords[coords.length - 1], { icon: eIcon }).addTo(miniMap);
    }
    miniMap.fitBounds(polyline.getBounds(), { padding: [30, 30] });
  },

  closeDetail() { document.getElementById('route-detail-modal')?.classList.remove('active'); },

  syncRoute(routeId) {
    const btn = document.querySelector('.sync-btn');
    if (btn) { btn.classList.add('syncing'); btn.innerHTML = I18n.t('routes.syncing'); btn.disabled = true; }
    setTimeout(() => {
      if (btn) { btn.classList.remove('syncing'); btn.innerHTML = I18n.t('routes.synced'); btn.style.background = 'var(--color-success)'; }
      App.showToast(I18n.t('routes.syncedToast'), 'success');
      setTimeout(() => { if(btn) { btn.innerHTML = I18n.t('routes.syncToGlasses'); btn.style.background = ''; btn.disabled = false; } }, 3000);
    }, 2000);
  },

  deleteRoute(routeId) {
    App.showModal(I18n.t('routes.deleteConfirm'), `
      <div style="padding:0 20px 20px;text-align:center;">
        <p style="margin-bottom:20px;">${I18n.t('routes.deleteDesc')}</p>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-outline btn-lg" style="flex:1;" onclick="App.closeModal()">${I18n.t('common.cancel')}</button>
          <button class="btn btn-danger btn-lg" style="flex:1;" onclick="RoutesScreen.confirmDelete('${routeId}')">${I18n.t('common.delete')}</button>
        </div>
      </div>
    `);
  },

  confirmDelete(routeId) {
    const idx = BlindNavData.routes.findIndex(r => r.id === routeId);
    if (idx > -1) BlindNavData.routes.splice(idx, 1);
    App.closeModal();
    this.closeDetail();
    this.renderRouteList();
    App.showToast(I18n.t('routes.deleted'), 'info');
  },

  editVoiceCommand(routeId) {
    const route = BlindNavData.routes.find(r => r.id === routeId);
    if (!route) return;
    App.showModal(I18n.t('routes.voiceTitle'), `
      <div style="padding:0 20px 20px;">
        <p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:12px;">${I18n.t('routes.voiceDesc')}</p>
        <input type="text" id="voice-cmd-input" value="${route.voiceCommand}" style="width:100%;padding:14px;border:2px solid var(--color-border);border-radius:12px;font-size:1.125rem;font-weight:600;text-align:center;">
        <button class="btn btn-primary btn-block btn-lg" style="margin-top:16px;" onclick="
          const val = document.getElementById('voice-cmd-input').value.trim();
          if(val) { RoutesScreen.saveVoiceCommand('${routeId}', val); }
        ">${I18n.t('routes.saveCommand')}</button>
      </div>
    `);
  },

  saveVoiceCommand(routeId, cmd) {
    const route = BlindNavData.routes.find(r => r.id === routeId);
    if (route) route.voiceCommand = cmd;
    App.closeModal();
    this.showRouteDetail(routeId);
    App.showToast(I18n.t('routes.voiceSaved'), 'success');
  },

  addLandmark(routeId) {
    App.showModal(I18n.t('routes.addLandmarkTitle'), `
      <div style="padding:0 20px 20px;">
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.noteLabel')}</span>
          <input type="text" id="lm-note-input" placeholder='${I18n.t('routes.notePlaceholder')}' style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.positionLabel')}</span>
          <input type="number" id="lm-dist-input" value="0.5" step="0.1" min="0" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.levelLabel')}</span>
          <select id="lm-level-input" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
            <option value="warning">${I18n.t('routes.levelWarning')}</option>
            <option value="info">${I18n.t('routes.levelInfo')}</option>
          </select>
        </label>
        <label style="display:block;margin-bottom:20px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.alertDistLabel')}</span>
          <select id="lm-alert-dist" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
            <option value="5">${I18n.t('routes.alertBefore5')}</option>
            <option value="10" selected>${I18n.t('routes.alertBefore10')}</option>
            <option value="20">${I18n.t('routes.alertBefore20')}</option>
          </select>
        </label>
        <button class="btn btn-primary btn-block btn-lg" onclick="RoutesScreen.saveLandmark('${routeId}')">${I18n.t('routes.addLandmarkBtn')}</button>
      </div>
    `);
  },

  saveLandmark(routeId) {
    const route = BlindNavData.routes.find(r => r.id === routeId);
    if (!route) return;
    const note = document.getElementById('lm-note-input')?.value;
    const dist = parseFloat(document.getElementById('lm-dist-input')?.value) || 0.5;
    const level = document.getElementById('lm-level-input')?.value || 'warning';
    const alertDist = parseInt(document.getElementById('lm-alert-dist')?.value) || 10;
    if (!note?.trim()) { document.getElementById('lm-note-input').style.borderColor = 'var(--color-danger)'; return; }
    // Interpolate position
    const wp = route.waypoints;
    const ratio = Math.min(dist / route.distance, 1);
    const idx = Math.floor(ratio * (wp.length - 1));
    const lat = wp[Math.min(idx, wp.length-1)].lat + (Math.random() - 0.5) * 0.001;
    const lng = wp[Math.min(idx, wp.length-1)].lng + (Math.random() - 0.5) * 0.001;
    route.landmarks.push({ id: 'lm_' + Date.now(), lat, lng, distanceFromStart: dist, note, alertLevel: level, alertDistance: alertDist });
    App.closeModal();
    this.showRouteDetail(routeId);
    App.showToast(I18n.t('routes.landmarkAdded'), 'success');
  },

  editLandmark(routeId, lmId) {
    const route = BlindNavData.routes.find(r => r.id === routeId);
    const lm = route?.landmarks.find(l => l.id === lmId);
    if (!lm) return;

    App.showModal(I18n.t('routes.editLandmark'), `
      <div style="padding:0 20px 20px;">
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.noteEditLabel')}</span>
          <input type="text" id="edit-lm-note" value="${lm.note}" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.levelLabel')}</span>
          <select id="edit-lm-level" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
            <option value="warning" ${lm.alertLevel==='warning'?'selected':''}>${I18n.t('routes.levelWarning')}</option>
            <option value="info" ${lm.alertLevel==='info'?'selected':''}>${I18n.t('routes.levelInfo')}</option>
          </select>
        </label>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="
            const note=document.getElementById('edit-lm-note').value;
            const level=document.getElementById('edit-lm-level').value;
            const r=BlindNavData.routes.find(r=>r.id==='${routeId}');
            const l=r?.landmarks.find(l=>l.id==='${lmId}');
            if(l){l.note=note;l.alertLevel=level;}
            App.closeModal();RoutesScreen.showRouteDetail('${routeId}');
            App.showToast(I18n.t('routes.landmarkUpdated'),'success');
          ">${I18n.t('common.save')}</button>
          <button class="btn btn-outline btn-lg" style="flex:1;color:var(--color-danger);border-color:var(--color-danger);" onclick="
            const r=BlindNavData.routes.find(r=>r.id==='${routeId}');
            if(r){r.landmarks=r.landmarks.filter(l=>l.id!=='${lmId}');}
            App.closeModal();RoutesScreen.showRouteDetail('${routeId}');
            App.showToast(I18n.t('routes.landmarkDeleted'),'info');
          ">${I18n.t('common.delete')}</button>
        </div>
      </div>
    `);
  },

  // ═══════ ADD ROUTE WIZARD (4 Steps) ═══════
  startAddRoute() {
    this.newRoute = {
      id: 'route_' + Date.now(),
      name: '', voiceCommand: '', distance: 0, duration: 0,
      usageCount: 0, lastUsed: I18n.t('routes.neverUsed'), frequency: 'unused', color: '#1A73E8',
      waypoints: [], landmarks: [], history: []
    };
    this.showAddRouteStep1();
  },

  showAddRouteStep1() {
    App.showModal(I18n.t('routes.step1'), `
      <div style="padding:0 20px 20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
        </div>
        <p style="font-size:0.875rem;color:var(--color-text-secondary);margin:12px 0 16px;">${I18n.t('routes.startDefault')}</p>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.startLabel')}</span>
          <input type="text" id="route-start" value="${I18n.t('routes.homePrefix', { address: BlindNavData.glasses.location.address })}" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;background:var(--color-bg);" readonly>
        </label>
        <label style="display:block;margin-bottom:20px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.endLabel')}</span>
          <input type="text" id="route-end" placeholder='${I18n.t('routes.endPlaceholder')}' style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <button class="btn btn-primary btn-block btn-lg" onclick="RoutesScreen.addRouteStep2()">${I18n.t('routes.next')}</button>
      </div>
    `);
  },

  addRouteStep2() {
    const dest = document.getElementById('route-end')?.value?.trim();
    if (!dest) { document.getElementById('route-end').style.borderColor='var(--color-danger)'; return; }
    this.newRoute._dest = dest;
    // Generate fake waypoints
    const startLat = BlindNavData.glasses.location.lat;
    const startLng = BlindNavData.glasses.location.lng;
    const endLat = startLat + (Math.random() - 0.3) * 0.01;
    const endLng = startLng + (Math.random() - 0.3) * 0.01;
    this.newRoute.waypoints = [
      { lat: startLat, lng: startLng },
      { lat: (startLat + endLat) / 2, lng: (startLng + endLng) / 2 + (Math.random()-0.5)*0.003 },
      { lat: endLat, lng: endLng }
    ];
    this.newRoute.distance = (Math.random() * 2 + 0.5).toFixed(1);
    this.newRoute.duration = Math.round(this.newRoute.distance * 13);

    App.showModal(I18n.t('routes.step2'), `
      <div style="padding:0 20px 20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
        </div>
        <div style="background:var(--color-bg);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">${I18n.t('routes.homePrefix', { address: '' }).replace(' — ', '')} → ${dest}</div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--color-primary);margin:8px 0;">${this.newRoute.distance} km</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">${I18n.t('routes.walkMinutes', { min: this.newRoute.duration })}</div>
        </div>
        <p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('routes.routeOptimal')}</p>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-outline btn-lg" style="flex:1;" onclick="RoutesScreen.showAddRouteStep1()">${I18n.t('routes.back')}</button>
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="RoutesScreen.addRouteStep3()">${I18n.t('routes.next')}</button>
        </div>
      </div>
    `);
  },

  addRouteStep3() {
    App.showModal(I18n.t('routes.step3'), `
      <div style="padding:0 20px 20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-border);border-radius:4px;"></div>
        </div>
        <p style="font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:16px;">${I18n.t('routes.step3Desc')}</p>
        <div id="new-route-landmarks"></div>
        <button class="btn btn-outline btn-block" style="margin-bottom:16px;" onclick="RoutesScreen.addNewRouteLandmark()">${I18n.t('routes.addLandmarkTitle')}</button>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-outline btn-lg" style="flex:1;" onclick="RoutesScreen.addRouteStep2()">${I18n.t('routes.back')}</button>
          <button class="btn btn-primary btn-lg" style="flex:1;" onclick="RoutesScreen.addRouteStep4()">${I18n.t('routes.next')}</button>
        </div>
      </div>
    `);
  },

  _tempLandmarks: [],
  addNewRouteLandmark() {
    const container = document.getElementById('new-route-landmarks');
    if (!container) return;
    const idx = this._tempLandmarks.length;
    this._tempLandmarks.push({});
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--color-bg);border-radius:10px;padding:12px;margin-bottom:12px;';
    div.innerHTML = `
      <input type="text" placeholder="${I18n.t('routes.notePlaceholder')}" class="lm-new-note" style="width:100%;padding:10px;border:1px solid var(--color-border);border-radius:8px;font-size:0.9375rem;margin-bottom:8px;">
      <div style="display:flex;gap:8px;">
        <select class="lm-new-level" style="flex:1;padding:8px;border:1px solid var(--color-border);border-radius:8px;">
          <option value="warning">${I18n.t('routes.levelWarning')}</option>
          <option value="info">${I18n.t('routes.levelInfo')}</option>
        </select>
        <select class="lm-new-dist" style="flex:1;padding:8px;border:1px solid var(--color-border);border-radius:8px;">
          <option value="5">${I18n.t('routes.alertBefore5')}</option>
          <option value="10" selected>${I18n.t('routes.alertBefore10')}</option>
          <option value="20">${I18n.t('routes.alertBefore20')}</option>
        </select>
      </div>
    `;
    container.appendChild(div);
  },

  addRouteStep4() {
    // Collect landmarks from step 3
    const notes = document.querySelectorAll('.lm-new-note');
    const levels = document.querySelectorAll('.lm-new-level');
    const dists = document.querySelectorAll('.lm-new-dist');
    this.newRoute.landmarks = [];
    notes.forEach((n, i) => {
      if (n.value.trim()) {
        this.newRoute.landmarks.push({
          id: 'lm_' + Date.now() + i, lat: this.newRoute.waypoints[1].lat, lng: this.newRoute.waypoints[1].lng,
          distanceFromStart: 0.5, note: n.value, alertLevel: levels[i]?.value || 'warning', alertDistance: parseInt(dists[i]?.value) || 10
        });
      }
    });
    this._tempLandmarks = [];

    App.showModal(I18n.t('routes.step4'), `
      <div style="padding:0 20px 20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
          <div style="width:100%;height:4px;background:var(--color-primary);border-radius:4px;"></div>
        </div>
        <label style="display:block;margin-bottom:12px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.routeNameLabel')}</span>
          <input type="text" id="new-route-name" placeholder='${I18n.t('routes.routeNamePlaceholder')}' value="${I18n.t('routes.homePrefix', { address: '' }).replace(' — ', '')} → ${this.newRoute._dest}" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <label style="display:block;margin-bottom:20px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('routes.voiceCmdLabel')}</span>
          <input type="text" id="new-route-voice" placeholder='VD: "đi chợ sáng"' value="đi ${this.newRoute._dest?.toLowerCase()}" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
        </label>
        <div style="background:var(--color-success-light);border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-weight:600;color:var(--color-success-dark);margin-bottom:4px;">${I18n.t('routes.summary')}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">
            ${I18n.t('routes.summaryDetail', { km: this.newRoute.distance, min: this.newRoute.duration, landmarks: this.newRoute.landmarks.length })}
          </div>
        </div>
        <button class="btn btn-primary btn-block btn-lg" onclick="RoutesScreen.saveNewRoute()">${I18n.t('routes.saveToGlasses')}</button>
      </div>
    `);
  },

  saveNewRoute() {
    const name = document.getElementById('new-route-name')?.value?.trim();
    const voice = document.getElementById('new-route-voice')?.value?.trim();
    if (!name) { document.getElementById('new-route-name').style.borderColor='var(--color-danger)'; return; }
    this.newRoute.name = name;
    this.newRoute.voiceCommand = voice || name;
    this.newRoute.distance = parseFloat(this.newRoute.distance);
    BlindNavData.routes.push(this.newRoute);
    App.closeModal();
    this.renderRouteList();
    App.showToast(I18n.t('routes.saved', { name }), 'success');
    this.newRoute = null;
  }
};
