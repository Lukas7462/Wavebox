import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api.js";

function getCG(id){const h1=(parseInt(id,36)*137)%360,h2=(h1+40+(parseInt(id,36)*53)%80)%360;return`linear-gradient(135deg,hsl(${h1},70%,35%),hsl(${h2},60%,20%))`}
function getCI(g){return{Synthwave:"◈",Chillout:"☀",Ambient:"◎",Electronic:"⚡",Rock:"♦",Pop:"★",Jazz:"♪",Classical:"♫","Hip-Hop":"◆"}[g]||"♬"}
function fmtTime(s){if(!s||isNaN(s))return"0:00";return`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`}
function fmtTimeFull(s){if(!s||isNaN(s))return"00:00.0";const m=Math.floor(s/60),sec=Math.floor(s%60),ms=Math.floor((s%1)*10);return`${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}.${ms}`}

function Cover({track,size=48}){
  if(track.coverUrl)return<div style={{width:size,height:size,minWidth:size,borderRadius:size>100?8:6,backgroundImage:`url(${track.coverUrl})`,backgroundSize:"cover",backgroundPosition:"center",boxShadow:size>100?"0 8px 32px rgba(0,0,0,0.5)":"0 2px 8px rgba(0,0,0,0.3)"}}/>;
  return<div style={{width:size,height:size,minWidth:size,borderRadius:size>100?8:6,background:getCG(track.id),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,color:"rgba(255,255,255,0.7)",fontWeight:"bold",boxShadow:size>100?"0 8px 32px rgba(0,0,0,0.5)":"0 2px 8px rgba(0,0,0,0.3)"}}>{getCI(track.genre)}</div>
}

