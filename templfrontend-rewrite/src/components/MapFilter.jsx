import { createSignal } from "solid-js";
import { store } from "../data/stores";
const MapFilter = (props) => {
  // const [haveBikeLayer, setBikeLayer] = createSignal(false);
  // const [haveTrafficLayer, setTrafficLayer] = createSignal(false);
  // const [haveTransitLayer, setTransitLayer] = createSignal(false);
  // const [haveDataLayer, setDataLayer] = createSignal(true);
  // const [showdropdown, setShowdropdown] = createSignal(true);
  // const handleClick = () => {
  //   setShowdropdown((prev) => !prev);
  //   console.log(showdropdown());
  // };

  // const handleBikeLayer = () => {
  //   setBikeLayer((prev) => !prev);
  //   haveBikeLayer()
  //     ? layerStore.bikeLayer.setMap(layerStore.map)
  //     : layerStore.bikeLayer.setMap(null);
  //   console.log(haveBikeLayer);
  // };

  // const handleTrafficLayer = () => {
  //   setTrafficLayer((prev) => !prev);
  //   haveTrafficLayer()
  //     ? layerStore.trafficLayer.setMap(layerStore.map)
  //     : layerStore.trafficLayer.setMap(null);
  // };

  // const handleTransitLayer = () => {
  //   setTransitLayer((prev) => !prev);
  //   haveTransitLayer()
  //     ? layerStore.transitLayer.setMap(layerStore.map)
  //     : layerStore.transitLayer.setMap(null);
  // };

  // const handleDataLayer = () => {
  //   setDataLayer((prev) => !prev);
  //   !haveDataLayer()
  //     ? layerStore.map.data.setStyle({ visible: false })
  //     : layerStore.map.data.setStyle({ visible: true });
  // };

  return (
    <div class="h-[15vh] w-[60%] flex flex-col">
      <div
        class={`z-20 w-[100%]
        items-center flex flex-col
        justify-center`}
      >
        {/* ${showdropdown() ? "block" : "hidden"} */}
        {/* <div>
          <input
            type="checkbox"
            name="bikeLayer"
            id="bikeLayer"
            onClick={handleBikeLayer}
          />
          <label htmlFor="bikeLayer">Bike Layer</label>
        </div>

        <div>
          <input
            type="checkbox"
            name="trafficLayer"
            id="trafficLayer"
            onClick={handleTrafficLayer}
          />
          <label htmlFor="trafficLayer">Traffic Layer</label>
        </div>

        <div>
          <input
            type="checkbox"
            name="transitLayer"
            id="transitLayer"
            onClick={handleTransitLayer}
          />
          <label htmlFor="transitLayer">Transit Layer</label>
        </div> */}

        <div>
          <input
            type="checkbox"
            name="markerClearer"
            id="markerClearer"
            onClick={console.log(
              "Yeah markers should be cleared out on the map"
            )}
          />
          <label htmlFor="markerLayer">Marker</label>
        </div>
      </div>
    </div>
  );
};
export default MapFilter;
