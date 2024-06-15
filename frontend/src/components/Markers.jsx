import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";
import * as mc from "@googlemaps/markerclusterer";
import cluster from "cluster";
const { MarkerClusterer, GridAlgorithm } = mc;

const markers = [];

function Markers() {
  // const [AdvancedMarker, setAdvancedMarker] = createSignal(null);
  // const [infoWindow, setInfoWindow] = createSignal(null);
  createEffect(async () => {
    if (isGoogleMapInitialized()) {
      const map = layerStore.map;
      if (map) {
        console.log("Google Maps instance is available", layerStore.google_map);
        const { AdvancedMarkerElement, PinElement } =
          await google.maps.importLibrary("marker");
        // if (!AdvancedMarker || !Pin) {

        //   setAdvancedMarker(AdvancedMarkerElement);
        //   setPin(PinElement);
        // }
        // console.log("AdvancedMarker", AdvancedMarker());

        // const marker = new AdvancedMarkerElement({
        //   map,
        //   position: { lat: 40.7128, lng: -74.006 },
        // });
        // Example: Add a marker
        // new google.maps.Marker({
        //   position: { lat: 40.7128, lng: -74.006 },
        //   map,
        //   title: "New York",
        // });
        fetch("/assets/cleaned_housing_data.json")
          .then((response) => response.json())
          .then((data) => {
            const icon = {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: "#81c7a5",
              fillOpacity: 1,
              strokeWeight: 0.4,
            };

            // const dataFilter = data.filter(
            //   (data) => data["business_type"] === "Home Services"
            // );
            // const unique_zipCode = [
            //   ...new Set(data.map((item) => item["zip_code"])),
            // ];
            // console.log(data[0]["longitude"] * 1);
            // const infoWindow = document.getElementById("dashboard");
            // infoWindow.innerText = data;
            // const dataFilter = data.filter((el) => {
            //   return el["business_type"] == unique_businessType[0];
            // });
            const markers = data.map((el) => {
              // const pin = new PinElement({
              //   glyph: el["median_home_value"].toString(),
              // });

              return new google.maps.Marker({
                map,
                position: {
                  lat: el["lat"],
                  lng: el["lng"] * 1,
                },
                label: {
                  text: `${el["median_home_value"] / 1000}k`,
                  color: "white",
                },
                price: el["median_home_value"],
                animation: google.maps.Animation.DROP,
                // gmpClickable: true,
                title: el["zipcode"],
                clickable: true,
                icon,
              });
            });

            //// change color if this cluster has more markers than the mean cluster

            // create svg url with fill color

            // const renderer = () => {
            //   const color =
            //     count > Math.max(10, stats.clusters.markers.mean)
            //       ? "#0145ac"
            //       : "#81c7a5";

            //   const svg = window.btoa(`
            // <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            // <circle cx="120" cy="120" opacity=".6" r="70" />
            // <circle cx="120" cy="120" opacity=".3" r="90" />
            // <circle cx="120" cy="120" opacity=".2" r="110" />
            // <circle cx="120" cy="120" opacity=".1" r="130" />
            // </svg>`);

            //   // create marker using svg icon
            //   return new google.maps.Marker({
            //     position,
            //     icon: {
            //       url: `data:image/svg+xml;base64,${svg}`,
            //       scaledSize: new google.maps.Size(45, 45),
            //     },
            //     label: {
            //       text: String(count),
            //       color: "rgba(255,255,255,0.9)",
            //       fontSize: "12px",
            //     },
            //     // adjust zIndex to be above other markers
            //     zIndex: 1000 + count,
            //   });
            // };
            // const renderer = {
            //   render: function ({ count, position }) {
            //     return new google.maps.Marker({
            //       label: {
            //         text: count.toString(),
            //         color: "red",
            //         fontSize: "50px",
            //       },
            //       position,
            //       icon: {
            //         url: "/assets/icon/home-service.svg",
            //         scaledSize: new google.maps.Size(45, 45),
            //       },
            //       title: "Zoom in to view resources in this area",
            //       // adjust zIndex to be above other markers
            //       zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            //     });
            //   },
            // };

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
                return new google.maps.Marker({
                  label: {
                    text: `${Math.ceil(avgPrice)}k`,
                    color: "white",
                  },
                  position: position,
                  icon,
                  map,
                  zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                });
              },
            };
            const mapCluster = new MarkerClusterer({
              markers,
              map,
              renderer: clusterRenderer,
              onClusterClick: (event, cluster, map) => {
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
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        // Add some markers to the map.

        // Add a marker clusterer to manage the markers.
      } else {
        console.log("Google Maps instance is not available yet");
      }
    }
  });

  return null;
}

export default Markers;