function ArtistAvatar({name,artistData,size=32,onClick}){
  const ad=artistData?.find(a=>a.name===name);
  const hasImg=ad?.imageUrl;
  const s={width:size,height:size,minWidth:size,borderRadius:"50%",cursor:onClick?"pointer":"default",transition:"transform 0.2s, box-shadow 0.2s"};
  if(hasImg)return<div onClick={onClick} style={{...s,backgroundImage:`url(${ad.imageUrl})`,backgroundSize:"cover",backgroundPosition:"center",boxShadow:size>60?"0 4px 20px rgba(0,0,0,0.5)":"0 2px 8px rgba(0,0,0,0.3)"}} onMouseEnter={e=>{if(onClick)e.currentTarget.style.transform="scale(1.05)"}} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>;
  return<div onClick={onClick} style={{...s,background:`linear-gradient(135deg,hsl(${(name.charCodeAt(0)*37)%360},60%,40%),hsl(${(name.charCodeAt(0)*137)%360},50%,25%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,fontWeight:700,color:"rgba(255,255,255,0.8)"}} onMouseEnter={e=>{if(onClick)e.currentTarget.style.transform="scale(1.05)"}} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{name[0]}</div>
}

function ArtistDetail({name,artistData,tracks,cur,playing,onPlay,likes,onLike,onClose,onRefresh,isAdmin,buffering}){
  const ad=artistData?.find(a=>a.name===name)||{};
  const artistTracks=tracks.filter(t=>t.artist===name);
  const[uploading,setUploading]=useState(false);
  const[bio,setBio]=useState(ad.bio||'');
  const[editBio,setEditBio]=useState(false);
  const[saving,setSaving]=useState(false);

  const uploadImage=()=>{
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);try{await api.uploadArtistImage(name,f);onRefresh()}catch(err){alert(err.message)}finally{setUploading(false)}};
    inp.click();
  };

  const removeImage=async()=>{try{await api.deleteArtistImage(name);onRefresh()}catch(err){alert(err.message)}};

  const saveBio=async()=>{setSaving(true);try{await api.updateArtist(name,{bio});setEditBio(false);onRefresh()}catch(err){alert(err.message)}finally{setSaving(false)}};

  const totalDur=artistTracks.reduce((s,t)=>s+t.duration,0);

  return<div className="fade-in">
    <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"6px 14px",color:"#888",cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Zurück</button>
    
    <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:28}}>
      <div style={{position:"relative"}}>
        <ArtistAvatar name={name} artistData={artistData} size={120}/>
        {isAdmin&&<div onClick={uploadImage} style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.2s",cursor:"pointer",flexDirection:"column",gap:4}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
          {uploading?<span style={{color:"#fff",fontSize:12}}>...</span>:<><I.Img/><span style={{color:"#fff",fontSize:10}}>Bild ändern</span></>}
        </div>}
      </div>
      <div>
        <p style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Künstler</p>
        <h1 style={{fontSize:28,fontWeight:700,marginBottom:6}}>{name}</h1>
        <p style={{fontSize:13,color:"#777"}}>{artistTracks.length} {artistTracks.length===1?"Track":"Tracks"} · {fmtTime(totalDur)}</p>
        {isAdmin&&ad.imageUrl&&<button onClick={removeImage} style={{marginTop:8,background:"rgba(255,60,60,0.08)",border:"1px solid rgba(255,60,60,0.15)",borderRadius:8,padding:"4px 10px",color:"#ff5555",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Bild entfernen</button>}
      </div>
    </div>

    {/* Bio */}
    {(ad.bio||isAdmin)&&<div style={{marginBottom:24}}>
      {editBio?<div>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Biografie..." style={{width:"100%",minHeight:80,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:14,color:"#e8e6e3",fontSize:13,lineHeight:1.6,outline:"none",resize:"vertical",fontFamily:"'DM Sans',system-ui"}}/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>setEditBio(false)} style={{padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#888",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Abbrechen</button>
          <button className="upload-btn" onClick={saveBio} disabled={saving} style={{padding:"8px 20px",fontSize:12}}>{saving?"...":"Speichern"}</button>
        </div>
      </div>:
      <div>
        {ad.bio&&<p style={{fontSize:13,color:"#aaa",lineHeight:1.6,marginBottom:8}}>{ad.bio}</p>}
        {isAdmin&&<button onClick={()=>setEditBio(true)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"4px 10px",color:"#666",cursor:"pointer",fontSize:11,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><I.Edit/>{ad.bio?"Bio bearbeiten":"Bio hinzufügen"}</button>}
      </div>}
    </div>}

    <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Tracks</h3>
    <TrackList tracks={artistTracks} cur={cur} playing={playing} onPlay={onPlay} likes={likes} onLike={onLike} buffering={buffering}/>
  </div>
}

const I={Play:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,Pause:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,Spinner:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>,SkipN:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,SkipP:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>,Vol:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>,Shuf:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>,Rep:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>,Rep1:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">1</text></svg>,Plus:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,Expand:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>,Down:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>,Mic:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>,MicOff:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>,YT:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>,Save:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>,Check:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>,Srch:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,Home:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,Lib:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>,Adm:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>,Upl:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>,Del:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,Heart:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,X:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,Usr:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,Eye:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>,EyeOff:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/></svg>,Out:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,PL:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>,Vid:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,Mus:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,Img:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>,Edit:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,Lyrics:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2zm0 6h5v2H8v-2z"/></svg>,AI:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>};

// ─── Lyrics Display (Spotify Style) ───
function LyricsView({lyrics,progress,track,onClose}){
  const ref=useRef(null);const activeIdx=lyrics?lyrics.reduce((a,l,i)=>progress>=l.time?i:a,-1):-1;
  useEffect(()=>{if(ref.current&&activeIdx>=0){const el=ref.current.children[activeIdx];if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}},[activeIdx]);
  if(!lyrics||!lyrics.length)return null;
  return(<div style={{position:"fixed",inset:0,zIndex:50,background:"rgba(5,5,10,0.95)",backdropFilter:"blur(30px)",display:"flex",flexDirection:"column",animation:"fadeIn 0.4s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><Cover track={track} size={40}/><div><p style={{fontSize:14,fontWeight:600,color:"#fff"}}>{track.title}</p><p style={{fontSize:12,color:"#888"}}>{track.artist}</p></div></div><button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:20,padding:"8px 16px",color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Schließen</button></div>
    <div ref={ref} style={{flex:1,overflow:"auto",padding:"20vh 30px",display:"flex",flexDirection:"column",gap:12,scrollBehavior:"smooth"}}>
      {lyrics.map((l,i)=>{const isActive=i===activeIdx;const isPast=i<activeIdx;return<p key={i} style={{fontSize:isActive?26:20,fontWeight:isActive?700:500,color:isActive?"#ffffff":isPast?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.2)",transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",transform:isActive?"scale(1.02)":"scale(1)",transformOrigin:"left center",lineHeight:1.4,padding:"4px 0",cursor:"pointer"}}>{l.text}</p>})}
    </div>
  </div>);
}

// ─── Track Editor Modal ───
function TrackEditor({track,onClose,onSave,onRefresh}){
  const[t,setT]=useState({title:track.title,artist:track.artist,album:track.album||'',genre:track.genre});
  const[lyrics,setLyrics]=useState(track.lyrics||[]);
  const[lyricsText,setLyricsText]=useState((track.lyrics||[]).map(l=>l.text).join('\n'));
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState("");
  const[tab,setTab]=useState('info');
  const showSaved=(m)=>{setSaved(m);setTimeout(()=>setSaved(""),2500)};
  // Timing editor state
  const[timingMode,setTimingMode]=useState(false);
  const[timingLines,setTimingLines]=useState([]);
  const[timingIdx,setTimingIdx]=useState(0);
  const[timingPlaying,setTimingPlaying]=useState(false);
  const[timingTime,setTimingTime]=useState(0);
  const timingAudio=useRef(null);
  const timingInterval=useRef(null);

  // Init timing audio
  useEffect(()=>{
    if(track.audioUrl){
      timingAudio.current=new Audio(track.audioUrl);
      timingAudio.current.addEventListener('timeupdate',()=>{if(timingAudio.current)setTimingTime(timingAudio.current.currentTime)});
      timingAudio.current.addEventListener('ended',()=>setTimingPlaying(false));
    }
    return()=>{if(timingAudio.current){timingAudio.current.pause();timingAudio.current=null}};
  },[track.audioUrl]);

  const saveMeta=async()=>{setSaving(true);try{await api.updateTrack(track.id,t);showSaved("✅ Details gespeichert!");onRefresh();}catch(e){alert(e.message)}finally{setSaving(false)}};

  // Save lyrics with auto-distributed timestamps (text tab)
  const saveLyricsText=async()=>{
    setSaving(true);
    try{
      const lines=lyricsText.split('\n').filter(l=>l.trim());
      const gap=track.duration/(lines.length+1);
      const ly=lines.map((text,i)=>({time:Math.round((i+1)*gap*10)/10,text:text.trim()}));
      await api.saveLyrics(track.id,ly);
      setLyrics(ly);
      showSaved("✅ Text gespeichert! Jetzt Timing setzen →");
      onRefresh();
    }catch(e){alert(e.message)}finally{setSaving(false)}
  };

  // Save lyrics with manual timestamps (timing tab)
  const saveLyricsTiming=async()=>{
    setSaving(true);
    try{
      await api.saveLyrics(track.id,timingLines);
      setLyrics(timingLines);
      setLyricsText(timingLines.map(l=>l.text).join('\n'));
      showSaved("✅ Timing gespeichert!");
      onRefresh();
    }catch(e){alert(e.message)}finally{setSaving(false)}
  };

  const delLyrics=async()=>{try{await api.deleteLyrics(track.id);setLyrics([]);setLyricsText('');setTimingLines([]);onRefresh();}catch(e){alert(e.message)}};
  const changeCover=()=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=async(e)=>{const f=e.target.files[0];if(!f)return;try{await api.updateCover(track.id,f);onRefresh();}catch(err){alert(err.message)}};inp.click()};

  // Start timing mode
  const startTiming=()=>{
    const lines=lyricsText.split('\n').filter(l=>l.trim());
    if(!lines.length){alert('Zuerst Text eingeben!');return}
    setTimingLines(lines.map((text,i)=>({time:lyrics[i]?.time||-1,text:text.trim()})));
    setTimingIdx(0);
    setTimingMode(true);
    setTimingTime(0);
    if(timingAudio.current)timingAudio.current.currentTime=0;
  };

  // Tap a line to set its timestamp
  const tapLine=(idx)=>{
    if(!timingAudio.current)return;
    const time=Math.round(timingAudio.current.currentTime*10)/10;
    setTimingLines(prev=>{const n=[...prev];n[idx]={...n[idx],time};return n});
    if(idx<timingLines.length-1)setTimingIdx(idx+1);
  };

  // Play/pause timing audio
  const toggleTimingPlay=()=>{
    if(!timingAudio.current)return;
    if(timingPlaying){timingAudio.current.pause();setTimingPlaying(false)}
    else{timingAudio.current.play().catch(()=>{});setTimingPlaying(true)}
  };

  // Seek timing audio
  const seekTiming=(time)=>{
    if(!timingAudio.current)return;
    timingAudio.current.currentTime=time;
    setTimingTime(time);
  };

  // Reset all timestamps
  const resetTiming=()=>{
    setTimingLines(prev=>prev.map(l=>({...l,time:-1})));
    setTimingIdx(0);
    if(timingAudio.current){timingAudio.current.currentTime=0;timingAudio.current.pause()}
    setTimingPlaying(false);
    setTimingTime(0);
  };

  // Edit a single timestamp manually
  const editTimestamp=(idx,val)=>{
    const parts=val.split(':');
    let secs=0;
    if(parts.length===2){secs=parseInt(parts[0]||0)*60+parseFloat(parts[1]||0)}
    else{secs=parseFloat(val||0)}
    setTimingLines(prev=>{const n=[...prev];n[idx]={...n[idx],time:Math.round(secs*10)/10};return n});
  };

  return(<div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(145deg,#13131f,#0e0e18)",borderRadius:20,width:"95%",maxWidth:600,maxHeight:"90vh",overflow:"auto",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 24px 80px rgba(0,0,0,0.6)",animation:"modalSlide 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{height:4,background:"linear-gradient(90deg,#ff3c6f,#ff6b35,#ff3c6f)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite"}}/>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:20,fontWeight:700}}>Track bearbeiten</h2>
          <button onClick={()=>{if(timingAudio.current)timingAudio.current.pause();onClose()}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:6,color:"#666",cursor:"pointer"}}><I.X/></button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:saved?8:20,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:4}}>
          {[{k:'info',l:'Details'},{k:'lyrics',l:'Text'},{k:'timing',l:'⏱ Timing'}].map(x=><button key={x.k} onClick={()=>{setTab(x.k);if(x.k==='timing'&&!timingMode&&lyricsText.trim())startTiming();}} style={{flex:1,padding:"8px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",background:tab===x.k?"rgba(255,60,111,0.15)":"transparent",color:tab===x.k?"#ff3c6f":"#777"}}>{x.l}</button>)}
        </div>
        {saved&&<div style={{background:"rgba(50,200,100,0.1)",border:"1px solid rgba(50,200,100,0.25)",borderRadius:10,padding:"10px 14px",marginBottom:16,textAlign:"center",animation:"fadeIn 0.3s ease"}}><p style={{fontSize:13,color:"#44cc66",fontWeight:600}}>{saved}</p></div>}

        {/* Details tab */}
        {tab==='info'&&<div>
          <div style={{display:"flex",gap:16,marginBottom:16}}>
            <div onClick={changeCover} style={{cursor:"pointer",position:"relative"}}>
              <Cover track={track} size={90}/>
              <div style={{position:"absolute",inset:0,borderRadius:8,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}><I.Img/></div>
            </div>
            <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <input className="admin-input" placeholder="Titel" value={t.title} onChange={e=>setT({...t,title:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
              <input className="admin-input" placeholder="Künstler" value={t.artist} onChange={e=>setT({...t,artist:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
              <input className="admin-input" placeholder="Album" value={t.album} onChange={e=>setT({...t,album:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
              <select className="admin-input" value={t.genre} onChange={e=>setT({...t,genre:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}>{["Electronic","Synthwave","Ambient","Chillout","Rock","Pop","Jazz","Classical","Hip-Hop","R&B","Metal","Folk","Country","Latin","Reggae"].map(g=><option key={g} value={g}>{g}</option>)}</select>
            </div>
          </div>
          <button className="upload-btn" onClick={saveMeta} disabled={saving} style={{width:"100%"}}>{saving?"Speichern...":"Details speichern"}</button>
        </div>}

        {/* Lyrics text tab */}
        {tab==='lyrics'&&<div>
          <p style={{fontSize:12,color:"#888",marginBottom:8}}>Songtext einfügen (eine Zeile pro Liedzeile). Tipp: Lyrics von <a href="https://genius.com" target="_blank" style={{color:"#ff3c6f"}}>genius.com</a> kopieren.</p>
          <textarea value={lyricsText} onChange={e=>setLyricsText(e.target.value)} placeholder={"Songtext hier einfügen...\n\nEine Zeile pro Liedzeile.\nLeere Zeilen für Pausen."} style={{width:"100%",minHeight:200,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:14,color:"#e8e6e3",fontSize:14,lineHeight:1.8,outline:"none",resize:"vertical",fontFamily:"'DM Sans',system-ui"}}/>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            {lyrics.length>0&&<button onClick={delLyrics} style={{padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,60,60,0.2)",background:"rgba(255,60,60,0.08)",color:"#ff5555",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}><I.Del/></button>}
            <button className="upload-btn" onClick={saveLyricsText} disabled={saving||!lyricsText.trim()} style={{flex:1}}>{saving?"Speichern...":"Text speichern"}</button>
          </div>
          <p style={{fontSize:11,color:"#555",marginTop:8}}>Nach dem Speichern → Tab "⏱ Timing" um die Zeitpunkte pro Zeile zu setzen.</p>
        </div>}

        {/* Timing tab - the cool part! */}
        {tab==='timing'&&<div>
          {!lyricsText.trim()?
            <div style={{textAlign:"center",padding:40,color:"#666"}}>
              <p style={{fontSize:14,marginBottom:8}}>Zuerst Text im Tab "Text" einfügen!</p>
            </div>
          :!timingMode?
            <div style={{textAlign:"center",padding:20}}>
              <button className="upload-btn" onClick={startTiming}>Timing starten</button>
            </div>
          :<div>
            {/* Audio controls */}
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <button onClick={toggleTimingPlay} style={{width:40,height:40,borderRadius:"50%",background:"#ff3c6f",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                  {timingPlaying?<I.Pause/>:<I.Play/>}
                </button>
                <div style={{flex:1}}>
                  <div onClick={e=>{const r=e.currentTarget.getBoundingClientRect();seekTiming((e.clientX-r.left)/r.width*track.duration)}} style={{height:20,display:"flex",alignItems:"center",cursor:"pointer"}}>
                    <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,position:"relative",pointerEvents:"none"}}>
                      <div style={{width:`${(timingTime/(track.duration||1))*100}%`,height:"100%",background:"linear-gradient(90deg,#ff3c6f,#ff6b35)",borderRadius:2,pointerEvents:"none"}}/>
                    </div>
                  </div>
                </div>
                <span style={{fontSize:12,color:"#aaa",fontFamily:"'Space Mono',monospace",minWidth:45}}>{fmtTime(timingTime)}</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={resetTiming} style={{fontSize:11,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#888",cursor:"pointer",fontFamily:"inherit"}}>↺ Reset</button>
                <p style={{fontSize:11,color:"#666",flex:1,display:"flex",alignItems:"center"}}>Song abspielen & auf jede Zeile tippen wenn sie gesungen wird</p>
              </div>
            </div>

            {/* Lines with tap-to-time */}
            <div style={{maxHeight:300,overflow:"auto",marginBottom:16}}>
              {timingLines.map((line,idx)=>{
                const isActive=idx===timingIdx;
                const hasTime=line.time>=0;
                const isPast=hasTime&&timingTime>=line.time;
                return<div key={idx} onClick={()=>tapLine(idx)} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:4,
                  cursor:"pointer",transition:"all 0.15s",
                  background:isActive?"rgba(255,60,111,0.12)":isPast?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)",
                  border:isActive?"1px solid rgba(255,60,111,0.3)":"1px solid transparent",
                }} onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(255,255,255,0.06)"}} onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=isPast?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)"}}>
                  <span style={{fontSize:11,color:"#555",fontFamily:"'Space Mono',monospace",width:20,textAlign:"right"}}>{idx+1}</span>
                  <div onClick={e=>{e.stopPropagation()}} style={{width:55}}>
                    <input value={hasTime?fmtTime(line.time):"--:--"} onChange={e=>editTimestamp(idx,e.target.value)}
                      style={{width:55,background:hasTime?"rgba(255,60,111,0.1)":"rgba(255,255,255,0.04)",border:"1px solid "+(hasTime?"rgba(255,60,111,0.2)":"rgba(255,255,255,0.08)"),borderRadius:6,padding:"4px 6px",color:hasTime?"#ff3c6f":"#555",fontSize:11,fontFamily:"'Space Mono',monospace",textAlign:"center",outline:"none"}}/>
                  </div>
                  <span style={{flex:1,fontSize:13,color:isActive?"#fff":isPast?"#ccc":"#888",fontWeight:isActive?600:400,transition:"color 0.2s"}}>{line.text}</span>
                  {isActive&&<span style={{fontSize:10,color:"#ff3c6f",fontWeight:600}}>← TIPPEN</span>}
                </div>
              })}
            </div>

            {/* Save timing */}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setTimingMode(false);if(timingAudio.current)timingAudio.current.pause();setTimingPlaying(false)}} style={{padding:"12px 18px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#888",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Abbrechen</button>
              <button className="upload-btn" onClick={saveLyricsTiming} disabled={saving||timingLines.some(l=>l.time<0)} style={{flex:1}}>
                {saving?"Speichern...":(timingLines.some(l=>l.time<0)?`Noch ${timingLines.filter(l=>l.time<0).length} Zeilen ohne Zeit`:"Timing speichern ✓")}
              </button>
            </div>
          </div>}
        </div>}
      </div>
    </div>
  </div>);
}

// ─── Auth Modal ───
function AuthModal({onClose,onLogin,onRegister,reason,err:extErr}){
  const[mode,setMode]=useState("login");const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[name,setName]=useState("");const[show,setShow]=useState(false);const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const e=extErr||err;
  const go=async()=>{setErr("");setLoading(true);try{if(mode==="login"){if(!email||!pw){setErr("Felder ausfüllen");return}await onLogin(email,pw)}else{if(!name||!email||!pw){setErr("Felder ausfüllen");return}if(pw.length<6){setErr("Mind. 6 Zeichen");return}await onRegister(name,email,pw)}}catch(x){setErr(x.message)}finally{setLoading(false)}};
  return<div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)"}} onClick={onClose}><div onClick={x=>x.stopPropagation()} style={{background:"linear-gradient(145deg,#13131f,#0e0e18)",borderRadius:20,width:"90%",maxWidth:400,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 24px 80px rgba(0,0,0,0.6)",animation:"modalSlide 0.35s cubic-bezier(0.16,1,0.3,1)",overflow:"hidden",position:"relative"}}><div style={{height:4,background:"linear-gradient(90deg,#ff3c6f,#ff6b35,#ff3c6f)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite"}}/><div style={{padding:"28px 28px 24px"}}><button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:6,color:"#666",cursor:"pointer"}}><I.X/></button><div style={{width:56,height:56,borderRadius:16,margin:"0 auto 16px",background:"linear-gradient(135deg,rgba(255,60,111,0.15),rgba(255,107,53,0.1))",display:"flex",alignItems:"center",justifyContent:"center",color:"#ff3c6f"}}><I.Usr/></div>{reason&&<div style={{background:"rgba(255,60,111,0.08)",border:"1px solid rgba(255,60,111,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:18,textAlign:"center"}}><p style={{fontSize:13,color:"#ff8fa8"}}>{reason==="play"?"🎵 Bitte anmelden zum Hören":reason==="playlist"?"📋 Bitte anmelden":"❤️ Bitte anmelden"}</p></div>}<h2 style={{fontSize:22,fontWeight:700,textAlign:"center",marginBottom:4}}>{mode==="login"?"Willkommen zurück":"Konto erstellen"}</h2><p style={{fontSize:13,color:"#666",textAlign:"center",marginBottom:22}}>{mode==="login"?"Anmelden":"Kostenlos registrieren"}</p><div style={{display:"flex",flexDirection:"column",gap:10}}>{mode==="register"&&<input className="auth-input" placeholder="Name" value={name} onChange={x=>setName(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()}/>}<input className="auth-input" type="email" placeholder="E-Mail" value={email} onChange={x=>setEmail(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()}/><div style={{position:"relative"}}><input className="auth-input" type={show?"text":"password"} placeholder="Passwort" value={pw} onChange={x=>setPw(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={{paddingRight:42}}/><button onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer",padding:4}}>{show?<I.EyeOff/>:<I.Eye/>}</button></div></div>{e&&<p style={{color:"#ff4455",fontSize:12,marginTop:10,textAlign:"center"}}>{e}</p>}<button className="auth-submit-btn" onClick={go} disabled={loading} style={{marginTop:16,opacity:loading?0.6:1}}>{loading?"...":(mode==="login"?"Anmelden":"Registrieren")}</button><p style={{fontSize:13,color:"#666",textAlign:"center",marginTop:16}}>{mode==="login"?"Kein Konto? ":"Schon registriert? "}<button onClick={()=>{setMode(mode==="login"?"register":"login");setErr("")}} style={{background:"none",border:"none",color:"#ff3c6f",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{mode==="login"?"Registrieren":"Anmelden"}</button></p></div></div></div>
}

function TrackList({tracks,cur,playing,onPlay,likes,onLike,pls,onAddToPl,addToPlMenu,setAddToPlMenu,onRemoveFromPl,playlistId,buffering}){
  return<div>{tracks.map((t,i)=><div key={t.id} className="track-row" onClick={()=>onPlay(t)} style={{display:"flex",alignItems:"center",padding:"8px 10px",borderRadius:8,cursor:"pointer",transition:"background 0.2s",background:cur?.id===t.id?"rgba(255,60,111,0.08)":"transparent"}}><div style={{width:28,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}><span className="track-num" style={{fontSize:13,color:cur?.id===t.id?"#ff3c6f":"#555",fontFamily:"'Space Mono',monospace"}}>{cur?.id===t.id&&playing?(buffering?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3c6f" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>:<span style={{display:"flex",gap:1,alignItems:"flex-end",height:14}}>{[1,2,3].map(b=><span key={b} style={{display:"block",width:2.5,height:5+b*3,background:"#ff3c6f",borderRadius:1,animation:`pulse ${0.35+b*0.12}s ease-in-out infinite`}}/>)}</span>):i+1}</span><span className="track-play-btn" style={{position:"absolute",opacity:0,transition:"opacity 0.2s",color:"#fff"}}>{cur?.id===t.id&&playing?<I.Pause/>:<I.Play/>}</span></div><div style={{marginLeft:10,marginRight:12}}><Cover track={t} size={40}/></div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><p style={{fontSize:14,fontWeight:cur?.id===t.id?600:400,color:cur?.id===t.id?"#ff3c6f":"#e8e6e3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>{t.lyrics&&<span style={{fontSize:9,background:"rgba(100,200,255,0.12)",color:"#6bc8ff",padding:"1px 5px",borderRadius:4,fontWeight:600}}>♪</span>}</div><p style={{fontSize:12,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.artist}{t.album?` · ${t.album}`:""}</p></div>
    {pls&&onAddToPl&&<div style={{position:"relative"}}><button className="ctrl-btn" onClick={e=>{e.stopPropagation();setAddToPlMenu(addToPlMenu===t.id?null:t.id)}} style={{color:"#555"}} title="Zur Playlist"><I.Plus/></button>
      {addToPlMenu===t.id&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:"100%",background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:6,minWidth:160,zIndex:50,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
        {pls.length===0?<p style={{fontSize:12,color:"#666",padding:"8px 10px"}}>Keine Playlisten</p>:pls.map(p=><button key={p.id} onClick={()=>onAddToPl(p.id,t.id)} style={{display:"block",width:"100%",textAlign:"left",background:p.trackIds?.includes(t.id)?"rgba(255,60,111,0.1)":"none",border:"none",borderRadius:6,padding:"8px 10px",color:p.trackIds?.includes(t.id)?"#ff3c6f":"#ccc",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{p.trackIds?.includes(t.id)?"✓ ":""}{p.name}</button>)}
      </div>}
    </div>}
    {playlistId&&onRemoveFromPl&&<button className="ctrl-btn" onClick={e=>{e.stopPropagation();onRemoveFromPl(playlistId,t.id)}} style={{color:"#ff5555"}} title="Entfernen"><I.Del/></button>}
    <button className="ctrl-btn" onClick={e=>{e.stopPropagation();onLike(t.id)}} style={{color:likes[t.id]?"#ff3c6f":"#444",marginRight:8}}><I.Heart/></button><span style={{fontSize:12,color:"#555",fontFamily:"'Space Mono',monospace",width:40,textAlign:"right"}}>{fmtTime(t.duration)}</span></div>)}</div>
}

function FileUploader({onReady}){
  const[drag,setDrag]=useState(false);const[msg,setMsg]=useState("");const ref=useRef(null);
  const audioExts=/\.(mp3|m4a|aac|ogg|opus|wav|flac|wma|webm|amr|3gp)$/i;
  const videoExts=/\.(mp4|mkv|avi|mov|webm|3gp|m4v|wmv)$/i;
  const go=async f=>{
    const isV=f.type.startsWith("video/")||videoExts.test(f.name);
    const isA=f.type.startsWith("audio/")||audioExts.test(f.name);
    if(!isV&&!isA){setMsg("❌ Nicht unterstütztes Format");setTimeout(()=>setMsg(""),3000);return}
    setMsg(isV?"🎬 Verarbeite...":"🎵 Lade...");
    try{
      const el=document.createElement(isV?"video":"audio");el.src=URL.createObjectURL(f);el.preload="metadata";
      await new Promise((r,j)=>{el.onloadedmetadata=r;el.onerror=()=>j(new Error("Datei konnte nicht gelesen werden"));setTimeout(()=>j(new Error("Timeout – Datei zu groß oder nicht unterstützt")),30000)});
      const dur=Math.floor(el.duration);const fn=f.name.replace(/\.[^/.]+$/,"");const pts=fn.split(/[-–—_]/).map(s=>s.trim()).filter(Boolean);
      let title=fn,artist="Unbekannt";if(pts.length>=2){artist=pts[0];title=pts.slice(1).join(" - ")}
      URL.revokeObjectURL(el.src);setMsg("✅ Bereit!");
      onReady({file:f,title,artist,album:"",genre:"Electronic",duration:dur,sourceType:isV?"video":"audio"});
      setTimeout(()=>setMsg(""),1500);
    }catch(e){setMsg("❌ "+e.message);setTimeout(()=>setMsg(""),4000)}
  };
  return<div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(e.dataTransfer.files[0])go(e.dataTransfer.files[0])}} onClick={()=>ref.current?.click()} style={{border:`2px dashed ${drag?"#ff3c6f":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:drag?"rgba(255,60,111,0.05)":"rgba(255,255,255,0.02)"}}><input ref={ref} type="file" accept="video/*,audio/*,.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac,.amr,.3gp,.mp4,.mkv,.avi,.mov,.webm" style={{display:"none"}} onChange={e=>{if(e.target.files[0])go(e.target.files[0]);e.target.value=""}}/>{msg?<p style={{color:msg[0]==="❌"?"#ff4455":msg[0]==="✅"?"#44ff88":"#ff3c6f",fontSize:14,fontWeight:500}}>{msg}</p>:<div><div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12}}><div style={{width:44,height:44,borderRadius:12,background:"rgba(255,60,111,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#ff3c6f"}}><I.Vid/></div><div style={{width:44,height:44,borderRadius:12,background:"rgba(255,107,53,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#ff6b35"}}><I.Mus/></div></div><p style={{color:"#ccc",fontSize:14,fontWeight:600,marginBottom:4}}>Video oder Audio hochladen</p><p style={{color:"#555",fontSize:11,marginTop:8}}>MP4, MP3, M4A, OGG, OPUS, WAV, FLAC, WhatsApp Audio...</p></div>}</div>
}

// ─── Main App ───
// Global audio element - created once, survives React re-renders
const _audio=new Audio();_audio.volume=0.7;_audio.preload='auto';_audio._shouldPlay=false;

