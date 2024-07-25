import { onMount, createEffect, createSignal } from "solid-js";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const [zipcode_markers, setZipcodeMarkers] = createSignal([]);
const [markerOnMap, setMarkerOnMap] = createSignal(false);

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const createZipcodeMarkers = (zipcodes, Marker, zipcodes_latlng) => {
  const level = "zipcode";

  zipcodes.forEach((el) => {
    const positionObj = zipcodes_latlng.filter(
      (obj) => obj["zip_code"] * 1 == el
    );

    try {
      const position = {
        lat: positionObj[0]["latitude"] * 1,
        lng: positionObj[0]["longitude"] * 1,
      };

      const color = "#ffffff";
      const svg = window.btoa(`
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
 
  <circle cx="150" cy="120" opacity="0.4" r="350" />
  </svg>`);

      const marker = new Marker({
        position,
        title: `ZIPCODE: ${el.toString()}`,
        level,
        label: {
          text: `${el.toString()}`,
          color: "black",
        },
        icon: {
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(80, 20),
        },
      });
      setZipcodeMarkers((prev) => [...prev, marker]);
    } catch (error) {
      console.log(
        `${el} is problematic, it does not have latitude and longitude in zipcodes or data in realEstateData : ${error}`
      );
    }
  });
};

function putMarkersOnMap(markersArray, map) {
  markersArray.forEach((marker) => {
    marker.setMap(map);
  });
}

function clearMarkers(markersArray) {
  markersArray.forEach((marker) => {
    marker.setMap(null);
  });
}

const Markers = async (props) => {
  onMount(async () => {
    const zipcodes_latlng = props.zipcodes;
    const borough_neighbourhood = props.borough_neighbourhood;
    const realEstateData = props.realEstateData;
    //extract all zipcodes from borough_neighbourhood
    let zipcodes = [];
    let borough_zipcode = {};
    let neighbourhood_zipcode = {};
    borough_neighbourhood.forEach((el) => {
      zipcodes = [...zipcodes, ...el["zipcodes"]];
      borough_zipcode[el["borough"]] = el["zipcodes"];
      neighbourhood_zipcode[el["neighbourhood"]] = el["zipcodes"];
    });

    loader.importLibrary("marker").then(({ Marker }) => {
      createZipcodeMarkers(zipcodes, Marker, zipcodes_latlng, realEstateData);
      // putMarkersOnMap(zipcode_markers(), props.map());
    });
  });

  createEffect(() => {
    if (props.zoom() >= 13) {
      setMarkerOnMap(true);
    } else {
      setMarkerOnMap(false);
    }
  });

  createEffect(() => {
    if (markerOnMap()) {
      putMarkersOnMap(zipcode_markers(), props.map());
    } else {
      clearMarkers(zipcode_markers());
    }
  });
};

export default Markers;
