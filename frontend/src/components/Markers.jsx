import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";

function Markers() {
  const [AdvancedMarker, setAdvancedMarker] = createSignal(null);
  const [Pin, setPin] = createSignal(null);
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

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: 40.7128, lng: -74.006 },
        });
        // Example: Add a marker
        // new google.maps.Marker({
        //   position: { lat: 40.7128, lng: -74.006 },
        //   map,
        //   title: "New York",
        // });
        // fetch("/assets/cleaned_business_data.json")
        //   .then((response) => response.json())
        //   .then((data) => {
        //     // const dataFilter = data.filter(
        //     //   (data) => data["business_type"] === "Home Services"
        //     // );
        //     const unique = [
        //       ...new Set(data.map((item) => item["business_type"])),
        //     ];
        //     console.log("unique:", unique);
        //     const dataFilter = data.slice(0, 200);
        //     dataFilter.forEach((el) => {
        //       //console.log(el["Latitude"]);
        //       new AdvancedMarkerElement({
        //         map,
        //         position: { lat: el["Latitude"], lng: el["Longitude"] },
        //       });
        //     });
        //   })
        //   .catch((error) => {
        //     console.error("Error:", error);
        //   });
      } else {
        console.log("Google Maps instance is not available yet");
      }
    }
  });

  return null;
}

export default Markers;
