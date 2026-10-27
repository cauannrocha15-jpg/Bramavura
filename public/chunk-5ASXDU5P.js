import{b as m}from"./chunk-23DBIEQ5.js";import{e as b}from"./chunk-TXVO7XLA.js";import{d as h,h as u}from"./chunk-E2P7LMMT.js";import{N as g,qa as v,sa as f}from"./chunk-3UYZ2FFW.js";function x(t,e){typeof e=="string"?t.textContent=e:t.replaceChildren(e)}var s=null;function M(){return s!==null}function H(){s?.()}function V(t){s?.();let e=document.createElement("div");e.className="text-prompt-overlay",e.innerHTML=`
    <div class="text-prompt-dialog steel-prompt${t.danger?" danger":""}" role="dialog" aria-modal="true" data-prompt-kind="text">
      <header>${t.danger?'<span class="slot-missing" aria-hidden="true">!</span>':""}<span class="text-prompt-title"></span></header>
      <p class="text-prompt-hint" hidden></p>
      <input class="text-prompt-input" type="text" autocomplete="off" spellcheck="false">
      <div class="text-prompt-buttons">
        <button type="button" class="text-prompt-cancel">${u("Cancel")}</button>
        <button type="button" class="text-prompt-confirm"></button>
      </div>
    </div>
  `,e.querySelector(".text-prompt-title").textContent=t.title;let c=e.querySelector(".text-prompt-hint");t.hint&&(x(c,t.hint),c.hidden=!1);let n=e.querySelector(".text-prompt-input");n.maxLength=t.maxLength,n.placeholder=t.placeholder??"",n.value=t.value??"",n.setAttribute("aria-label",t.title);let d=e.querySelector(".text-prompt-confirm");d.textContent=t.confirmLabel;let a=()=>{s=null,e.remove()};s=a;let r=t.requiredValue?.trim().toLocaleLowerCase()??null,o=()=>{let l=n.value.trim();return l.length===0?!1:r===null||l.toLocaleLowerCase()===r},i=()=>{d.disabled=!o()},p=()=>{o()&&(a(),t.onConfirm(n.value.trim()))};i(),n.addEventListener("input",i),d.addEventListener("click",p),e.querySelector(".text-prompt-cancel").addEventListener("click",a),m(e,a),e.addEventListener("keydown",l=>{l.key==="Enter"?(l.preventDefault(),p()):l.key==="Escape"&&(l.preventDefault(),a())}),document.body.appendChild(e),n.focus(),n.select()}function I(t){s?.();let e=document.createElement("div");e.className="text-prompt-overlay",e.innerHTML=`
    <div class="text-prompt-dialog steel-prompt" role="dialog" aria-modal="true">
      <header><span class="text-prompt-title"></span></header>
      <p class="text-prompt-hint" hidden></p>
      <div class="text-prompt-choices"></div>
      <div class="text-prompt-buttons">
        <button type="button" class="text-prompt-cancel">${u("Cancel")}</button>
      </div>
    </div>
  `,e.querySelector(".text-prompt-title").textContent=t.title;let c=e.querySelector(".text-prompt-hint");t.hint&&(x(c,t.hint),c.hidden=!1);let n=()=>{s=null,e.remove()};s=n;let d=e.querySelector(".text-prompt-choices");for(let r of t.choices){let o=document.createElement("button");o.type="button";let i=document.createElement("span");i.className="text-prompt-choice-label";let p=document.createElement("strong");if(p.textContent=r.label,i.append(p),r.note){let l=document.createElement("em");l.className="text-prompt-choice-note",l.textContent=r.note,i.append(l)}if(o.append(i),r.hint){let l=document.createElement("small");l.textContent=r.hint,o.append(l)}o.addEventListener("click",()=>{n(),r.onSelect()}),d.append(o)}let a=e.querySelector(".text-prompt-cancel");a.addEventListener("click",n),m(e,n),e.addEventListener("keydown",r=>{r.key==="Escape"&&(r.preventDefault(),n())}),document.body.appendChild(e),a.focus()}function A(t){s?.();let e=document.createElement("div");e.className="text-prompt-overlay",e.innerHTML=`
    <div class="text-prompt-dialog steel-prompt" role="dialog" aria-modal="true" data-prompt-kind="notice">
      <header><span class="text-prompt-title"></span></header>
      <p class="text-prompt-hint" hidden></p>
      <div class="text-prompt-buttons">
        <button type="button" class="text-prompt-confirm"></button>
      </div>
    </div>
  `,e.querySelector(".text-prompt-title").textContent=t.title;let c=e.querySelector(".text-prompt-hint");t.hint&&(x(c,t.hint),c.hidden=!1);let n=e.querySelector(".text-prompt-confirm");n.textContent=t.confirmLabel;let d=()=>{s=null,e.remove(),t.onClose()};s=d,n.addEventListener("click",d),m(e,d),e.addEventListener("keydown",a=>{a.key==="Escape"&&(a.preventDefault(),d())}),document.body.appendChild(e),n.focus()}function D(t){s?.();let e=document.createElement("div");e.className="text-prompt-overlay",e.innerHTML=`
    <div class="text-prompt-dialog steel-prompt${t.danger?" danger":""}" role="dialog" aria-modal="true">
      <header>${t.danger?'<span class="slot-missing" aria-hidden="true">!</span>':""}<span class="text-prompt-title"></span></header>
      <div class="text-prompt-hint" hidden></div>
      <div class="text-prompt-buttons">
        <button type="button" class="text-prompt-cancel">${u("Cancel")}</button>
        <button type="button" class="text-prompt-confirm"></button>
      </div>
    </div>
  `,e.querySelector(".text-prompt-title").textContent=t.title;let c=e.querySelector(".text-prompt-hint");t.hint&&(x(c,t.hint),c.hidden=!1);let n=e.querySelector(".text-prompt-confirm");n.textContent=t.confirmLabel,n.disabled=t.confirmDisabled===!0;let d=e.querySelector(".text-prompt-cancel"),a=e.querySelector("header");if(t.icon&&!t.danger){let o=document.createElement("span");o.className="text-prompt-emblem",o.setAttribute("aria-hidden","true");let i=document.createElement("img");i.src=t.icon,i.alt="",o.append(i),a.prepend(o),a.classList.add("has-emblem")}if(t.category){let o=a.querySelector(".text-prompt-title"),i=document.createElement("span");i.className="text-prompt-heading-copy";let p=document.createElement("span");p.className="text-prompt-category",p.textContent=t.category,i.append(p,o),a.append(i)}if(t.goldCost){let o=document.createElement("div");o.className="text-prompt-cost";let i=document.createElement("span");i.textContent=t.goldCost.label;let p=document.createElement("strong"),l=document.createElement("canvas");l.width=l.height=24,l.setAttribute("aria-hidden","true"),p.append(l,document.createTextNode(`${t.goldCost.amount.toLocaleString(h())} gold`)),o.append(i,p),e.querySelector(".text-prompt-buttons").before(o),b(g,l,100).catch(()=>!1)}let r=()=>{s=null,e.remove(),t.onClose?.()};return s=r,n.addEventListener("click",()=>{r(),t.onConfirm()}),d.addEventListener("click",r),m(e,r),e.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),r())}),document.body.appendChild(e),d.focus(),()=>{s===r&&r()}}var y={knight:"Knight",paladin:"Paladin",sorcerer:"Sorcerer",druid:"Druid"},E={knight:"Elite Knight",paladin:"Royal Paladin",sorcerer:"Master Sorcerer",druid:"Elder Druid"},L="Rookie",C={sorcerer:"#f7768e",druid:"#7aa2f7",paladin:"#e0af68",knight:"#9aa5ce"},O="#565f89";function P(t){return t===null?O:C[t]}function T(t,e){return t!==null&&e>=f}function B(t,e){return t?(T(t,e)?E[t]:y[t]).split(" ").map(n=>n[0]).join(""):""}function R(t,e){if(!t)return L;if(!v.includes(t))return t.charAt(0).toUpperCase()+t.slice(1);let c=t;return e>=f?E[c]:y[c]}export{M as a,H as b,V as c,I as d,A as e,D as f,y as g,L as h,P as i,T as j,B as k,R as l};
