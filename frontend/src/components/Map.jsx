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
import Favorite from "@suid/icons-material/Favorite";
import FavoriteBorder from "@suid/icons-material/FavoriteBorder";
import {
  Checkbox,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from "@suid/material";
import { LocationOn } from "@suid/icons-material";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const colorsChartjs = [
  "#4BC0C0",
  "#36A2EB",
  "#FF6384",
  "#FF9F40",
  "#FFCD56",
  "#9966FF",
  "#C9CBCF",
];
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
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions));
  // const [borough, setBorough] = createSignal(false);
  // const [neighbourhood, setNeighbourhood] = createSignal(true);
  // const borough_geojson = props.dataResources.borough_geojson();
  // const neighbourhood_geojson = props.dataResources.neighbourhood_geojson();
  // const [getLastClickedDataLayer, setLastClickedDataLayer] = createSignal("");
  const [lastClickedZipCode, setLastClickedZipCode] = createSignal(null);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const zipcodes = props.dataResources.zipcodes();
  const zipcode_geojson = props.dataResources.zipcode_geojson();

  function createCenterControl() {
    // Create the main control container
    const centerControlDiv = document.createElement("div");
    centerControlDiv.className = !sideBarOpen()
      ? "w-[80%] overflow-x-auto flex"
      : "w-[80%] overflow-x-auto flex flex-col";

    // Create the button element
    const controlButton = document.createElement("button");
    controlButton.textContent = sideBarOpen() ? "Hide List" : "Show List";
    controlButton.title = "Click to show details";
    controlButton.type = "button";
    controlButton.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    controlButton.addEventListener("click", () => {
      console.log("click!");
      setSidebarOpen(!sideBarOpen());
    });

    // Create the hover location div
    const hoverLocationDiv = document.createElement("div");
    hoverLocationDiv.className =
      "w-[20%] rounded shadow-md color-zinc-900 bg-[#a888f1] text-base text-white mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";

    // Create the inner div and span
    const innerDiv = document.createElement("div");
    innerDiv.textContent = "Location: ";
    innerDiv.className = "flex justify-center items-center";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "hoverLocation-div";
    input.className = "relative w-[100%] bg-transparent text-center";

    // Append the span to the inner div
    innerDiv.appendChild(input);

    // Append the inner div to the hover location div
    hoverLocationDiv.appendChild(innerDiv);

    //Create the Recommendation Button
    const recommendZipBtn = document.createElement("button");
    recommendZipBtn.textContent = "Recommend Zipcode";
    recommendZipBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    recommendZipBtn.addEventListener("click", () => {
      props.setShowRecommendBoard((prev) => !prev);
    });

    const filterBtn = document.createElement("button");
    filterBtn.textContent = "Filter";
    filterBtn.className =
      "rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center";
    filterBtn.addEventListener("click", () => {
      props.setShowFilterBoard((prev) => !prev);
    });

    // Append the button and hover location div to the main control container
    centerControlDiv.append(
      hoverLocationDiv,
      filterBtn,
      controlButton,
      recommendZipBtn
    );

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
      } else if (props.getComparedZip().includes(parseInt(zipCode))) {
        return {
          fillColor: colors.compared, // Orange for matched zip codes
          strokeColor: colors.compared,
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
      const zipcode_obj = zipcodes.filter(
        (el) => el["zip_code"] * 1 == event.feature.getProperty("ZIPCODE")
      );

      map.setZoom(14);
      const newCenter = {
        lng: zipcode_obj[0]["longitude"] * 1,
        lat: zipcode_obj[0]["latitude"] * 1,
      };

      map.setCenter(newCenter);
      setLastClickedZipCode(event.feature.getProperty("ZIPCODE"));
      map.data.revertStyle();
      event.feature.setProperty("isColorful", true);
      const zipcode = event.feature.getProperty("ZIPCODE");
      props.zipcodeSetter(zipcode);
      map.data.setStyle((feature) => {
        const zipCode = feature.getProperty("ZIPCODE");
        if (zipCode === lastClickedZipCode()) {
          return {
            //Yu Li's version:
            // fillColor: colorsChartjs[0],
            // strokeColor: colorsChartjs[0],
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
        } else if (props.getComparedZip().includes(parseInt(zipCode))) {
          return {
            fillColor: colors.compared, // Orange for matched zip codes
            strokeColor: colors.compared,
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
      } else if (props.getComparedZip().includes(parseInt(zipCode))) {
        map.data.overrideStyle(event.feature, {
          fillColor: colors.compared, // Orange for selected
          strokeColor: colors.compared,
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
    // if (!props.mapObject()) {
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

  //change data layer according to zoom
  // createEffect(() => {
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

  onCleanup(() => {
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
      mapDiv.innerHTML = ""; // Clear the div to prevent duplicate maps
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
          <div class="flex">
            <h1
              class="font-medium w-[50%] place-content-between"
              id="dashboard_top"
            >
              {`Information on ${props.zipcodeOnCharts()}`}
            </h1>
            <Show when={props.zipcodeOnCharts()}>
              <Box sx={{ width: 200 }}>
                <BottomNavigation
                  showLabels
                  // value={value()}
                  // onChange={(event, newValue) => {
                  //   setValue(newValue);
                  // }}
                >
                  {" "}
                  <Checkbox
                    {...label}
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite />}
                    checked={
                      props.favorite().includes(props.zipcodeOnCharts())
                        ? true
                        : false
                    }
                    onChange={() => {
                      props.setFavorite((prev) =>
                        prev.includes(props.zipcodeOnCharts())
                          ? prev.filter((el) => el !== props.zipcodeOnCharts())
                          : [...prev, props.zipcodeOnCharts()]
                      );
                    }}
                  />
                  <BottomNavigationAction
                    label="Houses"
                    icon={<LocationOn />}
                  />
                  <BottomNavigationAction
                    label="Amenities"
                    icon={<LocationOn />}
                  />
                </BottomNavigation>
              </Box>
            </Show>

            {/* <h2 class="txt-neutral-500 text-sm">click for more information</h2> */}
          </div>
          <div class="relative w-[95%] h-[1px] mt-[2%] bg-[#E4E4E7]"></div>
        </Show>
        <div class="gap-6 mt-6 py-3 flex flex-col">
          <div class="flex flex-col">{props.children}</div>
        </div>
      </div>
    </>
  );
};
