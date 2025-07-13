const radios = document.querySelectorAll('input[name=\"lang\"]');
const iframe = document.getElementById('profilesFrame');

function sendLanguageToIframe(lang) {
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ lang: lang }, '*');
  }
}

iframe.addEventListener('load', () => {
  let savedLang = localStorage.getItem('selectedLang');

  if (!savedLang) {
    // Get the user's browser language
    const userLang = navigator.language || navigator.userLanguage; // fallback for older browsers

    // Check if the language starts with 'da' (e.g., 'da', 'da-DK')
    if (userLang && userLang.toLowerCase().startsWith('da')) {
      savedLang = 'da';
    } else {
      savedLang = 'en';
    }
  }

  document.querySelector(`input[value="${savedLang}"]`).checked = true;
  sendLanguageToIframe(savedLang);
});


radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    localStorage.setItem('selectedLang', selectedLang);
    sendLanguageToIframe(selectedLang);
  });
});

function sendLayoutToIframe() {
  const iframe = document.getElementById('profilesFrame');
  if (!iframe) return;

  const isBottomPanel = window.matchMedia(
    '(min-height: 100vw) and (max-width: 1200px)'
  ).matches;

  const layout = isBottomPanel ? 'bottom' : 'side';

  iframe.contentWindow.postMessage({ layout }, '*');
}

iframe.addEventListener('load', sendLayoutToIframe);
window.addEventListener('resize', sendLayoutToIframe);

document.addEventListener("DOMContentLoaded", function() {
  if (!window.leafletMap) {
    console.error("Leaflet map not found. Ensure it is loaded before this script.");
    return;
  }
  
  function updateIframe(e) {
    var layer = e.popup._source; // Get the layer that triggered the popup
    var id = layer.options ? layer.options.layerId : null;

    var iframe = document.getElementById('profilesFrame');
    if (!iframe) {
      console.error("Iframe not found!");
      return;
    }

    if (id) {
      var newSrc = "profiles.html#" + id;
      iframe.src = newSrc;
    } else {
      console.error("ID is undefined or null!");
    }
  }

  // Attach event to Leaflet map
  window.leafletMap.on('popupopen', updateIframe);
});

/* HERE */
// Utility function to find marker by layerId in the cluster group
function findMarkerInClusters(clusterGroup, layerId) {
  let foundMarker = null;
  function searchLayer(layer) {
    if (layer instanceof L.MarkerCluster) {
      const children = layer.getAllChildMarkers();
      for (const child of children) {
        if (child.options && child.options.layerId === layerId) {
          foundMarker = child;
          return true;
        }
      }
      return false;
    } else if (layer.options && layer.options.layerId === layerId) {
      foundMarker = layer;
      return true;
    }
    return false;
  }
  clusterGroup.eachLayer(layer => {
    if (!foundMarker) searchLayer(layer);
  });
  return foundMarker;
}

// Listen for postMessage from iframe links
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "linkClick") return;

    //if (!window.leafletMap || !window.clusterGroup) {
      //console.warn("Map or clusterGroup not initialized");
      //return;
    //}

    const map = window.leafletMap;
    const clusterGroup = window.clusterGroup;
    const id = event.data.id;

    // Close any open popup immediately
    map.closePopup();

    // Collapse any spiderfied cluster
    if (clusterGroup._spiderfied) {
      clusterGroup.unspiderfy();
      // clusterGroup.refreshClusters(); // Uncomment if you find it necessary
    }

    if (id === "start") {
      // Reset map view to original bounds and zoom
      const originalBounds = L.latLngBounds([[54.00, 6.40], [58.15, 17.15]]);
      map.fitBounds(originalBounds);
      return;  // Don't open any marker
    }

    // For other ids, open corresponding marker
    openMarker(id);
  });
});


// Main marker opening logic
function openMarker(id) {
  const map = window.leafletMap;
  const clusterGroup = window.clusterGroup;
  const marker = window.markerMap[id];

  // if (!marker) {
    // console.warn("Marker not found:", id);
    // return;
  // }

  map.closePopup();

  if (clusterGroup) {
    clusterGroup.unspiderfy();
  }

  // Helper to check if marker is actually clustered
  function isClustered(marker) {
    const parent = marker.__parent || marker._parent;
    return parent && map.hasLayer(parent);
  }

  function spiderfyAndOpen() {
    if (isClustered(marker)) {
      const parentCluster = marker.__parent || marker._parent;
      // console.log("Valid parent cluster:", parentCluster);

      if (typeof parentCluster.spiderfy === 'function') {
        parentCluster.spiderfy();

        setTimeout(() => {
          marker.openPopup();
          map.panTo(marker.getLatLng());
          // console.log("Popup opened after spiderfy");
        }, 350);
      } // else {
        // console.warn("parentCluster.spiderfy() not found");
      // }

    } else {
      // console.log("Marker is not clustered, opening popup directly");
      marker.openPopup();
      map.panTo(marker.getLatLng());
    }
  }

  if (clusterGroup && typeof clusterGroup.zoomToShowLayer === "function") {
    clusterGroup.zoomToShowLayer(marker, () => {
      // console.log("zoomToShowLayer callback fired for marker:", id);
      spiderfyAndOpen();
    });

    // Backup call in case callback doesn't fire
    setTimeout(() => {
      if (!map.hasLayer(marker.getPopup())) {
        // console.log("zoomToShowLayer fallback triggered");
        spiderfyAndOpen();
      }
    }, 500);
  } else {
    spiderfyAndOpen();
  }
}