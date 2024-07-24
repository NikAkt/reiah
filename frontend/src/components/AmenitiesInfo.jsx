import { createEffect, onCleanup, createSignal } from "solid-js";
import { Suspense, Show, For } from "solid-js/web";
import { DoughnutChart } from "./Charts";

const AmenitiesDetailDropdown = ({
  item,
  amenitiesOnMap,
  newAmenitiesDetailedMarkerIcon,
  amenitiesMarkerIcon,
  highlightMarker,
}) => {
  const [displayDropdown, setDisplayDropdown] = createSignal(false);

  return (
    <div class="relative w-full overflow-x-auto">
      <div
        id="detail-title"
        class={`bg-teal-500 text-white rounded-lg cursor-pointer text-center 
            ${displayDropdown() === true ? "" : "opacity-60"}`}
        onClick={() => {
          setDisplayDropdown((prev) => !prev);
        }}
      >
        {`${item[0]} (${item[1].length})`}
      </div>
      <ul class={displayDropdown() === true ? "" : "hidden"}>
        {item[1].map((el) => (
          <li
            class="hover:bg-indigo-600 hover:text-white"
            onMouseOver={() => {
              highlightMarker(
                el,
                amenitiesOnMap(),
                amenitiesMarkerIcon,
                newAmenitiesDetailedMarkerIcon,
                "title"
              );
            }}
            onMouseDown={() => {
              revertMarkerIcon(amenitiesOnMap(), amenitiesMarkerIcon);
            }}
          >
            {el}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AmenitiesInfo = ({
  getSelectedZip,
  loader,
  highlightMarker,
  map,
  hideAmenities,
}) => {
  const [amenitiesOnMap, setAmenitiesOnMap] = createSignal([]);
  const [amenitiesDetails, setAmenitiesDetails] = createSignal({});
  const [amenities, setAmenities] = createSignal(null);
  const [hoverAmenity, setHoverAmenity] = createSignal(null);
  const colorsChartjs = [
    "#36A2EB",
    "#FF6384",
    "#FF9F40",
    "#FFCD56",
    "#4BC0C0",
    "#9966FF",
    "#C9CBCF",
  ];

  const amenitiesMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 5,
    fillColor: "#0145ac",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#000000",
  };

  const newAmenitiesMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: "#0145ac",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#000000",
  };

  const newAmenitiesDetailedMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 15,
    fillColor: "rgb(124 58 237)",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#000000",
  };

  const fetchAmenitiesData = async () => {
    try {
      fetch(`http://localhost:8000/api/amenities?zipcode=${getSelectedZip()}`)
        .then((response) => response.json())
        .then((data_amenities) => {
          if (data_amenities && data_amenities.length > 0) {
            setHoverAmenity(null);

            loader.importLibrary("marker").then(({ Marker, Animation }) => {
              amenitiesOnMap().forEach((marker) => marker.setMap(null));
              setAmenitiesOnMap([]);

              const amenitiesObj = {};
              data_amenities.forEach((el) => {
                if (!amenitiesObj[el.FACILITY_T]) {
                  amenitiesObj[el.FACILITY_T] = {};
                }
                if (!amenitiesObj[el.FACILITY_T][el.FACILITY_DOMAIN_NAME]) {
                  amenitiesObj[el.FACILITY_T][el.FACILITY_DOMAIN_NAME] = [];
                }
                amenitiesObj[el.FACILITY_T][el.FACILITY_DOMAIN_NAME].push(
                  el.NAME
                );

                const marker = new Marker({
                  position: { lat: el.LAT, lng: el.LNG },
                  title: el.NAME,
                  level: "amenties",
                  facility_type: el.FACILITY_T,
                  facility_desc: el.FACILITY_DOMAIN_NAME,
                  animation: Animation.DROP,
                  // map: map(),
                  icon: amenitiesMarkerIcon,
                });

                setAmenitiesOnMap((prev) => [...prev, marker]);
              });
              setAmenitiesDetails(amenitiesObj);

              const labels = Object.keys(amenitiesObj);
              const data = labels.map((key) => {
                return Object.values(amenitiesObj[key]).reduce(
                  (acc, curr) => acc + curr.length,
                  0
                );
              });

              const datasets = {
                labels,
                datasets: [{ label: "Amenities DoughnutChart", data }],
              };

              setAmenities(datasets);
            });
            // Clear existing markers
          }
        });
    } catch (error) {
      console.error("Failed to fetch amenities data:", error);
    }
  };

  const hideAmenitiesOnMap = () => {
    if (amenitiesOnMap().length > 0) {
      amenitiesOnMap().forEach((marker) => marker.setMap(null));
    }
  };

  const putAmenitiesOnMap = () => {
    if (amenitiesOnMap().length > 0) {
      amenitiesOnMap().forEach((marker) => marker.setMap(map()));
    }
  };

  createEffect(() => {
    fetchAmenitiesData();
  });

  createEffect(() => {
    const hoverAmenityValue = hoverAmenity();
    if (hoverAmenityValue) {
      highlightMarker(
        hoverAmenityValue,
        amenitiesOnMap(),
        amenitiesMarkerIcon,
        newAmenitiesMarkerIcon,
        "facility_type"
      );
    }
  });

  createEffect(() => {
    if (hideAmenities()) {
      hideAmenitiesOnMap();
    } else {
      putAmenitiesOnMap();
    }
  });

  onCleanup(() => {
    const markers = amenitiesOnMap();
    markers.forEach((marker) => marker.setMap(null));
    setAmenitiesOnMap([]);
  });

  return (
    <div id="amenity-info" class="dark:text-white">
      <Suspense>
        <Show when={amenities()}>
          <div class="flex flex-row place-content-between">
            <DoughnutChart
              datasets={amenities()}
              ref={(el) => (ref = el)}
              type="amenities"
              setHoverAmenity={setHoverAmenity}
            />
            <div class="relative w-[40%] overflow-x-auto flex flex-col gap-2 py-2">
              <Show
                when={hoverAmenity()}
                fallback={
                  <div>Click the doughnutchart for more information</div>
                }
              >
                <div class="flex flex-col gap-2">
                  <p
                    class="text-white rounded-lg"
                    style={{
                      "background-color":
                        colorsChartjs[
                          Object.keys(amenitiesDetails()).indexOf(
                            hoverAmenity()
                          )
                        ],
                    }}
                  >
                    {hoverAmenity()}
                  </p>
                  <For
                    each={Object.entries(amenitiesDetails()[hoverAmenity()])}
                  >
                    {(item) => (
                      <AmenitiesDetailDropdown
                        item={item}
                        amenitiesOnMap={amenitiesOnMap}
                        newAmenitiesDetailedMarkerIcon={
                          newAmenitiesDetailedMarkerIcon
                        }
                        amenitiesMarkerIcon={amenitiesMarkerIcon}
                        highlightMarker={highlightMarker}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </Suspense>
    </div>
  );
};

export default AmenitiesInfo;
