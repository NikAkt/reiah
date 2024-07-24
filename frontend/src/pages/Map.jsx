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
import Markers from "../components/Markers";
import { DashboardInfo } from "../components/DashboardInfo";
import UserMenu from "../components/UserMenu";

async function fetchData([url]) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

export const Map = (props) => {
  const [getSelectedZip, setSelectedZip] = createSignal("");
  const [createMoreDashboardInfo, setCreateMoreDashboardInfo] =
    createSignal(false);

  const [getComparedZip, setComparedZip] = createSignal([]);

  const [showHousesMarker, setShowHousesMarker] = createSignal(true);
  const [showAmenityMarker, setShowAmenityMarker] = createSignal(false);
  const [dialogInfo, setDialogInfo] = createSignal(null);
  const [displayDialog, setDisplayDialog] = createSignal(false);

  const [zoom, setZoom] = createSignal(11);

  const [predictedPrice, setPredictedPrice] = createSignal([]);
  const [query, setQuery] = createSignal({});

  const [historicalRealEstateData] = createResource(
    ["http://localhost:8000/api/historic-prices"],
    fetchData
  );

  const [zipcodes] = createResource(
    ["http://localhost:8000/api/zipcodes"],
    fetchData
  );

  const [borough_neighbourhood] = createResource(
    ["http://localhost:8000/api/borough-neighbourhood"],
    fetchData
  );

  const [zipcode_geojson] = createResource(
    ["http://localhost:8000/api/zipcode-areas"],
    fetchData
  );

  const dataResources = {
    historicalRealEstateData,
    zipcodes,
    borough_neighbourhood,
    zipcode_geojson,
  };

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
            <Show
              when={
                dataResources.zipcodes() &&
                dataResources.historicalRealEstateData() &&
                dataResources.zipcode_geojson()
              }
            >
              <MapComponent
                dataResources={dataResources}
                mapObject={props.mapObject}
                setMapObject={props.setMapObject}
                zipcodeOnCharts={getSelectedZip}
                zipcodeSetter={setSelectedZip}
                getComparedZip={getComparedZip}
                setFavorite={props.setFavorite}
                favorite={props.favorite}
                showAmenityMarker={showAmenityMarker}
                setShowAmenityMarker={setShowAmenityMarker}
                showHousesMarker={showHousesMarker}
                setShowHousesMarker={setShowHousesMarker}
                setZoom={setZoom}
                setPredictedPrice={setPredictedPrice}
                setQuery={setQuery}
              >
                <div class="flex flex-col gap-2">
                  <Show
                    when={getSelectedZip()}
                    fallback={
                      <div>
                        Please search or click a zipcode layer to check the
                        details
                      </div>
                    }
                  >
                    <DashboardInfo
                      map={props.mapObject}
                      historicalRealEstateData={dataResources.historicalRealEstateData()}
                      setDisplayDialog={setDisplayDialog}
                      setDialogInfo={setDialogInfo}
                      query={query}
                      predictedPrice={predictedPrice}
                      getComparedZip={getComparedZip}
                      setComparedZip={setComparedZip}
                      getSelectedZip={getSelectedZip}
                      setCreateMoreDashboardInfo={setCreateMoreDashboardInfo}
                    />
                  </Show>
                </div>

                {createEffect(() => {
                  if (props.mapObject()) {
                    <Show
                      when={
                        !dataResources.zipcodes.loading &&
                        !dataResources.borough_neighbourhood.loading
                      }
                    >
                      <Markers
                        zipcodes={dataResources.zipcodes()}
                        map={props.mapObject}
                        borough_neighbourhood={dataResources.borough_neighbourhood()}
                        zoom={zoom}
                      />
                      ;
                    </Show>;
                  }
                })}
              </MapComponent>
            </Show>

            <Show when={displayDialog() == true}>
              <div class="absolute bg-black z-20 w-full h-full opacity-30"></div>
              <div
                class="absolute w-[30vw] h-[30vh] bg-white rounded-lg shadow-md
               z-30 m-auto text-center top-[35vh] left-[35vw] items-center justify-center flex flex-col"
                onclick={() => setDisplayDialog(false)}
              >
                <For
                  each={Object.keys(dialogInfo())}
                  fallback={
                    <div>
                      Fail to load the detail information of this property
                    </div>
                  }
                >
                  {(item) => {
                    return (
                      <div>
                        {item}:{dialogInfo()[item]}
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Suspense>
        </ErrorBoundary>
        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div>
      <UserMenu />
    </MapView>
  );
};
