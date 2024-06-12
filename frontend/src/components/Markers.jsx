import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";
import * as mc from "@googlemaps/markerclusterer";
import cluster from "cluster";
const { MarkerClusterer, GridAlgorithm } = mc;

const markers = [];

function Markers() {
  // const [AdvancedMarker, setAdvancedMarker] = createSignal(null);
  const [infoWindow, setInfoWindow] = createSignal(null);
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
        fetch("/assets/cleaned_business_data.json")
          .then((response) => response.json())
          .then((data) => {
            const anchor = new AdvancedMarkerElement({
              map,
              position: { lat: 40.7128, lng: -74.006 },
              gmpClickable: true,
              title: "anchor marker",
            });
            // const dataFilter = data.filter(
            //   (data) => data["business_type"] === "Home Services"
            // );
            const unique_businessType = [
              ...new Set(data.map((item) => item["business_type"])),
            ];
            const unique_zipCode = [
              ...new Set(data.map((item) => item["Zip Code"])),
            ];

            const dataFilter = data.filter((el) => {
              return el["business_type"] == unique_businessType[0];
            });
            console.log(dataFilter);
            const markers = dataFilter.map((el) => {
              const pin = new PinElement({
                glyph: el["business_type"],
              });
              return new AdvancedMarkerElement({
                map,
                position: { lat: el["Latitude"], lng: el["Longitude"] },
                content: pin.element,
                gmpClickable: true,
                title: "hello marker",
              });
            });
            // const renderer = {
            //   render: ({ count, position }) => {
            //     new AdvancedMarkerElement({
            //       map,
            //       position,
            //       content: new PinElement({
            //         glyph: count,
            //       }).element,
            //       gmpClickable: true,
            //       // adjust zIndex to be above other markers
            //     });
            //   },
            // };

            //// change color if this cluster has more markers than the mean cluster
            // const color =
            // count > Math.max(10, stats.clusters.markers.mean)
            //   ? "#ff0000"
            //   : "#0000ff";

            // // create svg url with fill color
            // const svg = window.btoa(`
            // <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            // <circle cx="120" cy="120" opacity=".6" r="70" />
            // <circle cx="120" cy="120" opacity=".3" r="90" />
            // <circle cx="120" cy="120" opacity=".2" r="110" />
            // <circle cx="120" cy="120" opacity=".1" r="130" />
            // </svg>`);

            // // create marker using svg icon
            // return new google.maps.Marker({
            // position,
            // icon: {
            //   url: `data:image/svg+xml;base64,${svg}`,
            //   scaledSize: new google.maps.Size(45, 45),
            // },
            // label: {
            //   text: String(count),
            //   color: "rgba(255,255,255,0.9)",
            //   fontSize: "12px",
            // },
            // // adjust zIndex to be above other markers
            // zIndex: 1000 + count,
            // });

            const mapCluster = new MarkerClusterer({
              markers,
              map,
              onClusterClick: (event, cluster, map) => {
                // console.log(cluster.markers[0].title);
                // console.log(event);
                // const infoWindow = new google.maps.InfoWindow({
                //   content: `Cluster center: ${cluster.position}, Number of markers: ${cluster.markers.length}`,
                // });

                // infoWindow.open({ map, anchor: anchor });
                // console.log("hello");
                // console.log(infoWindow);
                document.getElementById(
                  "infoWindow"
                ).innerText = `Cluster center: ${cluster.position}, Number of markers: ${cluster.markers.length}`;
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

  return (
    <div
      class="absolute bg-black left-[80vw] top-[20vh] w-[20vw] h-[30vh] z-30 flex text-white"
      id="infoWindow"
    ></div>
  );
}

export default Markers;
