// Bookmarklet source code (readable version)
// This gets minified into a javascript: URL for the bookmarklet link.
//
// Usage: User clicks this bookmarklet while on an Idealista property page.
// It extracts property data from the DOM and opens the app with the data.

(function () {
  // Verify we're on an Idealista property page
  if (!window.location.hostname.includes('idealista.com') || !window.location.pathname.includes('/inmueble/')) {
    alert('IdealistaPlus: Please navigate to an Idealista property page first.');
    return;
  }

  function getText(selector) {
    var el = document.querySelector(selector);
    return el ? el.textContent.trim() : null;
  }

  function getTexts(selector) {
    return Array.from(document.querySelectorAll(selector))
      .map(function (el) { return el.textContent.trim(); })
      .filter(Boolean);
  }

  // Price
  var price = getText('.info-data-price') || getText('.price-row');

  // Title
  var title = getText('.main-info__title-main') || getText('.main-info__title');

  // Details (supports both Spanish and English pages)
  var detailSpans = getTexts('.info-features span');
  var size = null, rooms = null, bathrooms = null;
  var sl = function (s) { return s.toLowerCase(); };
  detailSpans.forEach(function (span) {
    var low = sl(span);
    if (low.indexOf('m\u00B2') !== -1) size = span;
    else if (low.indexOf('hab') !== -1 || low.indexOf('bedroom') !== -1 || low.indexOf('bed.') !== -1) rooms = span;
    else if (low.indexOf('ba\u00F1o') !== -1 || low.indexOf('bathroom') !== -1 || low.indexOf('bath.') !== -1) bathrooms = span;
  });

  // Fallback: extract rooms/bathrooms from features list if not found in detail spans
  if (!rooms || !bathrooms) {
    var featureEls = getTexts('.details-property_features li, .details-property-feature-one li');
    featureEls.forEach(function (f) {
      var low = sl(f);
      if (!rooms && (low.indexOf('bedroom') !== -1 || low.indexOf('hab') !== -1)) rooms = f;
      if (!bathrooms && (low.indexOf('bathroom') !== -1 || low.indexOf('ba\u00F1o') !== -1)) bathrooms = f;
    });
  }

  // Description
  var description = getText('.comment .adCommentsBody')
    || getText('.comment')
    || getText('.adCommentsBody');

  // Images
  var imageSet = {};
  document.querySelectorAll(
    '.detail-multimedia img, .detail-multimedia-gallery img, ' +
    '.carousel-img, img[src*="img3.idealista.com"], img[src*="img4.idealista.com"]'
  ).forEach(function (img) {
    var src = img.src || img.dataset.src || img.getAttribute('data-lazy');
    if (src && src.indexOf('http') === 0) {
      var fullSrc = src.replace(/\/S\d+x\d+\//, '/');
      imageSet[fullSrc] = true;
    }
  });
  document.querySelectorAll('picture source').forEach(function (source) {
    var srcset = source.srcset;
    if (srcset && srcset.indexOf('idealista.com') !== -1) {
      var src = srcset.split(',')[0].trim().split(' ')[0];
      imageSet[src] = true;
    }
  });

  // Features
  var features = getTexts('.details-property_features li, .details-property-feature-one li');

  // Property type: extract from first feature or title keywords
  var propertyType = null;
  var typeKeywords = ['flat', 'apartment', 'house', 'detached', 'semi-detached', 'terraced', 'penthouse', 'studio', 'duplex', 'villa', 'chalet', 'bungalow', 'country house', 'piso', 'casa', 'adosado', '\u00e1tico', 'estudio', 'd\u00faplex', 'finca'];
  features.forEach(function (f) {
    if (!propertyType) {
      var low = sl(f);
      typeKeywords.forEach(function (kw) {
        if (!propertyType && low.indexOf(kw) !== -1) propertyType = f;
      });
    }
  });
  if (!propertyType && title) {
    var tLow = sl(title);
    typeKeywords.forEach(function (kw) {
      if (!propertyType && tLow.indexOf(kw) !== -1) propertyType = kw.charAt(0).toUpperCase() + kw.slice(1);
    });
  }

  // Year of construction: look for 4-digit year in features
  var constructionYear = null;
  features.forEach(function (f) {
    if (!constructionYear) {
      var m = f.match(/(built in|construido en|a\u00f1o)\s*(\d{4})/i) || f.match(/\b(19|20)\d{2}\b/);
      if (m) constructionYear = m[0];
    }
  });

  // Orientation: scan features for direction keywords
  var orientation = null;
  var orientKeywords = ['north', 'south', 'east', 'west', 'norte', 'sur', 'este', 'oeste', 'southeast', 'southwest', 'northeast', 'northwest', 'sureste', 'suroeste', 'noreste', 'noroeste'];
  features.forEach(function (f) {
    if (!orientation) {
      var low = sl(f);
      if (low.indexOf('orient') !== -1 || low.indexOf('facing') !== -1) {
        orientation = f;
      } else {
        orientKeywords.forEach(function (kw) {
          if (!orientation && low === kw) orientation = f;
        });
      }
    }
  });

  // Energy certificate: consumption and emissions
  var energyConsumption = null;
  var emissions = null;
  // Try dedicated energy section
  var energyEls = getTexts('.details-property_certified-energy li, .details-property-feature-energy li');
  energyEls.forEach(function (e) {
    var low = sl(e);
    if (!energyConsumption && (low.indexOf('consum') !== -1 || low.indexOf('kwh') !== -1)) energyConsumption = e;
    if (!emissions && (low.indexOf('emisi') !== -1 || low.indexOf('emission') !== -1 || low.indexOf('co2') !== -1 || low.indexOf('co\u2082') !== -1)) emissions = e;
  });
  // Fallback: look in features
  if (!energyConsumption || !emissions) {
    features.forEach(function (f) {
      var low = sl(f);
      if (!energyConsumption && (low.indexOf('consum') !== -1 || low.indexOf('kwh') !== -1)) energyConsumption = f;
      if (!emissions && (low.indexOf('emisi') !== -1 || low.indexOf('emission') !== -1 || low.indexOf('co2') !== -1 || low.indexOf('co\u2082') !== -1)) emissions = f;
    });
  }
  // Try energy rating badges (letter grades like A, B, C...)
  if (!energyConsumption) {
    var badge = document.querySelector('.icon-energy-certificate-consumption, [class*="energy"][class*="consumption"]');
    if (badge) energyConsumption = badge.textContent.trim();
  }
  if (!emissions) {
    var badge2 = document.querySelector('.icon-energy-certificate-emissions, [class*="energy"][class*="emission"]');
    if (badge2) emissions = badge2.textContent.trim();
  }

  var data = {
    url: window.location.href,
    price: price,
    title: title,
    size: size,
    rooms: rooms,
    bathrooms: bathrooms,
    propertyType: propertyType,
    constructionYear: constructionYear,
    orientation: orientation,
    energyConsumption: energyConsumption,
    emissions: emissions,
    description: description,
    images: Object.keys(imageSet),
    features: features,
    scrapedAt: new Date().toISOString()
  };

  // Encode and send to app
  var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  window.open('http://localhost:5173/#import=' + encoded, 'IdealistaPlus');
})();
