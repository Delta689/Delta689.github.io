(function () {
  const cfg = window.__LUX_CONFIG__ || {};
  const DEST = cfg.DESTINATION;
  const DEST_LABEL = cfg.DESTINATION_LABEL;

  document.addEventListener("DOMContentLoaded", function () {
    const statusEl = document.getElementById("ubi-status");
    const btnGeo = document.getElementById("btn-geo");
    const btnGMaps = document.getElementById("btnGMaps");
    const btnWaze = document.getElementById("btnWaze");
    const panelRuta = document.getElementById("panelRuta");

    if (!statusEl || !btnGeo || !btnGMaps || !btnWaze || !panelRuta) return;

    let userLL = null;
    let routeFn = null;

    function setStatus(msg, type = "info") {
      statusEl.className = `alert alert-${type} py-2 px-3 small mb-3`;
      statusEl.textContent = msg;
    }

    function setLinks() {
      const origin = userLL ? `${userLL.lat},${userLL.lng}` : "My+Location";
      btnGMaps.href =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + encodeURIComponent(origin) +
        "&destination=" + encodeURIComponent(`${DEST.lat},${DEST.lng}`);

      btnWaze.href = `https://waze.com/ul?ll=${DEST.lat},${DEST.lng}&navigate=yes`;
    }

    function getUserLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("no-geoloc"));
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }

    function loadGoogleMaps() {
      return new Promise((resolve, reject) => {
        const key = (cfg.GOOGLE_MAPS_API_KEY || "").trim();
        if (!key || key.startsWith("PEGA_")) return reject(new Error("no-key"));

        const timeout = setTimeout(() => reject(new Error("timeout")), 12000);

        window.initMap = function () {
          clearTimeout(timeout);

          try {
            const map = new google.maps.Map(document.getElementById("map"), {
              center: DEST,
              zoom: 16
            });

            const dirService = new google.maps.DirectionsService();
            const dirRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
            dirRenderer.setMap(map);

            const destMarker = new google.maps.Marker({
              position: DEST,
              map,
              title: "Destino"
            });

            const info = new google.maps.InfoWindow({
              content: `<div><strong>Destino</strong><br>${DEST_LABEL}</div>`
            });

            destMarker.addListener("click", () => info.open({ anchor: destMarker, map }));

            function routeFrom(originLatLng) {
              new google.maps.Marker({
                position: originLatLng,
                map,
                title: "Tu ubicación",
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: "#c7a35a",
                  fillOpacity: 1,
                  strokeColor: "#0f1319",
                  strokeWeight: 1
                }
              });

              dirService.route({
                origin: originLatLng,
                destination: DEST,
                travelMode: google.maps.TravelMode.DRIVING
              }).then(result => {
                dirRenderer.setDirections(result);
                const leg = result.routes?.[0]?.legs?.[0];
                if (leg) {
                  const km = (leg.distance.value / 1000).toFixed(1);
                  const min = Math.round(leg.duration.value / 60);
                  panelRuta.innerHTML = `<strong>Distancia:</strong> ${km} km · <strong>Tiempo aprox:</strong> ${min} min`;
                }
              }).catch(() => {});
            }

            resolve({ routeFrom });
          } catch (error) {
            reject(error);
          }
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("load-error"));
        document.head.appendChild(script);
      });
    }

    function loadLeafletFallback() {
      return new Promise(async resolve => {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);

        await new Promise(done => {
          const js = document.createElement("script");
          js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          js.onload = done;
          document.body.appendChild(js);
        });

        const map = L.map("map").setView([DEST.lat, DEST.lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        L.marker([DEST.lat, DEST.lng]).addTo(map).bindPopup(`<strong>Destino</strong><br>${DEST_LABEL}`).openPopup();

        async function routeFrom(origin) {
          L.marker([origin.lat, origin.lng]).addTo(map).bindPopup("Tu ubicación");
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${DEST.lng},${DEST.lat}?overview=full&geometries=geojson`;
            const data = await (await fetch(url)).json();
            const route = data.routes?.[0];
            if (route) {
              const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
              L.polyline(coords, { color: "#c7a35a", weight: 5 }).addTo(map);
              const km = (route.distance / 1000).toFixed(1);
              const min = Math.round(route.duration / 60);
              panelRuta.innerHTML = `<strong>Distancia:</strong> ${km} km · <strong>Tiempo aprox:</strong> ${min} min`;
            }
          } catch (_) {}
        }

        resolve({ routeFrom });
      });
    }

    btnGeo.addEventListener("click", async function () {
      try {
        userLL = await getUserLocation();
        setLinks();
        setStatus("Ubicación detectada. Ruta lista.", "success");
        if (routeFn) routeFn(userLL);
      } catch (_) {
        setStatus("No se pudo obtener tu ubicación. Revisa permisos del navegador.", "danger");
      }
    });

    (async function init() {
      setLinks();

      try {
        const gmaps = await loadGoogleMaps();
        routeFn = gmaps.routeFrom;
      } catch (_) {
        const leaflet = await loadLeafletFallback();
        routeFn = leaflet.routeFrom;
      }

      try {
        userLL = await getUserLocation();
        setLinks();
        setStatus("Ubicación detectada. Ruta lista.", "success");
        if (routeFn) routeFn(userLL);
      } catch (_) {
        setStatus('No se pudo obtener tu ubicación automáticamente. Pulsa "Usar mi ubicación".', "warning");
      }
    })();
  });
})();