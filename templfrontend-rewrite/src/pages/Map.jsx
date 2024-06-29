import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";
import { Show, Suspense, createSignal } from "solid-js";

export const Map = (props) => {
  const [mapZoom, setMapZoom] = createSignal(10);

  return (
    <MapView>
      <div class="h-screen flex">
        <Suspense fallback={<div>Loading geojson...</div>}>
          <Show
            when={
              props.dataResources.borough_geojson() &&
              props.dataResources.neighbourhood_geojson()
            }
          >
            <MapComponent
              mapZoom={mapZoom}
              setMapZoom={setMapZoom}
              dataResources={props.dataResources}
            />
          </Show>
        </Suspense>

        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div>
    </MapView>
  );
};
