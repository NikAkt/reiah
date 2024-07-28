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
  default: "#10b981",
  highlight: "#a888f1",
  clicked: "#36A2EB",
  selected: "#FFA500",
  compared: "#FF6384",
  recommended: "#FFD700",
};

function getZipCodeBounds(zipcode_geojson) {
  let bounds = new google.maps.LatLngBounds();

  zipcode_geojson.features.forEach((feature) => {
    feature.geometry.coordinates[0].forEach((coord) => {
      bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
    });
  });

  const padding = 0.3;
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

let infoWindows = [];

const createLabels = (map, recommendedZipcode, recommendations, zipcodes) => {
  console.log("createLabels called with:", {
    recommendedZipcode,
    recommendations,
    zipcodes,
  });

  if (!map || !recommendedZipcode || !recommendations || !zipcodes) {
    console.error("createLabels: Missing required data", {
      map,
      recommendedZipcode,
      recommendations,
      zipcodes,
    });
    return;
  }

  // Close existing InfoWindows
  infoWindows.forEach((infoWindow) => infoWindow.close());
  infoWindows = [];

  const createInfoWindowContent = (liveliness, similarity) => {
    return `
      <div style="
        font-family: Arial, sans-serif; 
        padding: 6px; 
        width: 100px; 
        border-radius: 8px; 
        background-color: rgba(255, 255, 255, 0.9); 
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        text-align: center;
      ">
        <div style="font-size: 12px; font-weight: bold; color: #333;">Liveliness</div>
       
        <div style="font-size: 12px; color: #333;">${
          liveliness ? liveliness.toFixed(1) : "N/A"
        }/10</div>
        <div style="font-size: 12px; font-weight: bold; color: #333; margin-top: 4px;">Similarity</div>
         <div style="font-size: 8px; font-weight: bold; color: #333; margin-top: 2px;">(how well the area suit your preferences)</div>
        <div style="font-size: 12px; color: #333;">${
          similarity ? similarity.toFixed(1) : "N/A"
        }/10</div>
       
      </div>
    `;
  };

  recommendedZipcode.forEach((zipcode) => {
    const recommendation = recommendations[zipcode];
    console.log(
      `Processing zipcode: ${zipcode}, recommendation:`,
      recommendation
    );

    if (!recommendation) {
      console.warn(`No recommendation found for zipcode: ${zipcode}`);
      return; // Skip to the next zipcode
    }

    const { liveliness, similarity } = recommendation;
    const zipcodeObj = zipcodes.find((el) => el["zip_code"] == zipcode);
    console.log(`Found zipcodeObj for ${zipcode}:`, zipcodeObj);

    if (!zipcodeObj) {
      console.warn(`No zipcodeObj found for zipcode: ${zipcode}`);
      return; // Skip to the next zipcode
    }

    const infowindow = new google.maps.InfoWindow({
      content: createInfoWindowContent(liveliness, similarity),
      position: {
        lng: zipcodeObj.longitude * 1,
        lat: zipcodeObj.latitude * 1,
      },
    });

    infowindow.open(map);
    infoWindows.push(infowindow); // Track the new InfoWindow
    console.log(`InfoWindow created for ${zipcode}`);
  });
};

export const MapComponent = (props) => {
  let ref;
  const sideBarOpen = props.sideBarOpen;
  const setSidebarOpen = props.setSidebarOpen;
  const [showFilterBoard, setShowFilterBoard] = createSignal(false);
  const [showRecommendBoard, setShowRecommendBoard] = createSignal(false);
  const [showInfoBoard, setShowInfoBoard] = createSignal(false);
  const [filteredZipCodes, setFilteredZipCodes] = createSignal([]);
  const [loadedZipcodeData, setLoadedZipcodeData] = createSignal({});
  let debounceTimeout;
  let worker;

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

  const closeAllBoards = () => {
    setShowFilterBoard(false);
    setShowRecommendBoard(false);
    setShowInfoBoard(false);
  };

  const mapOptions = {
    ...JSON.parse(JSON.stringify(store.mapOptions)),
    styles: [],
    disableDefaultUI: true,
  };

  const zipcodes = props.dataResources.zipcodes(); // Ensure this is called as a function

  const zipcode_geojson = props.dataResources.zipcode_geojson();
  const geojsonZipcode = [
    ...zipcode_geojson.features.map((el) => el["properties"]["ZIPCODE"] * 1),
  ];

  function createCenterControl() {
    const centerControlDiv = document.createElement("div");
    const controlButton = document.createElement("button");
    const hoverLocationDiv = document.createElement("div");
    const innerDiv = document.createElement("div");
    const textNode = document.createTextNode("Zipcode: ");
    const input = document.createElement("input");
    const recommendZipBtn = document.createElement("button");
    const filterBtn = document.createElement("button");

    function updateButtonStyles() {
      centerControlDiv.className = !sideBarOpen()
        ? "sm:w-[80%] place-items-center w-[40%] overflow-x-auto text-base flex sm:flex-row flex-col min-w-[150px] mt-[10vh] md:mt-[7vh] mt-[10vh] lg:mt-[0vh]"
        : "w-[30%] place-items-end flex flex-col mr-4 mt-[10vh] md:mt-[7%] mt-[10%] lg:mt-[0vh]";

      controlButton.textContent = "Information";
      controlButton.id = "information-button";
      hoverLocationDiv.className = sideBarOpen()
        ? "w-[100%] min-w-[110px] rounded text-base shadow-md color-zinc-900 bg-white text-black mt-4 mb-6 mx-6 leading-9 py-0 px-2 text-center items-center justify-center"
        : "rounded shadow-md text-base color-zinc-900 bg-white text-black mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center items-center justify-center";
    }

    createEffect(() => updateButtonStyles());

    centerControlDiv.id = "centerControlDiv";

    controlButton.title = "Click to show details";
    controlButton.type = "button";
    controlButton.className =
      "rounded shadow-md color-zinc-900 text-base cursor-pointer bg-white mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center min-w-[110px]";
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
          const zipcodeObj = zipcodes.filter(
            (el) => el["zip_code"] === event.target.value
          );

          const map = props.mapObject();
          map.data.setStyle(applyStyle);
          map.setZoom(13);
          map.setCenter({
            lng: zipcodeObj[0]["longitude"] * 1,
            lat: zipcodeObj[0]["latitude"] * 1,
          });
        } else {
          alert("The zipcode you provided is not included.");
        }
      }
    });

    innerDiv.appendChild(input);
    hoverLocationDiv.appendChild(innerDiv);

    recommendZipBtn.textContent = "Recommend";
    recommendZipBtn.className =
      "rounded shadow-md  text-base color-zinc-900 cursor-pointer bg-white mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center min-w-[110px]";
    recommendZipBtn.addEventListener("click", () => {
      closeAllBoards();
      setShowRecommendBoard((prev) => !prev);
      setSidebarOpen(true);
    });

    filterBtn.textContent = "Filter";
    filterBtn.className =
      "rounded shadow-md text-base color-zinc-900 cursor-pointer bg-white mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center min-w-[110px]";
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
    if (!map) return;

    clearDataLayer(map);
    map.data.addGeoJson(data);
    map.data.setStyle(applyStyle);

    map.data.addListener("click", (event) => {
      props.zipcodeSetter(event.feature.getProperty("ZIPCODE"));
      map.data.setStyle(applyStyle);
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
      map.data.setStyle(applyStyle);
    });

    // Call the createLabels function after adding data layer
    createLabels(
      map,
      props.recommendedZipcode,
      props.recommendations,
      zipcodes
    );
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

      const bounds = getZipCodeBounds(zipcode_geojson);

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

      insertDataLayer(zipcode_geojson, mapInstance);
    });

    worker = new Worker(new URL("./dataWorker.js", import.meta.url));

    worker.onmessage = function (e) {
      const { propertyData, amenitiesData, demographicData } = e.data;
      setLoadedZipcodeData((prev) => ({
        ...prev,
        propertyData,
        amenitiesData,
        demographicData,
      }));
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

  createEffect(() => {
    const map = props.mapObject();
    const zipcodesData = zipcodes;

    if (!props.recommendations) {
      console.error("Recommendations object is undefined or null");
    }

    if (
      map &&
      props.recommendedZipcode &&
      props.recommendedZipcode.length > 0 &&
      zipcodesData
    ) {
      console.log("Calling createLabels with data", {
        map,
        recommendedZipcode: props.recommendedZipcode,
        recommendations: props.recommendations,
        zipcodesData,
      });
      createLabels(
        map,
        props.recommendedZipcode,
        props.recommendations,
        zipcodesData
      );
    }
  });

  onCleanup(() => {
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
      mapDiv.innerHTML = "";
    }

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
          class={`grow transition
            transform  transition-transform duration-500 scale-100 ${
              sideBarOpen() ? "sm:w-1/2 w-full sm:h-full h-3/5" : "w-full"
            }`}
        ></div>
      </Suspense>

      <div
        class={`bg-white dark:bg-gray-900 w-[60vw] gap-2 
      right-0 h-2/5 sm:h-full flex flex-col sm:w-1/2 w-full 
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
        setRecommendedZipcode={props.setRecommendedZipcode}
        setShowRecommendBoard={setShowRecommendBoard}
        setPredictedPrice={props.setPredictedPrice}
        setQuery={props.setQuery}
        showRecommendBoard={showRecommendBoard}
        setSidebarOpen={setSidebarOpen}
        setRecommendations={props.setRecommendations}
      />
    </>
  );
};
