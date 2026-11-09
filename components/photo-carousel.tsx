'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import photos from '@/data/photos.json';

export default function PhotoCarousel(){
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hover,setHover]=useState(false);
  const [failed,setFailed]=useState<string[]>([]);
  useEffect(()=>{
    if(paused||hover||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>setIndex(i=>(i+1)%photos.length),6500);
    return()=>window.clearInterval(timer);
  },[paused,hover]);
  const p=photos[index];
  const move=(step:number)=>setIndex(i=>(i+step+photos.length)%photos.length);
  return <section className="photo-carousel" aria-label="Les univers du deux temps" aria-roledescription="carrousel" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setHover(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false)}}>
    {!failed.includes(p.src)&&<Image key={p.src} unoptimized src={p.src} alt={p.alt} width={1400} height={900} priority={index===0} onError={()=>{setFailed(items=>[...items,p.src]);move(1)}}/>}
    <div className="photo-navigation">
      <div className="photo-categories" aria-label="Choisir une illustration">{photos.map((item,i)=><button key={`${item.category}-${i}`} aria-label={`Voir ${item.subject}`} aria-current={i===index?'true':undefined} onClick={()=>setIndex(i)}><span className="photo-progress"/></button>)}</div>
      <div className="photo-controls"><button aria-label="Illustration précédente" onClick={()=>move(-1)}>←</button><span className="sr-only" aria-live="polite">Illustration {index+1} sur {photos.length} : {p.subject}</span><button aria-label="Illustration suivante" onClick={()=>move(1)}>→</button><button aria-label={paused?'Relancer le défilement':'Mettre le défilement en pause'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button></div>
    </div>
  </section>;
}
