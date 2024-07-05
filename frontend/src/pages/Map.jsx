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
import { BarChart, LineChart } from "../components/Charts";
import Markers from "../components/Markers";
import { DashboardInfo } from "../components/DashboardInfo";
import Filter from "../components/Filter";

export const Map = (props) => {
  // const [mapZoom, setMapZoom] = createSignal(10);
  const [getDataLayerLevel, setDataLayerLevel] = createSignal("neighbourhood");
  const [getSelectedZip, setSelectedZip] = createSignal("");
  const [getSelectedBorough, setSelectedBorough] = createSignal("");
  const [getSelectedNeighbourhood, setSelectedNeighbourhood] = createSignal("");

  //limit is 7
  const [getComparedZip, setComparedZip] = createSignal([]);

  async function fetchHistoricPrices(zip) {
    const response = await fetch(
      `http://localhost:8000/api/historic-prices?zipcode=${zip}`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      console.log("fetchHistoriPrices", data);
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }

  async function fetchHistoricBNPrices([level, area]) {
    const response = await fetch(
      `http://localhost:8000/api/historic-prices?${level}=${area}`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      //aggregated by year
      let dataAggregatedHistory = {};
      data.forEach((obj) => {
        const history = obj["history"];
        Object.keys(history).forEach((key) => {
          if (!dataAggregatedHistory.hasOwnProperty(key)) {
            dataAggregatedHistory[key] = 0;
          }
          dataAggregatedHistory[key] += history[key];
        });
      });
      Object.keys(dataAggregatedHistory).forEach((key) => {
        dataAggregatedHistory[key] /= data.length;
      });
      const dataAggregated = [{ level: area, history: dataAggregatedHistory }];
      console.log("dataAggregated", dataAggregated);
      return dataAggregated;
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

  // const [historicBoroughPrices] = createResource(
  //   () => ["borough", getSelectedBorough()],
  //   fetchHistoricBNPrices
  // );

  // const [historicNeighbourhoodPrices] = createResource(
  //   () => ["neighbourhood", getSelectedNeighbourhood()],
  //   fetchHistoricBNPrices
  // );

  const [mapObject, setMapObject] = createSignal(null);

  return (
    <MapView>
      <div class="h-screen flex">
        <ErrorBoundary fallback={<ErrorPage />}>
          <Suspense
            fallback={
              <div>
                <LoadingAnimation />
              </div>
            }
          >
            <Show
              when={
                !props.dataResources.realEstateData.loading &&
                !props.dataResources.historicalRealEstateData.loading &&
                !props.dataResources.amenitiesData.loading
              }
            >
              {/* <Filter
                realEstateData={props.dataResources.realEstateData()}
                historicalRealEstateData={props.dataResources.historicalRealEstateData()}
                amenitiesData={props.dataResources.amenitiesData()}
              /> */}
            </Show>
            <Show
              when={
                props.dataResources.borough_geojson() &&
                props.dataResources.neighbourhood_geojson() &&
                props.dataResources.zipcodes() &&
                props.dataResources.historicalRealEstateData()
              }
            >
              <MapComponent
                getDataLayerLevel={getDataLayerLevel}
                setDataLayerLevel={setDataLayerLevel}
                dataResources={props.dataResources}
                mapObject={mapObject}
                setMapObject={setMapObject}
                zipcodeOnCharts={getSelectedZip}
                boroughSetter={setSelectedBorough}
                neighbourhoodSetter={setSelectedNeighbourhood}
                zipcodeSetter={setSelectedZip}
              >
                <Show when={!historicPrices.loading}>
                  <LineChart
                    asyncData={historicPrices}
                    getComparedZip={getComparedZip}
                    setComparedZip={setComparedZip}
                    getSelectedZip={getSelectedZip}
                    historicalRealEstateData={props.dataResources.historicalRealEstateData()}
                  ></LineChart>
                </Show>

                <div class="relative w-[95%] h-[1px] mt-[2%] bg-[#E4E4E7]"></div>
                <DashboardInfo
                  map={mapObject}
                  getSelectedZip={getSelectedZip}
                />
                {createEffect(() => {
                  if (mapObject()) {
                  }
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
                      map={mapObject}
                      getDataLayerLevel={getDataLayerLevel}
                      borough_neighbourhood={props.dataResources.borough_neighbourhood()}
                      realEstateData={props.dataResources.realEstateData()}
                    />
                    ;
                  </Show>;
                })}
              </MapComponent>
            </Show>
          </Suspense>
        </ErrorBoundary>

        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div>
    </MapView>
  );
};
