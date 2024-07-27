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
import RecommendZipcode from "./RecommendZipcode";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const colors = {
  default: "#10b981", // Green for default
  highlight: "#a888f1", // Purple for hover
  clicked: "#36A2EB", // Blue for clicked
  selected: "#FFA500", // Orange for selected
  compared: "#FF6384", // Pink for compared
  recommended: "#FFD700", // Gold for recommended
};

function getZipCodeBounds(zipcode_geojson) {
  let bounds = new google.maps.LatLngBounds();

  zipcode_geojson.features.forEach((feature) => {
    feature.geometry.coordinates[0].forEach((coord) => {
      bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
    });
  });

  // Expand bounds slightly
  const padding = 0.3; // Adjust the padding value as needed
  const northEast = new google.maps.LatLng(
    bounds.getNorthEast().lat() + padding,
    bounds.getNorthEast().lng() + padding
  );
  const southWest = new google.maps.LatLng(
    bounds.getSouthWest().lat() - padding,
    bounds.getSouthWest().lng() - padding
  );
  bounds.extend(northEast);
  bounds.extend(southWest);

  return bounds;
}

export const MapComponent = (props) => {
  let ref;
  const [sideBarOpen, setSidebarOpen] = createSignal(false);
  const [showFilterBoard, setShowFilterBoard] = createSignal(false);
  const [showRecommendBoard, setShowRecommendBoard] = createSignal(false);
  const [showInfoBoard, setShowInfoBoard] = createSignal(false);
  const [filteredZipCodes, setFilteredZipCodes] = createSignal([]);
  const [loadedZipcodeData, setLoadedZipcodeData] = createSignal({});
  let debounceTimeout;
  let worker;

  const closeAllBoards = () => {
    setShowFilterBoard(false);
    setShowRecommendBoard(false);
    setShowInfoBoard(false);
  };

  const mapOptions = {
    ...JSON.parse(JSON.stringify(store.mapOptions)),
    styles: [], // No specific styles needed since the rest of the map won't be shown
    disableDefaultUI: true, // Disable default UI to hide unwanted map controls
  };

  const zipcodes = props.dataResources.zipcodes();

  const zipcode_geojson = props.dataResources.zipcode_geojson();
  const geojsonZipcode = [
    ...zipcode_geojson.features.map((el) => el["properties"]["ZIPCODE"] * 1),
  ];

  function createCenterControl() {
    const centerControlDiv = document.createElement("div");
    const controlButton = document.createElement("button");
    const hoverLocationDiv = document.createElement("div");
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
      controlButton.id = "information-button";
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
      closeAllBoards();
      setShowInfoBoard((prev) => !prev);
      setSidebarOpen((prev) => !prev);
      updateButtonStyles();
    });

    innerDiv.appendChild(textNode);
    innerDiv.className = "flex justify-center items-center";
    input.type = "text";
    input.id = "hoverLocation-div";
    input.className =
      "relative w-[100%] h-[80%] bg-transparent text-center text-[#a888f1]";
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        if (geojsonZipcode.includes(event.target.value * 1)) {
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
      closeAllBoards();
      setShowRecommendBoard((prev) => !prev);
      setSidebarOpen(true);
    });

    filterBtn.textContent = "Filter";
    filterBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    filterBtn.addEventListener("click", () => {
      closeAllBoards();
      setShowFilterBoard((prev) => !prev);
      setSidebarOpen(true);
    });

    centerControlDiv.append(
      hoverLocationDiv,
      filterBtn,
      recommendZipBtn,
      controlButton
    );

    return centerControlDiv;
  }

  const insertDataLayer = (data, map) => {
    if (!map) return; // Ensure map is defined

    clearDataLayer(map);
    map.data.addGeoJson(data);

    const applyStyle = (feature) => {
      const zipCode = feature.getProperty("ZIPCODE");
      if (zipCode === props.zipcodeOnCharts()) {
        return {
          fillColor: colors.clicked,
          strokeColor: colors.clicked,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else if (
        props.recommendedZipcode &&
        Array.isArray(props.recommendedZipcode) &&
        props.recommendedZipcode.includes(parseInt(zipCode))
      ) {
        return {
          fillColor: colors.recommended,
          strokeColor: colors.recommended,
          fillOpacity: 0.7,
          strokeWeight: 2,
        };
      } else if (filteredZipCodes().includes(parseInt(zipCode))) {
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
    };

    map.data.setStyle(applyStyle);

    map.data.addListener("click", (event) => {
      props.zipcodeSetter(event.feature.getProperty("ZIPCODE"));
      map.data.setStyle(applyStyle); // Reapply styles immediately after click
      const zipcodeObj = zipcodes.filter(
        (el) => el["zip_code"] === event.feature.getProperty("ZIPCODE")
      );
      map.setZoom(13);
      map.setCenter({
        lng: zipcodeObj[0]["longitude"] * 1,
        lat: zipcodeObj[0]["latitude"] * 1,
      });
    });

    map.data.addListener("mouseover", (event) => {
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
      map.data.setStyle(applyStyle); // Ensure styles are reapplied after hover out
    });
  };

  const clearDataLayer = (map) => {
    if (map) {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
    }
  };

  function debounceFetch(zipcode) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      worker.postMessage({ zipcode });
    }, 100);
  }

  onMount(() => {
    loader.load().then(() => {
      const mapInstance = new google.maps.Map(ref, mapOptions);
      props.setMapObject(mapInstance);

      // Calculate bounds for the zip codes
      const bounds = getZipCodeBounds(zipcode_geojson);

      // Fit map to bounds and restrict it
      mapInstance.fitBounds(bounds);
      mapInstance.setOptions({
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });

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

    // Initialize the worker
    worker = new Worker(new URL("./dataWorker.js", import.meta.url));

    worker.onmessage = function (e) {
      const { propertyData, amenitiesData, demographicData } = e.data;
      setLoadedZipcodeData((prev) => ({
        ...prev,
        propertyData,
        amenitiesData,
        demographicData,
      }));
      // Now update your charts with the fetched data
    };
  });

  createEffect(() => {
    if (props.zipcodeOnCharts().length > 0) {
      debounceFetch(props.zipcodeOnCharts());
    }
  });

  createEffect(() => {
    if (filteredZipCodes().length > 0) {
      const map = props.mapObject();
      if (map) {
        insertDataLayer(zipcode_geojson, map);
      }
    }
  });

  onCleanup(() => {
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
      mapDiv.innerHTML = "";
    }

    // Terminate the worker on cleanup
    if (worker) {
      worker.terminate();
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
          class={`h-full basis-1/2 grow transition
            transform  transition-transform duration-500 scale-100 ${
              sideBarOpen() ? "w-1/2" : "w-full"
            }`}
        ></div>
      </Suspense>

      <div
        class={`bg-white dark:bg-gray-900 w-[60vw] gap-2 
      right-0 h-screen flex flex-col
          drop-shadow overflow-scroll p-6 
          ${sideBarOpen() ? "" : "hidden"}
          
          `}
      >
        <Show when={!props.isLoading}></Show>
        <div class="gap-6 mt-6 py-3 flex flex-col">
          <div class="flex flex-col">{props.children}</div>
        </div>
      </div>

      <Filter
        setFilteredZipCodes={setFilteredZipCodes}
        showFilterBoard={showFilterBoard}
        setShowFilterBoard={setShowFilterBoard}
        map={props.mapObject}
        setSidebarOpen={setSidebarOpen}
      />
      <RecommendZipcode
        setRecommendedZipcode={props.setRecommendedZipcode} // Ensure this line is added
        setShowRecommendBoard={setShowRecommendBoard}
        setPredictedPrice={props.setPredictedPrice}
        setQuery={props.setQuery}
        showRecommendBoard={showRecommendBoard}
        setSidebarOpen={setSidebarOpen}
      />
    </>
  );
};
