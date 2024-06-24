import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";
import * as mc from "@googlemaps/markerclusterer";
const { MarkerClusterer, GridAlgorithm } = mc;
import Chart from "chart.js/auto";
import Dashboard from "./Dashboard";
// import Plotly from "plotly.js-dist-min";

let zipcodes_latlng = {};
const [cluster_borough, setClusterBorough] = createSignal(true);
const [cluster_neighbourhood, setClusterNeighbourhood] = createSignal(false);

const Markers = (props) => {
  // console.log("data in markers", props.realEstateData);
  createEffect(async () => {
    // let Plotly = null;
    // Plotly = await import("plotly.js-dist-min");
    if (true) {
      const map = layerStore.map;

      const us_zip_codes = JSON.parse(props.us_zip_codes);

      for (let obj of us_zip_codes) {
        const { zip_code, latitude, longitude } = obj;
        zipcodes_latlng[zip_code] = { latitude, longitude };
      }
      let markers = [];

      const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);

      //cluster by borough

      //cluster by neighbourhood
      const findBoroughNeighbourhood = (zipcode) => {
        let borough = "",
          neighborhood = "",
          cdta = "";
        for (const boro in borough_neighbourhood) {
          for (const neigh in borough_neighbourhood[boro]) {
            for (const cdtaCode in borough_neighbourhood[boro][neigh]) {
              if (
                borough_neighbourhood[boro][neigh][cdtaCode].includes(zipcode)
              ) {
                borough = boro;
                neighborhood = neigh;
                cdta = cdtaCode;
                break;
              }
            }
          }
        }
        return [borough, neighborhood, cdta];
      };

      if (map) {
        console.log("Google Maps instance is available", layerStore.map);
        // const { AdvancedMarkerElement, PinElement } =
        //   await google.maps.importLibrary("marker");

        const historic_real_estate_data = JSON.parse(
          props.historicalRealEstateData
        );
        const data = JSON.parse(props.realEstateData);

        data.map((el) => {
          try {
            const [borough, neighbourhood, cdta] = findBoroughNeighbourhood(
              el["zipcode"]
            );
            if (borough && neighbourhood) {
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
                infoWindow.innerHTML +=
                  '<div id="plotly_js" class="w-[80%]"></div>';
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
              markers.push(marker);
            }
          } catch {
            console.log("problematic marker: ", el);
          }
        });

        let totalAvgPrice = 0;
        let count = 0;

        markers.map((marker) => {
          try {
            totalAvgPrice += marker["price"];
            count += 1;
          } catch (error) {
            console.log("problematic marker in calculating price: ", marker);
          }
        });

        totalAvgPrice /= count * 1000000;

        const createCluster = (map, markers, title) => {
          console.log(markers);
          const bounds = new google.maps.LatLngBounds();
          markers.forEach((marker) => {
            console.log("marker position", marker.getPosition());
            bounds.extend(marker.getPosition());
          });

          const clusterCenter = bounds.getCenter();
          console.log("clusterCenter", clusterCenter);
          const clusterMarker = new google.maps.Marker({
            position: clusterCenter,
            label: markers.length.toString(),
            map,
            title,
          });
          console.log(clusterMarker);
          clusterMarker.addListener("click", async ({ domEvent, latLng }) => {
            const dashboard = document.getElementById("dashboard");
            dashboard.innerHTML += `<p>${clusterMarker.title}</p>`;
          });
        };

        if (cluster_borough()) {
          let borough_markers = {};
          markers.forEach((marker) => {
            // console.log("marker", marker);
            if (!(marker["borough"] in borough_markers)) {
              borough_markers[marker.borough] = [marker];
            } else {
              borough_markers[marker.borough].push(marker);
            }
          });
          console.log(borough_markers);
          for (let key of Object.keys(borough_markers)) {
            createCluster(map, borough_markers[key], key);
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
    } else {
      console.log("Google Maps instance is not available yet");
    }
  });

  return null;
};

export default Markers;
