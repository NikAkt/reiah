import { onCleanup, onMount } from "solid-js";

const GoogleMap = (props) => {
  let mapContainer;
  // const t
  const initMap = () => {
    if (mapContainer) {
      const map = new google.maps.Map(mapContainer, {
        center: { lat: props.lat, lng: props.lng },
        zoom: props.zoom,
      });
      const trafficLayer = new google.maps.TrafficLayer();
      // trafficLayer.setMap(map);
    } else {
      console.error("Map container is not available.");
    }
  };

  onMount(() => {
    window.initMap = initMap;

    const API_KEY = "AIzaSyC7DX18HcyPErM1IXOIrThR5UmU__8pLwk";

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&language=en`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Failed to load the Google Maps script.");
    };
    document.head.appendChild(script);

    onCleanup(() => {
      if (script) {
        document.head.removeChild(script);
      }
      delete window.initMap;
    });
  });

  return <div ref={mapContainer} class="w-[50vw] h-screen" />;
};

export default GoogleMap;
