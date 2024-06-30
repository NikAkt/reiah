import {
  onMount,
  createEffect,
  createSignal,
  onCleanup,
  Suspense,
  Show,
} from "solid-js";
import { store } from "../data/stores";
import { Loader } from "@googlemaps/js-api-loader";
import { realEstateData } from "../data/dataToBeSent";
import { borough_neighbourhood } from "../data/dataToBeSent";

const [cluster_borough, setClusterBorough] = createSignal(true);
const [cluster_neighbourhood, setClusterNeighbourhood] = createSignal(false);
let zipcode_markers = [];
let borough_markers = [];
let neighbourhood_markers = [];
let markersOnMap = [];
// const svg = window.btoa(`
//   <svg fill="${"#0145ac"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
//   <circle cx="120" cy="120" opacity=".6" r="70" />
//   <circle cx="120" cy="120" opacity=".3" r="90" />
//   <circle cx="120" cy="120" opacity=".2" r="110" />
//   <circle cx="120" cy="120" opacity=".1" r="130" />
// </svg>`);
// const color = avgPrice > totalAvgPrice ? "#0145ac" : "#81c7a5";

//marker size range
// const initialSize = 50;
// const finalSize = 100;
// const sizeDifference = finalSize - initialSize;

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markersOnMap.length; i++) {
    markersOnMap[i].setMap(map);
  }
}
// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}

//generate the historic time series data

//calculate the avgerage price
async function calculateAvgPrice() {
  let totalAvgPrice = 0;
  let count = 0;

  zipcode_markers.map((marker) => {
    try {
      totalAvgPrice += marker["price"];
      count += 1;
    } catch (error) {
      console.log("problematic marker in calculating price: ", marker);
    }
  });
  return totalAvgPrice / count;
}

//find the borough and neighbourhood and cdta according the zipcode
async function findBoroughNeighbourhood(zipcode, borough_neighbourhood) {
  let borough = "",
    neighborhood = "",
    cdta = "";
  for (const boro in borough_neighbourhood) {
    for (const neigh in borough_neighbourhood[boro]) {
      for (const cdtaCode in borough_neighbourhood[boro][neigh]) {
        if (borough_neighbourhood[boro][neigh][cdtaCode].includes(zipcode)) {
          borough = boro;
          neighborhood = neigh;
          cdta = cdtaCode;
          break;
        }
      }
    }
  }
  return [borough, neighborhood, cdta];
}

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

async function fetchZipcodes() {
  let zipcode = null;
  try {
    const response = await fetch("http://localhost:8000/api/zipcodes");
    const data = await response.json();
    zipcode = data;
  } catch (error) {
    console.error("Error fetching zipcodes:", error);
  }
  return zipcode;
}

fetchZipcodes();

const Markers = async (props) => {
  // Load the maps library
  // loader
  //   .importLibrary("core")
  //   .then((coreLibrary) => {
  //     // Destructure the LatLngBounds class from the loaded map library
  //     const { LatLngBounds } = coreLibrary;

  //     // Check if LatLngBounds is correctly imported
  //     console.log(LatLngBounds);

  //     // Example usage of LatLngBounds (optional, just for demonstration)
  //     const bounds = new LatLngBounds(
  //       { lat: 40.712, lng: -74.227 }, // southwest corner
  //       { lat: 40.774, lng: -74.125 } // northeast corner
  //     );

  //     const position = bounds.getCenter();

  //     // Log the created bounds (optional)
  //     console.log("center", position.lat(), position.lng());

  //     // Log the amenities data
  //     console.log(props.dataResources.amenitiesData());
  //   })
  //   .catch((error) => {
  //     console.error("Error loading the maps library:", error);
  //   });
  loader.importLibrary("marker").then(async (markerLibrary) => {
    const { Marker } = markerLibrary;
    console.log("Marker", Marker);
    // Destructure the LatLngBounds class from the loaded map library
    const zipcode_latlng = await fetchZipcodes();

    console.log("realestatedata", realEstateData);

    const ny_zipcodes = [10458, 10467, 10468];

    ny_zipcodes.forEach((zipcode) => {
      //position, labelText, title, cdta, level
      const zipcode_obj = zipcode_latlng.filter(
        (obj) => obj["zip_code"] === zipcode.toString()
      );

      const position = {
        lat: zipcode_obj[0]["latitude"] * 1,
        lng: zipcode_obj[0]["longitude"] * 1,
      };

      const level = "zipcode";
      const title = zipcode.toString();
      const cdta = "";

      const price_obj = realEstateData.filter(
        (obj) => obj.zipcode === zipcode
      )[0];

      const labelText = price_obj["avg_home_value"].toString();
      const marker = new Marker({
        position,
        label: {
          text: labelText,
          color: "white",
          fontSize: "12px",
        },
        // animation: google.maps.Animation.DROP,
        title,
        clickable: true,
        cdta,
        level,
      });
      console.log(marker);
    });
  });
};

