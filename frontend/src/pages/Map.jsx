import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { ErrorPage } from "../components/ErrorPage";
import {
  Show,
  Suspense,
  createSignal,
  createResource,
  createEffect,
  ErrorBoundary,
} from "solid-js";
import { BarChart, DoughnutChart, LineChart } from "../components/Charts";
import Markers from "../components/Markers";
import { DashboardInfo } from "../components/DashboardInfo";
import Filter from "../components/Filter";
import UserMenu from "../components/UserMenu";
import RecommendZipcode from "../components/RecommendZipcode";

export const Map = (props) => {
  const [getDataLayerLevel, setDataLayerLevel] = createSignal("neighbourhood");
  const [getSelectedZip, setSelectedZip] = createSignal("");
  const [getSelectedBorough, setSelectedBorough] = createSignal("");
  const [getSelectedNeighbourhood, setSelectedNeighbourhood] = createSignal("");
  const [createMoreDashboardInfo, setCreateMoreDashboardInfo] =
    createSignal(false);

  const [filteredZipCodes, setFilteredZipCodes] = createSignal([]);
  const [recommendedZipcode, setRecommendedZipcode] = createSignal(null);

  // Limit is 7
  const [getComparedZip, setComparedZip] = createSignal([]);
  const [showRecommendBoard, setShowRecommendBoard] = createSignal(false);
  const [showFilterBoard, setShowFilterBoard] = createSignal(false);

  //constrol showing markers on the map
  const [showHousesMarker, setShowHousesMarker] = createSignal(true);
  const [showAmenityMarker, setShowAmenityMarker] = createSignal(false);

  async function fetchHistoricPrices(zip) {
    const response = await fetch(
      `http://localhost:8000/api/historic-prices?zipcode=${zip}`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      console.log("fetchHistoricPrices", data);
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }

  const [historicPrices] = createResource(
    () => getSelectedZip(),
    fetchHistoricPrices
  );

  createEffect(() => {
    console.log("historicPrices", historicPrices);
  });

  return (
    <MapView>
      <div class="h-screen flex relative">
        <ErrorBoundary fallback={<ErrorPage />}>
          <Suspense
            fallback={
              <div>
                <LoadingAnimation />
              </div>
            }
          >
            <Show when={showFilterBoard()}>
              <Filter
                // realEstateData={props.dataResources.realEstateData()}
                // historicalRealEstateData={props.dataResources.historicalRealEstateData()}
                // amenitiesData={props.dataResources.amenitiesData()}
                setFilteredZipCodes={setFilteredZipCodes} // Pass the setFilteredZipCodes function to Filter
                setShowFilterBoard={setShowFilterBoard}
              />
            </Show>

            <Show
              when={
                props.dataResources.borough_geojson() &&
                props.dataResources.neighbourhood_geojson() &&
                props.dataResources.zipcodes() &&
                props.dataResources.historicalRealEstateData() &&
                props.dataResources.zipcode_geojson()
              }
            >
              <MapComponent
                getDataLayerLevel={getDataLayerLevel}
                setDataLayerLevel={setDataLayerLevel}
                dataResources={props.dataResources}
                mapObject={props.mapObject}
                setMapObject={props.setMapObject}
                zipcodeOnCharts={getSelectedZip}
                boroughSetter={setSelectedBorough}
                neighbourhoodSetter={setSelectedNeighbourhood}
                zipcodeSetter={setSelectedZip}
                getComparedZip={getComparedZip}
                filteredZipCodes={filteredZipCodes} // Pass the filtered zip codes to MapComponent
                setFavorite={props.setFavorite}
                favorite={props.favorite}
                setShowRecommendBoard={setShowRecommendBoard}
                setShowFilterBoard={setShowFilterBoard}
                showAmenityMarker={showAmenityMarker}
                setShowAmenityMarker={setShowAmenityMarker}
                showHousesMarker={showHousesMarker}
                setShowHousesMarker={setShowHousesMarker}
              >
                <Show when={!historicPrices.loading}>
                  <LineChart
                    asyncData={historicPrices}
                    getComparedZip={getComparedZip}
                    setComparedZip={setComparedZip}
                    getSelectedZip={getSelectedZip}
                    historicalRealEstateData={props.dataResources.historicalRealEstateData()}
                    setCreateMoreDashboardInfo={setCreateMoreDashboardInfo}
                  ></LineChart>
                </Show>
                <div class="relative w-[95%] h-[1px] mt-[2%] bg-[#E4E4E7]"></div>
                <div id="compared-dashboardinfo-button" class="flex gap-2">
                  {createEffect(() => {
                    <For each={getComparedZip()} fallback={<div></div>}>
                      {(item, index) => (
                        <button
                          class="bg-black text-white active:bg-teal-500 rounded-lg"
                          onClick={(event) => {
                            const dashboardDiv = document.getElementById(
                              `dashboardDiv-${item}`
                            );
                            if (dashboardDiv) {
                              dashboardDiv.classList.toggle("hidden");
                            }
                            event.target.classList.toggle("opacity-50");
                          }}
                        >
                          {item}
                        </button>
                      )}
                    </For>;
                  })}
                </div>
                <DashboardInfo
                  map={props.mapObject}
                  zip={getSelectedZip()}
                  showAmenityMarker={showAmenityMarker}
                  setShowAmenityMarker={setShowAmenityMarker}
                  showHousesMarker={showHousesMarker}
                  setShowHousesMarker={setShowHousesMarker}
                />
                <Show when={createMoreDashboardInfo()}>
                  <For each={getComparedZip()} fallback={<div></div>}>
                    {(item, index) => (
                      <DashboardInfo map={props.mapObject} zip={item} />
                    )}
                  </For>
                </Show>

                {createEffect(() => {
                  if (props.mapObject()) {
                    <Show
                      when={
                        !props.dataResources.zipcodes.loading &&
                        !props.dataResources.borough_neighbourhood.loading &&
                        !props.dataResources.realEstateData.loading
                      }
                      fallback={props.dataResources.zipcodes.error}
                    >
                      <Markers
                        zipcodes={props.dataResources.zipcodes()}
                        map={props.mapObject}
                        getDataLayerLevel={getDataLayerLevel}
                        borough_neighbourhood={props.dataResources.borough_neighbourhood()}
                        realEstateData={props.dataResources.realEstateData()}
                      />
                      ;
                    </Show>;
                  }
                })}
              </MapComponent>
            </Show>
            <Show when={showRecommendBoard()}>
              <div class="absolute bg-black z-20 w-full h-full opacity-30"></div>
              <RecommendZipcode
                setRecommendedZipcode={setRecommendedZipcode}
                setShowRecommendBoard={setShowRecommendBoard}
              />
            </Show>
          </Suspense>
        </ErrorBoundary>
        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div>
      <UserMenu />
    </MapView>
  );
};
