import { Loader } from "@googlemaps/js-api-loader"
import { store } from "../data/stores";
import { createEffect, createSignal, onMount } from "solid-js";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly"
});

export const MapComponent = () => {
  let ref
  const [mapObject, setMapObject] = createSignal(null)
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions))

  onMount(() => {
    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        setMapObject(new Map(ref, mapOptions))
        mapObject().data.addGeoJson(store.geoJSONData)
      })
      .catch((e) => {
        console.error(e)
      });
  })

  createEffect(() => {
    if (mapObject() !== null) {
      mapObject().setOptions({ styles: store.mapStyles[store.darkModeOn ? "dark" : "light"] });
      mapObject().data.setStyle({
        fillColor: store.darkModeOn ? "white" : "dark",
        strokeWeight: 1
      });
    }
  })


  return (
    <div ref={ref} id="map" class="h-full basis-2/5 grow"></div>
  )
}
