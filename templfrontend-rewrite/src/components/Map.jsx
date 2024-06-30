import { Loader } from "@googlemaps/js-api-loader"
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show } from "solid-js";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly"
});



export const MapComponent = (props) => {
  let ref
  const [mapObject, setMapObject] = createSignal(null)
  const [sideBarOpen, setSidebarOpen] = createSignal(false)
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions))


  function createCenterControl() {
    const centerControlDiv = document.createElement("div")
    const controlButton = document.createElement("button");

    controlButton.className = "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center"
    controlButton.addEventListener("click", () => setSidebarOpen(!sideBarOpen()))
    // Set CSS for the control.
    controlButton.textContent = "Show List";
    controlButton.title = "Click to show details";
    controlButton.type = "button";

    centerControlDiv.append(controlButton)
    return centerControlDiv
  }

  onMount(() => {
    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        setMapObject(new Map(ref, mapOptions))
        mapObject().data.addGeoJson(JSON.parse(JSON.stringify(store.geoJSONData)))
        mapObject().data.addListener("mouseover", (event) => {
          //Reset the polygons to grey
          mapObject().data.forEach(function(feature) {
            mapObject().data.overrideStyle(feature, { fillColor: store.darkModeOn ? "white" : "black", strokeWeight: 1 })
          })

          mapObject().data.overrideStyle(event.feature, { "fillColor": "red" })
        });

        mapObject().data.forEach(function(feature) {
          mapObject().data.overrideStyle(feature, { fillColor: store.darkModeOn ? "white" : "black", strokeWeight: 1 })
        })
        mapObject().controls[google.maps.ControlPosition.TOP_RIGHT].push(createCenterControl());
        mapObject().data.addListener("click", (event) => {
          const zipcode = event.feature.getProperty("ZIPCODE")
          props.zipcodeSetter(zipcode)
        });
      })
      .catch((e) => {
        console.error(e)
      });
  })

  createEffect(() => {
    if (mapObject() !== null) {
      mapObject().setOptions({ styles: store.mapStyles[store.darkModeOn ? "dark" : "light"] });
      mapObject().data.forEach(function(feature) {
        mapObject().data.overrideStyle(feature, { fillColor: store.darkModeOn ? "white" : "black", strokeWeight: 1 })
      })

      mapObject().setZoom(sideBarOpen() ? 10 : 11)
      mapObject().setCenter(store.mapOptions.center)
    }
  })


  return (
    <>
      <div ref={ref} id="map" class="h-full basis-2/5 grow"></div>
      <div class={`bg-white dark:bg-gray-900 basis-3/5 drop-shadow overflow-scroll p-6 ${sideBarOpen() ? "" : "hidden"}`}>
        <Show when={props.isLoading}>
          <div class="flex flex-col gap-2 animate-pulse">
            <div class="h-6 w-3/12 rounded-lg bg-neutral-300" />
            <div class="h-6 w-2/12 rounded-lg bg-neutral-300" />
          </div>
        </Show>
        <Show when={!props.isLoading}>
          <div>
            <h1 class="font-medium">Information on 12345</h1>
            <h2 class="txt-neutral-500 text-sm">click for more information</h2>
          </div>
        </Show>
        <div class="grid grid-cols-3 gap-6 mt-6">
          {props.children}
        </div>
      </div>
    </>
  )
}
