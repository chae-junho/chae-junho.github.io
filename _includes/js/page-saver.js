class PageSaver {
  constructor({ name = 'Junhao-Cai-Homepage.html' } = {}) {
    this.name = name;
    this.types = { woff2: 'font/woff2', woff: 'font/woff', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon', gif: 'image/gif', webp: 'image/webp' };
  }

  static requested() {
    return new URLSearchParams(location.search).has('download');
  }

  async run() {
    const panel = this.panel();
    try {
      const blob = new Blob([await this.build()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      this.offer(panel, url, blob.size);
      this.save(url);
    } catch (error) {
      panel.textContent = 'The file could not be prepared. Please reload this page and try again.';
    }
    try {
      history.replaceState(null, '', location.pathname + location.hash);
    } catch (error) {
      return;
    }
  }

  async build() {
    const page = await this.source();
    const doc = new DOMParser().parseFromString(page.html, 'text/html');
    await Promise.all(
      Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map((link) => this.inlineStyle(link, page.url))
        .concat(Array.from(doc.querySelectorAll('img[src]')).map((image) => this.inlineImage(image, page.url)))
    );
    const script = doc.querySelector('script[src]');
    const code = await this.text(new URL(script.getAttribute('src'), page.url).href);
    script.remove();
    const inline = doc.createElement('script');
    inline.textContent = code.replace(/<\/script/gi, '<\\/script');
    doc.body.appendChild(inline);
    doc.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').forEach((link) => link.remove());
    const icon = doc.createElement('link');
    icon.rel = 'icon';
    icon.href = await this.dataUri(new URL('images/favicon-32x32.png', page.url).href);
    doc.head.appendChild(icon);
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  async source() {
    const canonical = document.querySelector('link[rel="canonical"]');
    const candidates = [location.href.split(/[?#]/)[0]].concat(canonical ? [canonical.href] : []);
    for (const url of candidates) {
      try {
        const html = await this.text(url);
        if (html.indexOf('data-reveal-gate') >= 0) {
          return { url, html };
        }
      } catch (error) {
        continue;
      }
    }
    throw new Error('The page source is not available');
  }

  async text(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(url + ' ' + response.status);
    }
    return response.text();
  }

  async dataUri(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(url + ' ' + response.status);
    }
    const blob = await response.blob();
    const type = this.types[url.split(/[?#]/)[0].split('.').pop().toLowerCase()] || blob.type;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(new Blob([blob], { type }));
    });
  }

  async inlineStyle(link, base) {
    const url = new URL(link.getAttribute('href'), base).href;
    let css = await this.text(url);
    const references = Array.from(new Set(Array.from(css.matchAll(/url\((["']?)([^)"']+)\1\)/g)).map((match) => match[2])))
      .filter((reference) => !/^(?:data:|#|https?:)/i.test(reference));
    const uris = await Promise.all(references.map((reference) => this.dataUri(new URL(reference, url).href)));
    references.forEach((reference, index) => {
      css = css.split(reference).join(uris[index]);
    });
    const style = link.ownerDocument.createElement('style');
    style.textContent = css.replace(/<\/style/gi, '<\\/style');
    link.replaceWith(style);
  }

  async inlineImage(image, base) {
    image.setAttribute('src', await this.dataUri(new URL(image.getAttribute('src'), base).href));
  }

  panel() {
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.style.cssText = 'position:fixed;right:1rem;bottom:1rem;z-index:2147483647;max-width:20rem;padding:0.9rem 1.1rem;color:#222;background:#fff;border:1px solid rgba(0,0,0,0.15);border-radius:0.9rem;box-shadow:0 12px 32px -10px rgba(0,0,0,0.3);font:0.9rem/1.45 "Times New Roman",Tinos,serif';
    element.textContent = 'Preparing the file';
    document.body.appendChild(element);
    return element;
  }

  offer(panel, url, size) {
    const message = document.createElement('div');
    message.textContent = this.name + ' (' + Math.round(size / 1024) + ' KB) is ready. Send this one file; it opens by double click.';
    const again = document.createElement('a');
    again.href = url;
    again.download = this.name;
    again.target = '_self';
    again.textContent = 'Download again';
    again.style.cssText = 'display:inline-block;margin-top:0.5rem;color:var(--accent,#8b0029);font-weight:700';
    panel.textContent = '';
    panel.append(message, again);
    setTimeout(() => panel.remove(), 20000);
  }

  save(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = this.name;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
