import { onCleanup, onMount } from "solid-js";
// import night_mapstyle from "../assets/aubergine_mapstyle.json";
const GoogleMap = (props) => {
  let mapContainer;

  // const styledMapType = new google.maps.StyledMapType(night_mapstyle);
  async function initMap() {
    // console.log(night_mapstyle);
    if (mapContainer) {
      const map = await new google.maps.Map(mapContainer, {
        center: { lat: props.lat, lng: props.lng },
        zoom: props.zoom,
        mapId: "4504f8b37365c3d0",
        // mapTypeControlOptions: {
        //   mapTypeIds: ["water"],
        // },
      });

      //dynamic map style:

      // map.mapTypes.set("styled_map", styledMapType);
      // map.setMapTypeId("styled_map");
      // let neighbourhood_geojson = JSON.stringify(neighbourhood);
      // neighbourhood_geojson = JSON.parse(neighbourhood_geojson);
      // map.data.loadGeoJson(
      //   "https://data.cityofnewyork.us/api/geospatial/gchv-z24g?method=export&format=GeoJSON"
      // );

      //NYC_Neighbourhood.geojson
      //https://data.cityofnewyork.us/api/geospatial/gchv-z24g?method=export&format=GeoJSON

      // map.data.loadGeoJson(neighbourhood);

      //this part should be dynamically changes with the user choosing to see different neighborhood in the filter,
      //not outlining any neighborhood
      fetch("/assets/NYC_Neighborhood.geojson")
        .then((response) => response.json())
        .then((data) => {
          // Add GeoJSON data to the map
          const manhattan_neighborhood = data.features.filter(
            (obj) => obj.properties.boro_name === "Manhattan"
          );
          data.features = manhattan_neighborhood;
          map.data.addGeoJson(data);
        })
        .catch((error) => {
          console.error("Error loading GeoJSON data:", error);
        });

      map.data.setStyle(function (feature) {
        const geometryType = feature.getGeometry().getType();
        if (geometryType === "Point") {
          return {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8, // Size of the red dot
              fillColor: "red",
              fillOpacity: 1,
              strokeWeight: 0,
            },
          };
        } else if (geometryType === "LineString") {
          return {
            strokeColor: "blue",
            strokeWeight: 2,
          };
        }
      });
      const { AdvancedMarkerElement } = await google.maps.importLibrary(
        "marker"
      );
      const trafficLayer = new google.maps.TrafficLayer();

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: 40.8636241732, lng: -73.8558279928 },
      });

      trafficLayer.setMap(map);

      const bikeLayer = new google.maps.BicyclingLayer();

      bikeLayer.setMap(map);

      const transitLayer = new google.maps.TransitLayer();

      transitLayer.setMap(map);
    } else {
      console.error("Map container is not available.");
    }
  }

  onMount(() => {
    window.initMap = initMap;

    const API_KEY = "AIzaSyC7DX18HcyPErM1IXOIrThR5UmU__8pLwk";

    //&language=en
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

  return <div ref={mapContainer} class="w-screen h-screen" />;
};

export default GoogleMap;
