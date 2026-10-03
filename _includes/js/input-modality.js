class InputModality {
  constructor(root, { className = 'using-pointer' } = {}) {
    this.root = root;
    this.className = className;
  }

  start() {
    window.addEventListener('pointerdown', () => this.root.classList.add(this.className), true);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.root.classList.remove(this.className);
      }
    }, true);
  }
}
