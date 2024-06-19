import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";
import * as mc from "@googlemaps/markerclusterer";
const { MarkerClusterer, GridAlgorithm } = mc;
import Chart from "chart.js/auto";
// import Plotly from "plotly.js-dist-min";

let markers;

const Markers = (props) => {
  // console.log("data in markers", props.realEstateData);
  createEffect(async () => {
    // let Plotly = null;
    // Plotly = await import("plotly.js-dist-min");
    console.log(layerStore.map);
    if (layerStore.map && !markers) {
      const map = layerStore.map;
      const icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 15,
        fillColor: "#81c7",
        fillOpacity: 1,
        strokeWeight: 0.4,
      };

      if (map) {
        console.log("Google Maps instance is available", layerStore.google_map);
        // const { AdvancedMarkerElement, PinElement } =
        //   await google.maps.importLibrary("marker");
        const infoWindow = new google.maps.InfoWindow({
          content: "",
          ariaLabel: "Uluru",
        });
        const data = JSON.parse(props.realEstateData);
        const historic_real_estate_data = JSON.parse(
          props.historicalRealEstateData
        );

        markers = data.map((el) => {
          const marker = new google.maps.Marker({
            map,
            position: {
              lat: el["lat"] * 1,
              lng: el["lng"] * 1,
            },
            label: {
              text: `\$ ${(el["avg_home_value"] / 1000).toFixed(2)}k`,
              color: "white",
              fontSize: "12px",
            },
            price: el["avg_home_value"],
            animation: google.maps.Animation.DROP,
            title: el["zipcode"].toString(),
            clickable: true,
            icon,
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
                labels: Object.keys(dataFilter[0]),
                datasets: [
                  {
                    label: marker.title,
                    data: Object.values(dataFilter[0]),
                  },
                ],
              },
            });
          });
          return marker;
        });

        let totalAvgPrice = 0;
        markers.map((marker) => {
          totalAvgPrice += marker.price;
        });
        totalAvgPrice /= markers.length * 1000;

        const clusterRenderer = {
          render: (cluster, stats) => {
            // Access to the cluster's attributes, check all available in the doc
            const { markers, position, count } = cluster;
            // Access to the stats' attributes if you need it

            let avgPrice = 0;
            markers.map((marker) => {
              avgPrice += marker.price * 1;
            });
            avgPrice /= count * 1000;
            const color = avgPrice > totalAvgPrice ? "#0145ac" : "#81c7a5";

            const svg = window.btoa(`
            <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            <circle cx="120" cy="120" opacity=".6" r="70" />
            <circle cx="120" cy="120" opacity=".3" r="90" />
            <circle cx="120" cy="120" opacity=".2" r="110" />
            <circle cx="120" cy="120" opacity=".1" r="130" />
            </svg>`);
            return new google.maps.Marker({
              icon: {
                url: `data:image/svg+xml;base64,${svg}`,
                scaledSize: new google.maps.Size(45, 45),
              },

              label: {
                text: `$${Math.ceil(avgPrice)}k`,
                color: "white",
              },
              position: position,
              map,
              zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            });
          },
        };
        const mapCluster = new MarkerClusterer({
          markers,
          map,
          renderer: clusterRenderer,
          onClusterClick: async (event, cluster, map) => {
            const infoWindow = document.getElementById("dashboard");
            infoWindow.innerText = `Cluster center: ${cluster.position}, 
                Number of markers: ${cluster.markers.length}`;
            infoWindow.innerHTML += '<ul id="infoContent"> </ul>';
            const infoContent = document.getElementById("infoContent");
            cluster.markers.forEach((marker) => {
              infoContent.innerHTML += `<li>ZIPCODE : ${marker.title}</li>`;
            });
          },
        });
      }
    } else {
      console.log("Google Maps instance is not available yet");
    }
  });

  return null;
};

export default Markers;
