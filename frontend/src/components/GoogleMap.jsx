import { createSignal, onCleanup, onMount } from "solid-js";
import {
  setLayerStore,
  setIsGoogleMapInitialized,
  layerStore,
} from "./layerStore";
import Markers from "./Markers";
import API_KEY from "../api";
import InfoWindow from "./Infowindow";
import DataLayer from "./DataLayer";

// import pkg from "@googlemaps/js-api-loader";
// const { Loader } = pkg;

// import night_mapstyle from "../assets/aubergine_mapstyle.json";

const GoogleMap = (props) => {
  const [infoWindowContent, setInfoWindowContent] = createSignal("Hello world");
  // const [infoWindowPosition, setInfoWindowPosition] = createSignal([20, 20]);
  // const styledMapType = new google.maps.StyledMapType(night_mapstyle);
  async function initMap() {
    if (true) {
      console.log("initMap function is triggered");
      if (!layerStore.map) {
        const map = await new google.maps.Map(document.getElementById("map"), {
          center: { lat: props.lat, lng: props.lng },
          zoom: props.zoom,
        });
        setLayerStore("map", map);
      }
      setLayerStore("google_map", google.maps);
      setIsGoogleMapInitialized(true);
      //dynamic map style:
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
      fetch("/assets/2020_Neighborhood_Tabulation_Areas(NTAs).geojson")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          // Add GeoJSON data to the map
          // const manhattan_neighborhood = data.features.filter(
          //   (obj) => obj.properties.boro_name === "Manhattan"
          // );
          // data.features = manhattan_neighborhood;
        })
        .catch((error) => {
          console.error("Error loading GeoJSON data:", error);
        });
      const trafficLayer = new google.maps.TrafficLayer();
      const bikeLayer = new google.maps.BicyclingLayer();
      const transitLayer = new google.maps.TransitLayer();
      setLayerStore("trafficLayer", trafficLayer);
      setLayerStore("bikeLayer", bikeLayer);
      setLayerStore("transitLayer", transitLayer);
    }
  }
  onMount(() => {
    window.initMap = initMap;
    //&language=en
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap&language=en&libraries=marker`;
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

  return (
    <div>
      <div ref={props.ref} id="map" class="w-[85vw] h-[100vh]" />
      <InfoWindow infoWindowContent={infoWindowContent()} />
      <Suspense
        fallback={
          <div class="z-30 text-blue w-[55vw] h-[20vh] text-4xl">
            Still loading the google map...
          </div>
        }
      >
        <Switch>
          <Match when={layerStore.map}>
            <Markers
              realEstateData={props.realEstateData}
              historicalRealEstateData={props.historicalRealEstateData}
              us_zip_codes={props.us_zip_codes}
              borough_neighbourhood={props.borough_neighbourhood}
            />

            <DataLayer
              data={props.datalayer_geonjson}
              setInfoWindowContent={setInfoWindowContent}
              borough_neighbourhood={props.borough_neighbourhood}
              borough_geojson={props.borough_geojson}
            />
          </Match>
          <Match>
            <div>Fail to load markers</div>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
};

export default GoogleMap;
