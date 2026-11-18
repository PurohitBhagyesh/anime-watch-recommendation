/**
 * Share Link - Plug & Play Web Share & Social Sharing Floating Widget
 * Features: Native Web Share API, 1-Click Clipboard Copy, Social Quicklinks (WhatsApp, X, LinkedIn, Reddit, Telegram)
 * Author: Web Elements (github.com/PurohitBhagyesh)
 * License: MIT
 */

(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    title: typeof document !== 'undefined' ? document.title : 'Share',
    text: 'Check this out!',
    url: typeof window !== 'undefined' ? window.location.href : '',
    buttonText: 'Share',
    position: 'bottom-right' // 'bottom-right' | 'bottom-left'
  };

  class ShareLinkWidget {
    constructor(userConfig = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, userConfig);
      this.widgetEl = null;
      this.init();
    }

    formatDisplayUrl(url) {
      try {
        const u = new URL(url);
        return u.hostname + (u.pathname === '/' ? '' : u.pathname);
      } catch (e) {
        return url;
      }
    }

    setUrl(newUrl) {
      if (typeof newUrl !== 'string' || !newUrl.trim()) return;
      this.config.url = newUrl.trim();
      if (this.widgetEl) {
        const desc = this.widgetEl.querySelector('.wshare-item-desc');
        if (desc) desc.textContent = this.formatDisplayUrl(this.config.url);
        const urlInput = this.widgetEl.querySelector('.wshare-edit-url-input');
        if (urlInput) urlInput.value = this.config.url;
      }
      this.updateSocialLinks();
    }

    setTitle(newTitle) {
      if (typeof newTitle !== 'string') return;
      this.config.title = newTitle;
      if (this.widgetEl) {
        const titleInput = this.widgetEl.querySelector('.wshare-edit-title-input');
        if (titleInput) titleInput.value = this.config.title;
      }
      this.updateSocialLinks();
    }

    setText(newText) {
      if (typeof newText !== 'string') return;
      this.config.text = newText;
      if (this.widgetEl) {
        const textInput = this.widgetEl.querySelector('.wshare-edit-text-input');
        if (textInput) textInput.value = this.config.text;
      }
      this.updateSocialLinks();
    }

    setButtonText(newText) {
      if (typeof newText !== 'string') return;
      this.config.buttonText = newText;
      if (this.widgetEl) {
        const pillText = this.widgetEl.querySelector('.wshare-pill-text');
        if (pillText) pillText.textContent = newText;
        const titleEl = this.widgetEl.querySelector('.wshare-title');
        if (titleEl) titleEl.textContent = newText;
        const pill = this.widgetEl.querySelector('.wshare-pill');
        if (pill) pill.setAttribute('aria-label', newText);
      }
    }

    updateSocialLinks() {
      if (!this.widgetEl) return;
      const { url, title, text } = this.config;
      const links = this.widgetEl.querySelectorAll('.wshare-social-btn');
      links.forEach(a => {
        const platform = a.dataset.platform;
        if (platform === 'whatsapp') {
          a.href = `https://api.whatsapp.com/send?text=${encodeURIComponent((text ? text + ' ' : '') + url)}`;
        } else if (platform === 'twitter') {
          a.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        } else if (platform === 'linkedin') {
          a.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        } else if (platform === 'reddit') {
          a.href = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        } else if (platform === 'telegram') {
          a.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        }
      });
    }

    updateConfig(newConfig = {}) {
      if (newConfig.url !== undefined) this.setUrl(newConfig.url);
      if (newConfig.title !== undefined) this.setTitle(newConfig.title);
      if (newConfig.text !== undefined) this.setText(newConfig.text);
      if (newConfig.buttonText !== undefined) this.setButtonText(newConfig.buttonText);
      if (newConfig.position !== undefined && this.widgetEl) {
        this.config.position = newConfig.position;
        const isLeft = newConfig.position === 'bottom-left';
        this.widgetEl.style.right = isLeft ? 'auto' : '24px';
        this.widgetEl.style.left = isLeft ? '24px' : 'auto';
        const card = this.widgetEl.querySelector('.wshare-card');
        if (card) {
          card.style.right = isLeft ? 'auto' : '0';
          card.style.left = isLeft ? '0' : 'auto';
        }
      }
      return this;
    }

    open() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.wshare-card');
      const pill = this.widgetEl.querySelector('.wshare-pill');
      if (card) {
        card.classList.add('wshare-active');
        if (pill) pill.setAttribute('aria-expanded', 'true');
      }
    }

    close() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.wshare-card');
      const pill = this.widgetEl.querySelector('.wshare-pill');
      if (card) {
        card.classList.remove('wshare-active');
        if (pill) pill.setAttribute('aria-expanded', 'false');
      }
    }

    toggle() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.wshare-card');
      if (card && card.classList.contains('wshare-active')) {
        this.close();
      } else {
        this.open();
      }
    }

    render() {
      const { title, text, url, buttonText, position } = this.config;
      const isLeft = position === 'bottom-left';
      const displayUrl = this.formatDisplayUrl(url);

      const widget = document.createElement('div');
      widget.className = 'wshare-widget';
      if (isLeft) {
        widget.style.right = 'auto';
        widget.style.left = '24px';
      }

      widget.innerHTML = `
        <button class="wshare-pill" type="button" aria-label="${buttonText}" aria-expanded="false">
          <span class="wshare-pill-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </span>
          <span class="wshare-pill-text">${buttonText}</span>
        </button>

        <div class="wshare-card" role="dialog" aria-modal="false" aria-label="${buttonText}">
          <div class="wshare-header">
            <div class="wshare-title-group">
              <h3 class="wshare-title">${buttonText}</h3>
              <p class="wshare-subtitle">Share with friends or social networks</p>
            </div>
            <div class="wshare-header-actions">
              <button type="button" class="wshare-edit-btn" title="Edit shared link" aria-label="Edit shared link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
              <button class="wshare-close-btn" type="button" aria-label="Close">&times;</button>
            </div>
          </div>

          <div class="wshare-edit-drawer" style="display: none;">
            <div class="wshare-edit-field">
              <label>Share URL</label>
              <input type="url" class="wshare-edit-url-input" value="${url}" placeholder="https://example.com" />
            </div>
            <div class="wshare-edit-field">
              <label>Share Title</label>
              <input type="text" class="wshare-edit-title-input" value="${title}" placeholder="Page title" />
            </div>
            <div class="wshare-edit-field">
              <label>Share Text</label>
              <input type="text" class="wshare-edit-text-input" value="${text}" placeholder="Check this out!" />
            </div>
            <div class="wshare-edit-actions">
              <button type="button" class="wshare-edit-save-btn">Save</button>
              <button type="button" class="wshare-edit-cancel-btn">Cancel</button>
            </div>
          </div>

          <div class="wshare-body">
            <!-- Copy Link Item -->
            <button type="button" class="wshare-item wshare-copy-btn">
              <div class="wshare-item-icon wshare-icon-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div class="wshare-item-content">
                <span class="wshare-item-title">Copy Link</span>
                <span class="wshare-item-desc">${displayUrl}</span>
              </div>
              <span class="wshare-item-badge wshare-copy-badge">Copy</span>
            </button>

            <!-- Native Share / More Options -->
            <button type="button" class="wshare-item wshare-native-btn">
              <div class="wshare-item-icon wshare-icon-sheet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="wshare-item-content">
                <span class="wshare-item-title">More Sharing Options</span>
                <span class="wshare-item-desc">AirDrop, Messages, Device Sheet</span>
              </div>
              <span class="wshare-item-badge">Share ↗</span>
            </button>

            <!-- Social Quicklinks -->
            <div class="wshare-social-row">
              <a href="https://api.whatsapp.com/send?text=${encodeURIComponent((text ? text + ' ' : '') + url)}" target="_blank" rel="noopener noreferrer" class="wshare-social-btn" title="Share on WhatsApp" data-platform="whatsapp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>

              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="wshare-social-btn" title="Share on X (Twitter)" data-platform="twitter">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="wshare-social-btn" title="Share on LinkedIn" data-platform="linkedin">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              <a href="https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer" class="wshare-social-btn" title="Share on Reddit" data-platform="reddit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>

              <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}" target="_blank" rel="noopener noreferrer" class="wshare-social-btn" title="Share on Telegram" data-platform="telegram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.718-1.554 7.377-2.261 10.748-.298 1.425-.79 1.704-1.298 1.751-.88.082-1.547-.58-2.399-1.139-1.332-.874-2.085-1.417-3.378-2.27-1.494-.984-.525-1.524.326-2.408.223-.231 4.092-3.75 4.167-4.068.01-.04.018-.187-.071-.266-.089-.079-.219-.052-.313-.031-.133.03-2.259 1.436-6.376 4.218-.603.414-1.149.616-1.637.605-.538-.012-1.572-.304-2.342-.555-.944-.307-1.696-.47-1.63-.992.034-.272.411-.55 1.13-.835 4.428-1.928 7.382-3.2 8.862-3.816 4.225-1.758 5.103-2.064 5.674-2.074.126-.002.407.03.589.178.154.125.197.294.217.413.021.119.043.349.023.539z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;

      if (isLeft) {
        const card = widget.querySelector('.wshare-card');
        if (card) {
          card.style.right = 'auto';
          card.style.left = '0';
        }
      }

      document.body.appendChild(widget);
      this.widgetEl = widget;
      this.bindEvents();
    }

    bindEvents() {
      const widget = this.widgetEl;
      const pill = widget.querySelector('.wshare-pill');
      const card = widget.querySelector('.wshare-card');
      const closeBtn = widget.querySelector('.wshare-close-btn');
      const copyBtn = widget.querySelector('.wshare-copy-btn');
      const copyBadge = widget.querySelector('.wshare-copy-badge');
      const nativeBtn = widget.querySelector('.wshare-native-btn');

      // Edit Drawer elements
      const editBtn = widget.querySelector('.wshare-edit-btn');
      const editDrawer = widget.querySelector('.wshare-edit-drawer');
      const editUrlInput = widget.querySelector('.wshare-edit-url-input');
      const editTitleInput = widget.querySelector('.wshare-edit-title-input');
      const editTextInput = widget.querySelector('.wshare-edit-text-input');
      const editSaveBtn = widget.querySelector('.wshare-edit-save-btn');
      const editCancelBtn = widget.querySelector('.wshare-edit-cancel-btn');

      const toggleCard = (forceState) => {
        const isActive = typeof forceState === 'boolean' ? forceState : !card.classList.contains('wshare-active');
        card.classList.toggle('wshare-active', isActive);
        pill.setAttribute('aria-expanded', String(isActive));
        if (!isActive && editDrawer) {
          editDrawer.style.display = 'none';
        }
      };

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard();
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard(false);
      });

      document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && card.classList.contains('wshare-active')) {
          toggleCard(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && card.classList.contains('wshare-active')) {
          toggleCard(false);
        }
      });

      // Inline Edit Drawer
      if (editBtn && editDrawer) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = editDrawer.style.display !== 'none';
          editDrawer.style.display = isOpen ? 'none' : 'flex';
          if (!isOpen) {
            editUrlInput.value = this.config.url;
            editTitleInput.value = this.config.title;
            editTextInput.value = this.config.text;
            editUrlInput.focus();
          }
        });

        editSaveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newUrl = editUrlInput.value.trim();
          const newTitle = editTitleInput.value.trim();
          const newText = editTextInput.value.trim();
          if (newUrl) {
            this.updateConfig({
              url: newUrl,
              title: newTitle || this.config.title,
              text: newText || this.config.text
            });
            editDrawer.style.display = 'none';
          }
        });

        editCancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          editDrawer.style.display = 'none';
        });
      }

      // Copy Action
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(this.config.url);
          const original = copyBadge.textContent;
          copyBadge.textContent = 'Copied!';
          copyBadge.style.color = '#10b981';
          setTimeout(() => {
            copyBadge.textContent = original;
            copyBadge.style.color = '';
          }, 2000);
        } catch (err) {
          console.warn('Clipboard copy failed:', err);
        }
      });

      // Native Share Sheet
      nativeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareData = {
          title: this.config.title,
          text: this.config.text,
          url: this.config.url
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            // Dismissed by user
          }
        } else {
          // Fallback if navigator.share is unsupported (e.g. desktop non-Safari)
          try {
            await navigator.clipboard.writeText(this.config.url);
            const titleSpan = nativeBtn.querySelector('.wshare-item-title');
            const original = titleSpan.textContent;
            titleSpan.textContent = 'Link copied to clipboard!';
            setTimeout(() => {
              titleSpan.textContent = original;
            }, 2000);
          } catch (err) {
            window.open(this.config.url, '_blank');
          }
        }
      });
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
    }
  }

  // Global API
  global.ShareLink = {
    instance: null,
    init: function (config) {
      global.ShareLink.instance = new ShareLinkWidget(config);
      return global.ShareLink.instance;
    },
    getInstance: function () {
      return global.ShareLink.instance;
    },
    update: function (cfg) {
      if (global.ShareLink.instance) {
        return global.ShareLink.instance.updateConfig(cfg);
      }
      return null;
    },
    setUrl: function (url) {
      if (global.ShareLink.instance) return global.ShareLink.instance.setUrl(url);
    },
    setTitle: function (title) {
      if (global.ShareLink.instance) return global.ShareLink.instance.setTitle(title);
    },
    setText: function (text) {
      if (global.ShareLink.instance) return global.ShareLink.instance.setText(text);
    },
    setButtonText: function (btnText) {
      if (global.ShareLink.instance) return global.ShareLink.instance.setButtonText(btnText);
    },
    open: function () {
      if (global.ShareLink.instance) return global.ShareLink.instance.open();
    },
    close: function () {
      if (global.ShareLink.instance) return global.ShareLink.instance.close();
    },
    toggle: function () {
      if (global.ShareLink.instance) return global.ShareLink.instance.toggle();
    }
  };

  // Auto-init via data attributes
  const currentScript = document.currentScript;
  if (currentScript) {
    const url = currentScript.getAttribute('data-url');
    const title = currentScript.getAttribute('data-title');
    const text = currentScript.getAttribute('data-text');
    const btn = currentScript.getAttribute('data-button-text');
    const pos = currentScript.getAttribute('data-position');

    if (url || title) {
      global.ShareLink.init({
        url: url || (typeof window !== 'undefined' ? window.location.href : ''),
        title: title || (typeof document !== 'undefined' ? document.title : ''),
        text: text || 'Check this out!',
        buttonText: btn || 'Share',
        position: pos || 'bottom-right'
      });
    }
  }
})(typeof window !== 'undefined' ? window : this);
