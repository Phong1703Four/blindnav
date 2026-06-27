/* ============================================
   Màn hình 5 — Cộng đồng — FULL INTERACTIVE
   i18n Integrated
   ============================================ */

const CommunityScreen = {
  map: null,
  initialized: false,

  init() {
    if (!this.initialized) {
      this.renderReports();
      this.initialized = true;
    }
    setTimeout(() => this.initMap(), 300);
  },

  initMap() {
    const mapEl = document.getElementById('community-map');
    if (!mapEl) return;
    if (this.map) { this.map.remove(); this.map = null; }
    const loc = BlindNavData.glasses.location;
    this.map = L.map('community-map', { zoomControl: false, attributionControl: false }).setView([loc.lat, loc.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
    this.refreshMapMarkers();
  },

  refreshMapMarkers() {
    if (!this.map) return;
    // Remove existing markers
    this.map.eachLayer(layer => { if (layer instanceof L.Marker) this.map.removeLayer(layer); });
    BlindNavData.communityReports.forEach(report => {
      const colorMap = { danger: '#E24B4A', warning: '#F59E0B', good: '#1D9E75' };
      const color = colorMap[report.severity] || '#1A73E8';
      const icon = L.divIcon({
        className: '', html: `<div style="width:22px;height:22px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [22, 22], iconAnchor: [11, 11]
      });
      L.marker([report.lat, report.lng], { icon }).addTo(this.map).bindPopup(`<b>${report.type}</b><br>${report.address}<br>${I18n.t('community.confirmCount', { count: report.confirmations })}`);
    });
  },

  renderReports() {
    const container = document.getElementById('community-reports');
    if (!container) return;
    let html = '';
    BlindNavData.communityReports.forEach(report => {
      html += `
        <div class="report-card">
          <div class="report-card-header">
            <div class="report-severity ${report.severity}"></div>
            <div class="report-content">
              <div class="report-title">${report.type}</div>
              <div class="report-address">${report.address}</div>
              ${report.description ? `<div style="font-size:0.8125rem;color:var(--color-text-secondary);margin-top:2px;font-style:italic;">"${report.description}"</div>` : ''}
              <div class="report-meta">
                <span>${report.timeAgo}</span><span>·</span>
                <span class="report-confirmations">${I18n.t('community.confirmCount', { count: report.confirmations })}</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button class="report-action-btn confirm" onclick="CommunityScreen.confirmReport('${report.id}')">${I18n.t('community.confirmBtn')}</button>
            <button class="report-action-btn deny" onclick="CommunityScreen.denyReport('${report.id}')">${I18n.t('community.denyBtn')}</button>
          </div>
        </div>
      `;
    });
    if (BlindNavData.communityReports.length === 0) {
      html = `<div style="text-align:center;padding:40px;color:var(--color-text-tertiary);">${I18n.t('community.noReports')}</div>`;
    }
    container.innerHTML = html;
  },

  confirmReport(reportId) {
    const report = BlindNavData.communityReports.find(r => r.id === reportId);
    if (report) { report.confirmations++; this.renderReports(); this.refreshMapMarkers(); App.showToast(I18n.t('community.confirmed'), 'success'); }
  },

  denyReport(reportId) {
    const report = BlindNavData.communityReports.find(r => r.id === reportId);
    if (!report) return;
    report.denials = (report.denials || 0) + 1;
    if (report.denials >= 3) {
      BlindNavData.communityReports = BlindNavData.communityReports.filter(r => r.id !== reportId);
      App.showToast(I18n.t('community.removed'), 'info');
    } else {
      App.showToast(I18n.t('community.denied', { count: report.denials }), 'info');
    }
    this.renderReports();
    this.refreshMapMarkers();
  },

  // ═══════ ADD REPORT — Full Form ═══════
  showAddReport() {
    const types = [
      { icon: '🚧', labelKey: 'community.typeSidewalkBlocked', severity: 'danger' },
      { icon: '🕳️', labelKey: 'community.typeHole', severity: 'danger' },
      { icon: '🚦', labelKey: 'community.typeTrafficBroken', severity: 'danger' },
      { icon: '⚠️', labelKey: 'community.typeDanger', severity: 'warning' },
      { icon: '🚗', labelKey: 'community.typeCarBlocked', severity: 'warning' },
      { icon: '✅', labelKey: 'community.typeRoadClear', severity: 'good' }
    ];

    let typesHtml = types.map(t => {
      const label = I18n.t(t.labelKey);
      return `
      <div class="report-type-chip" onclick="this.classList.toggle('selected'); document.querySelectorAll('.report-type-chip').forEach(c => { if(c!==this) c.classList.remove('selected'); }); document.getElementById('selected-report-type').value='${label}'; document.getElementById('selected-report-severity').value='${t.severity}';">
        <div class="report-type-icon">${t.icon}</div>
        <div class="report-type-label">${label}</div>
      </div>
    `}).join('');

    App.showModal(I18n.t('community.addTitle2'), `
      <div style="padding:0 0 20px;">
        <input type="hidden" id="selected-report-type" value="">
        <input type="hidden" id="selected-report-severity" value="">
        <div style="padding:0 20px;margin-bottom:16px;">
          <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:8px;">${I18n.t('community.selectTypeLabel')}</span>
        </div>
        <div class="report-type-grid">${typesHtml}</div>
        <div style="padding:0 20px;">
          <label style="display:block;margin-bottom:12px;">
            <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('community.addressLabel')}</span>
            <input type="text" id="report-address" placeholder="${I18n.t('community.addressPlaceholder')}" value="${BlindNavData.glasses.location.address}" style="width:100%;padding:12px;border:2px solid var(--color-border);border-radius:10px;font-size:1rem;">
          </label>
          <label style="display:block;margin-bottom:20px;">
            <span style="font-size:0.875rem;font-weight:600;display:block;margin-bottom:6px;">${I18n.t('community.descLabel')}</span>
            <textarea id="report-desc" placeholder='${I18n.t('community.descPlaceholder')}' style="width:100%;height:70px;border:2px solid var(--color-border);border-radius:10px;padding:12px;font-size:0.9375rem;font-family:inherit;resize:none;"></textarea>
          </label>
          <button class="btn btn-primary btn-block btn-lg" onclick="CommunityScreen.submitReport()">${I18n.t('community.submitBtn')}</button>
        </div>
      </div>
    `);
  },

  submitReport() {
    const type = document.getElementById('selected-report-type')?.value;
    const severity = document.getElementById('selected-report-severity')?.value;
    const address = document.getElementById('report-address')?.value?.trim();
    const desc = document.getElementById('report-desc')?.value?.trim();

    if (!type) { App.showToast(I18n.t('community.selectRequired'), 'danger'); return; }
    if (!address) { document.getElementById('report-address').style.borderColor = 'var(--color-danger)'; return; }

    const loc = BlindNavData.glasses.location;
    const newReport = {
      id: 'rpt_' + Date.now(),
      type: type,
      severity: severity || 'warning',
      lat: loc.lat + (Math.random() - 0.5) * 0.002,
      lng: loc.lng + (Math.random() - 0.5) * 0.002,
      address: address,
      description: desc,
      timeAgo: I18n.t('community.justNow'),
      confirmations: 1,
      denials: 0
    };

    BlindNavData.communityReports.unshift(newReport);
    App.closeModal();
    this.renderReports();
    this.refreshMapMarkers();
    App.showToast(I18n.t('community.submitted'), 'success');
  }
};
