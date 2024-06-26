import { onMount, createEffect, createSignal, onCleanup } from "solid-js";
import { layerStore } from "./layerStore";
// import * as mc from "@googlemaps/markerclusterer";
// const { MarkerClusterer, GridAlgorithm } = mc;
import Chart from "chart.js/auto";
// import Dashboard from "./Dashboard";

// import Plotly from "plotly.js-dist-min";
const [cluster_borough, setClusterBorough] = createSignal(true);
const [cluster_neighbourhood, setClusterNeighbourhood] = createSignal(false);
let zipcode_markers = [];
let borough_markers = [];
let neighbourhood_markers = [];
let markersOnMap = [];

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
async function generateHistoricTSData() {
  console.log("processing the data");
}

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

//create markers
async function createMarker(
  position,
  labelText,
  price,
  title,
  borough,
  neighbourhood,
  cdta
) {
  const marker = new google.maps.Marker({
    position: {
      lat: zipcodes_latlng[el["zipcode"]]["latitude"] * 1,
      lng: zipcodes_latlng[el["zipcode"]]["longitude"] * 1,
    },
    label: {
      text: `\$ ${(el["avg_home_value"] / 1000000).toFixed(1)}m`,
      color: "white",
      fontSize: "12px",
    },
    price: el["avg_home_value"],
    animation: google.maps.Animation.DROP,
    title: el["zipcode"].toString(),
    clickable: true,
    borough,
    neighbourhood,
    cdta,
  });
  marker.addListener("click", async ({ domEvent, latLng }) => {
    const infoWindow = document.getElementById("dashboard");

    infoWindow.innerText = `ZIPCODE: ${marker.title}`;
    infoWindow.innerHTML += '<canvas id="chart_js"></canvas>';
    infoWindow.innerHTML += '<div id="plotly_js" class="w-[80%]"></div>';
    const dataFilter = historic_real_estate_data.filter(
      ({ zipcode }) => String(zipcode) === marker.title
    );

    //chart js
    new Chart(document.getElementById("chart_js"), {
      type: "bar",
      data: {
        labels: Object.keys(dataFilter[0]["history"]),
        datasets: [
          {
            label: marker.title,
            data: Object.values(dataFilter[0]["history"]),
          },
        ],
      },
    });
  });
  return marker;
}

