import { Loader } from "@googlemaps/js-api-loader"
import { store } from "../data/stores";
import { onMount } from "solid-js";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly"
});


export const MapComponent = () => {
  let ref
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions))
  onMount(() => {
    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        new Map(ref, mapOptions);
      })
      .catch((e) => {
        console.error(e)
      });
  })
  return (
    <div ref={ref} id="map" class="h-full basis-2/5 grow"></div>
  )
}
