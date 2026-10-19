const KOREA_OFFSET = 9 * 3600000;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class VisitLog {
  constructor(box, { url, limit = 30, staleAfter = 300000, timeout = 8000 }) {
    this.box = box;
    this.url = url;
    this.limit = limit;
    this.staleAfter = staleAfter;
    this.timeout = timeout;
    this.visits = null;
    this.updated = null;
    this.loadedAt = 0;
    this.dialog = null;
    this.pressed = false;
  }

  static create(box) {
    const url = box && box.getAttribute('data-visits');
    const supported = url && location.protocol !== 'file:' && typeof HTMLDialogElement === 'function' && window.fetch && window.AbortController;
    return supported ? new VisitLog(box, { url }) : null;
  }

  static rows(data) {
    const list = data && Array.isArray(data.visits) ? data.visits : [];
    return list
      .map((row) => ({ time: Date.parse(row && row.t), place: row && typeof row.place === 'string' ? row.place : '' }))
      .filter((row) => !isNaN(row.time))
      .sort((first, second) => second.time - first.time);
  }

  static clock(time) {
    const seoul = new Date(time + KOREA_OFFSET);
    const pad = (number) => (number < 10 ? '0' : '') + number;
    return MONTH_NAMES[seoul.getUTCMonth()] + ' ' + seoul.getUTCDate() + ', ' + pad(seoul.getUTCHours()) + ':' + pad(seoul.getUTCMinutes());
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

  async load() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(this.url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      const visits = VisitLog.rows(data);
      if (!visits.length) {
        return false;
      }
      this.visits = visits;
      this.updated = Date.parse(data.updated);
      this.loadedAt = Date.now();
      return true;
    } catch (error) {
      return false;
    } finally {
      clearTimeout(timer);
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
    const dialog = this.build();
    this.fill(address);
    if (!dialog.open) {
      dialog.showModal();
    }
    if (Date.now() - this.loadedAt > this.staleAfter) {
      this.load().then((loaded) => {
        if (loaded && dialog.open) {
          this.fill(address);
        }
      });
    }
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

  fill(address) {
    const note = 'Seoul time (KST)' + (isFinite(this.updated) ? ', updated ' + VisitLog.clock(this.updated) : '');
    this.dialog.querySelector('.visit-log__note').textContent = note;
    const list = this.dialog.querySelector('.visit-log__list');
    list.textContent = '';
    this.visits.slice(0, this.limit).forEach((visit) => {
      const item = document.createElement('li');
      const time = document.createElement('time');
      time.dateTime = new Date(visit.time).toISOString();
      time.textContent = VisitLog.clock(visit.time);
      const place = document.createElement('span');
      place.textContent = visit.place || 'Unknown location';
      item.append(time, place);
      list.appendChild(item);
    });
    this.dialog.querySelector('.visit-log__more').href = address;
  }
}
