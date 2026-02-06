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

  // Details
  var detailSpans = getTexts('.info-features span');
  var size = null, rooms = null, bathrooms = null;
  detailSpans.forEach(function (span) {
    if (span.indexOf('m\u00B2') !== -1) size = span;
    else if (span.indexOf('hab') !== -1) rooms = span;
    else if (span.indexOf('ba\u00F1o') !== -1) bathrooms = span;
  });

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

  var data = {
    url: window.location.href,
    price: price,
    title: title,
    size: size,
    rooms: rooms,
    bathrooms: bathrooms,
    description: description,
    images: Object.keys(imageSet),
    features: features,
    scrapedAt: new Date().toISOString()
  };

  // Encode and send to app
  var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  window.open('http://localhost:5173/#import=' + encoded, 'IdealistaPlus');
})();
