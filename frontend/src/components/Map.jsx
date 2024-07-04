import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";
// import { AirBNBSlider } from "./AirBNBSlider";
import { zipcode_geojson } from "../data/dataToBeSent";

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
    // Create the main control container
    const centerControlDiv = document.createElement("div");

    // Create the button element
    const controlButton = document.createElement("button");
    controlButton.textContent = sideBarOpen() ? "Hide List" : "Show List";
    controlButton.title = "Click to show details";
    controlButton.type = "button";
    controlButton.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    controlButton.addEventListener("click", () =>
      setSidebarOpen(!sideBarOpen())
    );

    // Create the hover location div
    const hoverLocationDiv = document.createElement("div");
    hoverLocationDiv.className =
      "absolute rounded shadow-md color-zinc-900 bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";

    // Create the inner div and span
    const innerDiv = document.createElement("div");
    innerDiv.textContent = "Location: ";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "hoverLocation-div";

    // Append the span to the inner div
    innerDiv.appendChild(input);

    // Append the inner div to the hover location div
    hoverLocationDiv.appendChild(innerDiv);

    // Append the button and hover location div to the main control container
    centerControlDiv.append(controlButton, hoverLocationDiv);

    return centerControlDiv;
  }

  function handleDataLayerClick(info) {
    console.log("info", info);
    //gonna add a zipcode level data layer later
    let level, area;
    if (props.getDataLayerLevel() === "borough") {
      level = "borough";
      area = info["Fg"]["boro_name"];
    } else if (props.getDataLayerLevel() === "neighbourhood") {
      level = "cdta";
      area = info["Fg"]["cdta2020"];
    } else if (props.getDataLayerLevel() === "zipcode") {
      level = "zipcode";
      area = null;
    }
    console.log("level,area", level, area);
    return { level, area };
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
        if (geometryType === "MultiPolygon" || geometryType === "Polygon") {
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
        const { level, area } = handleDataLayerClick(event.feature);

        const zipcode = event.feature.getProperty("ZIPCODE");
        console.log("zipcode", zipcode);
        // switch (level) {
        //   case "zipcode":
        //     props.zipcodeSetter(area);
        //   case "borough":
        //     props.boroughSetter(area);
        //   case "cdta":
        //     props.neighbourhoodSetter(area);
        // }
        props.zipcodeSetter(zipcode);
      });

      map.data.addListener("mouseover", function (event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {
          strokeColor: "#0145ac",
          strokeWeight: 3,
          fillColor: "#a888f1",
          fillOpacity: 0.7,
          clickable: true,
        });
        event.feature.setProperty("isColorful", true);
        document.getElementById("hoverLocation-div").value =
          event.feature.getProperty("ZIPCODE");
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
    if (map) {
      map.data.forEach(function (feature) {
        map.data.remove(feature);
      });
    }
  };

  onMount(() => {
    loader.importLibrary("maps").then(({ Map }) => {
      props.setMapObject(new Map(ref, mapOptions));
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
        const mapZoom = props.mapObject().zoom;
        console.log("mapzoom", mapZoom);
        if (mapZoom <= 10) {
          props.setDataLayerLevel("borough");
        } else if (mapZoom > 10 && mapZoom <= 13) {
          props.setDataLayerLevel("neighbourhood");
        } else {
          props.setDataLayerLevel("zipcode");
        }
        // console.log(props.getDataLayerLevel());
      });

      props
        .mapObject()
        .controls[google.maps.ControlPosition.TOP_RIGHT].push(
          createCenterControl()
        );
      insertDataLayer(zipcode_geojson, props.mapObject());

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

  //change data layer according to zoom
  // createEffect(() => {
  //   // console.log("neighbourhood signal: ", neighbourhood());
  //   try {
  //     if (props.getDataLayerLevel() === "borough") {
  //       //if it has neighbourhood datalayer, clear the data layer
  //       if (props.mapObject().data) {
  //         // clearDataLayer(props.mapObject());
  //         // setNeighbourhood(false);
  //       }
  //       //if not duplicated, insert the borough data layer
  //       // if (!borough()) {
  //       // insertDataLayer(borough_geojson, props.mapObject());
  //       // setBorough(true);
  //       // }
  //     } else if (props.getDataLayerLevel() === "neighbourhood") {
  //       //datalayer changed to neighbourhood level
  //       // clearDataLayer(props.mapObject());
  //       // setBorough(false);
  //       //if not duplicated, insert the borough data layer
  //       // if (!neighbourhood()) {
  //       // insertDataLayer(neighbourhood_geojson, props.mapObject());
  //       // setNeighbourhood(true);
  //       // }
  //     } else if (props.getDataLayerLevel() === "zipcode") {
  //       // insertDataLayer(zipcode_geojson, props.mapObject());

  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

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
        class={`bg-white dark:bg-gray-900 w-[60vw] gap-2 
      right-0 h-screen flex flex-col
          drop-shadow overflow-scroll p-6 ${sideBarOpen() ? "" : "hidden"}`}
      >
        <Show when={props.isLoading}>
          <div class="flex flex-col gap-2 animate-pulse">
            <div class="h-6 w-3/12 rounded-lg bg-neutral-300" />
            <div class="h-6 w-2/12 rounded-lg bg-neutral-300" />
          </div>
        </Show>
        <Show when={!props.isLoading}>
          <div>
            <h1 class="font-medium">
              {`Information on ${props.zipcodeOnCharts()}`}
            </h1>
            <h2 class="txt-neutral-500 text-sm">click for more information</h2>
            <div class="relative w-[95%] h-[1px] mt-[2%] bg-[#E4E4E7]"></div>
          </div>
        </Show>
        <div class="gap-6 mt-6 py-3 flex flex-col">
          <div class="flex flex-col">{props.children}</div>
        </div>
      </div>
    </>
  );
};
