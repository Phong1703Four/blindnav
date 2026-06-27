/* ============================================
   Màn hình 4 — Thống kê — FULL INTERACTIVE
   i18n Integrated
   ============================================ */

const StatsScreen = {
  initialized: false,
  currentPeriod: 'week',

  init() {
    if (!this.initialized) {
      this.setupPeriodToggle();
      this.renderStats();
      this.initialized = true;
    }
    setTimeout(() => this.animateBars(), 100);
  },

  setupPeriodToggle() {
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPeriod = btn.dataset.period;
        this.updatePeriodData();
      });
    });
  },

  updatePeriodData() {
    const kmEl = document.getElementById('stat-km-val');
    const obsEl = document.getElementById('stat-obs-val');
    const lightEl = document.getElementById('stat-light-val');
    const dateRange = document.querySelector('.stats-date-range');
    const reportText = document.querySelector('.weekly-report-text');
    const reportTitle = document.querySelector('.weekly-report-title');

    if (this.currentPeriod === 'month') {
      const m = BlindNavData.stats.monthly;
      if (kmEl) kmEl.textContent = m.totalKm;
      if (obsEl) obsEl.textContent = m.totalObstacles;
      if (lightEl) lightEl.textContent = m.totalTrafficLights;
      if (dateRange) dateRange.textContent = I18n.t('stats.monthRange');
      if (reportText) reportText.textContent = BlindNavData.stats.monthlyReport;
      if (reportTitle) reportTitle.textContent = I18n.t('stats.monthlyReport');
    } else {
      const w = BlindNavData.stats.weekly;
      if (kmEl) kmEl.textContent = w.totalKm;
      if (obsEl) obsEl.textContent = w.totalObstacles;
      if (lightEl) lightEl.textContent = w.totalTrafficLights;
      if (dateRange) dateRange.textContent = I18n.t('stats.weekRange');
      if (reportText) reportText.textContent = BlindNavData.stats.weeklyReport;
      if (reportTitle) reportTitle.textContent = I18n.t('stats.weeklyReport');
    }
    this.renderStats();
    setTimeout(() => this.animateBars(), 100);
  },

  renderStats() {
    this.renderDailyChart();
    this.renderFrequentPlaces();
    this.renderTimeDistribution();
  },

  renderDailyChart() {
    const container = document.getElementById('daily-chart-bars');
    if (!container) return;
    const stats = this.currentPeriod === 'month' ? BlindNavData.stats.monthly : BlindNavData.stats.weekly;
    const maxKm = Math.max(...stats.days.map(d => d.km));
    let html = '';
    stats.days.forEach(day => {
      const width = maxKm > 0 ? (day.km / maxKm * 100) : 0;
      html += `
        <div class="chart-row" onclick="StatsScreen.showDayDetail('${day.day}', ${day.km}, ${day.obstacles}, ${day.lights})" style="cursor:pointer;">
          <div class="chart-day">${day.day}</div>
          <div class="chart-bar-container">
            <div class="chart-bar ${day.km === 0 ? 'zero' : ''}" data-width="${width}" style="width: 0%"></div>
          </div>
          <div class="chart-value">${day.km > 0 ? day.km + ' km' : '0 km'}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  showDayDetail(day, km, obstacles, lights) {
    if (km === 0) { App.showToast(I18n.t('stats.noActivity', { day }), 'info'); return; }
    const minutes = Math.round(km * 13);
    const summaryText = I18n.t('stats.summaryText', { minutes, km, obstacles, lights });
    const roadComment = obstacles > 10 ? I18n.t('stats.roadBusy') : I18n.t('stats.roadClear');
    App.showModal(I18n.t('stats.dayDetailTitle', { day }), `
      <div style="padding:0 20px 20px;">
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <div style="flex:1;text-align:center;padding:16px;background:var(--color-primary-light);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--color-primary);">${km}</div>
            <div style="font-size:0.75rem;color:var(--color-text-secondary);">${I18n.t('stats.kmWalked')}</div>
          </div>
          <div style="flex:1;text-align:center;padding:16px;background:var(--color-success-light);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--color-success);">${obstacles}</div>
            <div style="font-size:0.75rem;color:var(--color-text-secondary);">${I18n.t('stats.obstaclesAvoided')}</div>
          </div>
          <div style="flex:1;text-align:center;padding:16px;background:var(--color-warning-light);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--color-warning);">${lights}</div>
            <div style="font-size:0.75rem;color:var(--color-text-secondary);">${I18n.t('stats.trafficLights')}</div>
          </div>
        </div>
        <div style="background:var(--color-bg);border-radius:12px;padding:16px;">
          <div style="font-weight:600;margin-bottom:8px;">${I18n.t('stats.summaryLabel')}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);line-height:1.6;">
            ${summaryText} ${roadComment}
          </div>
        </div>
      </div>
    `);
  },

  renderFrequentPlaces() {
    const container = document.getElementById('frequent-places-list');
    if (!container) return;
    let html = '';
    BlindNavData.stats.frequentPlaces.forEach(place => {
      html += `
        <div class="place-item" onclick="StatsScreen.showPlaceDetail('${place.name}', ${place.count})" style="cursor:pointer;">
          <div class="place-icon">${place.icon}</div>
          <div class="place-name">${place.name}</div>
          <div class="place-count">${I18n.t('stats.times', { count: place.count })}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  showPlaceDetail(name, count) {
    const period = this.currentPeriod === 'month' ? I18n.t('stats.periodMonth') : I18n.t('stats.periodWeek');
    const frequency = count > 3 ? I18n.t('stats.placeFrequent') : count > 1 ? I18n.t('stats.placeRegular') : I18n.t('stats.placeOccasional');
    App.showModal(`📍 ${name}`, `
      <div style="padding:0 20px 20px;">
        <div style="background:var(--color-bg);border-radius:12px;padding:16px;text-align:center;margin-bottom:16px;">
          <div style="font-size:2rem;font-weight:800;color:var(--color-primary);">${count}</div>
          <div style="font-size:0.875rem;color:var(--color-text-secondary);">${I18n.t('stats.placeVisits', { period })}</div>
        </div>
        <p style="font-size:0.875rem;color:var(--color-text-secondary);">
          ${I18n.t('stats.placeDesc', { name, frequency })}
          ${count > 3 ? ' ' + I18n.t('stats.placeSuggestion') : ''}
        </p>
        <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="App.closeModal(); App.switchTab('routes');">${I18n.t('stats.viewRoute')}</button>
      </div>
    `);
  },

  renderTimeDistribution() {
    const container = document.getElementById('time-distribution-bars');
    if (!container) return;
    let html = '';
    BlindNavData.stats.timeDistribution.forEach(slot => {
      html += `
        <div class="time-row">
          <div class="time-label">${slot.range}</div>
          <div class="time-bar-container">
            <div class="time-bar" data-width="${slot.level}" style="width: 0%"></div>
          </div>
          <div class="time-level">${slot.label}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  animateBars() {
    document.querySelectorAll('.chart-bar').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 100);
    });
    document.querySelectorAll('.time-bar').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 100 + 400);
    });
  }
};