//   onMount(async () => {
//     if (true) {
//       //load json and data from store and props
//       const map = layerStore.map;
//       const us_zip_codes = JSON.parse(props.us_zip_codes);
//       const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);
//       const historic_real_estate_data = JSON.parse(
//         props.historicalRealEstateData
//       );
//       const realEstatedata = JSON.parse(props.realEstateData);

//       //create the object to check the relationship between borough--neighbourhood--zipcode

//       //zipcode:{latitude,longitude}
//       let zipcodes_latlng = {};
//       for (let obj of us_zip_codes) {
//         const { zip_code, latitude, longitude } = obj;
//         zipcodes_latlng[zip_code] = { latitude, longitude };
//       }

//       //if we have the map, then it is able to put the markers on the map

//       //create the zipcode level markers
//       realEstatedata.map((el) => {
//         try {
//           const [borough, neighbourhood, cdta] = findBoroughNeighbourhood(
//             el["zipcode"]
//           );

//           //there may be situation that cannot find the zipcode from the given us_zip_code.json
//           if (borough && neighbourhood) {
//             const position = {
//               lat: zipcodes_latlng[el["zipcode"]]["latitude"] * 1,
//               lng: zipcodes_latlng[el["zipcode"]]["longitude"] * 1,
//             };
//             const labelText = `\$ ${(el["avg_home_value"] / 1000000).toFixed(
//               1
//             )}m`;
//             const price = el["avg_home_value"];
//             const title = el["zipcode"].toString();

//             const marker = createMarker(
//               position,
//               labelText,
//               price,
//               title,
//               borough,
//               neighbourhood,
//               cdta,
//               "zipcode"
//             );
//             zipcode_markers.push(marker);
//           }
//         } catch {
//           console.log("problematic marker: ", el);
//         }
//       });

//       //calculate the average price of all zipcode
//       // const totalAvgPrice = calculateAvgPrice() / 1000000;

//       //marker icon svg

//       //create cluster

//       if (cluster_borough()) {
//         //set the borough markers to the map and clear out the other types of markers
//       } else if (cluster_neighbourhood()) {
//         //set the neighbourhood markers to the map and clear out the other types of markers
//       } else {
//         //set the zipcode markers
//       }

//       // const clusterRenderer = {
//       //   render: (cluster, stats) => {
//       //     // Access to the cluster's attributes, check all available in the doc
//       //     const { markers, position, count } = cluster;
//       //     // Access to the stats' attributes if you need it

//       //     const svg = window.btoa(`
//       //     <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
//       //     <circle cx="120" cy="120" opacity=".6" r="70" />
//       //     <circle cx="120" cy="120" opacity=".3" r="90" />
//       //     <circle cx="120" cy="120" opacity=".2" r="110" />
//       //     <circle cx="120" cy="120" opacity=".1" r="130" />
//       //     </svg>`);
//       //     return new google.maps.Marker({
//       //       icon: {
//       //         url: `data:image/svg+xml;base64,${svg}`,
//       //         scaledSize: new google.maps.Size(45, 45),
//       //       },

