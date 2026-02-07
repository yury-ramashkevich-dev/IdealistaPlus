import React, { useState, useRef, useEffect } from 'react';

// Minified bookmarklet code
const BOOKMARKLET_CODE = `javascript:void(function(){if(!window.location.hostname.includes('idealista.com')||!window.location.pathname.includes('/inmueble/')){alert('IdealistaPlus: Please navigate to an Idealista property page first.');return}function t(s){var e=document.querySelector(s);return e?e.textContent.trim():null}function a(s){return Array.from(document.querySelectorAll(s)).map(function(e){return e.textContent.trim()}).filter(Boolean)}function L(s){return s.toLowerCase()}var p=t('.info-data-price')||t('.price-row'),ti=t('.main-info__title-main')||t('.main-info__title'),ds=a('.info-features span'),sz=null,rm=null,bt=null;ds.forEach(function(s){var l=L(s);if(l.indexOf('m\\u00B2')!==-1)sz=s;else if(l.indexOf('hab')!==-1||l.indexOf('bedroom')!==-1||l.indexOf('bed.')!==-1)rm=s;else if(l.indexOf('ba\\u00F1o')!==-1||l.indexOf('bathroom')!==-1||l.indexOf('bath.')!==-1)bt=s});var fe=a('.details-property_features li,.details-property-feature-one li');if(!rm||!bt){fe.forEach(function(f){var l=L(f);if(!rm&&(l.indexOf('bedroom')!==-1||l.indexOf('hab')!==-1))rm=f;if(!bt&&(l.indexOf('bathroom')!==-1||l.indexOf('ba\\u00F1o')!==-1))bt=f})}var pt=null,tk=['flat','apartment','house','detached','semi-detached','terraced','penthouse','studio','duplex','villa','chalet','bungalow','country house','piso','casa','adosado','\\u00e1tico','estudio','d\\u00faplex','finca'];fe.forEach(function(f){if(!pt){var l=L(f);tk.forEach(function(k){if(!pt&&l.indexOf(k)!==-1)pt=f})}});if(!pt&&ti){var tl=L(ti);tk.forEach(function(k){if(!pt&&tl.indexOf(k)!==-1)pt=k.charAt(0).toUpperCase()+k.slice(1)})}var cy=null;fe.forEach(function(f){if(!cy){var m=f.match(/(built in|construido en|a\\u00f1o)\\s*(\\d{4})/i)||f.match(/\\b(19|20)\\d{2}\\b/);if(m)cy=m[0]}});var ori=null,ok=['southeast','southwest','northeast','northwest','sureste','suroeste','noreste','noroeste','north','south','east','west','norte','sur','este','oeste'];fe.forEach(function(f){if(!ori){var l=L(f);if(l.indexOf('orient')!==-1||l.indexOf('facing')!==-1){ori=f}else{ok.forEach(function(k){if(!ori&&l===k)ori=f})}}});var ec=null,em=null;var ee=a('.details-property_certified-energy li,.details-property-feature-energy li');ee.forEach(function(e){var l=L(e);if(!ec&&(l.indexOf('consum')!==-1||l.indexOf('kwh')!==-1))ec=e;if(!em&&(l.indexOf('emisi')!==-1||l.indexOf('emission')!==-1||l.indexOf('co2')!==-1||l.indexOf('co\\u2082')!==-1))em=e});if(!ec||!em){fe.forEach(function(f){var l=L(f);if(!ec&&(l.indexOf('consum')!==-1||l.indexOf('kwh')!==-1))ec=f;if(!em&&(l.indexOf('emisi')!==-1||l.indexOf('emission')!==-1||l.indexOf('co2')!==-1||l.indexOf('co\\u2082')!==-1))em=f})}if(!ec){var b1=document.querySelector('.icon-energy-certificate-consumption,[class*="energy"][class*="consumption"]');if(b1)ec=b1.textContent.trim()}if(!em){var b2=document.querySelector('.icon-energy-certificate-emissions,[class*="energy"][class*="emission"]');if(b2)em=b2.textContent.trim()}var de=t('.comment .adCommentsBody')||t('.comment')||t('.adCommentsBody'),im={};document.querySelectorAll('.detail-multimedia img,.detail-multimedia-gallery img,.carousel-img,img[src*="img3.idealista.com"],img[src*="img4.idealista.com"]').forEach(function(i){var s=i.src||i.dataset.src||i.getAttribute('data-lazy');if(s&&s.indexOf('http')===0){im[s.replace(/\\/S\\d+x\\d+\\//,'/')]=1}});document.querySelectorAll('picture source').forEach(function(s){var sr=s.srcset;if(sr&&sr.indexOf('idealista.com')!==-1){im[sr.split(',')[0].trim().split(' ')[0]]=1}});var d={url:window.location.href,price:p,title:ti,size:sz,rooms:rm,bathrooms:bt,propertyType:pt,constructionYear:cy,orientation:ori,energyConsumption:ec,emissions:em,description:de,images:Object.keys(im),features:fe,scrapedAt:new Date().toISOString()},en=btoa(unescape(encodeURIComponent(JSON.stringify(d))));window.open('http://localhost:5173/#import='+en,'IdealistaPlus')})()`;

function BookmarkletInstall() {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef(null);

  // Set href imperatively to avoid React's javascript: URL warning
  useEffect(() => {
    if (linkRef.current) {
      linkRef.current.href = BOOKMARKLET_CODE;
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Draggable bookmarklet link */}
        <a
          ref={linkRef}
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-idealista-green text-white font-medium rounded-lg shadow-md hover:bg-emerald-600 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
          title="Drag this to your bookmarks bar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          + IdealistaPlus
        </a>

        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-idealista-dark">How to use:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-gray-500">
            <li><strong>Drag</strong> the green button to your bookmarks bar</li>
            <li>Navigate to any Idealista property page</li>
            <li><strong>Click</strong> the bookmarklet in your bookmarks bar</li>
            <li>Property data appears here automatically</li>
          </ol>
        </div>
      </div>

      {/* Fallback: copy button for mobile / no drag support */}
      <button
        onClick={handleCopyCode}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {copied ? 'Copied to clipboard!' : "Can't drag? Click to copy bookmarklet code"}
      </button>
    </div>
  );
}

export default BookmarkletInstall;
