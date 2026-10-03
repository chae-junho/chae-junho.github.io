class PhdYear {
  constructor(root, { selector = '.phd-year', now = new Date() } = {}) {
    this.root = root;
    this.selector = selector;
    this.now = now;
  }

  start() {
    Array.from(this.root.querySelectorAll(this.selector)).forEach((element) => this.update(element));
  }

  update(element) {
    const start = (element.getAttribute('data-start') || '').split('-');
    if (start.length < 2) {
      return;
    }
    const months = (this.now.getFullYear() - Number(start[0])) * 12 + (this.now.getMonth() + 1 - Number(start[1]));
    const year = Math.floor(months / 12) + 1;
    if (!(year >= 1)) {
      return;
    }
    const words = element.getAttribute('data-words');
    const text = words ? words.split('|')[year - 1] : String(year);
    if (text) {
      element.textContent = text;
    }
  }
}
