(function(i){"use strict";const x={title:typeof document<"u"?document.title:"Share",text:"Check this out!",url:typeof window<"u"?window.location.href:"",buttonText:"Share",position:"bottom-right"};function g(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function v(n){try{const t=new URL(String(n||""),window.location.origin);if(t.protocol==="https:"||t.protocol==="http:")return t.href}catch{}return typeof window<"u"?window.location.href:"https://www.animesenpai.online/"}class L{constructor(t={}){this.config=Object.assign({},x,t),this.config.url=v(this.config.url),this.widgetEl=null,this.init()}formatDisplayUrl(t){try{const e=new URL(t);return e.hostname+(e.pathname==="/"?"":e.pathname)}catch{return t}}setUrl(t){if(!(typeof t!="string"||!t.trim())&&(this.config.url=v(t.trim()),this.widgetEl)){const e=this.widgetEl.querySelector(".wshare-item-desc");e&&(e.textContent=this.formatDisplayUrl(this.config.url))}}setTitle(t){typeof t=="string"&&(this.config.title=t.slice(0,200))}setText(t){typeof t=="string"&&(this.config.text=t.slice(0,300))}setButtonText(t){if(typeof t=="string"&&(this.config.buttonText=t.slice(0,40),this.widgetEl)){const e=this.widgetEl.querySelector(".wshare-pill-text");e&&(e.textContent=this.config.buttonText);const s=this.widgetEl.querySelector(".wshare-title");s&&(s.textContent=this.config.buttonText);const l=this.widgetEl.querySelector(".wshare-pill");l&&l.setAttribute("aria-label",this.config.buttonText)}}updateConfig(t={}){if(t.url!==void 0&&this.setUrl(t.url),t.title!==void 0&&this.setTitle(t.title),t.text!==void 0&&this.setText(t.text),t.buttonText!==void 0&&this.setButtonText(t.buttonText),t.position!==void 0&&this.widgetEl){this.config.position=t.position;const e=t.position==="bottom-left";this.widgetEl.style.right=e?"auto":"24px",this.widgetEl.style.left=e?"24px":"auto";const s=this.widgetEl.querySelector(".wshare-card");s&&(s.style.right=e?"auto":"0",s.style.left=e?"0":"auto")}return this}open(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".wshare-card"),e=this.widgetEl.querySelector(".wshare-pill");t&&(t.classList.add("wshare-active"),e&&e.setAttribute("aria-expanded","true"))}close(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".wshare-card"),e=this.widgetEl.querySelector(".wshare-pill");t&&(t.classList.remove("wshare-active"),e&&e.setAttribute("aria-expanded","false"))}toggle(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".wshare-card");t&&t.classList.contains("wshare-active")?this.close():this.open()}render(){const{url:t,buttonText:e,position:s}=this.config,l=s==="bottom-left",u=g(e),h=g(this.formatDisplayUrl(t)),a=document.createElement("div");if(a.className="wshare-widget",l&&(a.style.right="auto",a.style.left="24px"),a.innerHTML=`
        <button class="wshare-pill" type="button" aria-label="${u}" aria-expanded="false">
          <span class="wshare-pill-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </span>
          <span class="wshare-pill-text">${u}</span>
        </button>

        <div class="wshare-card" role="dialog" aria-modal="false" aria-label="${u}">
          <div class="wshare-header">
            <div class="wshare-title-group">
              <h3 class="wshare-title">${u}</h3>
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
                <span class="wshare-item-desc">${h}</span>
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
              <span class="wshare-item-badge">Share \u2197</span>
            </button>
          </div>
        </div>
      `,l){const c=a.querySelector(".wshare-card");c&&(c.style.right="auto",c.style.left="0")}document.body.appendChild(a),this.widgetEl=a,this.bindEvents()}bindEvents(){const t=this.widgetEl,e=t.querySelector(".wshare-pill"),s=t.querySelector(".wshare-card"),l=t.querySelector(".wshare-close-btn"),u=t.querySelector(".wshare-copy-btn"),h=t.querySelector(".wshare-copy-badge"),a=t.querySelector(".wshare-native-btn");let c=null,y=null,w=!1;const m=()=>typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(hover: hover) and (pointer: fine)").matches,p=()=>{c&&(clearTimeout(c),c=null),y&&(clearTimeout(y),y=null)},f=(r,o)=>{const d=typeof r=="boolean"?r:!s.classList.contains("wshare-active");s.classList.toggle("wshare-active",d),e.setAttribute("aria-expanded",String(d)),d?typeof o=="boolean"&&(w=o):w=!1};t.addEventListener("mouseenter",()=>{m()&&(p(),s.classList.contains("wshare-active")||(c=setTimeout(()=>{f(!0,!1)},120)))}),t.addEventListener("mouseleave",()=>{m()&&(p(),!w&&(y=setTimeout(()=>{f(!1)},240)))}),e.addEventListener("click",r=>{if(r.stopPropagation(),p(),s.classList.contains("wshare-active")&&!w){w=!0;return}const o=!s.classList.contains("wshare-active");f(o,o)}),l.addEventListener("click",r=>{r.stopPropagation(),p(),f(!1)}),document.addEventListener("click",r=>{!t.contains(r.target)&&s.classList.contains("wshare-active")&&(p(),f(!1))}),document.addEventListener("keydown",r=>{r.key==="Escape"&&s.classList.contains("wshare-active")&&(p(),f(!1))}),u.addEventListener("click",async r=>{r.stopPropagation();try{await navigator.clipboard.writeText(this.config.url);const o=h.textContent;h.textContent="Copied!",h.style.color="#10b981",setTimeout(()=>{h.textContent=o,h.style.color=""},2e3)}catch{}}),a.addEventListener("click",async r=>{r.stopPropagation();const o={title:this.config.title,text:this.config.text,url:this.config.url};if(navigator.share)try{await navigator.share(o)}catch{}else try{await navigator.clipboard.writeText(this.config.url);const d=a.querySelector(".wshare-item-title"),S=d.textContent;d.textContent="Link copied to clipboard!",setTimeout(()=>{d.textContent=S},2e3)}catch{}})}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.render()):this.render()}}i.ShareLink={instance:null,init:function(n){return i.ShareLink.instance=new L(n),i.ShareLink.instance},getInstance:function(){return i.ShareLink.instance},update:function(n){return i.ShareLink.instance?i.ShareLink.instance.updateConfig(n):null},setUrl:function(n){if(i.ShareLink.instance)return i.ShareLink.instance.setUrl(n)},setTitle:function(n){if(i.ShareLink.instance)return i.ShareLink.instance.setTitle(n)},setText:function(n){if(i.ShareLink.instance)return i.ShareLink.instance.setText(n)},setButtonText:function(n){if(i.ShareLink.instance)return i.ShareLink.instance.setButtonText(n)},open:function(){if(i.ShareLink.instance)return i.ShareLink.instance.open()},close:function(){if(i.ShareLink.instance)return i.ShareLink.instance.close()},toggle:function(){if(i.ShareLink.instance)return i.ShareLink.instance.toggle()}}})(typeof window<"u"?window:void 0);
