document.addEventListener("DOMContentLoaded", function() {
    if (!window.leafletMap) {
      console.error("Leaflet map not found. Ensure it is loaded before this script.");
      return;
    }
  
    //console.log("Adding popupopen event listener to Leaflet map."); // Debugging log
  
    function updateIframe(e) {
      //console.log("Popup event triggered:", e); // Log when triggered
  
      var layer = e.popup._source; // Get the layer that triggered the popup
      var id = layer.options ? layer.options.layerId : null;
      //console.log("Extracted ID:", id); // Debugging log
  
      var iframe = document.getElementById('profilesFrame');
      if (!iframe) {
        console.error("Iframe not found!");
        return;
      }
  
      if (id) {
        var newSrc = "profiles.html#" + id;
        //console.log("Updating iframe src to:", newSrc);
        iframe.src = newSrc;
      } else {
        console.error("ID is undefined or null!");
      }
    }
  
    // Attach event to Leaflet map
    window.leafletMap.on('popupopen', updateIframe);
  });
  