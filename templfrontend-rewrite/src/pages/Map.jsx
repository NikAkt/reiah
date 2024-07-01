import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";
import {
  Show,
  Suspense,
  createSignal,
  createResource,
  createEffect,
} from "solid-js";
import { BarChart, LineChart } from "../components/Charts";
import Markers from "../components/Markers";

export const Map = (props) => {
  const [mapZoom, setMapZoom] = createSignal(10);
  async function fetchHistoricPrices(zip) {
    const response = await fetch(
      `http://localhost:8000/api/historic-prices?zipcode=${zip}&aggregateBy=year`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
  const [getSelectedZip, setSelectedZip] = createSignal(11385);
  const [historicPrices] = createResource(
    () => getSelectedZip(),
    fetchHistoricPrices
  );

  const [mapObject, setMapObject] = createSignal(null);

  return (
    <MapView>
      <div class="h-screen flex">
        <Suspense fallback={<div>Loading data...</div>}>
          <Show
            when={
              props.dataResources.borough_geojson() &&
              props.dataResources.neighbourhood_geojson() &&
              props.dataResources.zipcodes()
            }
          >
            {/* <Markers
              zipcodes={props.dataResources.zipcodes()}
              map={mapObject}
            /> */}
            <MapComponent
              mapZoom={mapZoom}
              setMapZoom={setMapZoom}
              dataResources={props.dataResources}
              zipcodeSetter={setSelectedZip}
              mapObject={mapObject}
              setMapObject={setMapObject}
            >
              <LineChart asyncData={historicPrices}></LineChart>
              <BarChart asyncData={historicPrices}></BarChart>
              {createEffect(() => {
                <Show
                  when={props.dataResources.zipcodes() && mapObject()}
                  fallback={props.dataResources.zipcodes.error}
                >
                  <Markers
                    zipcodes={props.dataResources.zipcodes()}
                    map={mapObject}
                  />
                </Show>;
              })}
            </MapComponent>
          </Show>
        </Suspense>

        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div>
    </MapView>
  );
};