const Markers = (props) => {
  onMount(async () => {
    if (true) {
      //load json and data from store and props
      const map = layerStore.map;
      const us_zip_codes = JSON.parse(props.us_zip_codes);
      const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);
      const historic_real_estate_data = JSON.parse(
        props.historicalRealEstateData
      );
      const realEstatedata = JSON.parse(props.realEstateData);

      //create the object to check the relationship between borough--neighbourhood--zipcode

      //zipcode:{latitude,longitude}
      let zipcodes_latlng = {};
      for (let obj of us_zip_codes) {
        const { zip_code, latitude, longitude } = obj;
        zipcodes_latlng[zip_code] = { latitude, longitude };
      }

      //create the markers

      //if we have the map, then it is able to put the markers on the map

      //create the zipcode level markers
      realEstatedata.map((el) => {
        try {
          const [borough, neighbourhood, cdta] = findBoroughNeighbourhood(
            el["zipcode"]
          );

          //there may be situation that cannot find the zipcode from the given us_zip_code.json
          if (borough && neighbourhood) {
            const position = {
              lat: zipcodes_latlng[el["zipcode"]]["latitude"] * 1,
              lng: zipcodes_latlng[el["zipcode"]]["longitude"] * 1,
            };
            const labelText = `\$ ${(el["avg_home_value"] / 1000000).toFixed(
              1
            )}m`;

            const marker = createMarker(
              position,
              labelText,
              price,
              title,
              borough,
              neighbourhood,
              cdta
            );
            zipcode_markers.push(marker);
          }
        } catch {
          console.log("problematic marker: ", el);
        }
      });

      //calculate the average price of all zipcode

      const totalAvgPrice = calculateAvgPrice() / 1000000;

      // const color = avgPrice > totalAvgPrice ? "#0145ac" : "#81c7a5";

      const svg = window.btoa(`
        <svg fill="${"#0145ac"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <circle cx="120" cy="120" opacity=".6" r="70" />
        <circle cx="120" cy="120" opacity=".3" r="90" />
        <circle cx="120" cy="120" opacity=".2" r="110" />
        <circle cx="120" cy="120" opacity=".1" r="130" />
      </svg>`);

      const initialSize = 50;
      const finalSize = 100;
      const sizeDifference = finalSize - initialSize;

      const createCluster = (map, markers, title, numSplit, rank) => {
        const gap = Math.floor(sizeDifference / numSplit);

        const size = initialSize + gap * rank;

        const icon = {
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(size, size),
        };
        const bounds = new google.maps.LatLngBounds();
        let totalPriceMarker = 0;
        let markersInclude = [];
        markers.forEach((marker) => {
          bounds.extend(marker.getPosition());
          totalPriceMarker += marker.price * 1;
          markersInclude.push(marker.title);
        });

        totalPriceMarker /= markers.length * 1000;

        const clusterCenter = bounds.getCenter();
        const clusterMarker = new google.maps.Marker({
          position: clusterCenter,
          label: {
            text: `\$ ${totalPriceMarker.toFixed(0)} k`,
            color: "white",
          },
          map,
          title,
          markersInclude,
          icon,
          animation: google.maps.Animation.DROP,
        });

        clusterMarker.addListener("click", async ({ domEvent, latLng }) => {
          console.log("clusterMarker", clusterMarker);
          const dataToPut = {
            title: clusterMarker.title,
            markersInclude: clusterMarker.markersInclude,
            avgPrice: clusterMarker.label.text,
          };
          props.setInfoCardData((prev) => [...prev, dataToPut]);
          // 10454
          const dataFilter = historic_real_estate_data.filter(
            ({ zipcode }) => String(zipcode) === "10454"
          );

          //chart js

          new Chart(document.getElementById("chart_js"), {
            type: "bar",
            data: {
              labels: Object.keys(dataFilter[0]["history"]),
              datasets: [
                {
                  label: "10454",
                  data: Object.values(dataFilter[0]["history"]),
                },
              ],
            },
          });
        });
        markersOnMap.push(clusterMarker);
      };

      if (cluster_borough()) {
        //seperate the markers into borough
        let borough_markers = {};
        zipcode_markers.forEach((marker) => {
          if (!(marker["borough"] in borough_markers)) {
            borough_markers[marker.borough] = { marker: [], avgPrice: 0 };
            borough_markers[marker.borough]["marker"].push(marker);
            borough_markers[marker.borough]["avgPrice"] += marker["price"] * 1;
          } else {
            borough_markers[marker.borough]["marker"].push(marker);
            borough_markers[marker.borough]["avgPrice"] += marker["price"] * 1;
          }
        });

        //generate the ranking of markers according to their avgPrice
        // and dynamically set the marker size

        //calculate the avgerage price
        for (let key of Object.keys(borough_markers)) {
          borough_markers[key]["avgPrice"] /=
            borough_markers[key]["marker"].length;
        }

        //sort the object ascendingly according to avgPrice
        const boroughsArray = Object.entries(borough_markers);
        boroughsArray.sort((obj1, obj2) => obj1[1].avgPrice - obj2[1].avgPrice);

        const sorted_borough_markers = Object.fromEntries(boroughsArray);

        let rank = 0;
        for (let key of Object.keys(sorted_borough_markers)) {
          console.log("sorted borough markers", boroughsArray.length);
          createCluster(
            map,
            borough_markers[key]["marker"],
            key,
            boroughsArray.length,
            rank
          );

          rank += 1;
        }
      } else if (cluster_neighbourhood()) {
        let neigh_markers = {};
        markers.forEach((marker) => {
          if (!(marker.neighbourhood in Object.keys(neigh_markers))) {
            neigh_markers[marker.neighbourhood] = [];
          } else {
            neigh_markers[marker.neighbourhood].push(marker);
          }
        });
      }

      // const clusterRenderer = {
      //   render: (cluster, stats) => {
      //     // Access to the cluster's attributes, check all available in the doc
      //     const { markers, position, count } = cluster;
      //     // Access to the stats' attributes if you need it

      //     let avgPrice = 0;
      //     markers.map((marker) => {
      //       avgPrice += marker.price * 1;
      //     });
      //     avgPrice /= count * 1000000;
      //     const color = avgPrice > totalAvgPrice ? "#0145ac" : "#81c7a5";

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
    }
    onCleanup(() => {
      if (markersOnMap) {
        hideMarkers();

        //clear the markers
        zipcode_markers = [];
        borough_markers = [];
        neighbourhood_markers = [];
      }
    });
  });

  return null;
};

export default Markers;
