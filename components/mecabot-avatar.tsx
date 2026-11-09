'use client';

import {useEffect,useRef,useState} from 'react';
import Script from 'next/script';

export type MecaBotExpression='welcome'|'listening'|'thinking'|'speaking'|'happy'|'puzzled'|'empathy'|'alert';
export type MecaBotSpeech={id:string;text:string;endExpression:MecaBotExpression};
type AvatarElement=HTMLElement&{
  setExpression(value:MecaBotExpression):void;
  animateText(text:string,options:{charactersPerSecond:number;endExpression:MecaBotExpression}):Promise<{cancelled:boolean}>;
  pause():void;
  resume():void;
};

/** Adapte le composant livré au dialogue existant, sans importer son script côté serveur. */
export default function MecaBotAvatar({expression,speech}:{expression:MecaBotExpression;speech:MecaBotSpeech|null}){
 const holder=useRef<HTMLDivElement>(null),avatar=useRef<AvatarElement|null>(null);
 const [scriptReady,setScriptReady]=useState(false),[failed,setFailed]=useState(false),[paused,setPaused]=useState(false);
 useEffect(()=>{
  if(!scriptReady||!holder.current||!window.customElements.get('mecabot-avatar'))return;
  const element=document.createElement('mecabot-avatar') as AvatarElement;
  element.setAttribute('variant','emerald');
  element.setAttribute('theme','dark');
  element.setAttribute('size','166');
  element.setAttribute('label','MécaBot, assistant de diagnostic deux temps');
  holder.current.appendChild(element);avatar.current=element;
  return()=>{avatar.current=null;element.remove()};
 },[scriptReady]);
 useEffect(()=>{avatar.current?.setExpression(expression)},[expression,scriptReady]);
 useEffect(()=>{
  if(!speech||!avatar.current)return;
  void avatar.current.animateText(speech.text,{charactersPerSecond:65,endExpression:speech.endExpression}).catch(()=>avatar.current?.setExpression(speech.endExpression));
 },[speech,scriptReady]);
 function togglePause(){const next=!paused;setPaused(next);if(next)avatar.current?.pause();else avatar.current?.resume()}
 return <div className="mecabot-avatar-panel">
  <Script src="/assets/mecabot/mecabot.js" strategy="afterInteractive" onReady={()=>setScriptReady(true)} onError={()=>setFailed(true)}/>
  <div ref={holder} className="mecabot-avatar-stage" aria-hidden={failed?true:undefined}>{failed?<span>MécaBot</span>:!scriptReady?<span>Chargement de MécaBot…</span>:null}</div>
  <button type="button" onClick={togglePause} disabled={!scriptReady||failed} aria-label={paused?'Reprendre les animations de MécaBot':'Mettre en pause les animations de MécaBot'}>{paused?'Reprendre l’animation':'Mettre en pause'}</button>
 </div>
}
