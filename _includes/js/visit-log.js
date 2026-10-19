const KOREA_OFFSET = 9 * 3600000;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FRESH_LIST = 60000;
let liveCalls = 0;

class VisitLog {
  constructor(box, { urls, liveUrl, limit = 30, staleAfter = 30000, interval = 15000, timeout = 8000 }) {
    this.box = box;
    this.urls = urls;
    this.liveUrl = liveUrl;
    this.limit = limit;
    this.staleAfter = staleAfter;
    this.interval = interval;
    this.timeout = timeout;
    this.visits = null;
    this.updated = null;
    this.last = null;
    this.loadedAt = 0;
    this.live = [];
    this.polledAt = 0;
    this.busy = false;
    this.ticker = 0;
    this.address = '';
    this.dialog = null;
    this.pressed = false;
  }

  static create(box) {
    const urls = ((box && box.getAttribute('data-visits')) || '').split(/\s+/).filter(Boolean);
    const supported = urls.length && location.protocol !== 'file:' && typeof HTMLDialogElement === 'function' && window.fetch && window.AbortController;
    return supported ? new VisitLog(box, { urls, liveUrl: box.getAttribute('data-live') }) : null;
  }

  static rows(data) {
    const list = data && Array.isArray(data.visits) ? data.visits : [];
    return list
      .map((row) => ({ time: Date.parse(row && row.t), place: row && typeof row.place === 'string' ? row.place : '' }))
      .filter((row) => !isNaN(row.time))
      .sort((first, second) => second.time - first.time);
  }

  static points(code) {
    const found = typeof code === 'string' && /_helper\.add\s*\(\s*(\[[\s\S]*\])\s*,\s*true\s*\)/.exec(code);
    let list = null;
    try {
      list = found ? JSON.parse(found[1]) : null;
    } catch (error) {
      list = null;
    }
    if (!Array.isArray(list)) {
      return null;
    }
    const groups = [];
    list.forEach((point) => {
      const place = point && typeof point.name === 'string' ? point.name : '';
      const count = point && point.v >= 1 ? Math.floor(point.v) : 1;
      const group = groups.find((item) => item.place === place);
      if (group) {
        group.count += count;
      } else {
        groups.push({ place, count });
      }
    });
    return groups;
  }

  static hour(time) {
    const seoul = new Date(time + KOREA_OFFSET);
    const pad = (number) => (number < 10 ? '0' : '') + number;
    return pad(seoul.getUTCHours()) + ':' + pad(seoul.getUTCMinutes());
  }

  static clock(time) {
    const seoul = new Date(time + KOREA_OFFSET);
    return MONTH_NAMES[seoul.getUTCMonth()] + ' ' + seoul.getUTCDate() + ', ' + VisitLog.hour(time);
  }

