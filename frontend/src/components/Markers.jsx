import { createSignal, onCleanup, onMount } from "solid-js";
import { layerStore, setLayerStore } from "./layerStore";

const Markers = (props) => {
  // console.log(props.AdvancedMarkerElement());
  // const marker = new AdvancedMarkerElement({
  //   map,
  //   position: { lat: 40.8636241732, lng: -73.8558279928 },
  // });
  fetch("/assets/cleaned_business_data.json")
    .then((response) => response.json())
    .then((data) => {
      console.log(data[0]);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export default Markers;
