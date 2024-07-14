import { onMount, createEffect, createSignal, untrack } from "solid-js";
import { setStore, store } from "../data/stores";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { borough_neighbourhood } from "../data/dataToBeSent";

//marker size range
// const initialSize = 50;
// const finalSize = 100;
// const sizeDifference = finalSize - initialSize;

const [zipcode_markers, setZipcodeMarkers] = createSignal([]);
// const [borough_markers, setBoroughMarkers] = createSignal([]);
// const [neighbourhood_markers, setNeighbourhoodMarkers] = createSignal([]);

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const createZipcodeMarkers = (
  zipcodes,
  Marker,
  zipcodes_latlng,
  realEstateData
) => {
  const level = "zipcode";

  zipcodes.forEach((el) => {
    const positionObj = zipcodes_latlng.filter(
      (obj) => obj["zip_code"] * 1 == el
    );
    const realEstateDataObj = realEstateData.filter(
      (obj) => obj.zipcode * 1 === el
    );

    try {
      const position = {
        lat: positionObj[0]["latitude"] * 1,
        lng: positionObj[0]["longitude"] * 1,
      };

      const { avg_home_value, median_age, median_household_income } =
        realEstateDataObj[0];

      const color = "#ffffff";
      const svg = window.btoa(`
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
 
  <circle cx="150" cy="120" opacity="1" r="350" />
  </svg>`);

      const marker = new Marker({
        position,
        title: `ZIPCODE: ${el.toString()}`,
        level,
        avg_home_value,
        median_age,
        median_household_income,
        label: {
          text: `\$${(avg_home_value / 1000).toFixed(1)}k`,
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
      putMarkersOnMap(zipcode_markers(), props.map());
      const clusterRenderer = {
        render: (cluster, stats) => {
          // Access to the cluster's attributes, check all available in the doc
          const { markers, position, count } = cluster;
          // Access to the stats' attributes if you need it
          //// <circle cx="120" cy="120" opacity=".6" r="70" />
          // const color = "#0145ac";
          const color = "#ffffff";
          const svg = window.btoa(`
    <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
   
    <circle cx="150" cy="120" opacity="1" r="350" />
    </svg>`);
          let avgHomeValue = 0;
          let title = "";
          markers.forEach((marker) => {
            avgHomeValue += marker["avg_home_value"];
            title += `${marker.title} `;
          });
          avgHomeValue /= markers.length;

          return new google.maps.Marker({
            icon: {
              url: `data:image/svg+xml;base64,${svg}`,
              scaledSize: new google.maps.Size(80, 20),
            },
            title,

            label: {
              text: `\$${(avgHomeValue / 1000).toFixed(1)}k`,
              color: "black",
            },
            position: position,
            map,
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      };
      const map = props.map();
      const markers = zipcode_markers();
      const markerCluster = new MarkerClusterer({
        markers,
        map,
        renderer: clusterRenderer,
        onClusterClick: async (event, cluster, map) => {},
      });
    });
  });
};

export default Markers;
