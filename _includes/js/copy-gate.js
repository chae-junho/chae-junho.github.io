class CopyGate {
  constructor(root, { onPass, iterations, salt, hash }) {
    this.root = root;
    this.onPass = onPass;
    this.iterations = iterations;
    this.salt = CopyGate.bytes(salt);
    this.hash = CopyGate.bytes(hash);
    this.opener = root.querySelector('.save-copy__open');
    this.dialog = root.querySelector('.save-copy__dialog');
    this.input = root.querySelector('.save-copy__input');
    this.message = root.querySelector('.save-copy__message');
    this.confirmButton = root.querySelector('.save-copy__confirm');
    this.cancelButton = root.querySelector('.save-copy__cancel');
    this.failures = 0;
    this.busy = false;
    this.pressed = false;
  }

  static create(onPass) {
    const root = document.querySelector('[data-save-copy]');
    if (!root) {
      return null;
    }
    const supported = location.protocol !== 'file:' && typeof HTMLDialogElement === 'function' && window.crypto && crypto.subtle;
    if (!supported) {
      root.remove();
      return null;
    }
    return new CopyGate(root, {
      onPass,
      iterations: parseInt(root.getAttribute('data-iterations'), 10),
      salt: root.getAttribute('data-salt'),
      hash: root.getAttribute('data-hash'),
    });
  }

  static bytes(base64) {
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  }

  static same(first, second) {
    let difference = first.length ^ second.length;
    for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
      difference |= (first[index] || 0) ^ (second[index] || 0);
    }
    return difference === 0;
  }

  start() {
    if (!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc'))) {
      this.input.type = 'password';
    }
    this.root.classList.add('is-ready');
    this.opener.addEventListener('click', () => this.open());
    this.cancelButton.addEventListener('click', () => this.dialog.close());
    this.confirmButton.addEventListener('click', () => this.check());
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.check();
      }
    });
    this.dialog.addEventListener('pointerdown', (event) => {
      this.pressed = event.target === this.dialog;
    });
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog && this.pressed) {
        this.dialog.close();
      }
    });
    this.dialog.addEventListener('close', () => this.reset());
  }

  open() {
    if (!this.dialog.open) {
      this.dialog.showModal();
    }
    this.input.focus();
  }

  reset() {
    this.input.value = '';
    this.message.textContent = '';
  }

  async digest(password) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: this.salt, iterations: this.iterations }, key, 256);
    return new Uint8Array(bits);
  }

  async check() {
    if (this.busy || !this.input.value) {
      return;
    }
    this.busy = true;
    this.confirmButton.disabled = true;
    this.message.textContent = 'Checking';
    const attempt = this.input.value;
    this.input.value = '';
    let passed = false;
    try {
      passed = CopyGate.same(await this.digest(attempt), this.hash);
    } catch (error) {
      passed = false;
    }
    if (passed) {
      this.failures = 0;
      this.release();
      this.dialog.close();
      this.onPass();
      return;
    }
    this.failures += 1;
    await this.wait(Math.min(30, Math.pow(2, this.failures - 1)));
    this.release();
    this.message.textContent = 'Wrong password';
    this.input.focus();
  }

  async wait(seconds) {
    for (let left = seconds; left > 0; left -= 1) {
      this.message.textContent = 'Wrong password. Please wait ' + left + ' s';
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  release() {
    this.busy = false;
    this.confirmButton.disabled = false;
  }
}