  start() {
    this.box.addEventListener('click', (event) => this.onClick(event), true);
    const schedule = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => this.load(), { timeout: 4000 });
      } else {
        setTimeout(() => this.load(), 1500);
      }
    };
    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
  }

  fresh(url) {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 't=' + Math.floor(Date.now() / 60000);
  }

  async load() {
    for (const url of this.urls) {
      if (await this.read(url)) {
        return true;
      }
    }
    return false;
  }

  async read(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(this.fresh(url), { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      const visits = VisitLog.rows(data);
      if (!visits.length) {
        return false;
      }
      const last = /^[0-9]+$/.test(String(data.last)) ? String(data.last) : null;
      if (last !== this.last) {
        this.live = [];
        this.polledAt = 0;
      }
      this.visits = visits;
      this.updated = Date.parse(data.updated);
      this.last = last;
      this.loadedAt = Date.now();
      return true;
    } catch (error) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  ask(last) {
    return new Promise((resolve) => {
      liveCalls += 1;
      const name = 'visitLog' + liveCalls + 'x' + Date.now();
      const script = document.createElement('script');
      const done = (value) => {
        clearTimeout(timer);
        delete window[name];
        script.remove();
        resolve(value);
      };
      const timer = setTimeout(() => done(null), this.timeout);
      window[name] = (code) => done(VisitLog.points(code));
      script.onerror = () => done(null);
      script.src = this.liveUrl + (this.liveUrl.indexOf('?') === -1 ? '?' : '&') + 'last_hit_id=' + last + '&initial_hit_id=' + last + '&callback=' + name + '&_=' + Date.now();
      document.head.appendChild(script);
    });
  }

  async poll() {
    const last = this.last;
    if (!this.liveUrl || !last) {
      return;
    }
    const groups = await this.ask(last);
    if (!groups || last !== this.last) {
      return;
    }
    const now = Date.now();
    const recent = this.polledAt > 0 && now - this.polledAt < this.interval * 3;
    const young = isFinite(this.updated) && Math.abs(now - this.updated) < FRESH_LIST;
    groups.forEach((group) => {
      const known = this.live.filter((row) => row.place === group.place).reduce((sum, row) => sum + row.count, 0);
      if (group.count > known) {
        this.live.push({ place: group.place, count: group.count - known, at: recent || young ? now : null });
      }
    });
    this.polledAt = now;
  }

  signature() {
    return JSON.stringify([this.updated, this.live]);
  }

  async tick() {
    if (this.busy || document.hidden) {
      return;
    }
    this.busy = true;
    const before = this.signature();
    try {
      if (Date.now() - this.loadedAt > this.staleAfter) {
        await this.load();
      }
      await this.poll();
    } finally {
      this.busy = false;
    }
    if (this.dialog && this.dialog.open && this.signature() !== before) {
      this.fill();
    }
  }

  onClick(event) {
    const anchor = event.target.closest && event.target.closest('#mmvst_a');
    const plain = event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    if (!anchor || !plain || !this.visits) {
      return;
    }
    event.preventDefault();
    this.open(anchor.href);
  }

  open(address) {
    this.address = address;
    const dialog = this.build();
    this.fill();
    if (!dialog.open) {
      dialog.showModal();
    }
    this.tick();
    clearInterval(this.ticker);
    this.ticker = setInterval(() => this.tick(), this.interval);
  }

  build() {
    if (this.dialog) {
      return this.dialog;
    }
    const dialog = document.createElement('dialog');
    dialog.className = 'visit-log';
    dialog.setAttribute('aria-labelledby', 'visit-log-title');
    dialog.innerHTML = '<div class="visit-log__panel">'
      + '<p class="visit-log__title" id="visit-log-title">Recent visits</p>'
      + '<p class="visit-log__note"></p>'
      + '<ol class="visit-log__list"></ol>'
      + '<div class="visit-log__actions">'
      + '<a class="visit-log__more" target="_blank" rel="noopener">Full statistics</a>'
      + '<button type="button" class="visit-log__close" autofocus>Close</button>'
      + '</div></div>';
    dialog.querySelector('.visit-log__close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => clearInterval(this.ticker));
    dialog.addEventListener('pointerdown', (event) => {
      this.pressed = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog && this.pressed) {
        dialog.close();
      }
    });
    document.body.appendChild(dialog);
    this.dialog = dialog;
    return dialog;
  }

  merged() {
    const stamped = this.live.filter((row) => row.at).sort((first, second) => second.at - first.at);
    const waiting = this.live.filter((row) => !row.at);
    const fresh = stamped.map((row) => ({ label: VisitLog.clock(row.at), place: row.place, count: row.count, exact: false }))
      .concat(waiting.map((row) => ({ label: 'New', place: row.place, count: row.count, exact: false })));
    const known = this.visits.map((visit) => ({ label: VisitLog.clock(visit.time), time: visit.time, place: visit.place, count: 1, exact: true }));
    return fresh.concat(known);
  }

  fill() {
    const note = 'Seoul time (KST)' + (isFinite(this.updated) ? ', updated ' + VisitLog.clock(this.updated) : '');
    this.dialog.querySelector('.visit-log__note').textContent = note;
    const list = this.dialog.querySelector('.visit-log__list');
    const scrolled = list.scrollTop;
    list.textContent = '';
    this.merged().slice(0, this.limit).forEach((row) => {
      const item = document.createElement('li');
      const when = document.createElement(row.exact ? 'time' : 'span');
      when.className = 'visit-log__when';
      if (row.exact) {
        when.dateTime = new Date(row.time).toISOString();
      } else {
        item.className = 'is-new';
      }
      when.textContent = row.label;
      const where = document.createElement('span');
      where.className = 'visit-log__where';
      where.textContent = (row.place || 'Unknown location') + (row.count > 1 ? ' ×' + row.count : '');
      item.append(when, where);
      list.appendChild(item);
    });
    list.scrollTop = scrolled;
    this.dialog.querySelector('.visit-log__more').href = this.address;
  }
}
