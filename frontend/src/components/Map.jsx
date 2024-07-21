import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import Filter from "./Filter";

import search_icon from "../assets/search-svgrepo-com.svg";
import filter_icon from "../assets/filter-list-svgrepo-com.svg";
import dashboard_icon from "../assets/dashboard-svgrepo-com.svg";
import recommend_icon from "../assets/idea-bulb-glow-svgrepo-com.svg";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const colors = {
  default: "#10b981", // Green for default
  highlight: "#a888f1", // Purple for hover
  clicked: "#36A2EB", // Blue for clicked
  selected: "#FFA500", // Orange for selected
  compared: "#FF6384",
};

export const MapComponent = (props) => {
  let ref;
  const [sideBarOpen, setSidebarOpen] = createSignal(false);
  const [showFilterBoard, setShowFilterBoard] = createSignal(true);
  const [filteredZipCodes, setFilteredZipCodes] = createSignal([]);
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions));

  const zipcodes = props.dataResources.zipcodes();
  const zipcode_geojson = props.dataResources.zipcode_geojson();

  function createCenterControl() {
    const centerControlDiv = document.createElement("div");
    const controlButton = document.createElement("button");
    const hoverLocationDiv = document.createElement("div");
    const svgImg = document.createElement("img");
    const filtersvg = document.createElement("img");
    const infosvg = document.createElement("img");
    const ideasvg = document.createElement("img");
    const innerDiv = document.createElement("div");
    const textNode = document.createTextNode("Location: ");
    const input = document.createElement("input");
    const recommendZipBtn = document.createElement("button");
    const filterBtn = document.createElement("button");

    function updateButtonStyles() {
      centerControlDiv.className = !sideBarOpen()
        ? "w-[80%] overflow-x-auto flex"
        : "w-[30%] flex flex-col mr-4";

      controlButton.textContent = "Information";
      hoverLocationDiv.className = sideBarOpen()
        ? "w-[100%] rounded shadow-md color-zinc-900 bg-white text-base text-black mt-4 mr-10 mb-6 leading-9 py-0 px-2 text-center items-center justify-center"
        : "w-[20%] rounded shadow-md color-zinc-900 bg-white text-base text-black mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center items-center justify-center";
    }

    createEffect(() => updateButtonStyles());

    centerControlDiv.id = "centerControlDiv";

    controlButton.title = "Click to show details";
    controlButton.type = "button";
    controlButton.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    controlButton.addEventListener("click", () => {
      setSidebarOpen(!sideBarOpen());
      updateButtonStyles();
    });

    svgImg.src = search_icon;
    svgImg.className = "w-4 h-4 mr-2";

    filtersvg.src = filter_icon;
    filtersvg.className = "w-4 h-4 mr-2";

    infosvg.src = dashboard_icon;
    infosvg.className = "w-4 h-4 mr-2";

    ideasvg.src = recommend_icon;
    ideasvg.className = "w-4 h-4 mr-2";

    innerDiv.appendChild(svgImg);
    innerDiv.appendChild(textNode);
    innerDiv.className = "flex justify-center items-center";
    input.type = "text";
    input.id = "hoverLocation-div";
    input.className =
      "relative w-[100%] h-[80%] bg-transparent text-center text-[#a888f1]";
    const uniqueZipcode = Object.keys(
      props.dataResources.historicalRealEstateData()
    );
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        if (uniqueZipcode.includes(event.target.value)) {
          props.zipcodeSetter(event.target.value);
        } else {
          alert("The zipcode you provided is not included.");
        }
      }
    });

    innerDiv.appendChild(input);
    hoverLocationDiv.appendChild(innerDiv);

    recommendZipBtn.textContent = "Recommend";
    recommendZipBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    recommendZipBtn.addEventListener("click", () => {
      props.setShowRecommendBoard((prev) => !prev);
      setSidebarOpen(true);
    });

    filterBtn.textContent = "Filter";
    filterBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    filterBtn.addEventListener("click", () => {
      setShowFilterBoard((prev) => !prev);
      setSidebarOpen(true);
    });

    centerControlDiv.append(
      hoverLocationDiv,
      filterBtn,
      controlButton,
      recommendZipBtn
    );

    return centerControlDiv;
  }

  const insertDataLayer = (data, map) => {
    clearDataLayer(map);
    map.data.addGeoJson(data);
    map.data.setStyle((feature) => {
      const zipCode = feature.getProperty("ZIPCODE");
      if (zipCode === props.zipcodeOnCharts()) {
        return {
          fillColor: colors.clicked,
          strokeColor: colors.clicked,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else if (
        filteredZipCodes().includes(parseInt(zipCode)) ||
        props.recommendedZipcode().includes(parseInt(zipCode))
      ) {
        return {
          fillColor: colors.selected,
          strokeColor: colors.selected,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else if (props.getComparedZip().includes(parseInt(zipCode))) {
        return {
          fillColor: colors.compared,
          strokeColor: colors.compared,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else {
        return {
          fillColor: colors.default,
          strokeColor: colors.default,
          fillOpacity: 0.3,
          strokeWeight: 2,
        };
      }
    });

    map.data.addListener("click", (event) => {
      props.zipcodeSetter(event.feature.getProperty("ZIPCODE"));
    });

    map.data.addListener("mouseover", (event) => {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {
        strokeColor: colors.highlight,
        strokeWeight: 3,
        fillColor: colors.highlight,
        fillOpacity: 0.7,
        clickable: true,
      });
      const hoverDiv = document.getElementById("hoverLocation-div");
      if (hoverDiv) {
        hoverDiv.value = event.feature.getProperty("ZIPCODE");
      }
    });

    map.data.addListener("mouseout", (event) => {
      map.data.revertStyle();
      const zipCode = event.feature.getProperty("ZIPCODE");
      if (zipCode === props.zipcodeOnCharts()) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.clicked,
          strokeColor: colors.clicked,
          fillOpacity: 0.7,
          strokeWeight: 2,
        });
      } else if (
        filteredZipCodes().includes(parseInt(zipCode)) ||
        props.recommendedZipcode().includes(parseInt(zipCode))
      ) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.selected,
          strokeColor: colors.selected,
          fillOpacity: 0.7,
          strokeWeight: 2,
        });
      } else if (props.getComparedZip().includes(parseInt(zipCode))) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.compared,
          strokeColor: colors.compared,
          fillOpacity: 0.7,
          strokeWeight: 2,
        });
      } else {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.default,
          strokeColor: colors.default,
          fillOpacity: 0.3,
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
    loader.load().then(() => {
      const mapInstance = new google.maps.Map(ref, mapOptions);
      props.setMapObject(mapInstance);

      mapInstance.addListener("zoom_changed", () => {
        const mapZoom = mapInstance.getZoom();
        props.setZoom(mapZoom);
      });

      mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        createCenterControl()
      );

      // Insert all zipcodes initially
      insertDataLayer(zipcode_geojson, mapInstance);
    });
  });

  createEffect(() => {
    if (props.mapObject()) {
      if (filteredZipCodes().length > 0) {
        insertDataLayer(zipcode_geojson, props.mapObject());
      } else {
        insertDataLayer(zipcode_geojson, props.mapObject());
      }
    }
  });

  createEffect(() => {
    if (props.mapObject() && props.recommendedZipcode().length > 0) {
      insertDataLayer(zipcode_geojson, props.mapObject());
    }
  });

  createEffect(() => {
    if (props.mapObject() && props.zipcodeOnCharts().length > 0) {
      const zipcode_obj = zipcodes.filter(
        (el) => el["zip_code"] * 1 == props.zipcodeOnCharts()
      );

      props.mapObject().setZoom(14);
      const newCenter = {
        lng: zipcode_obj[0]["longitude"] * 1,
        lat: zipcode_obj[0]["latitude"] * 1,
      };

      props.mapObject().setCenter(newCenter);

      insertDataLayer(zipcode_geojson, props.mapObject());
    }
  });

  onCleanup(() => {
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
      mapDiv.innerHTML = "";
    }
  });

  createEffect(() => {
    if (props.zipcodeOnCharts()) {
      setSidebarOpen(true);
      setShowFilterBoard(false);
    }
  });

  createEffect(() => {
    if (props.mapObject()) {
      if (store.darkModeOn) {
        props.mapObject().setOptions({ styles: store.mapStyles["dark"] });
      } else {
        props.mapObject().setOptions({ styles: store.mapStyles["light"] });
      }
    }
  });

  return (
    <>
      <Suspense>
        <div
          ref={ref}
          id="map"
          class={`h-full basis-1/2 grow transition `}
        ></div>
      </Suspense>

      <div
        class={`bg-white dark:bg-gray-900 w-[60vw] gap-2 
      right-0 h-screen flex flex-col
          drop-shadow overflow-scroll p-6 ${sideBarOpen() ? "" : "hidden"}`}
      >
        {/* <Show when={props.isLoading}>
          <div class="flex flex-col gap-2 animate-pulse">
            <div class="h-6 w-3/12 rounded-lg bg-neutral-300" />
            <div class="h-6 w-2/12 rounded-lg bg-neutral-300" />
          </div>
        </Show> */}
        <Show when={!props.isLoading}>
          {/* <div class="flex">
            <h1
              class="font-medium w-[50%] place-content-between"
              id="dashboard_top"
            >
              {`Information on ${props.zipcodeOnCharts()}`}
            </h1>
          </div>
          <div class="relative w-[95%] h-[1px] mt-[2%] bg-[#E4E4E7]"></div> */}
        </Show>
        <div class="gap-6 mt-6 py-3 flex flex-col">
          <div class="flex flex-col">{props.children}</div>
        </div>
      </div>

      <Filter
        setFilteredZipCodes={setFilteredZipCodes}
        showFilterBoard={showFilterBoard}
        setShowFilterBoard={setShowFilterBoard}
        map={props.mapObject}
      />
    </>
  );
};