export default function App(){
  const[user,setUser]=useState(null);const[showAuth,setShowAuth]=useState(false);const[authReason,setAuthReason]=useState(null);const[authErr,setAuthErr]=useState("");const pa=useRef(null);
  const[tracks,setTracks]=useState([]);const[cur,setCur]=useState(null);const[playing,setPlaying]=useState(false);const[progress,setProgress]=useState(0);const[volume,setVolume]=useState(0.7);const[shuffle,setShuffle]=useState(false);const[repeat,setRepeat]=useState('off');const[buffering,setBuffering]=useState(false);
  const[view,setView]=useState("home");const[sq,setSq]=useState("");const[likes,setLikes]=useState({});const[pls,setPls]=useState([]);const[showNP,setShowNP]=useState(false);const[npName,setNpName]=useState("");
  const[editT,setEditT]=useState(null);const[uploading,setUploading]=useState(false);const[admUsers,setAdmUsers]=useState([]);
  const[newTrack,setNewTrack]=useState(null);const[newCover,setNewCover]=useState(null);const[newCoverP,setNewCoverP]=useState(null);
  const[ytUrl,setYtUrl]=useState('');const[ytLoading,setYtLoading]=useState(false);const[ytInfo,setYtInfo]=useState(null);const[ytSelected,setYtSelected]=useState([]);
  const[ytSearchQ,setYtSearchQ]=useState('');const[ytResults,setYtResults]=useState([]);const[ytSearching,setYtSearching]=useState(false);const[ytSaved,setYtSaved]=useState([]);const[ytStreaming,setYtStreaming]=useState(null);const[searchMode,setSearchMode]=useState('local');const[ytSaving,setYtSaving]=useState({});
  const[ytMusicQ,setYtMusicQ]=useState('');const[ytMusicResults,setYtMusicResults]=useState([]);const[ytMusicSearching,setYtMusicSearching]=useState(false);const[ytMusicFilterInfo,setYtMusicFilterInfo]=useState(null);const[ytMusicStreaming,setYtMusicStreaming]=useState(null);
  const[recommendations,setRecommendations]=useState([]);const[loadingRecs,setLoadingRecs]=useState(false);
  const[catalog,setCatalog]=useState([]);const[editingCatalog,setEditingCatalog]=useState(null);const[ytAddForm,setYtAddForm]=useState(null);
  const[showLyrics,setShowLyrics]=useState(false);const[editingTrack,setEditingTrack]=useState(null);
  const[artistData,setArtistData]=useState([]);const[selectedArtist,setSelectedArtist]=useState(null);
  const[showFullPlayer,setShowFullPlayer]=useState(false);const[viewingPlaylist,setViewingPlaylist]=useState(null);const[addToPlMenu,setAddToPlMenu]=useState(null);
  const[voiceActive,setVoiceActive]=useState(false);const[voiceListening,setVoiceListening]=useState(false);const[voiceAlwaysOn,setVoiceAlwaysOn]=useState(false);const[voiceText,setVoiceText]=useState('');const[voiceFeedback,setVoiceFeedback]=useState('');const[voiceCmd,setVoiceCmd]=useState(false);
  const[playCounts,setPlayCounts]=useState({});
  const audioRef=useRef(_audio);const piRef=useRef(null);const tRef=useRef(tracks);tRef.current=tracks;const repeatRef=useRef(repeat);repeatRef.current=repeat;const shuffleRef=useRef(shuffle);shuffleRef.current=shuffle;
  const recsRef=useRef([]);recsRef.current=recommendations;
  const voiceRecRef=useRef(null);const voiceFbTimer=useRef(null);
  const hasSpeech=!!(window.SpeechRecognition||window.webkitSpeechRecognition);

  // iOS: Unlock the audio element on first user interaction by playing silence on it
  const audioUnlocked=useRef(false);
  useEffect(()=>{
    const unlock=()=>{
      if(audioUnlocked.current)return;
      const a=audioRef.current;if(!a)return;
      // Play a tiny silent WAV on the SAME audio element we use for music
      const oldSrc=a.src;const oldId=a._id;
      a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      const p=a.play();
      if(p)p.then(()=>{a.pause();a.src=oldSrc||'';a._id=oldId;audioUnlocked.current=true}).catch(()=>{a.src=oldSrc||'';a._id=oldId});
      else{a.src=oldSrc||'';a._id=oldId}
      audioUnlocked.current=true;
      // Also unlock AudioContext
      try{const ctx=new(window.AudioContext||window.webkitAudioContext)();ctx.resume().catch(()=>{})}catch{}
    };
    // Use multiple events for reliability
    const events=['touchstart','touchend','click','pointerdown'];
    events.forEach(e=>document.addEventListener(e,unlock,{once:true,passive:true}));
    return()=>events.forEach(e=>document.removeEventListener(e,unlock));
  },[]);

  const autoPlayRecRef=useRef(null);

  useEffect(()=>{const a=audioRef.current;
    const onEnded=()=>{const ct=tRef.current;const c=a._id;if(!c)return;const rm=repeatRef.current;
      if(rm==='one'){a.currentTime=0;a._shouldPlay=true;a.play().catch(()=>{});return}
      // If we have recommendations, play a random one
      const recs=recsRef.current;
      if(recs&&recs.length>0){
        const pick=recs[Math.floor(Math.random()*recs.length)];
        if(autoPlayRecRef.current){autoPlayRecRef.current(pick);return}
      }
      // Otherwise play next from library
      if(!ct.length)return;
      const idx=ct.findIndex(t=>t.id===c);
      if(rm==='off'&&idx===ct.length-1){setPlaying(false);a._shouldPlay=false;return}
      const n=shuffleRef.current?ct[Math.floor(Math.random()*ct.length)]:ct[(idx+1)%ct.length];
      if(n){setCur(n);setProgress(0);setPlaying(true);setBuffering(true);a.src=n.audioUrl||"";a._id=n.id;a._shouldPlay=true;if(n.audioUrl)a.play().catch(()=>{})}
    };    const onTime=()=>{if(a&&!isNaN(a.currentTime))setProgress(Math.floor(a.currentTime))};
    const onWait=()=>setBuffering(true);
    const onCanPlay=()=>setBuffering(false);
    const onPlaying=()=>{setBuffering(false);setPlaying(true)};
    const onPause=()=>{if(!a._shouldPlay)setPlaying(false)};
    const onStalled=()=>{if(a._shouldPlay)setBuffering(true)};
    a.addEventListener("ended",onEnded);a.addEventListener("timeupdate",onTime);
    a.addEventListener("waiting",onWait);a.addEventListener("canplay",onCanPlay);
    a.addEventListener("playing",onPlaying);a.addEventListener("pause",onPause);
    a.addEventListener("stalled",onStalled);
    return()=>{a.removeEventListener("ended",onEnded);a.removeEventListener("timeupdate",onTime);a.removeEventListener("waiting",onWait);a.removeEventListener("canplay",onCanPlay);a.removeEventListener("playing",onPlaying);a.removeEventListener("pause",onPause);a.removeEventListener("stalled",onStalled)}
  },[]);

  // Preload next tracks in background
  const preloadCache=useRef({});
  useEffect(()=>{
    if(!cur||!tracks.length)return;
    const idx=tracks.findIndex(t=>t.id===cur.id);
    // Preload next 2 tracks
    for(let i=1;i<=2;i++){
      const next=tracks[(idx+i)%tracks.length];
      if(next?.audioUrl&&!preloadCache.current[next.id]){
        const link=document.createElement('link');
        link.rel='prefetch';link.href=next.audioUrl;link.as='fetch';
        document.head.appendChild(link);
        preloadCache.current[next.id]=true;
      }
    }
  },[cur,tracks]);

  // Fetch recommendations when current track changes
  useEffect(()=>{
    if(!cur)return;
    setRecommendations([]);setLoadingRecs(true);
    api.ytRecommend(cur.title,cur.artist,cur.ytId).then(d=>{setRecommendations(d.results||[]);setLoadingRecs(false)}).catch(()=>setLoadingRecs(false));
  },[cur?.id]);

  // Keyboard shortcuts
  useEffect(()=>{const h=e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;if(e.code==='Space'){e.preventDefault();if(cur){if(playing){setPlaying(false);if(audioRef.current){audioRef.current.pause();audioRef.current._shouldPlay=false}}else{setPlaying(true);if(cur.audioUrl&&audioRef.current){audioRef.current._shouldPlay=true;audioRef.current.play().catch(()=>{})}}}}else if(e.code==='ArrowRight'){e.preventDefault();doNextRef.current?.()}else if(e.code==='ArrowLeft'){e.preventDefault();doPrevRef.current?.()}else if(e.code==='ArrowUp'){e.preventDefault();setVolume(v=>{const nv=Math.min(1,v+0.05);if(audioRef.current)audioRef.current.volume=nv;return nv})}else if(e.code==='ArrowDown'){e.preventDefault();setVolume(v=>{const nv=Math.max(0,v-0.05);if(audioRef.current)audioRef.current.volume=nv;return nv})}};document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h)});
  const doNextRef=useRef(null);const doPrevRef=useRef(null);
  useEffect(()=>{api.me().then(u=>{if(u)setUser(u)}).catch(()=>{});api.getTracks().then(setTracks).catch(()=>{});api.getPlaylists().then(setPls).catch(()=>{});api.getArtists().then(setArtistData).catch(()=>{});api.ytSaved().then(d=>setYtSaved(d.saved||[])).catch(()=>{});api.getCatalog().then(d=>setCatalog(d.catalog||[])).catch(()=>{})},[]);
  useEffect(()=>{if(user){api.getLikes().then(setLikes).catch(()=>{});api.getPlayCounts().then(setPlayCounts).catch(()=>{});if(user.isAdmin)api.getUsers().then(setAdmUsers).catch(()=>{})}else{setLikes({});setPlayCounts({})}},[user]);
  useEffect(()=>{if(playing&&cur?.isDemo){piRef.current=setInterval(()=>setProgress(p=>p>=cur.duration?0:p+1),1000)}return()=>clearInterval(piRef.current)},[playing,cur]);

  const refresh=async()=>{try{setTracks(await api.getTracks());setArtistData(await api.getArtists());try{const d=await api.ytSaved();setYtSaved(d.saved||[])}catch{};try{const d=await api.getCatalog();setCatalog(d.catalog||[])}catch{}}catch{}};
  const rAuth=(r,fn)=>{if(user){fn();return}pa.current=fn;setAuthReason(r);setAuthErr("");setShowAuth(true)};
  const doLogin=async(e,p)=>{setAuthErr("");try{const u=await api.login(e,p);setUser(u);setShowAuth(false);if(pa.current){const a=pa.current;pa.current=null;setTimeout(a,100)}}catch(x){setAuthErr(x.message);throw x}};
  const doReg=async(n,e,p)=>{setAuthErr("");try{const u=await api.register(n,e,p);setUser(u);setShowAuth(false);if(pa.current){const a=pa.current;pa.current=null;setTimeout(a,100)}}catch(x){setAuthErr(x.message);throw x}};
  const doLogout=async()=>{await api.logout();setUser(null);setCur(null);setPlaying(false);if(audioRef.current){audioRef.current.pause();audioRef.current._shouldPlay=false}setView("home")};
  const playT=t=>{const a=audioRef.current;if(t.audioUrl&&a){setBuffering(true);
    a.src=t.audioUrl;a.volume=volume;a._id=t.id;a._shouldPlay=true;
    // play() directly in user gesture context - this is what iOS needs
    const p=a.play();
    if(p)p.then(()=>{setBuffering(false);setPlaying(true);audioUnlocked.current=true}).catch(e=>{
      // NotAllowedError = iOS blocked it. AbortError = loading interrupted (normal).
      // For other errors, try again on canplaythrough
      if(e.name!=='AbortError'){
        const retry=()=>{if(a._shouldPlay&&a._id===t.id&&a.paused){a.play().then(()=>{setBuffering(false);setPlaying(true)}).catch(()=>{setBuffering(false)})}};
        a.addEventListener('canplaythrough',retry,{once:true});
      }
    });
  }else if(a){a.pause();a.src="";a._shouldPlay=false;setBuffering(false)}
    if(user&&t.id){api.trackPlay(t.id).then(()=>api.getPlayCounts().then(setPlayCounts).catch(()=>{})).catch(()=>{})}
  };
  const doPlay=t=>{rAuth("play",()=>{if(cur?.id===t.id){if(playing){setPlaying(false);if(audioRef.current){audioRef.current.pause();audioRef.current._shouldPlay=false}}else{setPlaying(true);if(t.audioUrl&&audioRef.current){audioRef.current._shouldPlay=true;audioRef.current.play().catch(()=>{})}}}else{setCur(t);setProgress(0);setPlaying(true);playT(t)}})};
  const doNext=useCallback(()=>{if(!cur)return;const i=tracks.findIndex(t=>t.id===cur.id);const n=shuffle?tracks[Math.floor(Math.random()*tracks.length)]:tracks[(i+1)%tracks.length];setCur(n);setProgress(0);setPlaying(true);playT(n)},[cur,tracks,shuffle]);
  const doPrev=useCallback(()=>{if(!cur)return;if(progress>3){setProgress(0);if(audioRef.current)audioRef.current.currentTime=0;return}const i=tracks.findIndex(t=>t.id===cur.id);const p=tracks[(i-1+tracks.length)%tracks.length];setCur(p);setProgress(0);setPlaying(true);playT(p)},[cur,tracks,progress]);
  useEffect(()=>{doNextRef.current=doNext;doPrevRef.current=doPrev},[doNext,doPrev]);
  const doSeek=e=>{if(!cur)return;const r=e.currentTarget.getBoundingClientRect();const t=Math.floor(((e.clientX-r.left)/r.width)*cur.duration);setProgress(t);if(cur.audioUrl&&audioRef.current)audioRef.current.currentTime=t};
  const doVol=v=>{setVolume(v);if(audioRef.current)audioRef.current.volume=v};
  const doLike=id=>rAuth("like",async()=>{
    try{
      const newLikes=await api.toggleLike(id);setLikes(newLikes);
      // If liking a YT stream track, save it permanently
      if(newLikes[id]&&cur&&cur.isStream&&cur.ytId&&(cur.id===id||'yt-'+cur.ytId===id)){
        ytDoSave({ytId:cur.ytId,title:cur.title,artist:cur.artist,album:cur.album,duration:cur.duration,thumbnail:cur.coverUrl});
        showVoiceFb('❤️ Wird dauerhaft gespeichert!');
      }
    }catch{}
  });
  const doPL=()=>rAuth("playlist",async()=>{if(!npName.trim())return;try{const pl=await api.createPlaylist(npName.trim());setPls(p=>[...p,pl]);setNpName("");setShowNP(false)}catch{}});
  const delPL=async id=>{try{await api.deletePlaylist(id);setPls(p=>p.filter(x=>x.id!==id));if(viewingPlaylist?.id===id)setViewingPlaylist(null)}catch{}};
  const addToPL=async(plId,trackId)=>{try{const updated=await api.addToPlaylist(plId,trackId);setPls(p=>p.map(x=>x.id===plId?updated:x));setAddToPlMenu(null)}catch(e){alert(e.message)}};
  const removeFromPL=async(plId,trackId)=>{try{const updated=await api.removeFromPlaylist(plId,trackId);setPls(p=>p.map(x=>x.id===plId?updated:x));if(viewingPlaylist?.id===plId)setViewingPlaylist(updated)}catch{}};
  const playPlaylist=(pl)=>{const plTracks=pl.trackIds.map(id=>tracks.find(t=>t.id===id)).filter(Boolean);if(plTracks.length>0){setCur(plTracks[0]);setProgress(0);setPlaying(true);playT(plTracks[0])}};
  const cycleRepeat=()=>setRepeat(r=>r==='off'?'all':r==='all'?'one':'off');

  // Catalog reorder
  const moveCatalogItem=async(itemId,direction)=>{
    const ids=catalog.map(x=>x.id);const idx=ids.indexOf(itemId);if(idx<0)return;
    const item=catalog.find(c=>c.id===itemId);const albumName=item?.album||'Ohne Album';
    const albumItems=catalog.filter(c=>(c.album||'Ohne Album')===albumName);
    const albumIdx=albumItems.findIndex(a=>a.id===itemId);
    if(direction==='up'&&albumIdx>0){const sw=albumItems[albumIdx-1];const si=ids.indexOf(sw.id);const tmp=ids[idx];ids[idx]=ids[si];ids[si]=tmp}
    else if(direction==='down'&&albumIdx<albumItems.length-1){const sw=albumItems[albumIdx+1];const si=ids.indexOf(sw.id);const tmp=ids[idx];ids[idx]=ids[si];ids[si]=tmp}
    else return;
    try{await api.reorderCatalog(ids);const d=await api.getCatalog();setCatalog(d.catalog||[])}catch(e){alert('Fehler: '+e.message)}
  };

  // ─── Voice Control ───
  const showVoiceFb=(msg,dur=3000)=>{setVoiceFeedback(msg);clearTimeout(voiceFbTimer.current);voiceFbTimer.current=setTimeout(()=>setVoiceFeedback(''),dur)};
  const playCountsRef=useRef(playCounts);playCountsRef.current=playCounts;

  const findTrack=(text)=>{
    const t=text.toLowerCase().trim();
    if(!t)return null;
    const all=tRef.current;const pc=playCountsRef.current;

    // Strip "spiele/spiel/play" prefix if present
    const cleaned=t.replace(/^(spiele|spiel|play|abspielen)\s+/i,'').trim();
    const search=cleaned||t;

    // Try "title von artist" pattern
    const vonMatch=search.match(/^(.+?)\s+von\s+(.+)$/);
    if(vonMatch){
      const title=vonMatch[1].trim();const artist=vonMatch[2].trim();
      const match=all.find(tr=>tr.title.toLowerCase().includes(title)&&tr.artist.toLowerCase().includes(artist));
      if(match)return match;
    }

    // Score all tracks by how well they match
    const scored=all.map(tr=>{
      const tl=tr.title.toLowerCase();const al=tr.artist.toLowerCase();
      let score=0;
      // Exact title match
      if(tl===search)score+=100;
      // Title contains search
      else if(tl.includes(search))score+=60;
      // Search contains title (user said more than the title)
      else if(search.includes(tl)&&tl.length>2)score+=50;
      // Artist match
      if(al===search)score+=40;
      else if(al.includes(search))score+=30;
      else if(search.includes(al)&&al.length>2)score+=20;
      // Word-level matching for partial matches
      if(score===0){
        const words=search.split(/\s+/);
        const titleWords=tl.split(/\s+/);
        const matchedWords=words.filter(w=>w.length>2&&(tl.includes(w)||al.includes(w)));
        if(matchedWords.length>0)score+=matchedWords.length*15;
        // Also check if title words appear in search
        const revMatch=titleWords.filter(w=>w.length>2&&search.includes(w));
        if(revMatch.length>0)score+=revMatch.length*10;
      }
      // Boost by play count (most listened = preferred)
      const plays=pc[tr.id]||0;
      score+=Math.min(plays*2,20);// Max 20 bonus from play count
      return{track:tr,score};
    }).filter(s=>s.score>0).sort((a,b)=>b.score-a.score);

    if(scored.length>0)return scored[0].track;

    // Last resort: pick random track if nothing matches at all
    return null;
  };

  const processVoiceCmd=(text)=>{
    const t=text.toLowerCase().trim();
    if(!t)return;

    // Control commands (check these FIRST before track matching)
    if(t.match(/^(nächster|nächstes|nächste|weiter\b|skip|next|vorwärts)/)){doNextRef.current?.();showVoiceFb('⏭ Nächster Track');return}
    if(t.match(/^(vorheriger|zurück|previous|back)/)){doPrevRef.current?.();showVoiceFb('⏮ Vorheriger Track');return}
    if(t.match(/^(pause|stopp?|anhalten|halt)\s*$/)){if(playing&&audioRef.current){audioRef.current.pause();audioRef.current._shouldPlay=false;setPlaying(false);showVoiceFb('⏸ Pausiert')}return}
    if(t.match(/^(weiter ?machen|fortsetzen|resume|weiter ?spielen)\s*$/)){if(!playing&&cur&&audioRef.current){audioRef.current._shouldPlay=true;audioRef.current.play().catch(()=>{});setPlaying(true);showVoiceFb('▶ Fortgesetzt')}return}
    if(t.match(/^(lauter|louder|laut)/)){const nv=Math.min(1,volume+0.15);doVol(nv);showVoiceFb(`🔊 Lautstärke ${Math.round(nv*100)}%`);return}
    if(t.match(/^(leiser|quiet|leise)/)){const nv=Math.max(0,volume-0.15);doVol(nv);showVoiceFb(`🔉 Lautstärke ${Math.round(nv*100)}%`);return}
    if(t.match(/^(stumm|mute|ton aus)/)){doVol(0);showVoiceFb('🔇 Stumm');return}
    if(t.match(/^(shuffle|mischen|zufällig|zufall)/)){setShuffle(s=>!s);showVoiceFb(shuffle?'🔀 Shuffle aus':'🔀 Shuffle an');return}
    if(t.match(/^(wiederholen|repeat|loop)/)){cycleRepeat();showVoiceFb('🔁 Repeat gewechselt');return}
    if(t.match(/^(like|liken|herz|favorit|gefällt mir)/)){if(cur){doLike(cur.id);showVoiceFb('❤️ Geliked!')}return}

    // Everything else: try to find and play a track (with or without "spiele" prefix)
    const track=findTrack(t);
    if(track){
      setCur(track);setProgress(0);setPlaying(true);playT(track);
      showVoiceFb(`▶ ${track.title} – ${track.artist}`);
    }else{
      showVoiceFb(`🤔 "${t}" – nicht gefunden`);
    }
  };

  // Speech Recognition setup
  const startVoiceRec=(alwaysOn=false)=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){
      const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
      showVoiceFb(isIOS?'❌ Safari unterstützt keine Spracherkennung. Nutze Chrome!':'❌ Spracherkennung nicht verfügbar (nutze Chrome!)',5000);
      setVoiceActive(false);setVoiceListening(false);
      return;
    }
    if(voiceRecRef.current){voiceRecRef.current.abort();voiceRecRef.current=null}
    const rec=new SR();
    rec.lang='de-DE';rec.interimResults=true;rec.continuous=alwaysOn;rec.maxAlternatives=3;
    let wakeWordDetected=!alwaysOn;
    let cmdBuffer='';
    let lastResultTime=0;
    let silenceTimer=null;

    // Force-process after silence (fixes "keeps recording" bug)
    const startSilenceTimer=(forceCmd)=>{
      clearTimeout(silenceTimer);
      silenceTimer=setTimeout(()=>{
        if(forceCmd){
          processVoiceCmd(forceCmd.trim());
        }
        if(!alwaysOn){
          try{rec.stop()}catch{}
          setVoiceListening(false);setVoiceActive(false);setVoiceText('');
        }else{
          wakeWordDetected=false;setVoiceCmd(false);cmdBuffer='';
        }
      },alwaysOn?2500:2000);// Stop after 2s silence for push-to-talk, 2.5s for always-on commands
    };

    rec.onstart=()=>{setVoiceListening(true);if(!alwaysOn)showVoiceFb('🎤 Ich höre...')};
    rec.onresult=(e)=>{
      let transcript='';let isFinal=false;
      for(let i=e.resultIndex;i<e.results.length;i++){
        transcript+=e.results[i][0].transcript;
        if(e.results[i].isFinal)isFinal=true;
      }
      setVoiceText(transcript);
      lastResultTime=Date.now();

      if(alwaysOn&&!wakeWordDetected){
        const lower=transcript.toLowerCase();
        if(lower.includes('hey wavebox')||lower.includes('hey wave box')||lower.includes('he wavebox')||lower.includes('hei wavebox')){
          wakeWordDetected=true;setVoiceCmd(true);
          cmdBuffer=lower.replace(/.*?(hey?\s*wave\s*box)\s*/i,'').trim();
          showVoiceFb('🎤 Hey Wavebox! Was soll ich tun?');
          if(isFinal&&cmdBuffer){
            clearTimeout(silenceTimer);
            processVoiceCmd(cmdBuffer);wakeWordDetected=false;setVoiceCmd(false);cmdBuffer='';setVoiceText('');
          }else if(cmdBuffer){
            startSilenceTimer(cmdBuffer);
          }
        }
      }else{
        if(alwaysOn)cmdBuffer=transcript;
        if(isFinal){
          clearTimeout(silenceTimer);
          const cmd=alwaysOn?cmdBuffer:transcript;
          processVoiceCmd(cmd.trim());
          wakeWordDetected=!alwaysOn;setVoiceCmd(false);cmdBuffer='';setVoiceText('');
          if(!alwaysOn){try{rec.stop()}catch{};setVoiceListening(false);setVoiceActive(false)}
        }else{
          // Got interim results - start silence timer to force process if no final comes
          startSilenceTimer(alwaysOn?cmdBuffer:transcript);
        }
      }
    };
    rec.onerror=(e)=>{
      clearTimeout(silenceTimer);
      if(e.error==='no-speech'){if(!alwaysOn){showVoiceFb('🤫 Nichts gehört – nochmal versuchen');setVoiceListening(false);setVoiceActive(false)}}
      else if(e.error==='not-allowed'){showVoiceFb('❌ Mikrofon nicht erlaubt – bitte in den Browser-Einstellungen freigeben',5000);setVoiceListening(false);setVoiceActive(false);setVoiceAlwaysOn(false)}
      else if(e.error==='service-not-allowed'||e.error==='network'){showVoiceFb('❌ Spracherkennung braucht HTTPS',5000);setVoiceListening(false);setVoiceActive(false);setVoiceAlwaysOn(false)}
      else if(e.error!=='aborted'){if(alwaysOn)setTimeout(()=>{if(voiceRecRef.current===rec)try{rec.start()}catch{}},500);else{showVoiceFb('❌ Fehler: '+e.error);setVoiceListening(false);setVoiceActive(false)}}
    };
    rec.onend=()=>{
      clearTimeout(silenceTimer);
      if(alwaysOn&&voiceRecRef.current===rec){try{rec.start()}catch{setVoiceAlwaysOn(false);setVoiceListening(false)}}
      else{setVoiceListening(false);setVoiceActive(false);setVoiceCmd(false)}
    };
    voiceRecRef.current=rec;
    try{rec.start()}catch{showVoiceFb('❌ Fehler beim Starten')}
  };

  const stopVoiceRec=()=>{if(voiceRecRef.current){voiceRecRef.current.abort();voiceRecRef.current=null}setVoiceListening(false);setVoiceActive(false);setVoiceCmd(false);setVoiceText('')};

  const toggleAlwaysOn=()=>{
    if(voiceAlwaysOn){setVoiceAlwaysOn(false);stopVoiceRec();showVoiceFb('🎤 "Hey Wavebox" deaktiviert')}
    else{setVoiceAlwaysOn(true);startVoiceRec(true);showVoiceFb('🎤 "Hey Wavebox" aktiviert – ich höre!')}
  };

  const pushToTalk=()=>{
    if(voiceActive){stopVoiceRec();return}
    setVoiceActive(true);
    // Temporarily stop always-on if running
    if(voiceAlwaysOn&&voiceRecRef.current){voiceRecRef.current.abort();voiceRecRef.current=null}
    startVoiceRec(false);
    // Resume always-on after push-to-talk ends
    setTimeout(()=>{if(!voiceRecRef.current&&voiceAlwaysOn)startVoiceRec(true)},5000);
  };

  // Cleanup
  useEffect(()=>()=>{if(voiceRecRef.current){voiceRecRef.current.abort();voiceRecRef.current=null}},[]);

  const saveNew=async()=>{if(!newTrack)return;setUploading(true);try{const t=await api.uploadTrack(newTrack.file,newCover,{title:newTrack.title,artist:newTrack.artist,album:newTrack.album,genre:newTrack.genre,duration:newTrack.duration,sourceType:newTrack.sourceType});setTracks(p=>[t,...p]);setNewTrack(null);setNewCover(null);setNewCoverP(null)}catch(e){alert(e.message)}finally{setUploading(false)}};
  const delTrack=async id=>{try{await api.deleteTrack(id);setTracks(p=>p.filter(t=>t.id!==id));if(cur?.id===id){setCur(null);setPlaying(false);if(audioRef.current){audioRef.current.pause();audioRef.current._shouldPlay=false}}}catch{}};

  // YouTube downloader
  const ytFetchInfo=async()=>{if(!ytUrl.trim())return;setYtLoading(true);setYtInfo(null);try{const info=await api.ytInfo(ytUrl.trim());setYtInfo(info);setYtSelected(info.tracks.map(t=>t.id))}catch(e){alert(e.message)}finally{setYtLoading(false)}};
  const ytToggle=(id)=>setYtSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const ytImportToCatalog=async()=>{
    if(!ytInfo||ytSelected.length===0)return;
    const selected=ytInfo.tracks.filter(t=>ytSelected.includes(t.id));
    try{const r=await api.ytImportCatalog(selected);showVoiceFb(`✅ ${r.added} Songs zum Katalog hinzugefügt!`);setYtInfo(null);setYtUrl('');const d=await api.getCatalog();setCatalog(d.catalog||[])}catch(e){alert(e.message)}
  };

  // YouTube streaming
  const ytDoSearch=async()=>{if(!ytSearchQ.trim())return;setYtSearching(true);try{
    if(user?.isAdmin){
      const{results}=await api.ytSearch(ytSearchQ.trim());setYtResults(results);
    }else{
      const{results}=await api.searchCatalog(ytSearchQ.trim());setYtResults(results);
    }
    try{const{saved}=await api.ytSaved();setYtSaved(saved)}catch{}}catch{}finally{setYtSearching(false)}};

  // YouTube Music search for ALL users – filters by duration matching Spotlight
  const ytDoMusicSearch=async()=>{
    if(!ytMusicQ.trim())return;
    setYtMusicSearching(true);setYtMusicFilterInfo(null);setYtMusicResults([]);
    try{
      const spotDur=cur?.duration||0;
      const data=await api.ytSearchMusic(ytMusicQ.trim(),spotDur);
      setYtMusicResults(data.results||[]);
      setYtMusicFilterInfo({total:data.totalFound||0,nonMusic:data.filteredNonMusic||0,byDuration:data.filteredByDuration||0,spotlight:data.spotlightDuration||0});
    }catch(e){setYtMusicResults([]);showVoiceFb('❌ Suche fehlgeschlagen')}
    finally{setYtMusicSearching(false)}
  };

  const ytPlayMusicStream=async(item)=>{
    setYtMusicStreaming(item.ytId);setBuffering(true);
    try{
      const{streamUrl}=await api.ytStream(item.ytId);
      const t={id:'yt-'+item.ytId,ytId:item.ytId,title:item.title,artist:item.artist,album:item.album||'',duration:item.duration||0,coverUrl:item.thumbnail,audioUrl:streamUrl,isStream:true};
      setCur(t);setProgress(0);setPlaying(true);
      const a=audioRef.current;
      if(a){a.src=streamUrl;a.volume=volume;a._id=t.id;a._shouldPlay=true;
        a.play().then(()=>{setBuffering(false);setPlaying(true)}).catch(e=>{
          if(e.name!=='AbortError'){const retry=()=>{if(a._shouldPlay&&a._id===t.id&&a.paused)a.play().catch(()=>{})};a.addEventListener('canplaythrough',retry,{once:true})}
        });
      }
    }catch(e){showVoiceFb('❌ Stream nicht verfügbar');setBuffering(false)}
    setYtMusicStreaming(null);
  };
  const ytSearchCatalog=async(q)=>{if(!q)return;setYtSearching(true);try{const{results}=await api.searchCatalog(q);setYtResults(results)}catch{}finally{setYtSearching(false)}};
  const ytPlayStream=async(item)=>{
    setYtStreaming(item.ytId);setBuffering(true);
    try{
      const{streamUrl}=await api.ytStream(item.ytId);
      const t={id:'yt-'+item.ytId,ytId:item.ytId,title:item.title,artist:item.artist,album:item.album||'',duration:item.duration||0,coverUrl:item.thumbnail,audioUrl:streamUrl,isStream:true};
      setCur(t);setProgress(0);setPlaying(true);
      const a=audioRef.current;if(a){a.src=streamUrl;a.volume=volume;a._id=t.id;a._shouldPlay=true;a.play().then(()=>{setBuffering(false);setPlaying(true)}).catch(e=>{if(e.name!=='AbortError'){const retry=()=>{if(a._shouldPlay&&a._id===t.id&&a.paused)a.play().catch(()=>{})};a.addEventListener('canplaythrough',retry,{once:true})}})}
    }catch(e){showVoiceFb('❌ Stream nicht verfügbar');setBuffering(false)}
    setYtStreaming(null);
  };
  useEffect(()=>{autoPlayRecRef.current=ytPlayStream});
  const ytDoSave=async(item)=>{
    setYtSaving(s=>({...s,[item.ytId]:true}));
    try{
      await api.ytSave({ytId:item.ytId,title:item.title,artist:item.artist,album:item.album,duration:item.duration,thumbnail:item.thumbnail});
      setYtSaved(s=>[...s,item.ytId]);
      showVoiceFb(`💾 "${item.title}" wird gespeichert...`);
      // Refresh tracks after a delay to pick up the downloaded track
      setTimeout(()=>refresh(),8000);
    }catch(e){showVoiceFb('❌ Fehler beim Speichern')}
    setYtSaving(s=>({...s,[item.ytId]:false}));
  };
  const ytDeleteSaved=async(trackId)=>{try{await api.deleteYtTrack(trackId);refresh();showVoiceFb('🗑️ Download entfernt')}catch{}};

  const ft=sq?catalog.filter(t=>t.title.toLowerCase().includes(sq.toLowerCase())||t.artist.toLowerCase().includes(sq.toLowerCase())||(t.album&&t.album.toLowerCase().includes(sq.toLowerCase()))||(t.genre&&t.genre.toLowerCase().includes(sq.toLowerCase()))):catalog;
  const genres=[...new Set(catalog.map(t=>t.genre).filter(Boolean))];const recent=[...catalog].sort((a,b)=>(b.addedAt||0)-(a.addedAt||0)).slice(0,8);const artists=[...new Set(catalog.map(t=>t.artist))];

  return<div onClick={()=>{if(addToPlMenu)setAddToPlMenu(null)}} style={{display:"flex",flexDirection:"column",height:"100vh",background:"#0a0a0f",color:"#e8e6e3",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",overflow:"hidden",position:"relative"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{margin:0;background:#0a0a0f}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}.track-row:hover{background:rgba(255,255,255,0.06)!important}.track-row:hover .track-num{opacity:0!important}.track-row:hover .track-play-btn{opacity:1!important}.nav-btn{transition:all .2s;cursor:pointer;border:none;background:none;color:#777;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 12px;font-size:10px;font-family:'DM Sans',system-ui}.nav-btn:hover,.nav-btn.active{color:#ff3c6f}.nav-btn.active::after{content:'';width:4px;height:4px;background:#ff3c6f;border-radius:50%}.genre-pill{padding:10px 20px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#aaa;white-space:nowrap}.genre-pill:hover{background:rgba(255,60,111,0.15);border-color:rgba(255,60,111,0.3);color:#ff3c6f}.ctrl-btn{background:none;border:none;color:#888;cursor:pointer;padding:6px;display:flex;align-items:center;justify-content:center;transition:color .2s,transform .15s;border-radius:50%}.ctrl-btn:hover{color:#fff;transform:scale(1.1)}.ctrl-btn.active{color:#ff3c6f}.play-main{width:44px;height:44px;border-radius:50%;background:#ff3c6f;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .2s}.play-main:hover{transform:scale(1.08);box-shadow:0 0 20px rgba(255,60,111,0.4)}.admin-input,.auth-input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 16px;color:#e8e6e3;font-size:14px;width:100%;outline:none;transition:border-color .2s;font-family:'DM Sans',system-ui}.admin-input:focus,.auth-input:focus{border-color:#ff3c6f;box-shadow:0 0 0 3px rgba(255,60,111,0.1)}.admin-input::placeholder,.auth-input::placeholder{color:#555}.auth-submit-btn{width:100%;background:linear-gradient(135deg,#ff3c6f,#ff6b35);border:none;color:#fff;padding:14px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:'DM Sans',system-ui}.upload-btn{background:linear-gradient(135deg,#ff3c6f,#ff6b35);border:none;color:#fff;padding:12px 28px;border-radius:24px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',system-ui}.upload-btn:disabled{opacity:0.4;cursor:not-allowed}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .4s ease}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}.now-playing-cover{animation:pulse 2s ease-in-out infinite}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes modalSlide{from{opacity:0;transform:scale(0.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes voicePulse{0%,100%{box-shadow:0 0 0 0 rgba(255,60,111,0.4)}50%{box-shadow:0 0 0 12px rgba(255,60,111,0)}}@keyframes voiceWave{0%,100%{height:4px}50%{height:16px}}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}select option{background:#1a1a2e}textarea{font-family:'DM Sans',system-ui}.vol-slider{width:70px;height:20px;-webkit-appearance:none;appearance:none;background:transparent;outline:none;cursor:pointer}.vol-slider::-webkit-slider-runnable-track{height:3px;background:rgba(255,255,255,0.1);border-radius:2px}.vol-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:#ff3c6f;margin-top:-4.5px;cursor:pointer}.vol-slider::-moz-range-track{height:3px;background:rgba(255,255,255,0.1);border-radius:2px;border:none}.vol-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#ff3c6f;border:none;cursor:pointer}`}</style>

    {showAuth&&<AuthModal onClose={()=>{setShowAuth(false);pa.current=null}} onLogin={doLogin} onRegister={doReg} reason={authReason} err={authErr}/>}
    {editingTrack&&<TrackEditor track={editingTrack} onClose={()=>{setEditingTrack(null)}} onSave={()=>{}} onRefresh={async()=>{const t=await api.getTracks();setTracks(t);const updated=t.find(x=>x.id===editingTrack.id);if(updated)setEditingTrack(updated);}}/>}
    {showLyrics&&cur?.lyrics&&<LyricsView lyrics={cur.lyrics} progress={progress} track={cur} onClose={()=>setShowLyrics(false)}/>}

    {/* Fullscreen Now Playing */}
    {showFullPlayer&&cur&&<div style={{position:"fixed",inset:0,zIndex:40,background:"rgba(5,5,10,0.98)",backdropFilter:"blur(40px)",display:"flex",flexDirection:"column",animation:"fadeIn 0.4s ease",overflow:"auto"}}>
      {/* Blurred background */}
      <div style={{position:"absolute",inset:0,background:cur.coverUrl?`url(${cur.coverUrl}) center/cover`:getCG(cur.id),opacity:0.15,filter:"blur(80px)",pointerEvents:"none"}}/>
      
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"20px 30px",maxWidth:500,margin:"0 auto",width:"100%"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <button onClick={()=>setShowFullPlayer(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:20,padding:"8px 16px",color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}><I.Down/> Schließen</button>
          <p style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:2}}>Läuft gerade</p>
          <div style={{width:80}}/>
        </div>
        
        {/* Cover */}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}}>
          <div style={{width:"min(300px, 70vw)",height:"min(300px, 70vw)"}}>
            <Cover track={cur} size={300}/>
          </div>
        </div>
        
        {/* Track info */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{minWidth:0,flex:1}}>
              <h2 style={{fontSize:22,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cur.title}</h2>
              <p style={{fontSize:15,color:"#888",marginTop:4}}>{cur.artist}{cur.album?` · ${cur.album}`:""}</p>
            </div>
            <button className="ctrl-btn" onClick={()=>doLike(cur.id)} style={{color:likes[cur.id]?"#ff3c6f":"#555",transform:"scale(1.3)"}}><I.Heart/></button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:24}}>
          <div onClick={e=>{const r=e.currentTarget.getBoundingClientRect();const t=Math.floor(((e.clientX-r.left)/r.width)*cur.duration);setProgress(t);if(cur.audioUrl&&audioRef.current)audioRef.current.currentTime=t}} style={{height:28,display:"flex",alignItems:"center",cursor:"pointer"}}>
            <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,position:"relative",pointerEvents:"none"}}>
              <div style={{width:`${(progress/(cur.duration||1))*100}%`,height:"100%",background:"linear-gradient(90deg,#ff3c6f,#ff6b35)",borderRadius:2,pointerEvents:"none",position:"relative"}}>
                <div style={{position:"absolute",right:-7,top:-5,width:14,height:14,borderRadius:"50%",background:"#fff",boxShadow:"0 0 8px rgba(255,60,111,0.6)",pointerEvents:"none"}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:11,color:"#666",fontFamily:"'Space Mono',monospace"}}>{fmtTime(progress)}</span>
            <span style={{fontSize:11,color:"#666",fontFamily:"'Space Mono',monospace"}}>{fmtTime(cur.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginBottom:24}}>
          <button className={`ctrl-btn ${shuffle?"active":""}`} onClick={()=>setShuffle(!shuffle)} style={{transform:"scale(1.2)"}}><I.Shuf/></button>
          <button className="ctrl-btn" onClick={doPrev} style={{transform:"scale(1.3)"}}><I.SkipP/></button>
          <button onClick={()=>doPlay(cur)} style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#ff3c6f,#ff6b35)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(255,60,111,0.4)"}}>{buffering?<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>:playing?<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>:<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}</button>
          <button className="ctrl-btn" onClick={doNext} style={{transform:"scale(1.3)"}}><I.SkipN/></button>
          <button className={`ctrl-btn ${repeat!=='off'?"active":""}`} onClick={cycleRepeat} style={{transform:"scale(1.2)"}}>{repeat==='one'?<I.Rep1/>:<I.Rep/>}</button>
        </div>

        {/* Volume */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
          <button className="ctrl-btn" style={{color:"#888"}}><I.Vol/></button>
          <input type="range" className="vol-slider" style={{width:180}} min="0" max="1" step="0.01" value={volume} onChange={e=>doVol(parseFloat(e.target.value))}/>
        </div>

        {/* Stream save hint */}
        {cur.isStream&&<p style={{textAlign:"center",fontSize:11,color:"#666",marginBottom:12}}>❤️ = Dauerhaft auf Server speichern</p>}

        {/* Lyrics + voice buttons */}
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>

        {/* Recommendations in fullscreen */}
        {recommendations.length>0&&<div style={{width:"100%",marginTop:12}}>
          <p style={{fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:10,textAlign:"center"}}>Als Nächstes</p>
          {recommendations.map(r=><div key={r.ytId} onClick={()=>{ytPlayStream(r);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.05)",marginBottom:6,transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
            {r.thumbnail?<div style={{width:44,height:44,borderRadius:6,backgroundImage:`url(${r.thumbnail})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>:<div style={{width:44,height:44,borderRadius:6,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Mus/></div>}
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p>
              <p style={{fontSize:11,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.artist}{r.duration?` · ${fmtTime(r.duration)}`:''}</p>
            </div>
            <div style={{color:"#555",flexShrink:0}}><I.Play/></div>
          </div>)}
        </div>}
          {cur.lyrics&&<button onClick={()=>{setShowFullPlayer(false);setShowLyrics(true)}} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(100,200,255,0.08)",border:"1px solid rgba(100,200,255,0.2)",borderRadius:20,padding:"10px 24px",color:"#6bc8ff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}><I.Lyrics/> Lyrics</button>}
          <button onClick={pushToTalk} style={{display:"flex",alignItems:"center",gap:8,background:voiceActive?"rgba(255,60,111,0.15)":"rgba(255,255,255,0.06)",border:voiceActive?"1px solid rgba(255,60,111,0.3)":"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"10px 24px",color:voiceActive?"#ff3c6f":"#aaa",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",animation:voiceActive?"voicePulse 1s infinite":"none"}}><I.Mic/> {voiceActive?"Höre...":"Sprachbefehl"}</button>
        </div>
      </div>
    </div>}
    {cur&&<div style={{position:"fixed",top:-100,left:-100,right:-100,bottom:-100,background:cur.coverUrl?`url(${cur.coverUrl}) center/cover`:getCG(cur.id),opacity:cur.coverUrl?0.08:0.06,filter:"blur(100px)",pointerEvents:"none",transition:"all 1s",zIndex:0}}/>}

    {/* Voice Feedback Toast */}
    {voiceFeedback&&<div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:60,background:"rgba(15,15,25,0.95)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:16,padding:"12px 24px",display:"flex",alignItems:"center",gap:10,animation:"slideUp 0.3s ease",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",maxWidth:"90vw"}}>
      <p style={{fontSize:14,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{voiceFeedback}</p>
    </div>}

    {/* Voice Listening Overlay (Push-to-Talk) */}
    {voiceActive&&<div style={{position:"fixed",bottom:cur?200:100,left:"50%",transform:"translateX(-50%)",zIndex:55,animation:"slideUp 0.3s ease"}}>
      <div style={{background:"rgba(15,15,25,0.95)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,60,111,0.3)",borderRadius:20,padding:"16px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:"0 8px 40px rgba(255,60,111,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,height:24}}>{[1,2,3,4,5,4,3,2,1].map((h,i)=><div key={i} style={{width:3,background:"#ff3c6f",borderRadius:2,animation:`voiceWave ${0.4+i*0.08}s ease-in-out infinite`,animationDelay:`${i*0.05}s`}}/>)}</div>
        <p style={{fontSize:13,color:voiceText?"#e8e6e3":"#888",fontWeight:500,maxWidth:280,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{voiceText||'Sag deinen Befehl...'}</p>
        <p style={{fontSize:10,color:"#555"}}>z.B. "Spiele [Titel] von [Künstler]"</p>
      </div>
    </div>}

    {/* Always-On Indicator */}
    {voiceAlwaysOn&&!voiceActive&&<div style={{position:"fixed",top:56,right:16,zIndex:55,display:"flex",alignItems:"center",gap:6,background:"rgba(255,60,111,0.1)",border:"1px solid rgba(255,60,111,0.15)",borderRadius:20,padding:"4px 12px 4px 8px",fontSize:10,color:"#ff3c6f",fontWeight:600}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:"#ff3c6f",animation:"pulse 2s infinite"}}/>
      {voiceCmd?'Befehl...':'Hey Wavebox'}
    </div>}

    <div style={{flex:1,overflow:"auto",paddingBottom:cur?(recommendations.length>0?240:190):70,position:"relative",zIndex:1}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",position:"sticky",top:0,zIndex:10,background:"linear-gradient(to bottom,#0a0a0f 60%,transparent)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#ff3c6f,#ff6b35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>♫</div><span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,fontSize:16}}>WAVEBOX</span><span style={{fontSize:9,color:"#555"}}>v12</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"6px 14px",gap:8,border:"1px solid rgba(255,255,255,0.06)",width:view==="search"?200:140,transition:"width 0.3s"}}><I.Srch/><input type="text" placeholder={searchMode==='youtube'&&view==='search'?"YouTube...":"Suche..."} value={view==='search'&&searchMode==='youtube'?ytSearchQ:sq} onChange={e=>{if(view==='search'&&searchMode==='youtube'){setYtSearchQ(e.target.value)}else{setSq(e.target.value);if(e.target.value)setView("search")}}} onFocus={()=>setView("search")} onKeyDown={e=>{if(e.key==='Enter'&&view==='search'&&searchMode==='youtube')ytDoSearch()}} style={{background:"none",border:"none",color:"#e8e6e3",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"}}/></div>
        {user?<div style={{display:"flex",alignItems:"center",gap:6}}>
          {/* Always-On Toggle */}
          <button onClick={toggleAlwaysOn} title={voiceAlwaysOn?'"Hey Wavebox" aus':'"Hey Wavebox" an'} style={{width:32,height:32,borderRadius:"50%",border:voiceAlwaysOn?"2px solid rgba(255,60,111,0.5)":"1px solid rgba(255,255,255,0.1)",background:voiceAlwaysOn?"rgba(255,60,111,0.15)":"rgba(255,255,255,0.06)",color:voiceAlwaysOn?"#ff3c6f":"#666",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s",animation:voiceAlwaysOn&&voiceListening?"voicePulse 2s infinite":"none",fontSize:10}}>{voiceAlwaysOn?<I.Mic/>:<I.MicOff/>}</button>
          {/* Push-to-Talk */}
          <button onClick={pushToTalk} title="Sprachbefehl" style={{width:32,height:32,borderRadius:"50%",border:voiceActive?"2px solid rgba(255,60,111,0.6)":"1px solid rgba(255,255,255,0.1)",background:voiceActive?"rgba(255,60,111,0.2)":"rgba(255,255,255,0.06)",color:voiceActive?"#ff3c6f":"#888",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s",animation:voiceActive?"voicePulse 1s infinite":"none"}}><I.Mic/></button>
          <div onClick={()=>{setView("profile");setSq("")}} style={{width:32,height:32,borderRadius:"50%",cursor:"pointer",background:user.isAdmin?"linear-gradient(135deg,#ff3c6f,#ff6b35)":`linear-gradient(135deg,hsl(${(user.name.charCodeAt(0)*37)%360},60%,40%),hsl(${(user.name.charCodeAt(0)*137)%360},50%,30%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,border:user.isAdmin?"2px solid rgba(255,60,111,0.5)":"2px solid rgba(255,255,255,0.1)"}}>{user.name[0].toUpperCase()}</div>
        </div>:<div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={pushToTalk} title="Sprachbefehl" style={{width:32,height:32,borderRadius:"50%",border:voiceActive?"2px solid rgba(255,60,111,0.6)":"1px solid rgba(255,255,255,0.1)",background:voiceActive?"rgba(255,60,111,0.2)":"rgba(255,255,255,0.06)",color:voiceActive?"#ff3c6f":"#888",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s",animation:voiceActive?"voicePulse 1s infinite":"none"}}><I.Mic/></button>
          <button onClick={()=>{setAuthReason(null);setAuthErr("");setShowAuth(true)}} style={{background:"rgba(255,60,111,0.12)",border:"1px solid rgba(255,60,111,0.25)",borderRadius:20,padding:"6px 14px",color:"#ff3c6f",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>Anmelden</button>
        </div>}</div>
      </div>

      <div style={{padding:"0 20px 20px"}}>
        {/* HOME */}
        {view==="home"&&!selectedArtist&&<div className="fade-in">
          <div style={{background:"linear-gradient(135deg,rgba(255,60,111,0.15),rgba(255,107,53,0.1))",borderRadius:16,padding:"28px 24px",marginBottom:28,border:"1px solid rgba(255,60,111,0.1)"}}><p style={{color:"#ff3c6f",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{user?`Hallo, ${user.name}!`:"Willkommen bei"}</p><h1 style={{fontSize:28,fontWeight:700,marginBottom:6,background:"linear-gradient(135deg,#fff,#ff3c6f)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>WAVEBOX</h1><p style={{color:"#888",fontSize:14}}>{user?"Entdecke Tracks.":"Dein Musik-Stream."}</p></div>

          {/* Top 8 Alben */}
          {(()=>{const albums=[...new Set(catalog.filter(c=>c.album).map(c=>c.album))].slice(0,8);return albums.length>0&&<><h2 style={{fontSize:18,fontWeight:600,marginBottom:14}}>Top Alben</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:12,marginBottom:32}}>{albums.map((al,i)=>{const albumSongs=catalog.filter(c=>c.album===al);const thumb=albumSongs.find(s=>s.thumbnail)?.thumbnail;const artist=albumSongs[0]?.artist;return<div key={al} onClick={()=>{setSq(al);setView("search")}} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,cursor:"pointer",transition:"all 0.25s",border:"1px solid rgba(255,255,255,0.04)",animation:`slideUp 0.4s ease ${i*0.06}s both`}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateY(0)"}}>{thumb?<div style={{width:"100%",aspectRatio:"1",borderRadius:6,backgroundImage:`url(${thumb})`,backgroundSize:"cover",backgroundPosition:"center"}}/>:<div style={{width:"100%",aspectRatio:"1",borderRadius:6,background:`linear-gradient(135deg,hsl(${(al.charCodeAt(0)*47)%360},50%,30%),hsl(${(al.charCodeAt(0)*127)%360},40%,20%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}><I.Mus/></div>}<p style={{marginTop:10,fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{al}</p><p style={{fontSize:11,color:"#777",marginTop:2}}>{artist}</p></div>})}</div></>})()}

          {/* Top 8 Künstler */}
          {(()=>{const artList=[...new Set(catalog.map(c=>c.artist))].slice(0,8);return artList.length>0&&<><h2 style={{fontSize:18,fontWeight:600,marginBottom:14}}>Top Künstler</h2><div style={{display:"flex",gap:16,overflowX:"auto",marginBottom:32,paddingBottom:4}}>{artList.map(a=>{const thumb=catalog.find(c=>c.artist===a&&c.thumbnail)?.thumbnail;return<div key={a} onClick={()=>{setSq(a);setView("search")}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"pointer",flexShrink:0,minWidth:80}}>{thumb?<div style={{width:64,height:64,borderRadius:"50%",backgroundImage:`url(${thumb})`,backgroundSize:"cover",backgroundPosition:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}/>:<div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,hsl(${(a.charCodeAt(0)*37)%360},60%,40%),hsl(${(a.charCodeAt(0)*137)%360},50%,25%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{a[0]}</div>}<span style={{fontSize:12,fontWeight:500,color:"#aaa",textAlign:"center",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a}</span></div>})}</div></>})()}

          {/* Top 6 Songs nach playCounts */}
          {(()=>{const top6=[...catalog].sort((a,b)=>(playCounts[b.ytId]||playCounts[b.id]||0)-(playCounts[a.ytId]||playCounts[a.id]||0)).slice(0,6);return top6.length>0&&<><h2 style={{fontSize:18,fontWeight:600,marginBottom:14}}>Top Songs</h2>{top6.map(r=><div key={r.id} onClick={()=>{ytPlayStream(r);setSq('')}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:10,cursor:"pointer",transition:"background 0.2s",background:cur?.ytId===r.ytId?"rgba(255,60,111,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background=cur?.ytId===r.ytId?"rgba(255,60,111,0.08)":"transparent"}>{r.thumbnail?<div style={{width:48,height:48,borderRadius:6,backgroundImage:`url(${r.thumbnail})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>:<div style={{width:48,height:48,borderRadius:6,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Mus/></div>}<div style={{flex:1,minWidth:0}}><p style={{fontSize:14,fontWeight:cur?.ytId===r.ytId?600:400,color:cur?.ytId===r.ytId?"#ff3c6f":"#e8e6e3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p><p style={{fontSize:12,color:"#777"}}>{r.artist}{r.album?` · ${r.album}`:''}</p></div><span style={{fontSize:11,color:"#555",fontFamily:"'Space Mono',monospace"}}>{fmtTime(r.duration)}</span></div>)}</>})()}

          {catalog.length===0&&<div style={{textAlign:"center",padding:40,color:"#555"}}><I.Mus/><p style={{marginTop:12}}>Noch keine Songs verfügbar.</p></div>}
        </div>}

                {/* LIBRARY */}
        {view==="library"&&!selectedArtist&&<div className="fade-in"><h2 style={{fontSize:22,fontWeight:700,marginBottom:6}}>Bibliothek</h2><p style={{color:"#666",fontSize:13,marginBottom:24}}>{tracks.length} Tracks</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 style={{fontSize:15,fontWeight:600,color:"#aaa"}}>Playlisten</h3><button onClick={()=>rAuth("playlist",()=>setShowNP(true))} style={{background:"rgba(255,60,111,0.1)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:20,padding:"6px 14px",color:"#ff3c6f",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>+ Neu</button></div>
          {showNP&&user&&<div style={{display:"flex",gap:8,marginBottom:16}}><input className="auth-input" placeholder="Name..." value={npName} onChange={e=>setNpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doPL()} style={{flex:1}} autoFocus/><button className="upload-btn" onClick={doPL} style={{padding:"10px 20px"}}>OK</button><button onClick={()=>setShowNP(false)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 14px",color:"#888",cursor:"pointer"}}><I.X/></button></div>}
          {pls.length>0?<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28}}>{pls.map(p=>{const plTracks=p.trackIds?p.trackIds.map(id=>tracks.find(t=>t.id===id)).filter(Boolean):[];return<div key={p.id}>
            <div onClick={()=>setViewingPlaylist(viewingPlaylist?.id===p.id?null:p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,background:viewingPlaylist?.id===p.id?"rgba(255,60,111,0.08)":"rgba(255,255,255,0.03)",border:viewingPlaylist?.id===p.id?"1px solid rgba(255,60,111,0.15)":"1px solid rgba(255,255,255,0.05)",cursor:"pointer",transition:"all 0.2s"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:8,background:"linear-gradient(135deg,rgba(255,60,111,0.3),rgba(255,107,53,0.2))",display:"flex",alignItems:"center",justifyContent:"center",color:"#ff3c6f"}}><I.PL/></div><div><p style={{fontSize:14,fontWeight:500}}>{p.name}</p><p style={{fontSize:11,color:"#666"}}>{plTracks.length} {plTracks.length===1?"Track":"Tracks"}</p></div></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {plTracks.length>0&&<button onClick={e=>{e.stopPropagation();playPlaylist(p)}} style={{background:"rgba(255,60,111,0.12)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:20,padding:"5px 12px",color:"#ff3c6f",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><I.Play/> Abspielen</button>}
                {user&&(user.isAdmin||user.email===p.createdBy)&&<button onClick={e=>{e.stopPropagation();delPL(p.id)}} style={{background:"rgba(255,60,60,0.08)",border:"1px solid rgba(255,60,60,0.15)",borderRadius:6,padding:"5px 8px",color:"#ff5555",cursor:"pointer"}}><I.Del/></button>}
              </div>
            </div>
            {viewingPlaylist?.id===p.id&&<div style={{padding:"8px 0 8px 20px",animation:"fadeIn 0.3s"}}>
              {plTracks.length>0?<TrackList tracks={plTracks} cur={cur} playing={playing} onPlay={doPlay} likes={likes} onLike={doLike} buffering={buffering} onRemoveFromPl={removeFromPL} playlistId={p.id}/>:<p style={{fontSize:12,color:"#555",padding:"12px 0"}}>Keine Tracks – füge welche über das + bei einem Track hinzu!</p>}
            </div>}
          </div>})}</div>:<div style={{padding:20,borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.08)",textAlign:"center",marginBottom:28}}><p style={{color:"#555",fontSize:13}}>Keine Playlisten</p></div>}
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:"#aaa"}}>Künstler</h3><div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:28}}>{artists.map(a=><div key={a} onClick={()=>setSelectedArtist(a)} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",borderRadius:24,padding:"8px 16px 8px 8px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.05)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}><ArtistAvatar name={a} artistData={artistData} size={32}/><span style={{fontSize:13,fontWeight:500}}>{a}</span></div>)}</div>
          {Object.values(likes).some(Boolean)&&user&&<><h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:"#ff3c6f"}}>♥ Favoriten</h3><TrackList tracks={tracks.filter(t=>likes[t.id])} cur={cur} playing={playing} onPlay={doPlay} likes={likes} onLike={doLike} buffering={buffering} pls={pls} onAddToPl={addToPL} addToPlMenu={addToPlMenu} setAddToPlMenu={setAddToPlMenu}/><div style={{height:24}}/></>}
          
          {/* Downloads from YouTube */}
          {tracks.some(t=>t.sourceType==='youtube')&&<>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:"#ff4444",display:"flex",alignItems:"center",gap:8}}><I.Save/> Downloads ({tracks.filter(t=>t.sourceType==='youtube').length})</h3>
            <div style={{marginBottom:24}}>
              {tracks.filter(t=>t.sourceType==='youtube').map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div onClick={()=>doPlay(t)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                  <Cover track={t} size={40}/>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:cur?.id===t.id?600:400,color:cur?.id===t.id?"#ff3c6f":"#e8e6e3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                    <p style={{fontSize:11,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.artist}</p>
                  </div>
                </div>
                <span style={{fontSize:11,color:"#555",fontFamily:"'Space Mono',monospace",flexShrink:0}}>{fmtTime(t.duration)}</span>
                <button onClick={()=>{if(confirm(`"${t.title}" wirklich löschen?`))ytDeleteSaved(t.id)}} className="ctrl-btn" style={{color:"#ff5555",flexShrink:0}} title="Download löschen"><I.Del/></button>
              </div>)}
            </div>
          </>}

          <h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:"#aaa"}}>Alle Tracks</h3><TrackList tracks={tracks} cur={cur} playing={playing} onPlay={doPlay} likes={likes} onLike={doLike} buffering={buffering} pls={pls} onAddToPl={addToPL} addToPlMenu={addToPlMenu} setAddToPlMenu={setAddToPlMenu}/></div>}

        {/* SEARCH */}
        {view==="search"&&!selectedArtist&&<div className="fade-in">
          {/* Search mode tabs */}
          <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(255,255,255,0.03)",borderRadius:12,padding:4}}>
            <button onClick={()=>setSearchMode('local')} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:searchMode==='local'?"rgba(255,60,111,0.15)":"transparent",color:searchMode==='local'?"#ff3c6f":"#666",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><I.Mus/> Bibliothek</button>
            <button onClick={()=>setSearchMode('youtube')} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:searchMode==='youtube'?"rgba(255,0,0,0.12)":"transparent",color:searchMode==='youtube'?"#ff4444":"#666",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><I.YT/> Streaming</button>
          </div>

          {searchMode==='local'?<>
            <h2 style={{fontSize:22,fontWeight:700,marginBottom:20}}>{sq?`"${sq}"`:"Suche"}</h2>
            {sq?(ft.length>0?<TrackList tracks={ft} cur={cur} playing={playing} onPlay={doPlay} likes={likes} onLike={doLike} buffering={buffering} pls={pls} onAddToPl={addToPL} addToPlMenu={addToPlMenu} setAddToPlMenu={setAddToPlMenu}/>:<p style={{color:"#666"}}>Nichts gefunden.</p>):<p style={{color:"#555"}}>Suchbegriff...</p>}
          </>:<>
            {/* ── YouTube Music Suche für ALLE User ── */}
            <div style={{background:"rgba(255,60,111,0.05)",border:"1px solid rgba(255,60,111,0.15)",borderRadius:14,padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <I.Mus/>
                <span style={{fontSize:14,fontWeight:700,color:"#ff3c6f"}}>YouTube Music</span>
                <span style={{fontSize:10,color:"#888",marginLeft:"auto"}}>Nur Lieder · Keine Videos</span>
              </div>

              {/* Spotlight-Filter-Badge */}
              {cur&&cur.duration>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{width:32,height:32,borderRadius:4,backgroundImage:cur.coverUrl?`url(${cur.coverUrl})`:'none',backgroundSize:"cover",backgroundPosition:"center",background:cur.coverUrl?undefined:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{!cur.coverUrl&&<I.Mus/>}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:11,color:"#aaa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🎯 Spotlight: <b style={{color:"#ff3c6f"}}>{cur.title}</b></p>
                  <p style={{fontSize:10,color:"#666"}}>Erlaubt: {fmtTime(cur.duration-1)} – {fmtTime(cur.duration+3)} · Abweichung -1s bis +3s</p>
                </div>
                <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"#ff3c6f",fontWeight:700,flexShrink:0}}>{fmtTime(cur.duration)}</span>
              </div>}
              {!cur&&<p style={{fontSize:11,color:"#666",marginBottom:10}}>💡 Spiele einen Song → Suche findet nur Songs mit gleicher Länge (±3s)</p>}

              <div style={{display:"flex",gap:8}}>
                <input className="admin-input" placeholder="Künstler oder Titel suchen..." value={ytMusicQ} onChange={e=>setYtMusicQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ytDoMusicSearch()} style={{flex:1,fontSize:14,padding:"11px 14px",borderRadius:12}}/>
                <button onClick={ytDoMusicSearch} disabled={ytMusicSearching||!ytMusicQ.trim()} style={{background:"linear-gradient(135deg,#ff3c6f,#ff6b35)",border:"none",borderRadius:12,padding:"11px 18px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",opacity:ytMusicSearching?0.6:1}}>
                  {ytMusicSearching?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>:"Suchen"}
                </button>
              </div>

              {/* Filter-Info */}
              {ytMusicFilterInfo&&<div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:10,background:"rgba(68,200,100,0.12)",color:"#44cc66",padding:"3px 8px",borderRadius:6,fontWeight:600}}>✓ {ytMusicResults.length} Treffer</span>
                {ytMusicFilterInfo.nonMusic>0&&<span style={{fontSize:10,background:"rgba(255,60,60,0.1)",color:"#ff6666",padding:"3px 8px",borderRadius:6}}>✗ {ytMusicFilterInfo.nonMusic} Videos/Alben gefiltert</span>}
                {ytMusicFilterInfo.byDuration>0&&<span style={{fontSize:10,background:"rgba(255,107,53,0.1)",color:"#ff9955",padding:"3px 8px",borderRadius:6}}>✗ {ytMusicFilterInfo.byDuration} falsche Länge</span>}
                {ytMusicFilterInfo.spotlight>0&&<span style={{fontSize:10,background:"rgba(255,60,111,0.1)",color:"#ff3c6f",padding:"3px 8px",borderRadius:6}}>🎯 Spotlight aktiv</span>}
              </div>}
            </div>

            {/* YouTube Music Ergebnisse */}
            {ytMusicResults.length>0&&<div style={{marginBottom:20}}>
              {ytMusicResults.map(r=>{const isPlaying=cur?.ytId===r.ytId&&playing;const isCurrent=cur?.ytId===r.ytId;const isLoading=ytMusicStreaming===r.ytId;return<div key={r.ytId} onClick={()=>!isLoading&&ytPlayMusicStream(r)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:10,cursor:"pointer",transition:"background 0.2s",background:isCurrent?"rgba(255,60,111,0.08)":"transparent"}} onMouseEnter={e=>{if(!isCurrent)e.currentTarget.style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!isCurrent)e.currentTarget.style.background="transparent"}}>
                <div style={{width:50,height:50,borderRadius:6,backgroundImage:r.thumbnail?`url(${r.thumbnail})`:'none',backgroundSize:"cover",backgroundPosition:"center",flexShrink:0,position:"relative",background:r.thumbnail?undefined:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {!r.thumbnail&&<I.Mus/>}
                  {(isLoading||isCurrent)&&<div style={{position:"absolute",inset:0,borderRadius:6,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isLoading?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3c6f" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    :isPlaying?<span style={{display:"flex",gap:1,alignItems:"flex-end",height:12}}>{[1,2,3].map(b=><span key={b} style={{display:"block",width:2.5,height:4+b*3,background:"#ff3c6f",borderRadius:1,animation:`pulse ${0.35+b*0.12}s ease-in-out infinite`}}/>)}</span>
                    :<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
                  </div>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:isCurrent?600:400,color:isCurrent?"#ff3c6f":"#e8e6e3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p>
                  <p style={{fontSize:12,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.artist}{r.album?` · ${r.album}`:''}</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                  <span style={{fontSize:11,color:isCurrent?"#ff3c6f":"#555",fontFamily:"'Space Mono',monospace",fontWeight:isCurrent?600:400}}>{fmtTime(r.duration)}</span>
                  {cur&&cur.duration>0&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:"rgba(68,200,100,0.12)",color:"#44cc66",fontWeight:600}}>✓ passt</span>}
                </div>
                {user?.isAdmin&&!catalog.find(c=>c.ytId===r.ytId)&&<button onClick={e=>{e.stopPropagation();setYtAddForm({ytId:r.ytId,title:r.title,artist:r.artist,album:r.album||'',genre:'Pop',duration:r.duration,thumbnail:r.thumbnail})}} style={{background:"rgba(255,60,111,0.1)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:8,padding:"5px 9px",color:"#ff3c6f",cursor:"pointer",flexShrink:0,fontSize:10,fontWeight:600,fontFamily:"inherit"}} title="Zum Katalog">+</button>}
              </div>})}
            </div>}

            {ytMusicSearching&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:30,gap:10}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3c6f" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
              <span style={{color:"#888",fontSize:13}}>Suche auf YouTube Music... (Cover + Alben)</span>
            </div>}

            {!ytMusicSearching&&ytMusicQ&&ytMusicResults.length===0&&ytMusicFilterInfo&&<div style={{textAlign:"center",padding:24,color:"#666"}}>
              <p style={{fontSize:14,marginBottom:8}}>Keine passenden Songs gefunden.</p>
              {ytMusicFilterInfo.spotlight>0&&<p style={{fontSize:12,color:"#555"}}>Alle {ytMusicFilterInfo.nonMusic+ytMusicFilterInfo.byDuration} gefundenen Songs hatten eine andere Länge als der Spotlight-Track ({fmtTime(ytMusicFilterInfo.spotlight)}).<br/>Versuche einen anderen Suchbegriff oder stoppe den Spotlight.</p>}
            </div>}

            {/* Admin: YT-Suche für Katalog */}
            {user?.isAdmin&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:14,marginBottom:16,border:"1px solid rgba(255,255,255,0.06)"}}>
              <p style={{fontSize:12,color:"#888",fontWeight:600,marginBottom:10}}>Admin: Direkt in Katalog suchen</p>
              <div style={{display:"flex",gap:8,marginBottom:ytResults.length?12:0}}>
                <input className="admin-input" placeholder="YouTube durchsuchen..." value={ytSearchQ} onChange={e=>setYtSearchQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ytDoSearch()} style={{flex:1,fontSize:13,padding:"10px 14px",borderRadius:10}}/>
                <button onClick={ytDoSearch} disabled={ytSearching} style={{background:"rgba(255,60,60,0.15)",border:"1px solid rgba(255,60,60,0.3)",borderRadius:10,padding:"10px 16px",color:"#ff4444",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"}}>{ytSearching?"...":"Suchen"}</button>
              </div>
              {ytResults.length>0&&<div>
                <p style={{fontSize:11,color:"#666",marginBottom:8}}>{ytResults.length} Ergebnisse – klicke + für Katalog</p>
                {ytResults.map(r=><div key={r.ytId||r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderRadius:8,transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:40,height:40,borderRadius:4,backgroundImage:r.thumbnail?`url(${r.thumbnail})`:'none',backgroundSize:"cover",backgroundPosition:"center",flexShrink:0,background:r.thumbnail?undefined:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Mus/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p>
                    <p style={{fontSize:10,color:"#777"}}>{r.artist}{r.duration?` · ${fmtTime(r.duration)}`:''}</p>
                  </div>
                  {!catalog.find(c=>c.ytId===r.ytId)?<button onClick={e=>{e.stopPropagation();setYtAddForm({ytId:r.ytId,title:r.title,artist:r.artist,album:r.album||'',genre:'Pop',duration:r.duration,thumbnail:r.thumbnail})}} style={{background:"rgba(255,60,111,0.1)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:8,padding:"5px 9px",color:"#ff3c6f",cursor:"pointer",flexShrink:0,fontSize:11,fontWeight:600,fontFamily:"inherit"}}><I.Plus/></button>
                  :<span style={{fontSize:10,color:"#44cc66",flexShrink:0,fontWeight:600}}>✓</span>}
                </div>)}
              </div>}
            </div>}

            {/* Add-to-catalog form (admin only) */}
            {ytAddForm&&user?.isAdmin&&<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,60,111,0.2)",borderRadius:14,padding:16,marginBottom:16,animation:"fadeIn 0.3s"}}>
              <p style={{fontSize:13,fontWeight:600,color:"#ff3c6f",marginBottom:12}}>Zum Katalog hinzufügen</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:4}}>Titel</label><input className="admin-input" value={ytAddForm.title} onChange={e=>setYtAddForm({...ytAddForm,title:e.target.value})} style={{padding:"8px 12px",fontSize:12}}/></div>
                <div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:4}}>Künstler</label><input className="admin-input" value={ytAddForm.artist} onChange={e=>setYtAddForm({...ytAddForm,artist:e.target.value})} style={{padding:"8px 12px",fontSize:12}}/></div>
                <div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:4}}>Album</label><input className="admin-input" value={ytAddForm.album||''} onChange={e=>setYtAddForm({...ytAddForm,album:e.target.value})} style={{padding:"8px 12px",fontSize:12}}/></div>
                <div><label style={{fontSize:10,color:"#666",display:"block",marginBottom:4}}>Genre</label><input className="admin-input" value={ytAddForm.genre||'Pop'} onChange={e=>setYtAddForm({...ytAddForm,genre:e.target.value})} style={{padding:"8px 12px",fontSize:12}}/></div>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>setYtAddForm(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 16px",color:"#888",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Abbrechen</button>
                <button className="upload-btn" onClick={async()=>{try{await api.addToCatalog(ytAddForm);setYtAddForm(null);const d=await api.getCatalog();setCatalog(d.catalog||[]);showVoiceFb('✅ Zum Katalog hinzugefügt!')}catch(e){alert(e.message)}}} style={{padding:"8px 20px",fontSize:12}}>Hinzufügen</button>
              </div>
            </div>}

            {/* Catalog Library View */}
            {((!user?.isAdmin&&!ytResults.length)||(!ytResults.length&&!ytSearchQ&&user?.isAdmin))&&<div>
              {catalog.length>0?<>
                {/* Künstler */}
                {(()=>{const catArtists=[...new Set(catalog.map(c=>c.artist))];return catArtists.length>0&&<>
                  <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Künstler</h3>
                  <div style={{display:"flex",gap:16,overflowX:"auto",marginBottom:24,paddingBottom:4}}>
                    {catArtists.map(a=>{const artSongs=catalog.filter(c=>c.artist===a);const thumb=artSongs.find(s=>s.thumbnail)?.thumbnail;return<div key={a} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",flexShrink:0,minWidth:80}} onClick={()=>{setYtSearchQ(a);setYtResults(catalog.filter(c=>c.artist===a))}}>
                      {thumb?<div style={{width:64,height:64,borderRadius:"50%",backgroundImage:`url(${thumb})`,backgroundSize:"cover",backgroundPosition:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}/>:<div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,hsl(${(a.charCodeAt(0)*37)%360},60%,40%),hsl(${(a.charCodeAt(0)*137)%360},50%,25%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{a[0]}</div>}
                      <span style={{fontSize:11,fontWeight:500,color:"#aaa",textAlign:"center",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a}</span>
                      <span style={{fontSize:9,color:"#555"}}>{artSongs.length} Songs</span>
                    </div>})}
                  </div>
                </>})()}

                {/* Alben */}
                {(()=>{const albums=[...new Set(catalog.filter(c=>c.album).map(c=>c.album))];return albums.length>0&&<>
                  <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Alben</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:24}}>
                    {albums.map(al=>{const albumSongs=catalog.filter(c=>c.album===al);const thumb=albumSongs.find(s=>s.thumbnail)?.thumbnail;const artist=albumSongs[0]?.artist;return<div key={al} onClick={()=>{setYtSearchQ(al);setYtResults(albumSongs)}} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12,cursor:"pointer",border:"1px solid rgba(255,255,255,0.05)",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateY(0)"}}>
                      {thumb?<div style={{width:"100%",aspectRatio:"1",borderRadius:6,backgroundImage:`url(${thumb})`,backgroundSize:"cover",backgroundPosition:"center",marginBottom:8}}/>:<div style={{width:"100%",aspectRatio:"1",borderRadius:6,background:`linear-gradient(135deg,hsl(${(al.charCodeAt(0)*47)%360},50%,30%),hsl(${(al.charCodeAt(0)*127)%360},40%,20%))`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,fontSize:28}}><I.Mus/></div>}
                      <p style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{al}</p>
                      <p style={{fontSize:11,color:"#666"}}>{artist} · {albumSongs.length} Songs</p>
                    </div>})}
                  </div>
                </>})()}

                {/* Alle Songs */}
                <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Alle Songs ({catalog.length})</h3>
                {catalog.map(r=><div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:10,cursor:"pointer",transition:"background 0.2s",background:cur?.ytId===r.ytId?"rgba(255,60,111,0.08)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background=cur?.ytId===r.ytId?"rgba(255,60,111,0.08)":"transparent"}>
                  <div onClick={()=>ytPlayStream(r)} style={{width:48,height:48,borderRadius:6,backgroundImage:r.thumbnail?`url(${r.thumbnail})`:'none',backgroundSize:"cover",backgroundPosition:"center",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:r.thumbnail?undefined:"rgba(255,255,255,0.05)"}}>{cur?.ytId===r.ytId&&playing?<span style={{display:"flex",gap:1,alignItems:"flex-end",height:12}}>{[1,2,3].map(b=><span key={b} style={{display:"block",width:2,height:3+b*3,background:"#fff",borderRadius:1,animation:`pulse ${0.35+b*0.12}s ease-in-out infinite`}}/>)}</span>:<div style={{width:24,height:24,borderRadius:"50%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>}</div>
                  <div onClick={()=>ytPlayStream(r)} style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:14,fontWeight:cur?.ytId===r.ytId?600:400,color:cur?.ytId===r.ytId?"#ff3c6f":"#e8e6e3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p>
                    <p style={{fontSize:12,color:"#777"}}>{r.artist}{r.album?` · ${r.album}`:''}{r.genre?` · ${r.genre}`:''}</p>
                  </div>
                  <span style={{fontSize:11,color:"#555",fontFamily:"'Space Mono',monospace"}}>{fmtTime(r.duration)}</span>
                  <button className="ctrl-btn" onClick={e=>{e.stopPropagation();doLike('yt-'+r.ytId)}} style={{color:likes['yt-'+r.ytId]?"#ff3c6f":"#444"}}><I.Heart/></button>
                </div>)}
              </>:<div style={{textAlign:"center",padding:40}}>
                <I.Mus/><p style={{color:"#555",marginTop:12,fontSize:14}}>{user?.isAdmin?"Noch keine Songs. Suche oben nach Songs und füge sie zum Katalog hinzu!":"Noch keine Songs verfügbar."}</p>
              </div>}
            </div>}
          </>}
        </div>}

        {/* ADMIN */}
        {view==="admin"&&user?.isAdmin&&<div className="fade-in">
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Admin</h2><p style={{color:"#666",fontSize:13,marginBottom:24}}>Musik verwalten</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:24}}>{[{l:"Tracks",v:tracks.length,c:"#ff3c6f"},{l:"Katalog",v:catalog.length,c:"#ff4444"},{l:"Uploads",v:tracks.filter(t=>!t.isDemo).length,c:"#ff6b35"},{l:"Künstler",v:artists.length,c:"#6bc8ff"},{l:"Nutzer",v:admUsers.length+1,c:"#ffa726"}].map(s=><div key={s.l} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16,border:"1px solid rgba(255,255,255,0.05)",textAlign:"center"}}><p style={{fontSize:26,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.v}</p><p style={{fontSize:11,color:"#666",marginTop:4}}>{s.l}</p></div>)}</div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:20,marginBottom:24,border:"1px solid rgba(255,255,255,0.06)"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><I.Upl/><h3 style={{fontSize:16,fontWeight:600}}>Hochladen</h3></div>
            <FileUploader onReady={d=>{setNewTrack(d);setNewCover(null);setNewCoverP(null)}}/>
            {newTrack&&<div style={{marginTop:16,padding:16,background:"rgba(255,60,111,0.05)",borderRadius:12,border:"1px solid rgba(255,60,111,0.1)",animation:"fadeIn 0.3s"}}>
              <p style={{fontSize:14,fontWeight:600,color:"#ff3c6f",marginBottom:12}}>Track-Details</p>
              <div style={{display:"flex",gap:16,marginBottom:12}}>
                <div onClick={()=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=e=>{const f=e.target.files[0];if(f){setNewCover(f);setNewCoverP(URL.createObjectURL(f))}};i.click()}} style={{width:80,height:80,borderRadius:10,border:newCoverP?"none":"2px dashed rgba(255,255,255,0.15)",background:newCoverP?`url(${newCoverP}) center/cover`:"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>{!newCoverP&&<I.Img/>}</div>
                <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <input className="admin-input" placeholder="Titel *" value={newTrack.title} onChange={e=>setNewTrack({...newTrack,title:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
                  <input className="admin-input" placeholder="Künstler *" value={newTrack.artist} onChange={e=>setNewTrack({...newTrack,artist:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
                  <input className="admin-input" placeholder="Album" value={newTrack.album} onChange={e=>setNewTrack({...newTrack,album:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}/>
                  <select className="admin-input" value={newTrack.genre} onChange={e=>setNewTrack({...newTrack,genre:e.target.value})} style={{fontSize:13,padding:"10px 12px"}}>{["Electronic","Synthwave","Ambient","Chillout","Rock","Pop","Jazz","Classical","Hip-Hop","R&B","Metal","Folk"].map(g=><option key={g} value={g}>{g}</option>)}</select>
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:12,color:"#888"}}>Dauer: {fmtTime(newTrack.duration)}</span><div style={{flex:1}}/><button onClick={()=>{setNewTrack(null);setNewCover(null);setNewCoverP(null)}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 18px",color:"#888",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Abbrechen</button><button className="upload-btn" onClick={saveNew} disabled={!newTrack.title||!newTrack.artist||uploading}>{uploading?"...":"Veröffentlichen"}</button></div>
            </div>}
          </div>

          {/* YouTube Downloader */}
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:20,marginBottom:24,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><I.Vid/><h3 style={{fontSize:16,fontWeight:600}}>Per Link zum Katalog</h3></div>
            <p style={{fontSize:12,color:"#666",marginBottom:12}}>YouTube-Link einfügen → Songs auswählen → zum Streaming-Katalog hinzufügen (kein Download!)</p>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input className="admin-input" placeholder="YouTube-Link (Song, Playlist oder Album)..." value={ytUrl} onChange={e=>setYtUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ytFetchInfo()} style={{flex:1,fontSize:13,padding:"10px 14px"}}/>
              <button className="upload-btn" onClick={ytFetchInfo} disabled={ytLoading||!ytUrl.trim()} style={{padding:"10px 20px",fontSize:13,whiteSpace:"nowrap"}}>{ytLoading?"Lade...":"Suchen"}</button>
            </div>

            {/* Track Preview */}
            {ytInfo&&<div style={{animation:"fadeIn 0.3s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:600,color:"#ff3c6f"}}>{ytInfo.tracks.length} {ytInfo.tracks.length===1?"Track":"Tracks"} gefunden</p>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>setYtSelected(ytInfo.tracks.map(t=>t.id))} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"4px 10px",color:"#aaa",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Alle</button>
                  <button onClick={()=>setYtSelected([])} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"4px 10px",color:"#aaa",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Keine</button>
                </div>
              </div>
              <div style={{maxHeight:300,overflow:"auto",marginBottom:12}}>
                {ytInfo.tracks.map((t,i)=><div key={t.id} onClick={()=>ytToggle(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:ytSelected.includes(t.id)?"rgba(255,60,111,0.08)":"transparent",transition:"background 0.2s"}}>
                  <div style={{width:20,height:20,borderRadius:4,border:ytSelected.includes(t.id)?"2px solid #ff3c6f":"2px solid rgba(255,255,255,0.15)",background:ytSelected.includes(t.id)?"#ff3c6f":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>{ytSelected.includes(t.id)&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}</div>
                  {t.thumbnail&&<div style={{width:40,height:40,borderRadius:6,backgroundImage:`url(${t.thumbnail})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                    <p style={{fontSize:11,color:"#666"}}>{t.artist}{t.duration?` · ${fmtTime(t.duration)}`:''}</p>
                  </div>
                </div>)}
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>{setYtInfo(null);setYtUrl('')}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 18px",color:"#888",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Abbrechen</button>
                <button className="upload-btn" onClick={ytImportToCatalog} disabled={ytSelected.length===0} style={{padding:"10px 24px",fontSize:13}}>{ytSelected.length} {ytSelected.length===1?"Track":"Tracks"} zum Katalog</button>
              </div>
            </div>}
          </div>

          <h3 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Alle Tracks ({tracks.length})</h3>
          {tracks.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,marginBottom:4,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}><Cover track={t} size={40}/>
              <div style={{minWidth:0,flex:1}}><div style={{display:"flex",alignItems:"center",gap:6}}><p style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>{t.lyrics&&<span style={{fontSize:9,background:"rgba(100,200,255,0.12)",color:"#6bc8ff",padding:"1px 5px",borderRadius:4,fontWeight:600}}>♪ Lyrics</span>}{!t.isDemo&&<span style={{fontSize:9,background:t.sourceType==="youtube"?"rgba(255,0,0,0.12)":"rgba(255,60,111,0.15)",color:t.sourceType==="youtube"?"#ff4444":"#ff3c6f",padding:"1px 5px",borderRadius:4,fontWeight:600}}>{t.sourceType==="youtube"?"YT":t.sourceType==="video"?"VIDEO":"UPLOAD"}</span>}</div><p style={{fontSize:11,color:"#666"}}>{t.artist} · {fmtTime(t.duration)}</p></div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setEditingTrack(t)} style={{background:"rgba(100,200,255,0.08)",border:"1px solid rgba(100,200,255,0.2)",borderRadius:6,padding:"6px 10px",color:"#6bc8ff",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11}} title="Bearbeiten"><I.Edit/> Bearbeiten</button>
              <button onClick={()=>delTrack(t.id)} style={{background:"rgba(255,60,60,0.1)",border:"1px solid rgba(255,60,60,0.2)",borderRadius:6,padding:"6px 8px",color:"#ff4444",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11}}><I.Del/></button>
            </div>
          </div>)}
          
          {/* Artist Management */}
          {/* Catalog Management */}
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:20,marginBottom:24,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><I.YT/><h3 style={{fontSize:16,fontWeight:600}}>Streaming-Katalog ({catalog.length})</h3></div>
            <p style={{fontSize:12,color:"#666",marginBottom:12}}>Songs die User streamen können. Suche im "Streaming"-Tab neue Songs und füge sie hinzu.</p>
            {catalog.length===0?<p style={{color:"#555",fontSize:13,padding:"12px 0"}}>Noch keine Songs im Katalog.</p>:
            <div style={{maxHeight:500,overflow:"auto"}}>
              {(()=>{
                // Group by album
                const albums={};
                catalog.forEach(c=>{const al=c.album||'Ohne Album';if(!albums[al])albums[al]=[];albums[al].push(c)});
                return Object.entries(albums).map(([albumName,songs])=><div key={albumName} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 8px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>
                    {songs[0]?.thumbnail&&<div style={{width:32,height:32,borderRadius:4,backgroundImage:`url(${songs[0].thumbnail})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>}
                    <div><p style={{fontSize:14,fontWeight:600}}>{albumName}</p><p style={{fontSize:11,color:"#666"}}>{songs[0]?.artist} · {songs.length} Songs</p></div>
                  </div>
                  {songs.map((c,idx)=><div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px 6px 16px",borderRadius:8,transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{fontSize:11,color:"#555",fontFamily:"'Space Mono',monospace",width:20,textAlign:"right"}}>{idx+1}</span>
                    {/* Cover with upload */}
                    <div onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{await api.uploadCatalogCover(c.id,f);const d=await api.getCatalog();setCatalog(d.catalog||[])}catch(err){alert(err.message)}};inp.click()}} style={{width:36,height:36,borderRadius:4,backgroundImage:c.thumbnail?`url(${c.thumbnail})`:'none',backgroundSize:"cover",backgroundPosition:"center",flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:c.thumbnail?undefined:"rgba(255,255,255,0.06)",border:"1px dashed rgba(255,255,255,0.1)"}} title="Bild ändern">
                      {!c.thumbnail&&<I.Img/>}
                    </div>
                    {editingCatalog===c.id?<div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      <input className="admin-input" defaultValue={c.title} onBlur={async e=>{if(e.target.value!==c.title){await api.updateCatalog(c.id,{title:e.target.value});const d=await api.getCatalog();setCatalog(d.catalog||[])}}} style={{padding:"6px 10px",fontSize:11}}/>
                      <input className="admin-input" defaultValue={c.artist} onBlur={async e=>{if(e.target.value!==c.artist){await api.updateCatalog(c.id,{artist:e.target.value});const d=await api.getCatalog();setCatalog(d.catalog||[])}}} style={{padding:"6px 10px",fontSize:11}}/>
                      <input className="admin-input" defaultValue={c.album||''} placeholder="Album" onBlur={async e=>{await api.updateCatalog(c.id,{album:e.target.value});const d=await api.getCatalog();setCatalog(d.catalog||[])}} style={{padding:"6px 10px",fontSize:11}}/>
                      <input className="admin-input" defaultValue={c.genre||''} placeholder="Genre" onBlur={async e=>{await api.updateCatalog(c.id,{genre:e.target.value});const d=await api.getCatalog();setCatalog(d.catalog||[])}} style={{padding:"6px 10px",fontSize:11}}/>
                    </div>:<div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</p>
                      <p style={{fontSize:11,color:"#666"}}>{fmtTime(c.duration)}</p>
                    </div>}
                    <button onClick={()=>setEditingCatalog(editingCatalog===c.id?null:c.id)} className="ctrl-btn" style={{color:editingCatalog===c.id?"#ff3c6f":"#666"}}><I.Edit/></button>
                    <button onClick={()=>moveCatalogItem(c.id,'up')} style={{width:28,height:28,borderRadius:6,border:"1px solid rgba(255,255,255,0.15)",background:idx>0?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)",color:idx>0?"#ccc":"#333",cursor:idx>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}} title="Nach oben"><I.Expand/></button>
                    <button onClick={()=>moveCatalogItem(c.id,'down')} style={{width:28,height:28,borderRadius:6,border:"1px solid rgba(255,255,255,0.15)",background:idx<songs.length-1?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.02)",color:idx<songs.length-1?"#ccc":"#333",cursor:idx<songs.length-1?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}} title="Nach unten"><I.Down/></button>
                    <button onClick={async()=>{if(confirm(`"${c.title}" entfernen?`)){await api.deleteCatalog(c.id);const d=await api.getCatalog();setCatalog(d.catalog||[])}}} className="ctrl-btn" style={{color:"#ff5555"}}><I.Del/></button>
                  </div>)}
                </div>)
              })()}
            </div>}
          </div>

          <h3 style={{fontSize:16,fontWeight:600,marginBottom:12,marginTop:24}}>Künstler ({artists.length})</h3>
          <p style={{fontSize:12,color:"#666",marginBottom:12}}>Klicke auf einen Künstler um das Bild zu ändern</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:24}}>
            {artists.map(a=>{
              const ad=artistData?.find(x=>x.name===a);
              const tc=tracks.filter(t=>t.artist===a).length;
              return<div key={a} onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{await api.uploadArtistImage(a,f);setArtistData(await api.getArtists())}catch(err){alert(err.message)}};inp.click()}} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16,cursor:"pointer",border:"1px solid rgba(255,255,255,0.05)",textAlign:"center",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{margin:"0 auto 10px"}}><ArtistAvatar name={a} artistData={artistData} size={64}/></div>
                <p style={{fontSize:13,fontWeight:600,marginBottom:2}}>{a}</p>
                <p style={{fontSize:11,color:"#666"}}>{tc} {tc===1?"Track":"Tracks"}</p>
                <p style={{fontSize:10,color:ad?.imageUrl?"#44cc66":"#ff8f00",marginTop:4}}>{ad?.imageUrl?"✓ Bild vorhanden":"⚠ Kein Bild"}</p>
              </div>})}
          </div>
        </div>}

        {/* ARTIST DETAIL */}
        {selectedArtist&&view!=="admin"&&view!=="profile"&&<ArtistDetail name={selectedArtist} artistData={artistData} tracks={tracks} cur={cur} playing={playing} onPlay={doPlay} likes={likes} onLike={doLike} onClose={()=>setSelectedArtist(null)} onRefresh={async()=>{setArtistData(await api.getArtists())}} isAdmin={user?.isAdmin} buffering={buffering}/>}

        {/* PROFILE */}
        {view==="profile"&&user&&<div className="fade-in" style={{maxWidth:400,margin:"20px auto"}}><div style={{textAlign:"center",marginBottom:28}}><div style={{width:80,height:80,borderRadius:"50%",margin:"0 auto 16px",background:user.isAdmin?"linear-gradient(135deg,#ff3c6f,#ff6b35)":`linear-gradient(135deg,hsl(${(user.name.charCodeAt(0)*37)%360},60%,40%),hsl(${(user.name.charCodeAt(0)*137)%360},50%,30%))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,border:user.isAdmin?"3px solid rgba(255,60,111,0.4)":"3px solid rgba(255,255,255,0.1)"}}>{user.name[0].toUpperCase()}</div><h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>{user.name}</h2><p style={{fontSize:13,color:"#666"}}>{user.email}</p></div>
          {/* Voice Settings */}
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:20,marginBottom:20,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><I.Mic/><h3 style={{fontSize:15,fontWeight:600}}>Sprachsteuerung</h3></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div><p style={{fontSize:13,fontWeight:500}}>"Hey Wavebox" Erkennung</p><p style={{fontSize:11,color:"#666"}}>Hört dauerhaft auf das Weckwort</p></div>
              <button onClick={toggleAlwaysOn} style={{width:48,height:26,borderRadius:13,background:voiceAlwaysOn?"linear-gradient(135deg,#ff3c6f,#ff6b35)":"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",position:"relative",transition:"background 0.3s"}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,transition:"left 0.3s",left:voiceAlwaysOn?25:3,boxShadow:"0 2px 4px rgba(0,0,0,0.3)"}}/></button>
            </div>
            <div style={{background:"rgba(255,255,255,0.02)",borderRadius:10,padding:14,border:"1px solid rgba(255,255,255,0.04)"}}>
              <p style={{fontSize:12,fontWeight:600,color:"#aaa",marginBottom:8}}>Befehle:</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:11,color:"#666"}}>
                <span>🎵 "Spiele [Titel]"</span><span>⏭ "Nächster"</span>
                <span>🎤 "Spiele [X] von [Y]"</span><span>⏮ "Zurück"</span>
                <span>⏸ "Pause"</span><span>▶ "Weiter machen"</span>
                <span>🔊 "Lauter" / "Leiser"</span><span>🔇 "Stumm"</span>
                <span>🔀 "Shuffle"</span><span>🔁 "Wiederholen"</span>
                <span>❤️ "Like" / "Gefällt mir"</span><span>&nbsp;</span>
              </div>
            </div>
            <p style={{fontSize:10,color:"#555",marginTop:12,lineHeight:1.5}}>⚠️ Spracherkennung benötigt HTTPS. Auf iPhone/iPad nur in Chrome verfügbar (Safari unterstützt es nicht).</p>
          </div>
          <button onClick={doLogout} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",marginTop:24,background:"rgba(255,60,60,0.08)",border:"1px solid rgba(255,60,60,0.15)",borderRadius:12,padding:"14px 20px",color:"#ff5555",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit"}}><I.Out/> Abmelden</button></div>}
      </div>
    </div>

    {/* Player */}
    {cur&&<div style={{position:"fixed",bottom:68,left:0,right:0,background:"rgba(10,10,15,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"16px 20px 14px",zIndex:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{fontSize:10,color:"#666",fontFamily:"'Space Mono',monospace",width:36,textAlign:"right"}}>{fmtTime(progress)}</span><div onClick={doSeek} style={{flex:1,height:24,display:"flex",alignItems:"center",cursor:"pointer"}}><div style={{width:"100%",height:3,background:"rgba(255,255,255,0.1)",borderRadius:2,position:"relative",pointerEvents:"none"}}><div style={{width:`${(progress/(cur.duration||1))*100}%`,height:"100%",background:"linear-gradient(90deg,#ff3c6f,#ff6b35)",borderRadius:2,pointerEvents:"none",position:"relative"}}><div style={{position:"absolute",right:-5,top:-4,width:11,height:11,borderRadius:"50%",background:"#fff",boxShadow:"0 0 6px rgba(255,60,111,0.6)",pointerEvents:"none"}}/></div></div></div><span style={{fontSize:10,color:"#666",fontFamily:"'Space Mono',monospace",width:36}}>{fmtTime(cur.duration)}</span></div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setShowFullPlayer(true)}>
          <div className={playing?"now-playing-cover":""}><Cover track={cur} size={44}/></div>
          <div style={{minWidth:0}}><p style={{fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cur.title}</p><p style={{fontSize:12,color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cur.artist}</p></div>
          <button className="ctrl-btn" onClick={e=>{e.stopPropagation();doLike(cur.id)}} style={{color:likes[cur.id]?"#ff3c6f":"#555"}} title={cur.isStream?"❤ = Dauerhaft speichern":"Like"}><I.Heart/></button>
          {cur.lyrics&&<button className="ctrl-btn" onClick={()=>setShowLyrics(true)} style={{color:"#6bc8ff"}} title="Lyrics"><I.Lyrics/></button>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button className={`ctrl-btn ${shuffle?"active":""}`} onClick={()=>setShuffle(!shuffle)}><I.Shuf/></button>
          <button className="ctrl-btn" onClick={doPrev}><I.SkipP/></button>
          <button className="play-main" onClick={()=>doPlay(cur)}>{buffering?<I.Spinner/>:playing?<I.Pause/>:<I.Play/>}</button>
          <button className="ctrl-btn" onClick={doNext}><I.SkipN/></button>
          <button className={`ctrl-btn ${repeat!=='off'?"active":""}`} onClick={cycleRepeat} title={repeat==='off'?"Wiederholen aus":repeat==='all'?"Alle wiederholen":"Einen wiederholen"}>{repeat==='one'?<I.Rep1/>:<I.Rep/>}</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,justifyContent:"flex-end"}}><button className="ctrl-btn" style={{color:"#888"}}><I.Vol/></button><input type="range" className="vol-slider" min="0" max="1" step="0.01" value={volume} onChange={e=>doVol(parseFloat(e.target.value))} onInput={e=>doVol(parseFloat(e.target.value))}/></div>
      </div>
      {/* Recommendations */}
      {recommendations.length>0&&<div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:8}}>
        <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Als Nächstes</p>
        <div style={{display:"flex",gap:8}}>
          {recommendations.map(r=><div key={r.ytId} onClick={()=>ytPlayStream(r)} style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,cursor:"pointer",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",transition:"background 0.2s",minWidth:0}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
            {r.thumbnail?<div style={{width:32,height:32,borderRadius:4,backgroundImage:`url(${r.thumbnail})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>:<div style={{width:32,height:32,borderRadius:4,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10}}><I.Mus/></div>}
            <div style={{minWidth:0,flex:1}}>
              <p style={{fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</p>
              <p style={{fontSize:9,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.artist}</p>
            </div>
          </div>)}
        </div>
      </div>}
      {loadingRecs&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg><span style={{fontSize:10,color:"#555"}}>Lade Empfehlungen...</span></div>}
    </div>}

    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-around",padding:"6px 0 10px",zIndex:20}}>
      <button className={`nav-btn ${view==="home"?"active":""}`} onClick={()=>{setView("home");setSq("");setSelectedArtist(null)}}><I.Home/> Home</button>
      <button className={`nav-btn ${view==="search"?"active":""}`} onClick={()=>{setView("search");setSelectedArtist(null)}}><I.Srch/> Suche</button>
      <button className={`nav-btn ${view==="library"?"active":""}`} onClick={()=>{setView("library");setSq("");setSelectedArtist(null)}}><I.Lib/> Bibliothek</button>
      {user?.isAdmin&&<button className={`nav-btn ${view==="admin"?"active":""}`} onClick={()=>{setView("admin");setSq("");setSelectedArtist(null)}}><I.Adm/> Admin</button>}
      {user&&<button className={`nav-btn ${view==="profile"?"active":""}`} onClick={()=>{setView("profile");setSq("");setSelectedArtist(null)}}><I.Usr/> Profil</button>}
    </div>
  </div>
}
