/* MécaBot Étincelle — 2T Expert — v1.0.0
 * Source de comportement. Exécuter tools/build.py pour produire dist/mecabot.js.
 * Aucun service IA, appel réseau, stockage ou microphone dans ce composant.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || window.customElements.get('mecabot-avatar')) return;
  const CSS = /*__MECABOT_CSS__*/ '';
  const ART = /*__MECABOT_ART__*/ '';
  const EXPRESSIONS = Object.freeze(['welcome', 'listening', 'thinking', 'speaking', 'happy', 'puzzled', 'empathy', 'alert']);
  const VARIANTS = Object.freeze(['emerald', 'flame', 'plasma', 'halo']);
  const VISEMES = Object.freeze(['rest', 'aa', 'ee', 'oo', 'mm']);
  const LABELS = {welcome:'accueil',listening:'à l’écoute',thinking:'réflexion',speaking:'réponse',happy:'joie',puzzled:'demande de précision',empathy:'réconfort',alert:'vigilance'};
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function mouthFor(text) {
    const t = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (/[ou]/.test(t)) return 'oo';
    if (/a/.test(t)) return 'aa';
    if (/[ei]/.test(t)) return 'ee';
    if (/[mbp]/.test(t)) return 'mm';
    return 'rest';
  }
  function requireValue(value, choices, name) {
    if (!choices.includes(value)) throw new RangeError(name + ' : valeurs acceptées : ' + choices.join(', '));
    return value;
  }
  class MecaBotAvatar extends HTMLElement {
    static get observedAttributes() { return ['expression', 'variant', 'size', 'paused', 'reduced-motion', 'theme', 'label', 'nonce']; }
    static get version() { return '1.0.0'; }
    static get expressions() { return EXPRESSIONS.slice(); }
    static get variants() { return VARIANTS.slice(); }
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this._style = document.createElement('style');
      const nonce = this.nonce || this.getAttribute('nonce');
      if (nonce) this._style.setAttribute('nonce', nonce);
      this._style.textContent = CSS;
      const template = document.createElement('template');
      template.innerHTML = ART; // Markup statique livré dans le paquet ; aucune donnée utilisateur.
      this.shadowRoot.append(this._style, template.content.cloneNode(true));
      this._root = this.shadowRoot.querySelector('.mecabot-root');
      this._stage = this.shadowRoot.querySelector('.mecabot-stage');
      this._media = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._connected = false;
      this._visible = true;
      this._textJob = null;
      this._mouthTimer = null;
      this._internalChange = false;
      this._lastState = '';
      this._onMotion = () => this._apply();
      this._onVisibility = () => this._syncMotion();
      this._onResize = () => this._resize();
      this._onPointer = e => {
        if (!this._motionAllowed()) return;
        const r = this.getBoundingClientRect();
        if (!r.width || !r.height) return;
        this._root.style.setProperty('--sp-follow-x', String(clamp((e.clientX-r.left)/r.width-.5,-.5,.5)*7)+'px');
        this._root.style.setProperty('--sp-follow-y', String(clamp((e.clientY-r.top)/r.height-.5,-.5,.5)*4)+'px');
      };
      this._onLeave = () => {
        this._root.style.setProperty('--sp-follow-x', '0px');
        this._root.style.setProperty('--sp-follow-y', '0px');
      };
    }
    connectedCallback() {
      if (this._connected) return;
      this._connected = true;
      for (const name of ['expression','variant']) {
        if (Object.prototype.hasOwnProperty.call(this,name)) { const value=this[name];delete this[name];this[name]=value; }
      }
      if (!this.hasAttribute('role')) this.setAttribute('role','img');
      this.addEventListener('pointermove',this._onPointer);
      this.addEventListener('pointerleave',this._onLeave);
      document.addEventListener('visibilitychange',this._onVisibility);
      if (this._media.addEventListener) this._media.addEventListener('change',this._onMotion);
      else this._media.addListener(this._onMotion);
      if (window.ResizeObserver) {
        this._resizeObserver = new window.ResizeObserver(this._onResize);
        this._resizeObserver.observe(this);
      } else window.addEventListener('resize',this._onResize);
      if (window.IntersectionObserver) {
        this._intersectionObserver = new window.IntersectionObserver(entries => {
          this._visible = entries.some(e=>e.isIntersecting);
          this._syncMotion();
        });
        this._intersectionObserver.observe(this);
      }
      this._apply();
    }
    disconnectedCallback() {
      this._connected = false;
      this._stopText(true);
      this.removeEventListener('pointermove',this._onPointer);
      this.removeEventListener('pointerleave',this._onLeave);
      document.removeEventListener('visibilitychange',this._onVisibility);
      if (this._media.removeEventListener) this._media.removeEventListener('change',this._onMotion);
      else this._media.removeListener(this._onMotion);
      window.removeEventListener('resize',this._onResize);
      this._resizeObserver?.disconnect();
      this._intersectionObserver?.disconnect();
      this._root.classList.add('sp-paused');
    }
    attributeChangedCallback(name, previous, next) {
      if (previous === next || !this._root) return;
      if (name === 'expression' && !this._internalChange) this._stopText(true);
      if (name === 'nonce') {
        if (next) this._style.setAttribute('nonce',this.nonce||next);
        else this._style.removeAttribute('nonce');
      }
      this._apply();
    }
    get expression() { const v=this.getAttribute('expression');return EXPRESSIONS.includes(v)?v:'welcome'; }
    set expression(value) { this.setExpression(value); }
    get variant() { const v=this.getAttribute('variant');return VARIANTS.includes(v)?v:'emerald'; }
    set variant(value) { this.setVariant(value); }
    get paused() { return this.hasAttribute('paused'); }
    get reducedMotion() { return this.hasAttribute('reduced-motion') || this._media.matches; }
    getState() {
      return {expression:this.expression,variant:this.variant,paused:this.paused,reducedMotion:this.reducedMotion,animatingText:!!this._textJob,connected:this._connected};
    }
    _setExpression(value) {
      this._internalChange = true;
      try { this.setAttribute('expression',value); } finally { this._internalChange=false; }
      this._root.dataset.viseme = 'rest';
    }
    setExpression(value) {
      requireValue(value,EXPRESSIONS,'Expression');
      this._stopText(true);
      this._setExpression(value);
    }
    setVariant(value) { this.setAttribute('variant',requireValue(value,VARIANTS,'Version')); }
    pause() { this.setAttribute('paused',''); }
    resume() { this.removeAttribute('paused'); }
    _apply() {
      this._root.dataset.emotion = this.expression;
      this._stage.dataset.kind = this.variant;
      const parsed = Number(this.getAttribute('size') || 240);
      const size = Number.isFinite(parsed) ? clamp(parsed,64,640) : 240;
      this.style.setProperty('--mecabot-size',size+'px');
      this.setAttribute('aria-label',(this.getAttribute('label')||'MécaBot')+' — '+LABELS[this.expression]);
      this._resize();
      this._syncMotion();
      const state = this.getState();
      const signature = JSON.stringify([state.expression,state.variant,state.paused,state.reducedMotion]);
      if (this._connected && signature !== this._lastState) {
        this._lastState=signature;
        this.dispatchEvent(new CustomEvent('mecabot:statechange',{bubbles:true,composed:true,detail:state}));
      }
    }
    _resize() {
      const measured=this.getBoundingClientRect().width;
      const requested=Number(this.getAttribute('size')||240);
      const width=measured||clamp(Number.isFinite(requested)?requested:240,64,640);
      this._root.style.setProperty('--mecabot-scale',String(width/240));
    }
    _motionAllowed() { return this._connected && this._visible && !document.hidden && !this.paused && !this.reducedMotion; }
    _syncMotion() {
      this._root.classList.toggle('sp-reduced',this.reducedMotion);
      this._root.classList.toggle('sp-paused',!this._motionAllowed());
      clearTimeout(this._mouthTimer);
      this._mouthTimer=null;
      if (!this._motionAllowed()) { this._root.dataset.viseme='rest';this._onLeave(); }
      else if (this._textJob) this._tickMouth();
    }
    setViseme(value) {
      requireValue(value,VISEMES,'Forme de bouche');
      this._root.dataset.viseme=this._motionAllowed()?value:'rest';
    }
    setAudioLevel(value) {
      if (typeof value!=='number'||!Number.isFinite(value)) throw new TypeError('Le niveau audio doit être un nombre fini entre 0 et 1.');
      const v=clamp(value,0,1);
      this.setViseme(v<.08?'rest':v<.35?'ee':v<.7?'oo':'aa');
    }
    animateText(text, options = {}) {
      if (!this._connected) return Promise.reject(new Error('Ajouter MécaBot au document avant animateText().'));
      if (typeof text!=='string') throw new TypeError('Le texte doit être une chaîne.');
      const endExpression=requireValue(options.endExpression||'welcome',EXPRESSIONS,'Expression finale');
      if (options.charactersPerSecond!=null && (typeof options.charactersPerSecond!=='number'||!Number.isFinite(options.charactersPerSecond)||options.charactersPerSecond<=0)) throw new RangeError('charactersPerSecond doit être positif.');
      if (options.durationMs!=null && (typeof options.durationMs!=='number'||!Number.isFinite(options.durationMs)||options.durationMs<0)) throw new RangeError('durationMs doit être un nombre positif ou nul.');
      this._stopText(true);
      if (!text.trim()) { this._setExpression(endExpression);return Promise.resolve({cancelled:false}); }
      const duration=clamp(options.durationMs??text.length/(options.charactersPerSecond||24)*1000,200,120000);
      this._setExpression('speaking');
      return new Promise(resolve => {
        const job={text,duration,endExpression,resolve,start:performance.now(),endTimer:null};
        this._textJob=job;
        job.endTimer=setTimeout(()=>{
          if(this._textJob!==job)return;
          this._stopText(false);
          this._setExpression(endExpression);
        },duration);
        this._tickMouth();
      });
    }
    _tickMouth() {
      clearTimeout(this._mouthTimer);this._mouthTimer=null;
      const job=this._textJob;
      if(!job||!this._motionAllowed())return;
      const ratio=clamp((performance.now()-job.start)/job.duration,0,1);
      const index=Math.min(job.text.length-1,Math.floor(ratio*job.text.length));
      this.setViseme(mouthFor(job.text.slice(index,index+2)));
      this._mouthTimer=setTimeout(()=>this._tickMouth(),110);
    }
    _stopText(cancelled) {
      clearTimeout(this._mouthTimer);this._mouthTimer=null;
      const job=this._textJob;
      this._textJob=null;
      if(job){clearTimeout(job.endTimer);job.resolve({cancelled});}
      if(this._root)this._root.dataset.viseme='rest';
    }
    cancelSpeech(endExpression = 'welcome') {
      requireValue(endExpression,EXPRESSIONS,'Expression finale');
      this._stopText(true);this._setExpression(endExpression);
    }
  }
  window.customElements.define('mecabot-avatar',MecaBotAvatar);
})();
