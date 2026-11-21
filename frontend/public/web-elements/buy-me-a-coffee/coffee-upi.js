(function(n){"use strict";const b={upiId:"developer@upi",payeeName:"Developer Name",defaultAmount:50,presets:[20,50,100,200],title:"Buy me a coffee",subtitle:"Every coffee fuels continuous development.",position:"bottom-left"};function U(c){return String(c??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}class k{constructor(t={}){this.config=Object.assign({},b,t),this.currentAmount=this.config.defaultAmount,this.widgetEl=null,this.init()}buildUPIUri(t){const e=Math.max(1,parseInt(t,10)||this.config.defaultAmount),a=`pa=${encodeURIComponent(this.config.upiId)}&pn=${encodeURIComponent(this.config.payeeName)}&am=${e}&cu=INR`;return{generic:`upi://pay?${a}`,query:a}}setUpiId(t){if(!(typeof t!="string"||!t.trim())){if(this.config.upiId=t.trim(),this.widgetEl){const e=this.widgetEl.querySelector(".cupi-copy-id code");e&&(e.textContent=this.config.upiId);const a=this.widgetEl.querySelector(".cupi-edit-upi-input");a&&(a.value=this.config.upiId)}this.updateQR(this.currentAmount)}}setPayeeName(t){if(typeof t=="string"){if(this.config.payeeName=t.trim(),this.widgetEl){const e=this.widgetEl.querySelector(".cupi-edit-name-input");e&&(e.value=this.config.payeeName)}this.updateQR(this.currentAmount)}}setAmount(t){const e=parseInt(t,10);if(!(isNaN(e)||e<=0)){if(this.currentAmount=e,this.widgetEl){const a=this.widgetEl.querySelector(".cupi-amount-input");a&&(a.value=e),this.widgetEl.querySelectorAll(".cupi-preset-chip").forEach(r=>{r.classList.toggle("active",parseInt(r.dataset.amt,10)===e)})}this.updateQR(e)}}setTitle(t){if(typeof t=="string"&&(this.config.title=t,this.widgetEl)){const e=this.widgetEl.querySelector(".cupi-pill-text");e&&(e.textContent=t);const a=this.widgetEl.querySelector(".cupi-title");a&&(a.textContent=t);const o=this.widgetEl.querySelector(".cupi-pill");o&&o.setAttribute("aria-label",t)}}setSubtitle(t){if(typeof t=="string"&&(this.config.subtitle=t,this.widgetEl)){const e=this.widgetEl.querySelector(".cupi-footer-note");e&&(e.textContent=t)}}updateConfig(t={}){if(t.upiId!==void 0&&this.setUpiId(t.upiId),t.payeeName!==void 0&&this.setPayeeName(t.payeeName),t.amount!==void 0&&this.setAmount(t.amount),t.defaultAmount!==void 0&&t.amount===void 0&&this.setAmount(t.defaultAmount),t.title!==void 0&&this.setTitle(t.title),t.subtitle!==void 0&&this.setSubtitle(t.subtitle),t.position!==void 0&&this.widgetEl){this.config.position=t.position;const e=t.position==="bottom-right";this.widgetEl.style.left=e?"auto":"24px",this.widgetEl.style.right=e?"24px":"auto";const a=this.widgetEl.querySelector(".cupi-card");a&&(a.style.left=e?"auto":"0",a.style.right=e?"0":"auto")}return this.updateQR(this.currentAmount),this}open(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".cupi-card"),e=this.widgetEl.querySelector(".cupi-pill");t&&(t.classList.add("cupi-active"),e&&e.setAttribute("aria-expanded","true"),this.updateQR(this.currentAmount))}close(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".cupi-card"),e=this.widgetEl.querySelector(".cupi-pill");t&&(t.classList.remove("cupi-active"),e&&e.setAttribute("aria-expanded","false"))}toggle(){if(!this.widgetEl)return;const t=this.widgetEl.querySelector(".cupi-card");t&&t.classList.contains("cupi-active")?this.close():this.open()}render(){const{upiId:t,payeeName:e,title:a,subtitle:o,presets:r,defaultAmount:h,position:A}=this.config,y=A==="bottom-right",g=U(a),C=U(t),S=U(e),l=U(o),P=Math.max(1,parseInt(h,10)||50),q=Array.isArray(r)?r.map(p=>Math.max(1,parseInt(p,10)||50)):[20,50,100,200],d=document.createElement("div");if(d.className="cupi-widget",y&&(d.style.left="auto",d.style.right="24px"),d.innerHTML=`
        <button class="cupi-pill" type="button" aria-label="${g}" aria-expanded="false">
          <span class="cupi-pill-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </span>
          <span class="cupi-pill-text">${g}</span>
        </button>

        <div class="cupi-card" role="dialog" aria-modal="false" aria-label="${g}">
          <div class="cupi-header">
            <div class="cupi-title-group">
              <h3 class="cupi-title">${g}</h3>
              <div class="cupi-id-row">
                <button type="button" class="cupi-copy-id" title="Click to copy UPI ID">
                  <code>${C}</code>
                  <span class="cupi-copy-label">Copy</span>
                </button>
              </div>
            </div>
            <button class="cupi-close-btn" type="button" aria-label="Close">&times;</button>
          </div>

          <div class="cupi-body">
            <div class="cupi-qr-wrapper">
              <div class="cupi-qr-pad">
                <img class="cupi-qr-img" src="" alt="UPI QR Code for ${S}" width="140" height="140" />
              </div>
              <span class="cupi-qr-caption">Scan with any UPI App</span>
            </div>

            <div class="cupi-input-wrap">
              <span class="cupi-currency">&#8377;</span>
              <input type="number" class="cupi-amount-input" min="1" max="100000" value="${P}" placeholder="Enter amount" />
            </div>

            <div class="cupi-presets">
              ${q.map(p=>`<button type="button" class="cupi-preset-chip ${p===P?"active":""}" data-amt="${p}">&#8377;${p}</button>`).join("")}
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
              <span class="cupi-alert-icon">\u26A0\uFE0F</span>
              <div class="cupi-alert-text">
                <strong>No UPI app opened?</strong>
                <p>Scan the QR code with your mobile camera or copy the UPI ID above.</p>
              </div>
              <button type="button" class="cupi-alert-close">&times;</button>
            </div>

            <p class="cupi-footer-note">${l}</p>
          </div>
        </div>
      `,y){const p=d.querySelector(".cupi-card");p&&(p.style.left="auto",p.style.right="0")}document.body.appendChild(d),this.widgetEl=d,this.bindEvents(),this.updateQR(this.currentAmount)}updateQR(t){if(!this.widgetEl)return;const e=this.widgetEl.querySelector(".cupi-qr-img");if(!e)return;const{generic:a}=this.buildUPIUri(t),o=encodeURIComponent(a);e.onerror=()=>{e.dataset.fallbackUsed||(e.dataset.fallbackUsed="1",e.src=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${o}`)},delete e.dataset.fallbackUsed,e.src=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=svg&data=${o}`}bindEvents(){const t=this.widgetEl,e=t.querySelector(".cupi-pill"),a=t.querySelector(".cupi-card"),o=t.querySelector(".cupi-close-btn"),r=t.querySelector(".cupi-copy-id"),h=t.querySelector(".cupi-amount-input"),A=t.querySelector(".cupi-presets"),y=t.querySelector(".cupi-alert"),g=t.querySelector(".cupi-alert-close"),C=t.querySelectorAll(".cupi-app-btn"),S=t.querySelector(".cupi-edit-btn"),l=t.querySelector(".cupi-edit-drawer"),P=t.querySelector(".cupi-edit-name-input"),q=t.querySelector(".cupi-edit-upi-input"),d=t.querySelector(".cupi-edit-save-btn"),p=t.querySelector(".cupi-edit-cancel-btn");let x=null,L=null,w=!1;const $=()=>typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(hover: hover) and (pointer: fine)").matches,I=()=>{x&&(clearTimeout(x),x=null),L&&(clearTimeout(L),L=null)},E=(s,i)=>{const u=typeof s=="boolean"?s:!a.classList.contains("cupi-active");a.classList.toggle("cupi-active",u),e.setAttribute("aria-expanded",String(u)),u?(typeof i=="boolean"&&(w=i),this.updateQR(h.value||this.config.defaultAmount)):(w=!1,l&&(l.style.display="none"))};t.addEventListener("mouseenter",()=>{$()&&(I(),a.classList.contains("cupi-active")||(x=setTimeout(()=>{E(!0,!1)},120)))}),t.addEventListener("mouseleave",()=>{if(!$()||(I(),w))return;const s=document.activeElement;s&&a.contains(s)&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA")||(L=setTimeout(()=>{E(!1)},240))}),e.addEventListener("click",s=>{if(s.stopPropagation(),I(),a.classList.contains("cupi-active")&&!w){w=!0;return}const i=!a.classList.contains("cupi-active");E(i,i)}),o.addEventListener("click",s=>{s.stopPropagation(),I(),E(!1)}),document.addEventListener("click",s=>{!t.contains(s.target)&&a.classList.contains("cupi-active")&&(I(),E(!1))}),document.addEventListener("keydown",s=>{s.key==="Escape"&&a.classList.contains("cupi-active")&&(I(),E(!1))}),S&&l&&(S.addEventListener("click",s=>{s.stopPropagation();const i=l.style.display!=="none";l.style.display=i?"none":"flex",i||(P.value=this.config.payeeName,q.value=this.config.upiId,q.focus())}),d.addEventListener("click",s=>{s.stopPropagation();const i=P.value.trim(),u=q.value.trim();u&&(this.updateConfig({payeeName:i||this.config.payeeName,upiId:u}),l.style.display="none")}),p.addEventListener("click",s=>{s.stopPropagation(),l.style.display="none"})),h.addEventListener("input",()=>{const s=parseInt(h.value,10);this.updateQR(s||this.config.defaultAmount),A.querySelectorAll(".cupi-preset-chip").forEach(i=>{i.classList.toggle("active",parseInt(i.dataset.amt,10)===s)})}),A.addEventListener("click",s=>{const i=s.target.closest(".cupi-preset-chip");if(!i)return;const u=parseInt(i.dataset.amt,10);h.value=u,A.querySelectorAll(".cupi-preset-chip").forEach(f=>f.classList.remove("active")),i.classList.add("active"),this.updateQR(u)}),r.addEventListener("click",async s=>{s.stopPropagation();try{await navigator.clipboard.writeText(this.config.upiId);const i=r.querySelector(".cupi-copy-label");i.textContent="Copied!",i.style.color="var(--cupi-accent)",setTimeout(()=>{i.textContent="Copy",i.style.color=""},2e3)}catch(i){console.warn("Failed to copy UPI ID:",i)}}),g&&g.addEventListener("click",()=>{y.style.display="none"}),C.forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.scheme,u=parseInt(h.value,10)||this.config.defaultAmount,{query:f,generic:R}=this.buildUPIUri(u);let v=R;if(i==="famapp"?v=`in.fampay.app://upi/pay?${f}`:i==="amazonpay"?v=`amazonpay://upi/pay?${f}`:i==="phonepe"?v=`phonepe://upi/pay?${f}`:i==="gpay"?v=`tez://upi/pay?${f}`:i==="paytm"?v=`paytmmp://pay?${f}`:i==="whatsapp"&&(v=`whatsapp://pay?${f}`),!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){y.style.display="flex";return}let N=!1;const T=()=>{document.hidden&&(N=!0)};document.addEventListener("visibilitychange",T,{once:!0}),window.location.href=v,setTimeout(()=>{!N&&!document.hidden&&(i==="famapp"?(window.location.href=`famapp://upi/pay?${f}`,setTimeout(()=>{!N&&!document.hidden&&(y.style.display="flex")},800)):y.style.display="flex")},1200)})})}init(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.render()):this.render()}}n.CoffeeUPI={instance:null,init:function(c){return n.CoffeeUPI.instance=new k(c),n.CoffeeUPI.instance},getInstance:function(){return n.CoffeeUPI.instance},update:function(c){return n.CoffeeUPI.instance?n.CoffeeUPI.instance.updateConfig(c):null},setUpiId:function(c){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.setUpiId(c)},setPayeeName:function(c){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.setPayeeName(c)},setAmount:function(c){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.setAmount(c)},open:function(){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.open()},close:function(){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.close()},toggle:function(){if(n.CoffeeUPI.instance)return n.CoffeeUPI.instance.toggle()}};const m=document.currentScript;if(m){const c=m.getAttribute("data-upi");if(c){const t=m.getAttribute("data-name"),e=m.getAttribute("data-amount"),a=m.getAttribute("data-position"),o=m.getAttribute("data-title"),r=m.getAttribute("data-subtitle");n.CoffeeUPI.init({upiId:c,payeeName:t||b.payeeName,defaultAmount:e?parseInt(e,10):b.defaultAmount,position:a||b.position,title:o||b.title,subtitle:r||b.subtitle})}}})(typeof window<"u"?window:void 0);