//       //       label: {
//       //         text: `$${avgPrice.toFixed(1)}m`,
//       //         color: "white",
//       //       },
//       //       position: position,
//       //       map,
//       //       zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
//       //     });
//       //   },
//       // };
//       // new MarkerClusterer({
//       //   markers,
//       //   map,
//       //   renderer: clusterRenderer,
//       //   onClusterClick: async (event, cluster, map) => {
//       //     const infoWindow = document.getElementById("dashboard");
//       //     infoWindow.innerText = `Cluster center: ${cluster.position},
//       //         Number of markers: ${cluster.markers.length}`;
//       //     infoWindow.innerHTML += '<ul id="infoContent"> </ul>';
//       //     const infoContent = document.getElementById("infoContent");
//       //     cluster.markers.forEach((marker) => {
//       //       infoContent.innerHTML += `<li>ZIPCODE : ${marker.title}</li>`;
//       //     });
//       //   },
//       // });
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

//create markers
/**
 * position:{lat,lng}
 * labelText:String
 * title: String
 * cdta:String
 * level: String
 */

/**
 *
 * @param {object} markers_obj {borough:{marker,avgPrice}}
 */

// async function sortMarkersObj(markers_obj) {
//   //sort the markers ascendingly by home value or other value
//   const markersArray = Object.entries(markers_obj);
//   markersArray.sort((m1, m2) => m1.price - m2.price);
//   const sorted_separated_obj = Object.fromEntries(markersArray);
//   return sorted_separated_obj;
// }

// async function createBoroughMarker(zipcode_markers) {
//   //seperate the markers according to borough
//   //borough_separated_obj = {"Bronx":{marker:[markersArray],avgPrice:number}}
//   let borough_separated_obj = {};
//   zipcode_markers.forEach((marker) => {
//     if (!(marker["borough"] in borough_separated_obj)) {
//       borough_separated_obj[marker.borough] = {
//         marker: [marker],
//         avgPrice: marker["price"] * 1,
//       };
//     } else {
//       borough_separated_obj[marker.borough]["marker"].push(marker);
//       borough_separated_obj[marker.borough]["avgPrice"] += marker["price"] * 1;
//     }
//   });

//   //calculate the avgerage price
//   for (let key of Object.keys(borough_separated_obj)) {
//     borough_separated_obj[key]["avgPrice"] /=
//       borough_separated_obj[key]["marker"].length;
//   }

//   //sort the object ascendingly according to avgPrice
//   borough_separated_obj = sortMarkersObj(borough_separated_obj);

//   //calculate the size of the icon
//   const gap = Math.floor(sizeDifference / borough_separated_obj.marker.length);

//   // let rank = 0;
//   //create the marker
//   for (key in Object.keys(borough_separated_obj)) {
//     const obj = borough_separated_obj[key];
//     const size = initialSize + gap * rank;
//     const icon = {
//       url: `data:image/svg+xml;base64,${svg}`,
//       scaledSize: new google.maps.Size(size, size),
//     };

//     //calculate the center point of all of the markers included
//     const bounds = new google.maps.LatLngBounds();
//     obj.marker.forEach((marker) => {
//       bounds.extend(marker.getPosition());
//     });
//     const position = bounds.getCenter();
//     // rank += 1;

//     const title = key.toSting();
//     const borough = key.toString();
//     const neighbourhood = [...obj.marker.neighborhood];
//     const cdta = "";
//     const level = "borough";
//     const tsData = [];
//     const borough_marker = createMarker(
//       position,
//       obj["avgPrice"].toString(),
//       obj["avgPrice"],
//       title,
//       borough,
//       neighbourhood,
//       cdta,
//       // tsData,
//       level
//     );
//     borough_markers.push(borough_marker);
//   }
// }
