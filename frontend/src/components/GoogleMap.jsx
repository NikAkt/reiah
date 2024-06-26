import { Show, createSignal, onCleanup, onMount } from "solid-js";
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
    if (!layerStore.map) {
      console.log("initMap function is triggered");
      if (!layerStore.map) {
        const map = await new google.maps.Map(document.getElementById("map"), {
          center: { lat: props.lat, lng: props.lng },
          zoom: props.zoom,
        });
        setLayerStore("map", map);
        map.addListener("zoom_changed", () => {
          props.setMapZoom(map.zoom);
        });
      } else {
        console.log("Should find a way bring back the map store in layerstore");
      }
      setIsGoogleMapInitialized(true);

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
      <div
        ref={props.ref}
        id="map"
        class="absolute top-0 left-0 w-[100vw] h-[100vh] transition-width"
      />
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
              setInfoCardData={props.setInfoCardData}
              mapZoom={props.mapZoom}
            />

            <DataLayer
              data={props.datalayer_geonjson}
              setInfoWindowContent={setInfoWindowContent}
              borough_neighbourhood={props.borough_neighbourhood}
              borough_geojson={props.borough_geojson}
              mapZoom={props.mapZoom}
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
