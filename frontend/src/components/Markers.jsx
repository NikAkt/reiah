import { onMount, createEffect, createSignal, untrack } from "solid-js";
import { setStore, store } from "../data/stores";
import { Loader } from "@googlemaps/js-api-loader";
import { realEstateData } from "../data/dataToBeSent";
import { borough_neighbourhood } from "../data/dataToBeSent";

//marker size range
// const initialSize = 50;
// const finalSize = 100;
// const sizeDifference = finalSize - initialSize;

const [zipcode_markers, setZipcodeMarkers] = createSignal([]);
const [borough_markers, setBoroughMarkers] = createSignal([]);
const [neighbourhood_markers, setNeighbourhoodMarkers] = createSignal([]);

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
  const svg = window.btoa(`
<svg fill="white xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
<circle cx="120" cy="120" opacity=".0" r="70" />
</svg>`);
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

      const marker = new Marker({
        position,
        title: el.toString(),
        level,
        avg_home_value,
        median_age,
        median_household_income,
        label: {
          text: `\$ ${(avg_home_value / 1000).toFixed(1)}k`,
          color: "black",
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
    //extract all zipcodes from borough_neighbourhood
    let zipcodes = [];
    for (let key1 of Object.keys(borough_neighbourhood)) {
      for (let key2 of Object.keys(borough_neighbourhood[key1])) {
        for (let key3 of Object.keys(borough_neighbourhood[key1][key2])) {
          zipcodes = [...zipcodes, ...borough_neighbourhood[key1][key2][key3]];
        }
      }
    }
    let borough_zipcode = {};
    let neighbourhood_zipcode = {};

    for (let [key, value] of Object.entries(borough_neighbourhood)) {
      if (!borough_zipcode.hasOwnProperty(key)) {
        borough_zipcode[key] = [];
      }
      for (let [neighbourhood, zipcodeObj] of Object.entries(value)) {
        const zipcodeArray = Object.values(zipcodeObj)[0];
        if (!neighbourhood_zipcode.hasOwnProperty(neighbourhood)) {
          neighbourhood_zipcode[neighbourhood] = [];
        }
        neighbourhood_zipcode[neighbourhood] = [
          ...neighbourhood_zipcode[neighbourhood],
          ...zipcodeArray,
        ];
        borough_zipcode[key] = [...borough_zipcode[key], ...zipcodeArray];
      }
    }

    loader.importLibrary("marker").then(({ Marker }) => {
      loader.importLibrary("core").then(({ LatLng, LatLngBounds }) => {
        createZipcodeMarkers(zipcodes, Marker, zipcodes_latlng, realEstateData);
        createBoroughMarkers(
          borough_zipcode,
          zipcodes_latlng,
          LatLng,
          LatLngBounds,
          realEstateData,
          Marker
        );
        createNeighbourhoodMarkers(
          neighbourhood_zipcode,
          zipcodes_latlng,
          LatLng,
          LatLngBounds,
          realEstateData,
          Marker
        );
      });
    });
  });

  const switchMarkers = (props, map) => {
    if (props.getDataLayerLevel() === "borough") {
      //borough level markers
      //if it has neighbourhood markers, clear the data layer
      clearMarkers(neighbourhood_markers(), map);
      clearMarkers(zipcode_markers(), map);
      putMarkersOnMap(borough_markers(), map);
    } else if (props.getDataLayerLevel() === "neighbourhood") {
      //datalayer changed to neighbourhood level
      clearMarkers(borough_markers(), map);
      clearMarkers(zipcode_markers(), map);
      putMarkersOnMap(neighbourhood_markers(), map);
    } else if (props.getDataLayerLevel() === "zipcode") {
      // zipcode level markers
      clearMarkers(borough_markers(), map);
      clearMarkers(neighbourhood_markers(), map);
      putMarkersOnMap(zipcode_markers(), map);
    }
  };

  createEffect(() => {
    switchMarkers(props.props.map());
  });
};

function createNeighbourhoodMarkers(
  neighbourhood_zipcode,
  zipcodes_latlng,
  LatLng,
  LatLngBounds,
  realEstateData,
  Marker
) {
  for (let [neighbourhood, zipcodeArray] of Object.entries(
    neighbourhood_zipcode
  )) {
    const latlngArray = [];
    const realEstateDataObj = {
      avg_home_value: 0,
      median_age: 0,
      median_household_income: 0,
    };
    let count = 0;

    zipcodeArray.forEach((zipcode) => {
      try {
        const { latitude, longitude } = zipcodes_latlng.filter(
          (obj) => obj["zip_code"] * 1 == zipcode
        )[0];
        const { avg_home_value, median_age, median_household_income } =
          realEstateData.filter((obj) => obj.zipcode === zipcode)[0];
        latlngArray.push({ lat: latitude * 1, lng: longitude * 1 });
        realEstateDataObj["avg_home_value"] += avg_home_value;
        realEstateDataObj["median_age"] += median_age;
        realEstateDataObj["median_household_income"] += median_household_income;
        count += 1;
      } catch (error) {
        console.log(`${zipcode}: ${error}`);
      }
    });

    //average the values inside
    for (let key of Object.keys(realEstateDataObj)) {
      realEstateDataObj[key] /= count;
    }
    const { avg_home_value, median_age, median_household_income } =
      realEstateDataObj;

    //center position:
    const bounds = new LatLngBounds();

    latlngArray.forEach((obj) => {
      bounds.extend(new LatLng(obj["lat"], obj["lng"]));
    });
    // centerPositionArray.push(bounds.getCenter());
    const svg = window.btoa(`
      <svg fill="white xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity=".6" r="70" />
      <circle cx="120" cy="120" opacity=".3" r="90" />
      <circle cx="120" cy="120" opacity=".2" r="120" />
      </svg>`);
    const position = bounds.getCenter();
    const marker = new Marker({
      position,
      title: neighbourhood,
      level: "neighbourhood",
      avg_home_value,
      median_age,
      median_household_income,
      label: {
        text: `\$ ${(avg_home_value / 1000).toFixed(1)}k`,
        color: "black",
        fontSize: "16px",
      },
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(45, 45),
      },
    });
    setNeighbourhoodMarkers((prev) => [...prev, marker]);
  }
}

