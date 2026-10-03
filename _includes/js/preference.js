class Preference {
  constructor(key) {
    this.key = key;
  }

  read() {
    try {
      return window.localStorage.getItem(this.key);
    } catch (error) {
      return null;
    }
  }

  write(value) {
    try {
      window.localStorage.setItem(this.key, value);
    } catch (error) {
      return;
    }
  }
}
