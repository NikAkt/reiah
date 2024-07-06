import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";
import { zipcode_geojson } from "../data/dataToBeSent";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const colors = {
  default: "#10b981", // Green for default
  highlight: "#a888f1", // Purple for hover
  clicked: "#36A2EB", // Blue for clicked
  selected: "#FFA500", // Orange for selected
};

export const MapComponent = (props) => {
  let ref;
  const [sideBarOpen, setSidebarOpen] = createSignal(false);
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions));
  const [lastClickedZipCode, setLastClickedZipCode] = createSignal(null);

  function createCenterControl() {
    const centerControlDiv = document.createElement("div");
    centerControlDiv.className = !sideBarOpen()
      ? "w-[80%] overflow-x-auto flex"
      : "w-[80%] overflow-x-auto flex flex-col";

    const controlButton = document.createElement("button");
    controlButton.textContent = sideBarOpen() ? "Hide List" : "Show List";
    controlButton.title = "Click to show details";
    controlButton.type = "button";
    controlButton.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    controlButton.addEventListener("click", () =>
      setSidebarOpen(!sideBarOpen())
    );

    const hoverLocationDiv = document.createElement("div");
    hoverLocationDiv.className =
      "w-[20%] rounded shadow-md color-zinc-900 bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";

    const innerDiv = document.createElement("div");
    innerDiv.textContent = "Location: ";
    innerDiv.className = "flex justify-center items-center";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "hoverLocation-div";
    input.className = "relative w-[100%] bg-transparent text-center";

    innerDiv.appendChild(input);
    hoverLocationDiv.appendChild(innerDiv);

    const recommendZipBtn = document.createElement("button");
    recommendZipBtn.textContent = "Recommend Zipcode";
    recommendZipBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";

    centerControlDiv.append(
      hoverLocationDiv,
      controlButton,
      recommendZipBtn
    );

    return centerControlDiv;
  }

  const insertDataLayer = (data, map) => {
    clearDataLayer(map); // Clear existing layers before adding new ones
    map.data.addGeoJson(data);
    map.data.setStyle((feature) => {
      const zipCode = feature.getProperty("ZIPCODE");
      if (zipCode === lastClickedZipCode()) {
        return {
          fillColor: colors.clicked, // Blue for clicked
          strokeColor: colors.clicked,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else if (props.filteredZipCodes().includes(parseInt(zipCode))) {
        return {
          fillColor: colors.selected, // Orange for matched zip codes
          strokeColor: colors.selected,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else {
        return {
          fillColor: colors.default, // Green for default
          strokeColor: colors.default,
          fillOpacity: 0.1,
          strokeWeight: 2,
        };
      }
    });

    map.data.addListener("click", (event) => {
      setLastClickedZipCode(event.feature.getProperty("ZIPCODE"));
      map.data.revertStyle();
      event.feature.setProperty("isColorful", true);
      const zipcode = event.feature.getProperty("ZIPCODE");
      props.zipcodeSetter(zipcode);
      map.data.setStyle((feature) => {
        const zipCode = feature.getProperty("ZIPCODE");
        if (zipCode === lastClickedZipCode()) {
          return {
            fillColor: colors.clicked, // Blue for clicked
            strokeColor: colors.clicked,
            fillOpacity: 0.7,
            strokeWeight: 2,
          };
        } else if (props.filteredZipCodes().includes(parseInt(zipCode))) {
          return {
            fillColor: colors.selected, // Orange for matched zip codes
            strokeColor: colors.selected,
            fillOpacity: 0.7,
            strokeWeight: 2,
          };
        } else {
          return {
            fillColor: colors.default, // Green for default
            strokeColor: colors.default,
            fillOpacity: 0.1,
            strokeWeight: 2,
          };
        }
      });
    });

    map.data.addListener("mouseover", (event) => {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {
        strokeColor: colors.highlight, // Purple for hover
        strokeWeight: 3,
        fillColor: colors.highlight,
        fillOpacity: 0.7,
        clickable: true,
      });
      document.getElementById("hoverLocation-div").value =
        event.feature.getProperty("ZIPCODE");
    });

    map.data.addListener("mouseout", (event) => {
      map.data.revertStyle();
      const zipCode = event.feature.getProperty("ZIPCODE");
      if (zipCode === lastClickedZipCode()) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.clicked, // Blue for clicked
          strokeColor: colors.clicked,
          fillOpacity: 0.7,
          strokeWeight: 2,
        });
      } else if (props.filteredZipCodes().includes(parseInt(zipCode))) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.selected, // Orange for selected
          strokeColor: colors.selected,
          fillOpacity: 0.7,
          strokeWeight: 2,
        });
      } else {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.default, // Green for default
          strokeColor: colors.default,
          fillOpacity: 0.1,
          strokeWeight: 2,
        });
      }
    });
  };

  const clearDataLayer = (map) => {
    if (map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
    }
  };

  onMount(() => {
    loader.importLibrary("maps").then(({ Map }) => {
      const mapInstance = new Map(ref, mapOptions);
      props.setMapObject(mapInstance);

      mapInstance.addListener("zoom_changed", () => {
        const mapZoom = mapInstance.zoom;
        if (mapZoom <= 10) {
          props.setDataLayerLevel("borough");
        } else if (mapZoom > 10 && mapZoom <= 13) {
          props.setDataLayerLevel("neighbourhood");
        } else {
          props.setDataLayerLevel("zipcode");
        }
      });

      mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        createCenterControl()
      );
      insertDataLayer(zipcode_geojson, mapInstance);
    });
  });

  createEffect(() => {
    if (props.mapObject() && props.filteredZipCodes().length > 0) {
      insertDataLayer(zipcode_geojson, props.mapObject());
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
