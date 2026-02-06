import React, { useState, useRef, useEffect } from 'react';

// Minified bookmarklet code
const BOOKMARKLET_CODE = `javascript:void(function(){if(!window.location.hostname.includes('idealista.com')||!window.location.pathname.includes('/inmueble/')){alert('IdealistaPlus: Please navigate to an Idealista property page first.');return}function t(s){var e=document.querySelector(s);return e?e.textContent.trim():null}function a(s){return Array.from(document.querySelectorAll(s)).map(function(e){return e.textContent.trim()}).filter(Boolean)}var p=t('.info-data-price')||t('.price-row'),ti=t('.main-info__title-main')||t('.main-info__title'),ds=a('.info-features span'),sz=null,rm=null,bt=null;ds.forEach(function(s){if(s.indexOf('m\\u00B2')!==-1)sz=s;else if(s.indexOf('hab')!==-1)rm=s;else if(s.indexOf('ba\\u00F1o')!==-1)bt=s});var de=t('.comment .adCommentsBody')||t('.comment')||t('.adCommentsBody'),im={};document.querySelectorAll('.detail-multimedia img,.detail-multimedia-gallery img,.carousel-img,img[src*="img3.idealista.com"],img[src*="img4.idealista.com"]').forEach(function(i){var s=i.src||i.dataset.src||i.getAttribute('data-lazy');if(s&&s.indexOf('http')===0){im[s.replace(/\\/S\\d+x\\d+\\//,'/')]=1}});document.querySelectorAll('picture source').forEach(function(s){var sr=s.srcset;if(sr&&sr.indexOf('idealista.com')!==-1){im[sr.split(',')[0].trim().split(' ')[0]]=1}});var fe=a('.details-property_features li,.details-property-feature-one li'),d={url:window.location.href,price:p,title:ti,size:sz,rooms:rm,bathrooms:bt,description:de,images:Object.keys(im),features:fe,scrapedAt:new Date().toISOString()},en=btoa(unescape(encodeURIComponent(JSON.stringify(d))));window.open('http://localhost:5173/#import='+en,'IdealistaPlus')})()`;

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
