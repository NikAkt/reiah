import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

export const MapComponent = (props) => {
  let ref;
  const [sideBarOpen, setSidebarOpen] = createSignal(false);
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions));
  const [borough, setBorough] = createSignal(false);
  const [neighbourhood, setNeighbourhood] = createSignal(true);
  const borough_geojson = props.dataResources.borough_geojson();
  const neighbourhood_geojson = props.dataResources.neighbourhood_geojson();

  function createCenterControl() {
    const centerControlDiv = document.createElement("div");
    const controlButton = document.createElement("button");

    controlButton.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    controlButton.addEventListener("click", () =>
      setSidebarOpen(!sideBarOpen())
    );
    // Set CSS for the control.
    controlButton.textContent = "Show List";
    controlButton.title = "Click to show details";
    controlButton.type = "button";

    centerControlDiv.append(controlButton);
    return centerControlDiv;
  }

  const insertDataLayer = (data, map) => {
    try {
      map.data.addGeoJson(data);
      map.data.setStyle(function (feature) {
        const geometryType = feature.getGeometry().getType();
        let color = "#10b981";
        if (feature.getProperty("isColorful")) {
          color = feature.getProperty("color");
        }
        if (geometryType === "MultiPolygon") {
          return {
            strokeColor: "#10b981",
            fillColor: color,
            strokeWeight: 2,
            fillOpacity: 0.1,
            clickable: true,
          };
        }
      });
      map.data.addListener("click", function (event) {
        event.feature.setProperty("isColorful", true);
      });
      map.data.addListener("mouseover", function (event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { strokeWeight: 3 });
        event.feature.setProperty("isColorful", true);
      });

      map.data.addListener("mouseout", function (event) {
        event.feature.setProperty("isColorful", false);
        map.data.revertStyle();
      });
    } catch (error) {
      console.log("error in loading data layer", error);
    }
  };

  const clearDataLayer = (map) => {
    console.log("trigger clear data layer");
    map.data.forEach(function (feature) {
      map.data.remove(feature);
    });
  };

  onMount(() => {
    loader.importLibrary("maps").then(({ Map }) => {
      if (!props.mapObject()) {
        props.setMapObject(new Map(ref, mapOptions));
        console.log("loading map object signal...");
      }
      console.log("start inserting data layer");
      insertDataLayer(neighbourhood_geojson, props.mapObject());
      // setNeighbourhood(true);
      // props.mapObject().data.addListener("mouseover", (event) => {
      //   // Reset the polygons to grey
      //   props.mapObject().data.forEach(function (feature) {
      //     props.mapObject().data.overrideStyle(feature, {
      //       fillColor: store.darkModeOn ? "white" : "black",
      //       strokeWeight: 1,
      //     });
      //   });
      props.mapObject().addListener("zoom_changed", () => {
        props.setMapZoom(props.mapObject().zoom);
      });

      props
        .mapObject()
        .controls[google.maps.ControlPosition.TOP_RIGHT].push(
          createCenterControl()
        );
      props.mapObject().data.addListener("click", (event) => {
        const zipcode = event.feature.getProperty("ZIPCODE");
        props.zipcodeSetter(zipcode);
      });
      // props.mapObject().data.overrideStyle(event.feature, { fillColor: "red" });
    });

    //automatically update mapZoom signal

    // props.mapObject().data.forEach(function (feature) {
    //   props.mapObject().data.overrideStyle(feature, {
    //     fillColor: store.darkModeOn ? "white" : "black",
    //     strokeWeight: 1,
    //   });
    // });
  });

  // props.mapObject().catch((e) => {
  //   console.error(e);
  // });

  createEffect(() => {
    if (props.mapObject() !== null) {
      props.mapObject().setOptions({
        styles: store.mapStyles[store.darkModeOn ? "dark" : "light"],
      });
      props.mapObject().data.forEach(function (feature) {
        props.mapObject().data.overrideStyle(feature, {
          fillColor: store.darkModeOn ? "white" : "black",
          strokeWeight: 1,
        });
      });

      props.mapObject().setZoom(sideBarOpen() ? 10 : 11);
      props.mapObject().setCenter(store.mapOptions.center);
    }
  });

  createEffect(() => {
    console.log("neighbourhood signal: ", neighbourhood());
    try {
      if (props.mapZoom() <= 10) {
        //if it has neighbourhood datalayer, clear the data layer
        if (neighbourhood()) {
          clearDataLayer(props.mapObject());
          setNeighbourhood(false);
        }
        //if not duplicated, insert the borough data layer
        if (!borough()) {
          insertDataLayer(borough_geojson, props.mapObject());
          setBorough(true);
        }
      } else {
        //datalayer changed to neighbourhood level
        if (borough()) {
          clearDataLayer(props.mapObject());
          setBorough(false);
        }
        //if not duplicated, insert the borough data layer
        if (!neighbourhood()) {
          insertDataLayer(neighbourhood_geojson, props.mapObject());
          setNeighbourhood(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <Suspense>
        <Show
          when={
            props.dataResources.borough_geojson() &&
            props.dataResources.neighbourhood_geojson()
          }
        >
          <div ref={ref} id="map" class="h-full basis-2/5 grow"></div>
        </Show>
      </Suspense>

      <div
        class={`bg-white dark:bg-gray-900 basis-3/5 drop-shadow overflow-scroll p-6 ${
          sideBarOpen() ? "" : "hidden"
        }`}
      >
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
        <div class="grid grid-cols-3 gap-6 mt-6">{props.children}</div>
      </div>
    </>
  );
};
