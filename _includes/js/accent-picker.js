class AccentPicker {
  constructor(group, { storageKey = 'accent', attribute = 'data-accent', root = document.documentElement, onChange = () => {} } = {}) {
    this.group = group;
    this.root = root;
    this.attribute = attribute;
    this.buttons = Array.from(group.querySelectorAll('button[' + attribute + ']'));
    this.ids = this.buttons.map((button) => button.getAttribute(attribute));
    this.preference = new Preference(storageKey);
    this.onChange = onChange;
    this.current = null;
    this.thumb = document.createElement('span');
    this.thumb.className = 'accent-picker__thumb';
    this.thumb.setAttribute('aria-hidden', 'true');
    this.placed = false;
  }

  start() {
    this.group.insertBefore(this.thumb, this.group.firstChild);
    this.show(this.initialId());
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.choose(this.ids[index]));
      button.addEventListener('keydown', (event) => this.navigate(event, index));
    });
  }

  initialId() {
    const saved = this.preference.read();
    return this.ids.indexOf(saved) >= 0 ? saved : this.ids[0];
  }

  choose(id) {
    if (id === this.current) {
      return;
    }
    this.show(id);
    this.onChange(id);
    this.preference.write(id);
  }

  show(id) {
    this.current = id;
    this.root.setAttribute(this.attribute, id);
    this.buttons.forEach((button) => {
      const selected = button.getAttribute(this.attribute) === id;
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
    this.slide();
  }

  slide() {
    const place = () => this.group.style.setProperty('--index', this.ids.indexOf(this.current));
    if (this.placed) {
      place();
      return;
    }
    Dom.withoutTransition(this.thumb, place);
    this.placed = true;
  }

  navigate(event, index) {
    const count = this.buttons.length;
    const targets = {
      ArrowRight: (index + 1) % count,
      ArrowDown: (index + 1) % count,
      ArrowLeft: (index + count - 1) % count,
      ArrowUp: (index + count - 1) % count,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in targets)) {
      return;
    }
    event.preventDefault();
    const target = targets[event.key];
    this.buttons[target].focus();
    this.choose(this.ids[target]);
  }
}