function createBoroughMarkers(
  borough_zipcode,
  zipcodes_latlng,
  LatLng,
  LatLngBounds,
  realEstateData,
  Marker
) {
  for (let [borough, zipcodeArray] of Object.entries(borough_zipcode)) {
    const latlngArray = [];
    const realEstateDataObj = {
      avg_home_value: 0,
      median_age: 0,
      median_household_income: 0,
    };
    let count = 0;

    zipcodeArray.forEach((zipcode) => {
      try {
        const { latitude, longitude } = zipcodes_latlng.filter(
          (obj) => obj["zip_code"] * 1 == zipcode
        )[0];
        const { avg_home_value, median_age, median_household_income } =
          realEstateData.filter((obj) => obj.zipcode === zipcode)[0];
        latlngArray.push({ lat: latitude * 1, lng: longitude * 1 });
        realEstateDataObj["avg_home_value"] += avg_home_value;
        realEstateDataObj["median_age"] += median_age;
        realEstateDataObj["median_household_income"] += median_household_income;
        count += 1;
      } catch (error) {
        console.log(`${zipcode}: ${error}`);
      }
    });

    //average the values inside
    for (let key of Object.keys(realEstateDataObj)) {
      realEstateDataObj[key] /= count;
    }
    const { avg_home_value, median_age, median_household_income } =
      realEstateDataObj;

    //center position:
    const bounds = new LatLngBounds();

    latlngArray.forEach((obj) => {
      bounds.extend(new LatLng(obj["lat"], obj["lng"]));
    });
    // centerPositionArray.push(bounds.getCenter());
    const svg = window.btoa(`
      <svg fill="white xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity=".0" r="70" />
      </svg>`);
    const position = bounds.getCenter();
    const marker = new Marker({
      position,
      title: borough,
      level: "borough",
      avg_home_value,
      median_age,
      median_household_income,
      label: {
        text: `\$ ${(avg_home_value / 1000).toFixed(1)}k`,
        color: "black",
        fontSize: "20px",
      },
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(45, 45),
      },
    });
    setBoroughMarkers((prev) => [...prev, marker]);
  }
}

// const clusterRenderer = {
//   render: (cluster, stats) => {
//     // Access to the cluster's attributes, check all available in the doc
//     const { markers, position, count } = cluster;
//     // Access to the stats' attributes if you need it

//     const svg = window.btoa(`
//     <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
//     <circle cx="120" cy="120" opacity=".6" r="70" />
//     <circle cx="120" cy="120" opacity=".3" r="90" />
//     <circle cx="120" cy="120" opacity=".2" r="110" />
//     <circle cx="120" cy="120" opacity=".1" r="130" />
//     </svg>`);
//     return new google.maps.Marker({
//       icon: {
//         url: `data:image/svg+xml;base64,${svg}`,
//         scaledSize: new google.maps.Size(45, 45),
//       },

//       label: {
//         text: `$${avgPrice.toFixed(1)}m`,
//         color: "white",
//       },
//       position: position,
//       map,
//       zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
//     });
//   },
// };
// new MarkerClusterer({
//   markers,
//   map,
//   renderer: clusterRenderer,
//   onClusterClick: async (event, cluster, map) => {
//     const infoWindow = document.getElementById("dashboard");
//     infoWindow.innerText = `Cluster center: ${cluster.position},
//         Number of markers: ${cluster.markers.length}`;
//     infoWindow.innerHTML += '<ul id="infoContent"> </ul>';
//     const infoContent = document.getElementById("infoContent");
//     cluster.markers.forEach((marker) => {
//       infoContent.innerHTML += `<li>ZIPCODE : ${marker.title}</li>`;
//     });
//   },
// });
//     }
//     onCleanup(() => {
//       if (markersOnMap) {
//         hideMarkers();

//         //clear the markers
//         zipcode_markers = [];
//         borough_markers = [];
//         neighbourhood_markers = [];
//       }
//     });
//   });

//   return null;
// };

export default Markers;
