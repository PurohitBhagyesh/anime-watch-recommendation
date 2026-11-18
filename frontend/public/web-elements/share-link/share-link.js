/**
 * Share Link - Minimal Privacy-First Share Widget
 * Features: 1-Click Clipboard Copy & Native Device Share Sheet
 * License: MIT
 */

(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    title: typeof document !== 'undefined' ? document.title : 'Share',
    text: 'Check this out!',
    url: typeof window !== 'undefined' ? window.location.href : '',
    buttonText: 'Share',
    position: 'bottom-right',
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeHttpUrl(rawUrl) {
    try {
      const parsed = new URL(String(rawUrl || ''), window.location.origin);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href;
      }
    } catch {
      // Fall through to current page URL
    }
    return typeof window !== 'undefined' ? window.location.href : 'https://www.animesenpai.online/';
  }

  class ShareLinkWidget {
    constructor(userConfig = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, userConfig);
      this.config.url = sanitizeHttpUrl(this.config.url);
      this.widgetEl = null;
      this.init();
    }

    formatDisplayUrl(url) {
      try {
        const u = new URL(url);
        return u.hostname + (u.pathname === '/' ? '' : u.pathname);
      } catch {
        return url;
      }
    }

    setUrl(newUrl) {
      if (typeof newUrl !== 'string' || !newUrl.trim()) return;
      this.config.url = sanitizeHttpUrl(newUrl.trim());
      if (this.widgetEl) {
        const desc = this.widgetEl.querySelector('.wshare-item-desc');
        if (desc) desc.textContent = this.formatDisplayUrl(this.config.url);
      }
    }

    setTitle(newTitle) {
      if (typeof newTitle !== 'string') return;
      this.config.title = newTitle.slice(0, 200);
    }

    setText(newText) {
      if (typeof newText !== 'string') return;
      this.config.text = newText.slice(0, 300);
    }

    setButtonText(newText) {
      if (typeof newText !== 'string') return;
      this.config.buttonText = newText.slice(0, 40);
      if (this.widgetEl) {
        const pillText = this.widgetEl.querySelector('.wshare-pill-text');
        if (pillText) pillText.textContent = this.config.buttonText;
        const titleEl = this.widgetEl.querySelector('.wshare-title');
        if (titleEl) titleEl.textContent = this.config.buttonText;
        const pill = this.widgetEl.querySelector('.wshare-pill');
        if (pill) pill.setAttribute('aria-label', this.config.buttonText);
      }
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
      const { url, buttonText, position } = this.config;
      const isLeft = position === 'bottom-left';
      const safeButtonText = escapeHtml(buttonText);
      const safeDisplayUrl = escapeHtml(this.formatDisplayUrl(url));

      const widget = document.createElement('div');
      widget.className = 'wshare-widget';
      if (isLeft) {
        widget.style.right = 'auto';
        widget.style.left = '24px';
      }

      widget.innerHTML = `
        <button class="wshare-pill" type="button" aria-label="${safeButtonText}" aria-expanded="false">
          <span class="wshare-pill-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </span>
          <span class="wshare-pill-text">${safeButtonText}</span>
        </button>

        <div class="wshare-card" role="dialog" aria-modal="false" aria-label="${safeButtonText}">
          <div class="wshare-header">
            <div class="wshare-title-group">
              <h3 class="wshare-title">${safeButtonText}</h3>
              <p class="wshare-subtitle">Copy link or share from your device</p>
            </div>
            <div class="wshare-header-actions">
              <button class="wshare-close-btn" type="button" aria-label="Close">&times;</button>
            </div>
          </div>

          <div class="wshare-body">
            <button type="button" class="wshare-item wshare-copy-btn">
              <div class="wshare-item-icon wshare-icon-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div class="wshare-item-content">
                <span class="wshare-item-title">Copy Link</span>
                <span class="wshare-item-desc">${safeDisplayUrl}</span>
              </div>
              <span class="wshare-item-badge wshare-copy-badge">Copy</span>
            </button>

            <button type="button" class="wshare-item wshare-native-btn">
              <div class="wshare-item-icon wshare-icon-sheet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

      const toggleCard = (forceState) => {
        const isActive =
          typeof forceState === 'boolean' ? forceState : !card.classList.contains('wshare-active');
        card.classList.toggle('wshare-active', isActive);
        pill.setAttribute('aria-expanded', String(isActive));
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
        } catch {
          // Ignore clipboard denial
        }
      });

      nativeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareData = {
          title: this.config.title,
          text: this.config.text,
          url: this.config.url,
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch {
            // Dismissed by user
          }
        } else {
          try {
            await navigator.clipboard.writeText(this.config.url);
            const titleSpan = nativeBtn.querySelector('.wshare-item-title');
            const original = titleSpan.textContent;
            titleSpan.textContent = 'Link copied to clipboard!';
            setTimeout(() => {
              titleSpan.textContent = original;
            }, 2000);
          } catch {
            // Ignore clipboard fallback error
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
    },
  };
})(typeof window !== 'undefined' ? window : this);
