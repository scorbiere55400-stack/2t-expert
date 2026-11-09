/* MécaBot Étincelle — 2T Expert — v1.0.0
 * Source de comportement. Exécuter tools/build.py pour produire dist/mecabot.js.
 * Aucun service IA, appel réseau, stockage ou microphone dans ce composant.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || window.customElements.get('mecabot-avatar')) return;
  const CSS = "/* MécaBot Étincelle — styles isolés dans le Shadow DOM. */\n:host{display:inline-block;inline-size:var(--mecabot-size,240px);max-inline-size:100%;vertical-align:middle;line-height:normal;color-scheme:light dark}\n:host([theme=\"light\"]){color-scheme:light}:host([theme=\"dark\"]){color-scheme:dark}\n.mecabot-root{--sp-ink:#17313a;--sp-ink:light-dark(#17313a,#e7f1f5);--sp-strength:1;--sp-follow-x:0px;--sp-follow-y:0px;--mecabot-scale:1;position:relative;display:block;width:100%;aspect-ratio:1;isolation:isolate;font:14px/1.5 system-ui;background:transparent}\n.mecabot-root *{box-sizing:border-box}\n.mecabot-stage{position:absolute;inset:0}\n.mecabot-root .sp-avatar{display:block;width:240px;height:228px;position:absolute;left:50%;top:50%;margin:-114px 0 0 -120px;transform:scale(var(--mecabot-scale));transform-origin:50% 50%}\n.mecabot-root .sp-avatar *{position:absolute;display:block}\n.mecabot-root .sp-shadow{position:absolute;left:26%;right:26%;bottom:9%;height:4%;border-radius:50%;background:#203d5928;filter:blur(4px);animation:sp-shadow 4s ease-in-out infinite}\n.mecabot-root [data-kind]{--sp-skin-top:#b9f8de;--sp-skin-mid:#4cbdb0;--sp-skin-low:#207e91;--sp-skin-deep:#234975;--sp-eye-white:#e3fff4;--sp-iris:#276b76;--sp-brow:#b4ffe5;--sp-cheek:#f7b79688;--sp-mouth:#204b62;--sp-ring:#4baab586;--sp-scene-glow:light-dark(#b4e0da80,#22655844);--sp-mouth-light:#f3fff9}\n.mecabot-root [data-kind=flame]{--sp-skin-top:#ffe6a0;--sp-skin-mid:#ffb456;--sp-skin-low:#ed713d;--sp-skin-deep:#b63e42;--sp-eye-white:#fff3c6;--sp-iris:#925443;--sp-brow:#fff1bb;--sp-cheek:#f9553377;--sp-mouth:#794137;--sp-ring:#e69b6666;--sp-scene-glow:light-dark(#ffe0b980,#814b2144);--sp-mouth-light:#fff8dc}\n.mecabot-root [data-kind=plasma]{--sp-skin-top:#d6d4ff;--sp-skin-mid:#9392f7;--sp-skin-low:#6067bf;--sp-skin-deep:#2c4b82;--sp-eye-white:#ddfcff;--sp-iris:#4f578b;--sp-brow:#d2eaff;--sp-cheek:#eaa7e366;--sp-mouth:#383c70;--sp-ring:#9497e888;--sp-scene-glow:light-dark(#d1cffb88,#49497944);--sp-mouth-light:#eafaff}\n.mecabot-root [data-kind=halo]{--sp-skin-top:#ffffff;--sp-skin-mid:#e4f5f5;--sp-skin-low:#8eb9c8;--sp-skin-deep:#3c738f;--sp-eye-white:#befff2;--sp-iris:#327085;--sp-brow:#b6eee8;--sp-cheek:#84cadd55;--sp-mouth:#143548;--sp-ring:#86bcc1aa;--sp-scene-glow:light-dark(#d9eff388,#47778133);--sp-mouth-light:#e6faff}\n.mecabot-root .sp-being{position:absolute;inset:0;transform-origin:50% 70%;animation:sp-float 4s ease-in-out infinite}.mecabot-root .sp-body-group{inset:0;transform-origin:50% 58%;transition:transform .48s cubic-bezier(.22,.8,.35,1)}.mecabot-root .sp-body{left:47px;top:44px;width:146px;height:144px;border-radius:47% 53% 53% 47% / 43% 44% 56% 57%;background:radial-gradient(ellipse at 27% 14%,var(--sp-skin-top) 0,var(--sp-skin-mid) 28%,var(--sp-skin-low) 65%,var(--sp-skin-deep) 100%);box-shadow:inset 4px 5px 10px #f4fff54d,inset -6px -7px 12px #1c426830,0 10px 18px #23485a1f;overflow:hidden;animation:sp-morph 6s ease-in-out infinite}.mecabot-root .sp-body-light{left:17px;top:7px;width:67px;height:29px;border-radius:50%;background:linear-gradient(165deg,#fff9,#fff0);rotate:-27deg;filter:blur(2px)}.mecabot-root .sp-body-shine{right:11px;top:37px;width:13px;height:59px;border-radius:50%;background:linear-gradient(#dffff333,#dffff300);rotate:-11deg}.mecabot-root .sp-face{width:124px;height:94px;left:58px;top:79px;translate:var(--sp-follow-x) var(--sp-follow-y);transition:translate .2s ease}.mecabot-root .sp-eye{width:24px;height:31px;top:21px;background:var(--sp-eye-white);border-radius:48% 48% 44% 44%;box-shadow:0 0 8px color-mix(in srgb,var(--sp-eye-white) 40%,transparent),inset 0 2px 2px #fff4;overflow:hidden;animation:sp-blink 6.1s infinite;transform-origin:center;transition:height .26s,top .26s,width .26s,border-radius .3s,rotate .3s}.mecabot-root .sp-eye-left{left:21px}.mecabot-root .sp-eye-right{right:21px;animation-delay:.035s}.mecabot-root .sp-pupil{left:7px;top:9px;width:12px;height:18px;background:linear-gradient(var(--sp-iris),var(--sp-skin-deep));border-radius:50%;translate:calc(var(--sp-follow-x)*.5) calc(var(--sp-follow-y)*.5);box-shadow:inset -2px -2px 2px #00182f55;transition:translate .22s,scale .25s}.mecabot-root .sp-eye-glint{left:2px;top:2px;width:5px;height:6px;border-radius:50%;background:#fffdf5;box-shadow:4px 8px 0 -1.6px #d7fffa}.mecabot-root .sp-eyebrow{width:26px;height:10px;border-top:4px solid var(--sp-brow);border-radius:70% 70% 0 0;top:6px;filter:drop-shadow(0 1px 1px #28637333);transform-origin:center;transition:transform .4s cubic-bezier(.2,.8,.3,1),top .3s}.mecabot-root .sp-eyebrow-left{left:18px;transform:rotate(-8deg)}.mecabot-root .sp-eyebrow-right{right:18px;transform:rotate(8deg)}.mecabot-root .sp-mouth{left:50%;top:61px;width:28px;height:13px;margin-left:-14px;border:3px solid var(--sp-mouth-light);border-left-color:transparent;border-right-color:transparent;border-top:0;border-radius:0 0 65% 65%;overflow:hidden;transition:width .16s,height .16s,top .16s,margin-left .16s,transform .22s,border-radius .16s,background .16s;transform-origin:50% 50%;box-shadow:0 1px 0 #28536022}.mecabot-root .sp-teeth{left:12%;right:12%;top:0;height:7px;border-radius:0 0 5px 5px;background:#f2fff6;opacity:0}.mecabot-root .sp-tongue{left:24%;right:15%;bottom:-2px;height:11px;background:#ec9a9d;border-radius:70% 70% 0 0;opacity:0}.mecabot-root .sp-blush{top:48px;width:19px;height:8px;border-radius:50%;background:var(--sp-cheek);opacity:.35;filter:blur(2px);transition:opacity .3s}.mecabot-root .sp-blush-left{left:8px}.mecabot-root .sp-blush-right{right:8px}.mecabot-root .sp-dimple{width:4px;height:3px;border-radius:50%;background:var(--sp-mouth-light);top:65px;opacity:.3;transition:opacity .2s}.mecabot-root .sp-dimple-left{left:44px}.mecabot-root .sp-dimple-right{right:44px}.mecabot-root .sp-hand{width:19px;height:42px;top:117px;border-radius:50%;background:linear-gradient(140deg,var(--sp-skin-top),var(--sp-skin-mid) 30%,var(--sp-skin-low));box-shadow:inset 2px 2px 2px #fffffa55;transform-origin:50% 20%;transition:transform .45s cubic-bezier(.2,.9,.35,1),top .35s}.mecabot-root .sp-hand-left{left:22px;transform:rotate(-19deg)}.mecabot-root .sp-hand-right{right:22px;transform:rotate(19deg)}.mecabot-root .sp-tail{width:16px;height:17px;border-radius:25% 25% 65% 65%;left:112px;top:196px;background:linear-gradient(var(--sp-skin-mid),color-mix(in srgb,var(--sp-skin-low) 25%,transparent));animation:sp-tail 4s ease-in-out infinite}.mecabot-root .sp-orbit{left:17px;top:26px;width:206px;height:165px;border:1px solid var(--sp-ring);border-radius:50%;rotate:-27deg;transform:rotateX(23deg);animation:sp-orbit 19s linear infinite;opacity:.65}.mecabot-root .sp-orbit>i{width:8px;height:8px;border-radius:50%;background:var(--sp-skin-mid);left:36px;top:12px;box-shadow:0 0 7px var(--sp-ring)}.mecabot-root .sp-orbit-front{left:22px;top:33px;width:193px;height:148px;rotate:36deg;animation-direction:reverse;border-color:transparent var(--sp-ring) var(--sp-ring) transparent;opacity:.35;pointer-events:none}.mecabot-root .sp-orbit-front>i{width:5px;height:5px;left:144px;top:11px;background:#f2b68e}.mecabot-root .sp-satellite{width:4px;height:4px;border-radius:50%;background:var(--sp-skin-mid);left:28px;top:64px;opacity:.7}.mecabot-root .sp-satellite-two{left:auto;right:26px;top:177px;width:3px;height:3px}.mecabot-root .sp-forehead-light{left:115px;top:63px;width:10px;height:4px;background:#fff9;border-radius:70%;opacity:0}.mecabot-root .sp-thoughts{right:8px;top:61px;display:flex;gap:4px;align-items:center;rotate:-12deg;opacity:0;transition:opacity .2s}.mecabot-root .sp-thoughts>i{position:relative;width:5px;height:5px;border-radius:50%;background:var(--sp-brow);box-shadow:0 0 1px var(--sp-skin-deep);animation:sp-dot 1s infinite}.mecabot-root .sp-thoughts>i:nth-child(2){width:7px;height:7px;animation-delay:.17s}.mecabot-root .sp-thoughts>i:nth-child(3){width:9px;height:9px;animation-delay:.34s}.mecabot-root .sp-question,.mecabot-root .sp-caution{right:18px;top:39px;font:600 27px/1 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:var(--sp-ink);opacity:0;transform:translateY(5px);transition:opacity .3s,transform .3s}.mecabot-root .sp-caution{right:21px;color:light-dark(#ab6524,#efbb7a);font-size:25px}\n.mecabot-root [data-kind=flame] .sp-body{width:140px;height:151px;left:50px;top:40px;border-radius:61% 37% 48% 49% / 57% 55% 45% 43%;animation-name:sp-flame-morph;background:radial-gradient(ellipse at 36% 68%,#ffd284 0,var(--sp-skin-mid) 33%,var(--sp-skin-low) 73%,var(--sp-skin-deep) 100%)}.mecabot-root .sp-flame-tip{opacity:0}.mecabot-root [data-kind=flame] .sp-flame-tip-one{opacity:1;left:89px;top:9px;width:65px;height:97px;border-radius:75% 2% 58% 38%;background:linear-gradient(135deg,#ffeec3 5%,#ffbe69 40%,#f28949);rotate:18deg;transform-origin:50% 95%;animation:sp-flicker 3s ease-in-out infinite}.mecabot-root [data-kind=flame] .sp-flame-tip-two{opacity:1;left:61px;top:51px;width:40px;height:65px;border-radius:85% 4% 20% 55%;rotate:-27deg;background:linear-gradient(#ffce7c,#ec7846);animation:sp-flicker 3.7s ease-in-out infinite reverse}.mecabot-root [data-kind=flame] .sp-face{top:85px}.mecabot-root [data-kind=flame] .sp-orbit{display:none}.mecabot-root [data-kind=flame] .sp-tail{width:24px;left:108px;top:200px;height:9px;border-radius:50%;background:#e97b5033;filter:blur(3px)}.mecabot-root [data-kind=flame] .sp-hand{height:35px;width:19px;top:126px;border-radius:65% 30% 55% 45%}.mecabot-root [data-kind=flame] .sp-eye{border-radius:47% 52% 48% 48%;height:29px}.mecabot-root [data-kind=flame] .sp-satellite{width:5px;height:10px;border-radius:70% 20% 65% 30%;rotate:24deg;animation:sp-ember 3s ease-in-out infinite}.mecabot-root [data-kind=flame] .sp-satellite-two{top:75px;right:34px;animation-delay:-1.6s}\n.mecabot-root [data-kind=plasma] .sp-body{width:140px;height:157px;left:50px;top:33px;border-radius:48% 48% 48% 48% / 39% 42% 63% 62%;box-shadow:inset 0 0 4px #cbe5ffa6,inset -5px -9px 18px #25366b44,0 0 16px #838ee62e;animation:sp-plasma-morph 7s ease-in-out infinite;background:radial-gradient(ellipse at 23% 14%,#e6eaff 0,var(--sp-skin-mid) 25%,#747fc1 62%,#314b7c 100%)}.mecabot-root [data-kind=plasma] .sp-body-light{left:12px;top:4px;width:51px;height:32px;rotate:-42deg}.mecabot-root [data-kind=plasma] .sp-body-shine{height:100px;width:19px;top:21px;right:7px;background:linear-gradient(#b8daff77,#a6d7ff00)}.mecabot-root [data-kind=plasma] .sp-face{top:76px}.mecabot-root [data-kind=plasma] .sp-eye{width:22px;height:33px}.mecabot-root [data-kind=plasma] .sp-eye-left{left:24px}.mecabot-root [data-kind=plasma] .sp-eye-right{right:24px}.mecabot-root [data-kind=plasma] .sp-orbit-back{top:38px;height:145px;width:220px;left:10px;transform:rotateX(48deg);border:2px solid #a4b0fa88;animation-duration:16s}.mecabot-root [data-kind=plasma] .sp-orbit-front{top:21px;width:163px;left:36px;height:195px;rotate:35deg;transform:rotateX(0deg);border:1px solid #9bbceb77;opacity:.65}.mecabot-root [data-kind=plasma] .sp-hand{height:36px;top:130px;border-radius:60%;width:14px;opacity:.8}.mecabot-root [data-kind=plasma] .sp-tail{width:11px;height:21px;left:114px;top:196px;border-radius:40% 40% 65% 65%;opacity:.6}.mecabot-root [data-kind=plasma] .sp-forehead-light{opacity:.7;width:5px;height:5px;left:117px;top:51px;box-shadow:0 0 8px #d0e7ff}\n.mecabot-root [data-kind=halo] .sp-body{top:49px;left:44px;width:152px;height:139px;border-radius:48% 48% 43% 43%;background:radial-gradient(ellipse at 32% 10%,#fff 0,#e4f3f5 31%,#9dc9d3 68%,#4e869d 100%);box-shadow:inset 4px 4px 7px #fff8,inset -4px -4px 7px #355e7933,0 8px 18px #1b435c1a;animation-name:sp-halo-morph}.mecabot-root [data-kind=halo] .sp-face-panel{left:14px;top:35px;width:124px;height:75px;background:linear-gradient(150deg,#294f60,#102d40);border-radius:34px 34px 32px 32px;box-shadow:inset 0 1px 2px #6e9ba7,inset 0 -1px 7px #051c3199;border:2px solid #6fadb955}.mecabot-root [data-kind=halo] .sp-face{top:86px}.mecabot-root [data-kind=halo] .sp-eye{width:23px;height:25px;top:18px;box-shadow:0 0 9px #b4fff333}.mecabot-root [data-kind=halo] .sp-pupil{height:13px;top:8px;width:11px}.mecabot-root [data-kind=halo] .sp-eyebrow{top:5px;height:6px;width:23px;border-top-width:3px}.mecabot-root [data-kind=halo] .sp-mouth{top:49px;height:10px;width:23px;margin-left:-11px;border-bottom-width:2px}.mecabot-root [data-kind=halo] .sp-blush{top:44px;width:12px;height:4px}.mecabot-root [data-kind=halo] .sp-dimple{display:none}.mecabot-root [data-kind=halo] .sp-forehead-light{opacity:1;top:65px;width:13px;height:4px;left:113px;background:#5e9ea7;box-shadow:0 0 4px #89ddd4}.mecabot-root [data-kind=halo] .sp-hand{top:123px;width:18px;height:26px;background:radial-gradient(ellipse at 30% 10%,#f2ffff,#85bbc5);border-radius:50%}.mecabot-root [data-kind=halo] .sp-orbit-back{width:85px;height:24px;left:77px;top:22px;transform:none;rotate:-8deg;border:3px solid #70bbc5;animation:sp-halo-hover 4s ease-in-out infinite;box-shadow:0 0 5px #a6e9e84d;opacity:.8}.mecabot-root [data-kind=halo] .sp-orbit-back>i{width:5px;height:5px;left:55px;top:-4px;background:#eafffd}.mecabot-root [data-kind=halo] .sp-orbit-front{display:none}.mecabot-root [data-kind=halo] .sp-tail{top:194px;height:9px;width:31px;left:105px;border-radius:50%;background:#75acbc44;filter:blur(2px)}\n.mecabot-root[data-emotion=listening] .sp-body-group{transform:rotate(calc(-5deg*var(--sp-strength)))}.mecabot-root[data-emotion=listening] .sp-eyebrow-left{transform:translateY(-6px) rotate(-15deg)}.mecabot-root[data-emotion=listening] .sp-eyebrow-right{transform:translateY(-3px) rotate(9deg)}.mecabot-root[data-emotion=listening] .sp-eye{height:35px;top:17px}.mecabot-root[data-emotion=listening] .sp-pupil{scale:1.08}.mecabot-root[data-emotion=listening] .sp-hand-left{transform:translateY(-8px) rotate(-60deg)}.mecabot-root[data-emotion=listening] .sp-hand-right{transform:rotate(35deg)}.mecabot-root[data-emotion=listening] .sp-mouth{width:19px;margin-left:-9px;height:10px}.mecabot-root[data-emotion=listening] [data-kind=halo] .sp-eye{height:29px;top:15px}\n.mecabot-root[data-emotion=thinking] .sp-body-group{transform:rotate(calc(6deg*var(--sp-strength)))}.mecabot-root[data-emotion=thinking] .sp-eye{height:18px;top:25px;border-radius:35% 35% 42% 42%;animation:sp-think-look 2.7s ease-in-out infinite}.mecabot-root[data-emotion=thinking] .sp-pupil{top:0;translate:4px -3px}.mecabot-root[data-emotion=thinking] .sp-eyebrow-left{transform:translateY(6px) rotate(9deg)}.mecabot-root[data-emotion=thinking] .sp-eyebrow-right{transform:translateY(-1px) rotate(-8deg)}.mecabot-root[data-emotion=thinking] .sp-mouth{width:14px;margin-left:0;height:5px;top:66px;transform:rotate(-10deg);border-bottom-width:3px;border-radius:0 0 80% 20%}.mecabot-root[data-emotion=thinking] .sp-hand-right{transform:translate(-20px,-9px) rotate(-73deg)}.mecabot-root[data-emotion=thinking] .sp-orbit-back{animation-duration:6s}.mecabot-root[data-emotion=thinking] .sp-thoughts{opacity:1}.mecabot-root[data-emotion=thinking] [data-kind=halo] .sp-eye{height:13px;top:23px}.mecabot-root[data-emotion=thinking] [data-kind=halo] .sp-mouth{top:52px}.mecabot-root[data-emotion=thinking] .sp-signal-dot{animation:sp-dot 1s ease-in-out infinite}\n.mecabot-root[data-emotion=speaking] .sp-body-group{animation:sp-nod 1.8s ease-in-out infinite}.mecabot-root[data-emotion=speaking] .sp-hand-right{animation:sp-gesture 2s ease-in-out infinite}.mecabot-root[data-emotion=speaking] .sp-eyebrow-left{animation:sp-speaking-brow 3s ease-in-out infinite}.mecabot-root[data-emotion=speaking] .sp-mouth{background:var(--sp-mouth);border:0;width:26px;margin-left:-13px;height:15px;border-radius:42% 42% 55% 55%;top:59px;box-shadow:inset 0 2px 3px #15243844;transition:width .12s,height .12s,margin-left .12s,border-radius .12s,top .12s}.mecabot-root[data-emotion=speaking] .sp-teeth{opacity:1}.mecabot-root[data-emotion=speaking] .sp-tongue{opacity:.8}.mecabot-root[data-emotion=speaking][data-viseme=aa] .sp-mouth{width:24px;margin-left:-12px;height:24px;border-radius:45% 45% 48% 48%;top:57px}.mecabot-root[data-emotion=speaking][data-viseme=ee] .sp-mouth{width:35px;margin-left:-17px;height:12px;top:61px;border-radius:30% 30% 55% 55%}.mecabot-root[data-emotion=speaking][data-viseme=oo] .sp-mouth{width:17px;margin-left:-8px;height:23px;top:58px;border-radius:50%}.mecabot-root[data-emotion=speaking][data-viseme=oo] .sp-teeth{opacity:0}.mecabot-root[data-emotion=speaking][data-viseme=mm] .sp-mouth{width:25px;margin-left:-12px;height:4px;top:65px;border-radius:50%;background:var(--sp-mouth-light)}.mecabot-root[data-emotion=speaking][data-viseme=rest] .sp-mouth{height:7px;width:20px;margin-left:-10px;top:63px;border-radius:0 0 55% 55%}.mecabot-root[data-emotion=speaking][data-viseme=rest] .sp-teeth,.mecabot-root[data-emotion=speaking][data-viseme=rest] .sp-tongue,.mecabot-root[data-emotion=speaking][data-viseme=mm] .sp-teeth,.mecabot-root[data-emotion=speaking][data-viseme=mm] .sp-tongue{opacity:0}.mecabot-root[data-emotion=speaking] [data-kind=halo] .sp-mouth{translate:0 -11px}\n.mecabot-root[data-emotion=happy] .sp-being{animation:sp-happy-bounce 1.5s ease-in-out infinite}.mecabot-root[data-emotion=happy] .sp-eye{height:13px;top:26px;background:transparent;border-top:5px solid var(--sp-eye-white);border-radius:60% 60% 0 0;box-shadow:none;animation:none;overflow:visible}.mecabot-root[data-emotion=happy] .sp-pupil{opacity:0}.mecabot-root[data-emotion=happy] .sp-eyebrow-left{transform:translateY(-5px) rotate(-12deg)}.mecabot-root[data-emotion=happy] .sp-eyebrow-right{transform:translateY(-5px) rotate(12deg)}.mecabot-root[data-emotion=happy] .sp-mouth{top:54px;width:38px;height:25px;margin-left:-19px;border:0;border-radius:20% 20% 60% 60%;background:var(--sp-mouth)}.mecabot-root[data-emotion=happy] .sp-teeth,.mecabot-root[data-emotion=happy] .sp-tongue{opacity:1}.mecabot-root[data-emotion=happy] .sp-blush{opacity:1;scale:1.1}.mecabot-root[data-emotion=happy] .sp-hand-left{transform:translateY(-9px) rotate(-100deg)}.mecabot-root[data-emotion=happy] .sp-hand-right{transform:translateY(-9px) rotate(100deg)}.mecabot-root[data-emotion=happy] [data-kind=halo] .sp-mouth{top:44px;height:18px;width:31px;margin-left:-15px}.mecabot-root[data-emotion=happy] [data-kind=halo] .sp-eye{top:24px;height:11px;border-top-width:4px}\n.mecabot-root[data-emotion=puzzled] .sp-body-group{transform:rotate(calc(-10deg*var(--sp-strength)))}.mecabot-root[data-emotion=puzzled] .sp-eyebrow-left{transform:translateY(-9px) rotate(-14deg)}.mecabot-root[data-emotion=puzzled] .sp-eyebrow-right{transform:translateY(7px) rotate(-9deg)}.mecabot-root[data-emotion=puzzled] .sp-eye-left{height:34px;top:16px}.mecabot-root[data-emotion=puzzled] .sp-eye-right{height:19px;top:28px}.mecabot-root[data-emotion=puzzled] .sp-eye-right .sp-pupil{top:3px;scale:.88}.mecabot-root[data-emotion=puzzled] .sp-mouth{height:7px;width:16px;margin-left:-1px;top:63px;rotate:-15deg;border-radius:0;border-bottom-width:3px}.mecabot-root[data-emotion=puzzled] .sp-question{opacity:.85;transform:rotate(12deg)}.mecabot-root[data-emotion=puzzled] .sp-hand-right{transform:translate(6px,-5px) rotate(90deg)}.mecabot-root[data-emotion=puzzled] [data-kind=halo] .sp-eye-left{height:29px;top:14px}.mecabot-root[data-emotion=puzzled] [data-kind=halo] .sp-eye-right{height:17px;top:24px}.mecabot-root[data-emotion=puzzled] [data-kind=halo] .sp-mouth{top:51px}\n.mecabot-root[data-emotion=empathy] .sp-being{animation-duration:6s}.mecabot-root[data-emotion=empathy] .sp-body-group{transform:rotate(calc(5deg*var(--sp-strength)))}.mecabot-root[data-emotion=empathy] .sp-eye{height:24px;top:24px;border-radius:50%}.mecabot-root[data-emotion=empathy] .sp-pupil{scale:1.08;top:6px}.mecabot-root[data-emotion=empathy] .sp-eyebrow-left{transform:translateY(2px) rotate(-19deg)}.mecabot-root[data-emotion=empathy] .sp-eyebrow-right{transform:translateY(2px) rotate(19deg)}.mecabot-root[data-emotion=empathy] .sp-mouth{width:24px;height:9px;top:61px;margin-left:-12px;border-bottom-width:2px;transform:rotate(-4deg)}.mecabot-root[data-emotion=empathy] .sp-hand-left{transform:translate(13px,-5px) rotate(-42deg)}.mecabot-root[data-emotion=empathy] .sp-hand-right{transform:translate(-13px,-5px) rotate(42deg)}.mecabot-root[data-emotion=empathy] .sp-blush{opacity:.6}.mecabot-root[data-emotion=empathy] [data-kind=halo] .sp-eye{height:20px;top:21px}.mecabot-root[data-emotion=empathy] [data-kind=halo] .sp-mouth{top:51px}\n.mecabot-root[data-emotion=alert] .sp-being,.mecabot-root[data-emotion=alert] .sp-body,.mecabot-root[data-emotion=alert] .sp-orbit,.mecabot-root[data-emotion=alert] .sp-flame-tip,.mecabot-root[data-emotion=alert] .sp-satellite,.mecabot-root[data-emotion=alert] .sp-tail{animation-play-state:paused}.mecabot-root[data-emotion=alert] .sp-eyebrow-left{transform:translateY(5px) rotate(-13deg)}.mecabot-root[data-emotion=alert] .sp-eyebrow-right{transform:translateY(5px) rotate(13deg)}.mecabot-root[data-emotion=alert] .sp-eye{height:26px;top:23px}.mecabot-root[data-emotion=alert] .sp-pupil{scale:.85}.mecabot-root[data-emotion=alert] .sp-mouth{width:17px;margin-left:-8px;height:6px;top:66px;background:var(--sp-mouth-light);border:0;border-radius:70% 70% 40% 40%}.mecabot-root[data-emotion=alert] .sp-hand-right{transform:translateY(-23px) rotate(80deg)}.mecabot-root[data-emotion=alert] .sp-caution{opacity:1;transform:translateY(0)}.mecabot-root[data-emotion=alert] .sp-signal-dot{background:#d79b51}.mecabot-root[data-emotion=alert] .sp-blush{opacity:0}.mecabot-root[data-emotion=alert] [data-kind=halo] .sp-eye{height:22px;top:19px}.mecabot-root[data-emotion=alert] [data-kind=halo] .sp-mouth{top:54px}\n.mecabot-root.sp-paused *,.mecabot-root.sp-reduced *{animation-play-state:paused!important;transition:none!important}.mecabot-root.sp-paused .sp-face,.mecabot-root.sp-paused .sp-pupil,.mecabot-root.sp-reduced .sp-face,.mecabot-root.sp-reduced .sp-pupil{translate:0 0!important}\n@keyframes sp-float{0%,100%{translate:0 2px}50%{translate:0 calc(-6px*var(--sp-strength))}}@keyframes sp-shadow{0%,100%{scale:1 1;opacity:.8}50%{scale:.85 1;opacity:.5}}@keyframes sp-morph{0%,100%{border-radius:47% 53% 53% 47% / 43% 44% 56% 57%}50%{border-radius:51% 49% 47% 53% / 47% 45% 55% 53%}}@keyframes sp-flame-morph{0%,100%{border-radius:61% 37% 48% 49% / 57% 55% 45% 43%}50%{border-radius:49% 51% 45% 55% / 59% 57% 43% 41%}}@keyframes sp-plasma-morph{0%,100%{border-radius:48% 48% 48% 48% / 39% 42% 63% 62%}50%{border-radius:45% 55% 52% 48% / 48% 43% 57% 52%}}@keyframes sp-halo-morph{0%,100%{border-radius:48% 48% 43% 43%}50%{border-radius:46% 50% 46% 47%}}@keyframes sp-blink{0%,43%,46%,100%{scale:1 1}44.5%{scale:1 .07}}@keyframes sp-tail{0%,100%{scale:1 1;opacity:.85}50%{scale:.8 1.13;opacity:.45}}@keyframes sp-orbit{from{rotate:-27deg}to{rotate:333deg}}@keyframes sp-flicker{0%,100%{scale:1 1;rotate:14deg}50%{scale:.94 1.07;rotate:23deg}}@keyframes sp-ember{0%,100%{translate:0 3px;opacity:.4}50%{translate:2px -6px;opacity:.8}}@keyframes sp-halo-hover{0%,100%{translate:0 0;rotate:-8deg}50%{translate:0 -4px;rotate:7deg}}@keyframes sp-think-look{0%,100%{translate:0 0}45%,60%{translate:3px -2px}}@keyframes sp-nod{0%,100%{rotate:0deg}40%{rotate:calc(-3deg*var(--sp-strength))}70%{rotate:calc(2deg*var(--sp-strength))}}@keyframes sp-gesture{0%,100%{transform:translateY(-3px) rotate(32deg)}45%{transform:translateY(-11px) rotate(68deg)}}@keyframes sp-speaking-brow{0%,100%{transform:translateY(-1px) rotate(-8deg)}40%{transform:translateY(-6px) rotate(-12deg)}70%{transform:translateY(-3px) rotate(-5deg)}}@keyframes sp-happy-bounce{0%,100%{translate:0 0;rotate:-2deg}40%{translate:0 calc(-9px*var(--sp-strength));rotate:2deg}70%{translate:0 -2px;rotate:0deg}}@keyframes sp-dot{0%,75%,100%{translate:0 0;opacity:.4}35%{translate:0 -3px;opacity:1}}\n\n@media(prefers-reduced-motion:reduce){.mecabot-root *{animation:none!important;transition:none!important}.mecabot-root .sp-face,.mecabot-root .sp-pupil{translate:0 0!important}}\n";
  const ART = "<div class=\"mecabot-root\" data-emotion=\"welcome\" data-viseme=\"rest\" part=\"artwork\" aria-hidden=\"true\"><div class=\"sp-shadow\"></div><div class=\"mecabot-stage\" data-kind=\"emerald\"><div class=\"sp-avatar\"><span class=\"sp-being\"><span class=\"sp-orbit sp-orbit-back\"><i></i></span><span class=\"sp-tail\"></span><span class=\"sp-hand sp-hand-left\"></span><span class=\"sp-hand sp-hand-right\"></span><span class=\"sp-body-group\"><span class=\"sp-flame-tip sp-flame-tip-one\"></span><span class=\"sp-flame-tip sp-flame-tip-two\"></span><span class=\"sp-body\"><span class=\"sp-body-light\"></span><span class=\"sp-body-shine\"></span><span class=\"sp-face-panel\"></span></span><span class=\"sp-face\"><span class=\"sp-eyebrow sp-eyebrow-left\"></span><span class=\"sp-eyebrow sp-eyebrow-right\"></span><span class=\"sp-eye sp-eye-left\"><span class=\"sp-pupil\"><span class=\"sp-eye-glint\"></span></span></span><span class=\"sp-eye sp-eye-right\"><span class=\"sp-pupil\"><span class=\"sp-eye-glint\"></span></span></span><span class=\"sp-blush sp-blush-left\"></span><span class=\"sp-blush sp-blush-right\"></span><span class=\"sp-mouth\"><span class=\"sp-teeth\"></span><span class=\"sp-tongue\"></span></span><span class=\"sp-dimple sp-dimple-left\"></span><span class=\"sp-dimple sp-dimple-right\"></span></span><span class=\"sp-forehead-light\"></span></span><span class=\"sp-orbit sp-orbit-front\"><i></i></span><span class=\"sp-satellite sp-satellite-one\"></span><span class=\"sp-satellite sp-satellite-two\"></span><span class=\"sp-thoughts\"><i></i><i></i><i></i></span><span class=\"sp-question\">?</span><span class=\"sp-caution\">!</span></span></div></div></div>\n";
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
