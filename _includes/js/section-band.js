class SectionBand {
  constructor({ content, masthead, headingSelector, leadSelector, excludedSelector = null, above = 0.9, below = 0.8, inset = 0.9, awayDelay = 600 }) {
    this.content = content;
    this.masthead = masthead;
    this.headingSelector = headingSelector;
    this.leadSelector = leadSelector;
    this.excludedSelector = excludedSelector;
    this.above = above;
    this.below = below;
    this.inset = inset;
    this.awayDelay = awayDelay;
    this.band = null;
    this.wave = null;
    this.following = null;
    this.frame = 0;
  }

  start() {
    window.addEventListener('scroll', () => this.schedule(), { passive: true });
    window.addEventListener('resize', () => {
      if (this.following) {
        this.following.dirty = true;
      }
      this.schedule();
    });
  }

  show(target, elements, origin) {
    this.ensureElements();
    this.band.style.transition = 'none';
    this.wave.style.transition = 'none';
    this.band.classList.remove('is-on');
    this.following = { target, elements, away: 0, dirty: false };
    if (!this.measure()) {
      this.following = null;
      return;
    }
    this.place();
    this.aimWave(origin);
    Dom.settle(this.band);
    this.band.style.transition = '';
    this.wave.style.transition = '';
    this.band.classList.add('is-on');
    this.check();
    if (target.matches(this.headingSelector)) {
      Dom.replay(target, 'is-locating', 1200);
    }
  }

  end() {
    this.following = null;
    if (this.band) {
      Dom.withoutTransition(this.band, () => this.band.classList.remove('is-on'));
    }
  }

  ensureElements() {
    if (this.band) {
      return;
    }
    this.band = document.createElement('span');
    this.band.className = 'section-glow';
    this.band.setAttribute('aria-hidden', 'true');
    this.wave = document.createElement('span');
    this.wave.className = 'section-glow__wave';
    this.band.appendChild(this.wave);
    this.content.insertBefore(this.band, this.content.firstChild);
  }

  schedule() {
    if (this.following && !this.frame) {
      this.frame = window.requestAnimationFrame(() => this.check());
    }
  }

  check() {
    this.frame = 0;
    const following = this.following;
    if (!following) {
      return;
    }
    if (following.dirty) {
      if (!this.measure()) {
        this.end();
        return;
      }
      this.place();
    }
    const top = following.top - window.scrollY;
    const bottom = following.bottom - window.scrollY;
    if (bottom > following.barBottom && top < window.innerHeight) {
      following.away = 0;
    } else if (!following.away) {
      following.away = Date.now();
    } else if (Date.now() - following.away > this.awayDelay) {
      this.end();
    }
  }

  measure() {
    const range = this.rangeOf(this.following.target, this.following.elements);
    if (!range) {
      return false;
    }
    const box = this.content.getBoundingClientRect();
    const rem = Dom.rem();
    const following = this.following;
    following.top = range.top + window.scrollY;
    following.bottom = range.bottom + window.scrollY;
    following.contentTop = box.top + window.scrollY;
    following.left = box.left - this.inset * rem;
    following.width = box.width + 2 * this.inset * rem;
    following.barBottom = this.masthead ? this.masthead.getBoundingClientRect().bottom : 0;
    following.dirty = false;
    return true;
  }

  place() {
    const following = this.following;
    this.band.style.top = following.top - following.contentTop + 'px';
    this.band.style.height = following.bottom - following.top + 'px';
  }

  aimWave(origin) {
    const following = this.following;
    const from = origin && origin.width > 0 ? origin : null;
    const height = following.bottom - following.top;
    const x = (from ? from.left + from.width / 2 : following.left + following.width / 2) - following.left;
    const y = (from ? from.top + from.height / 2 : following.barBottom) - (following.top - window.scrollY);
    const reach = Math.sqrt(Math.pow(Math.max(x, following.width - x), 2) + Math.pow(Math.max(Math.abs(y), Math.abs(y - height)), 2)) + 8;
    this.wave.style.width = this.wave.style.height = 2 * reach + 'px';
    this.wave.style.left = x - reach + 'px';
    this.wave.style.top = y - reach + 'px';
  }

  rangeOf(target, elements) {
    const group = elements.filter((element) => !this.excludedSelector || !element.matches(this.excludedSelector));
    if (!target.matches(this.headingSelector)) {
      const lead = document.querySelector(this.leadSelector);
      if (lead) {
        group.push(lead);
      }
    }
    let top = Infinity;
    let bottom = -Infinity;
    group.forEach((element) => {
      const box = this.boxOf(element);
      const lifted = Dom.translation(element).y;
      if (box.height > 0) {
        top = Math.min(top, box.top - lifted);
        bottom = Math.max(bottom, box.bottom - lifted);
      }
    });
    if (!isFinite(top)) {
      return null;
    }
    const rem = Dom.rem();
    return { top: top - this.above * rem, bottom: bottom + this.below * rem };
  }

  boxOf(element) {
    if (!element.matches('h1')) {
      return element.getBoundingClientRect();
    }
    const text = document.createRange();
    text.selectNodeContents(element);
    return text.getBoundingClientRect();
  }
}
