class LanguageSwitch {
  constructor(hero, { storageKey = 'hero-lang', codes = ['en', 'ko', 'zh'], onChange = () => {} } = {}) {
    this.hero = hero;
    this.group = hero.querySelector('.lang-switch__group');
    this.buttons = Array.from(hero.querySelectorAll('.lang-switch button'));
    this.preference = new Preference(storageKey);
    this.codes = codes;
    this.onChange = onChange;
    this.thumb = document.createElement('span');
    this.thumb.className = 'lang-switch__thumb';
    this.thumb.setAttribute('aria-hidden', 'true');
    this.placed = false;
  }

  start() {
    this.group.insertBefore(this.thumb, this.group.firstChild);
    window.addEventListener('resize', () => this.slide());
    window.addEventListener('load', () => this.slide());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.slide());
    }
    this.show(this.initialCode());
    this.buttons.forEach((button) => {
      button.addEventListener('click', () => this.choose(button.getAttribute('data-lang')));
    });
  }

  initialCode() {
    const saved = this.preference.read();
    if (this.codes.indexOf(saved) >= 0) {
      return saved;
    }
    const browser = String((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    if (browser.indexOf('ko') === 0) {
      return 'ko';
    }
    return browser.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  choose(code) {
    this.show(code);
    this.onChange(code);
    this.preference.write(code);
  }

  show(code) {
    this.hero.setAttribute('data-lang', code);
    this.buttons.forEach((button) => {
      button.setAttribute('aria-pressed', button.getAttribute('data-lang') === code ? 'true' : 'false');
    });
    this.slide();
  }

  slide() {
    const active = this.group.querySelector('button[aria-pressed="true"]');
    if (!active || !active.offsetWidth) {
      return;
    }
    const apply = () => {
      this.thumb.style.width = active.offsetWidth + 'px';
      this.thumb.style.height = active.offsetHeight + 'px';
      this.thumb.style.transform = 'translate(' + active.offsetLeft + 'px, ' + active.offsetTop + 'px)';
    };
    if (this.placed) {
      apply();
      return;
    }
    this.group.classList.add('lang-switch--slide');
    Dom.withoutTransition(this.thumb, apply);
    this.placed = true;
  }
}
