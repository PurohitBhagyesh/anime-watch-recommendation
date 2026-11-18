/**
 * Coffee UPI - Plug & Play Buy Me A Coffee (UPI) Floating Widget
 * Supports: FamApp, Google Pay, PhonePe, Paytm, Amazon Pay, WhatsApp, BHIM
 * Author: Web Elements (github.com/PurohitBhagyesh)
 * License: MIT
 */

(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    upiId: 'developer@upi',
    payeeName: 'Developer Name',
    defaultAmount: 50,
    presets: [20, 50, 100, 200],
    title: 'Buy me a coffee',
    subtitle: 'Every coffee fuels continuous development.',
    position: 'bottom-left' // 'bottom-left' | 'bottom-right'
  };

  class CoffeeUPIWidget {
    constructor(userConfig = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, userConfig);
      this.currentAmount = this.config.defaultAmount;
      this.widgetEl = null;
      this.init();
    }

    buildUPIUri(amount) {
      const amt = Math.max(1, parseInt(amount, 10) || this.config.defaultAmount);
      const query = `pa=${encodeURIComponent(this.config.upiId)}&pn=${encodeURIComponent(this.config.payeeName)}&am=${amt}&cu=INR`;
      return {
        generic: `upi://pay?${query}`,
        query
      };
    }

    setUpiId(newUpiId) {
      if (typeof newUpiId !== 'string' || !newUpiId.trim()) return;
      this.config.upiId = newUpiId.trim();
      if (this.widgetEl) {
        const codeEl = this.widgetEl.querySelector('.cupi-copy-id code');
        if (codeEl) codeEl.textContent = this.config.upiId;
        const upiInput = this.widgetEl.querySelector('.cupi-edit-upi-input');
        if (upiInput) upiInput.value = this.config.upiId;
      }
      this.updateQR(this.currentAmount);
    }

    setPayeeName(newName) {
      if (typeof newName !== 'string') return;
      this.config.payeeName = newName.trim();
      if (this.widgetEl) {
        const nameInput = this.widgetEl.querySelector('.cupi-edit-name-input');
        if (nameInput) nameInput.value = this.config.payeeName;
      }
      this.updateQR(this.currentAmount);
    }

    setAmount(newAmount) {
      const amt = parseInt(newAmount, 10);
      if (isNaN(amt) || amt <= 0) return;
      this.currentAmount = amt;
      if (this.widgetEl) {
        const input = this.widgetEl.querySelector('.cupi-amount-input');
        if (input) input.value = amt;
        const chips = this.widgetEl.querySelectorAll('.cupi-preset-chip');
        chips.forEach(chip => {
          chip.classList.toggle('active', parseInt(chip.dataset.amt, 10) === amt);
        });
      }
      this.updateQR(amt);
    }

    setTitle(newTitle) {
      if (typeof newTitle !== 'string') return;
      this.config.title = newTitle;
      if (this.widgetEl) {
        const pillText = this.widgetEl.querySelector('.cupi-pill-text');
        if (pillText) pillText.textContent = newTitle;
        const titleEl = this.widgetEl.querySelector('.cupi-title');
        if (titleEl) titleEl.textContent = newTitle;
        const pill = this.widgetEl.querySelector('.cupi-pill');
        if (pill) pill.setAttribute('aria-label', newTitle);
      }
    }

    setSubtitle(newSubtitle) {
      if (typeof newSubtitle !== 'string') return;
      this.config.subtitle = newSubtitle;
      if (this.widgetEl) {
        const note = this.widgetEl.querySelector('.cupi-footer-note');
        if (note) note.textContent = newSubtitle;
      }
    }

    updateConfig(newConfig = {}) {
      if (newConfig.upiId !== undefined) this.setUpiId(newConfig.upiId);
      if (newConfig.payeeName !== undefined) this.setPayeeName(newConfig.payeeName);
      if (newConfig.amount !== undefined) this.setAmount(newConfig.amount);
      if (newConfig.defaultAmount !== undefined && newConfig.amount === undefined) this.setAmount(newConfig.defaultAmount);
      if (newConfig.title !== undefined) this.setTitle(newConfig.title);
      if (newConfig.subtitle !== undefined) this.setSubtitle(newConfig.subtitle);
      if (newConfig.position !== undefined && this.widgetEl) {
        this.config.position = newConfig.position;
        const isRight = newConfig.position === 'bottom-right';
        this.widgetEl.style.left = isRight ? 'auto' : '24px';
        this.widgetEl.style.right = isRight ? '24px' : 'auto';
        const card = this.widgetEl.querySelector('.cupi-card');
        if (card) {
          card.style.left = isRight ? 'auto' : '0';
          card.style.right = isRight ? '0' : 'auto';
        }
      }
      this.updateQR(this.currentAmount);
      return this;
    }

    open() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.cupi-card');
      const pill = this.widgetEl.querySelector('.cupi-pill');
      if (card) {
        card.classList.add('cupi-active');
        if (pill) pill.setAttribute('aria-expanded', 'true');
        this.updateQR(this.currentAmount);
      }
    }

    close() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.cupi-card');
      const pill = this.widgetEl.querySelector('.cupi-pill');
      if (card) {
        card.classList.remove('cupi-active');
        if (pill) pill.setAttribute('aria-expanded', 'false');
      }
    }

    toggle() {
      if (!this.widgetEl) return;
      const card = this.widgetEl.querySelector('.cupi-card');
      if (card && card.classList.contains('cupi-active')) {
        this.close();
      } else {
        this.open();
      }
    }

    render() {
      const { upiId, payeeName, title, subtitle, presets, defaultAmount, position } = this.config;
      const isRight = position === 'bottom-right';

      const widget = document.createElement('div');
      widget.className = 'cupi-widget';
      if (isRight) {
        widget.style.left = 'auto';
        widget.style.right = '24px';
      }

      widget.innerHTML = `
        <button class="cupi-pill" type="button" aria-label="${title}" aria-expanded="false">
          <span class="cupi-pill-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </span>
          <span class="cupi-pill-text">${title}</span>
        </button>

        <div class="cupi-card" role="dialog" aria-modal="false" aria-label="${title}">
          <div class="cupi-header">
            <div class="cupi-title-group">
              <h3 class="cupi-title">${title}</h3>
              <div class="cupi-id-row">
                <button type="button" class="cupi-copy-id" title="Click to copy UPI ID">
                  <code>${upiId}</code>
                  <span class="cupi-copy-label">Copy</span>
                </button>
                <button type="button" class="cupi-edit-btn" title="Edit UPI ID and Payee Name" aria-label="Edit details">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
              </div>
            </div>
            <button class="cupi-close-btn" type="button" aria-label="Close">&times;</button>
          </div>

          <div class="cupi-edit-drawer" style="display: none;">
            <div class="cupi-edit-field">
              <label>Payee Name</label>
              <input type="text" class="cupi-edit-name-input" value="${payeeName}" placeholder="e.g. Developer Name" />
            </div>
            <div class="cupi-edit-field">
              <label>UPI ID (VPA)</label>
              <input type="text" class="cupi-edit-upi-input" value="${upiId}" placeholder="e.g. developer@upi" />
            </div>
            <div class="cupi-edit-actions">
              <button type="button" class="cupi-edit-save-btn">Save</button>
              <button type="button" class="cupi-edit-cancel-btn">Cancel</button>
            </div>
          </div>

          <div class="cupi-body">
            <div class="cupi-qr-wrapper">
              <div class="cupi-qr-pad">
                <img class="cupi-qr-img" src="" alt="UPI QR Code" width="140" height="140" />
              </div>
              <span class="cupi-qr-caption">Scan with any UPI App</span>
            </div>

            <div class="cupi-input-wrap">
              <span class="cupi-currency">&#8377;</span>
              <input type="number" class="cupi-amount-input" min="1" max="100000" value="${defaultAmount}" placeholder="Enter amount" />
            </div>

            <div class="cupi-presets">
              ${presets.map(p => `<button type="button" class="cupi-preset-chip ${p === defaultAmount ? 'active' : ''}" data-amt="${p}">&#8377;${p}</button>`).join('')}
            </div>

            <div class="cupi-apps-section">
              <span class="cupi-apps-header">Or pay via installed app:</span>
              <div class="cupi-apps-grid">
                <button type="button" class="cupi-app-btn" data-scheme="famapp">
                  <span class="cupi-app-badge cupi-fam-badge">Fam</span>
                  <span>FamApp</span>
                </button>
                <button type="button" class="cupi-app-btn" data-scheme="amazonpay">
                  <span class="cupi-app-badge cupi-amz-badge">a</span>
                  <span>Amazon</span>
                </button>
                <button type="button" class="cupi-app-btn" data-scheme="phonepe">
                  <span class="cupi-app-badge cupi-pe-badge">Pe</span>
                  <span>PhonePe</span>
                </button>
                <button type="button" class="cupi-app-btn" data-scheme="gpay">
                  <span class="cupi-app-badge cupi-gpay-badge">G</span>
                  <span>GPay</span>
                </button>
                <button type="button" class="cupi-app-btn" data-scheme="paytm">
                  <span class="cupi-app-badge cupi-paytm-badge">Pay</span>
                  <span>Paytm</span>
                </button>
                <button type="button" class="cupi-app-btn" data-scheme="whatsapp">
                  <span class="cupi-app-badge cupi-wa-badge">WA</span>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            <div class="cupi-alert" style="display: none;" role="alert">
              <span class="cupi-alert-icon">⚠️</span>
              <div class="cupi-alert-text">
                <strong>No UPI app opened?</strong>
                <p>Scan the QR code with your mobile camera or copy the UPI ID above.</p>
              </div>
              <button type="button" class="cupi-alert-close">&times;</button>
            </div>

            <p class="cupi-footer-note">${subtitle}</p>
          </div>
        </div>
      `;

      if (isRight) {
        const card = widget.querySelector('.cupi-card');
        if (card) {
          card.style.left = 'auto';
          card.style.right = '0';
        }
      }

      document.body.appendChild(widget);
      this.widgetEl = widget;
      this.bindEvents();
      this.updateQR(this.currentAmount);
    }

    updateQR(amount) {
      if (!this.widgetEl) return;
      const qrImg = this.widgetEl.querySelector('.cupi-qr-img');
      if (!qrImg) return;
      const { generic } = this.buildUPIUri(amount);
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=svg&data=${encodeURIComponent(generic)}`;
    }

    bindEvents() {
      const widget = this.widgetEl;
      const pill = widget.querySelector('.cupi-pill');
      const card = widget.querySelector('.cupi-card');
      const closeBtn = widget.querySelector('.cupi-close-btn');
      const copyBtn = widget.querySelector('.cupi-copy-id');
      const amountInput = widget.querySelector('.cupi-amount-input');
      const presetsWrap = widget.querySelector('.cupi-presets');
      const alertBox = widget.querySelector('.cupi-alert');
      const alertClose = widget.querySelector('.cupi-alert-close');
      const appButtons = widget.querySelectorAll('.cupi-app-btn');

      // Edit Drawer elements
      const editBtn = widget.querySelector('.cupi-edit-btn');
      const editDrawer = widget.querySelector('.cupi-edit-drawer');
      const editNameInput = widget.querySelector('.cupi-edit-name-input');
      const editUpiInput = widget.querySelector('.cupi-edit-upi-input');
      const editSaveBtn = widget.querySelector('.cupi-edit-save-btn');
      const editCancelBtn = widget.querySelector('.cupi-edit-cancel-btn');

      const toggleCard = (forceState) => {
        const isActive = typeof forceState === 'boolean' ? forceState : !card.classList.contains('cupi-active');
        card.classList.toggle('cupi-active', isActive);
        pill.setAttribute('aria-expanded', String(isActive));
        if (isActive) {
          this.updateQR(amountInput.value || this.config.defaultAmount);
        } else if (editDrawer) {
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
        if (!widget.contains(e.target) && card.classList.contains('cupi-active')) {
          toggleCard(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && card.classList.contains('cupi-active')) {
          toggleCard(false);
        }
      });

      // Inline Edit UPI ID & Name Drawer
      if (editBtn && editDrawer) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = editDrawer.style.display !== 'none';
          editDrawer.style.display = isOpen ? 'none' : 'flex';
          if (!isOpen) {
            editNameInput.value = this.config.payeeName;
            editUpiInput.value = this.config.upiId;
            editUpiInput.focus();
          }
        });

        editSaveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newName = editNameInput.value.trim();
          const newUpi = editUpiInput.value.trim();
          if (newUpi) {
            this.updateConfig({
              payeeName: newName || this.config.payeeName,
              upiId: newUpi
            });
            editDrawer.style.display = 'none';
          }
        });

        editCancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          editDrawer.style.display = 'none';
        });
      }

      // Amount Input & Presets
      amountInput.addEventListener('input', () => {
        const amt = parseInt(amountInput.value, 10);
        this.updateQR(amt || this.config.defaultAmount);
        presetsWrap.querySelectorAll('.cupi-preset-chip').forEach(chip => {
          chip.classList.toggle('active', parseInt(chip.dataset.amt, 10) === amt);
        });
      });

      presetsWrap.addEventListener('click', (e) => {
        const chip = e.target.closest('.cupi-preset-chip');
        if (!chip) return;
        const amt = parseInt(chip.dataset.amt, 10);
        amountInput.value = amt;
        presetsWrap.querySelectorAll('.cupi-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.updateQR(amt);
      });

      // Copy UPI ID
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(this.config.upiId);
          const label = copyBtn.querySelector('.cupi-copy-label');
          label.textContent = 'Copied!';
          label.style.color = 'var(--cupi-accent)';
          setTimeout(() => {
            label.textContent = 'Copy';
            label.style.color = '';
          }, 2000);
        } catch (err) {
          console.warn('Failed to copy UPI ID:', err);
        }
      });

      if (alertClose) {
        alertClose.addEventListener('click', () => {
          alertBox.style.display = 'none';
        });
      }

      // App deep linking
      appButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const scheme = btn.dataset.scheme;
          const amt = parseInt(amountInput.value, 10) || this.config.defaultAmount;
          const { query, generic } = this.buildUPIUri(amt);
          let targetUri = generic;

          if (scheme === 'famapp') {
            targetUri = `in.fampay.app://upi/pay?${query}`;
          } else if (scheme === 'amazonpay') {
            targetUri = `amazonpay://upi/pay?${query}`;
          } else if (scheme === 'phonepe') {
            targetUri = `phonepe://upi/pay?${query}`;
          } else if (scheme === 'gpay') {
            targetUri = `tez://upi/pay?${query}`;
          } else if (scheme === 'paytm') {
            targetUri = `paytmmp://pay?${query}`;
          } else if (scheme === 'whatsapp') {
            targetUri = `whatsapp://pay?${query}`;
          }

          const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          if (isDesktop) {
            alertBox.style.display = 'flex';
            return;
          }

          let didAppOpen = false;
          const onVisibilityChange = () => {
            if (document.hidden) didAppOpen = true;
          };
          document.addEventListener('visibilitychange', onVisibilityChange, { once: true });

          window.location.href = targetUri;

          setTimeout(() => {
            if (!didAppOpen && !document.hidden) {
              if (scheme === 'famapp') {
                window.location.href = `famapp://upi/pay?${query}`;
                setTimeout(() => {
                  if (!didAppOpen && !document.hidden) {
                    alertBox.style.display = 'flex';
                  }
                }, 800);
              } else {
                alertBox.style.display = 'flex';
              }
            }
          }, 1200);
        });
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
  global.CoffeeUPI = {
    instance: null,
    init: function (config) {
      global.CoffeeUPI.instance = new CoffeeUPIWidget(config);
      return global.CoffeeUPI.instance;
    },
    getInstance: function () {
      return global.CoffeeUPI.instance;
    },
    update: function (cfg) {
      if (global.CoffeeUPI.instance) {
        return global.CoffeeUPI.instance.updateConfig(cfg);
      }
      return null;
    },
    setUpiId: function (id) {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.setUpiId(id);
    },
    setPayeeName: function (name) {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.setPayeeName(name);
    },
    setAmount: function (amt) {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.setAmount(amt);
    },
    open: function () {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.open();
    },
    close: function () {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.close();
    },
    toggle: function () {
      if (global.CoffeeUPI.instance) return global.CoffeeUPI.instance.toggle();
    }
  };

  // Auto-init via data attributes on current script tag if present
  const currentScript = document.currentScript;
  if (currentScript) {
    const upi = currentScript.getAttribute('data-upi');
    if (upi) {
      const name = currentScript.getAttribute('data-name');
      const amt = currentScript.getAttribute('data-amount');
      const pos = currentScript.getAttribute('data-position');
      const title = currentScript.getAttribute('data-title');
      const subtitle = currentScript.getAttribute('data-subtitle');
      global.CoffeeUPI.init({
        upiId: upi,
        payeeName: name || DEFAULT_CONFIG.payeeName,
        defaultAmount: amt ? parseInt(amt, 10) : DEFAULT_CONFIG.defaultAmount,
        position: pos || DEFAULT_CONFIG.position,
        title: title || DEFAULT_CONFIG.title,
        subtitle: subtitle || DEFAULT_CONFIG.subtitle
      });
    }
  }
})(typeof window !== 'undefined' ? window : this);
