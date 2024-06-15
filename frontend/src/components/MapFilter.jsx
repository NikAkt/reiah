import { createSignal } from "solid-js";
import { layerStore } from "./layerStore";
const MapFilter = (props) => {
  const [haveBikeLayer, setBikeLayer] = createSignal(false);
  const [haveTrafficLayer, setTrafficLayer] = createSignal(false);
  const [haveTransitLayer, setTransitLayer] = createSignal(false);
  // const [showdropdown, setShowdropdown] = createSignal(true);
  // const handleClick = () => {
  //   setShowdropdown((prev) => !prev);
  //   console.log(showdropdown());
  // };
  const google_maps = layerStore.google_map;

  const handleBikeLayer = () => {
    setBikeLayer((prev) => !prev);
    haveBikeLayer()
      ? layerStore.bikeLayer.setMap(layerStore.map)
      : layerStore.bikeLayer.setMap(null);
    console.log(haveBikeLayer);
  };

  const handleTrafficLayer = () => {
    setTrafficLayer((prev) => !prev);
    haveTrafficLayer()
      ? layerStore.trafficLayer.setMap(layerStore.map)
      : layerStore.trafficLayer.setMap(null);
  };

  const handleTransitLayer = () => {
    setTransitLayer((prev) => !prev);
    haveTransitLayer()
      ? layerStore.transitLayer.setMap(layerStore.map)
      : layerStore.transitLayer.setMap(null);
  };

  return (
    <div class="h-[15vh] w-[60%] flex flex-col border-solid border-2 border-indigo-600">
      <div
        class={`bg-green z-20 w-[100%]
        text-white items-center 
        justify-center border-solid border-2 border-indigo-600`}
      >
        {/* ${showdropdown() ? "block" : "hidden"} */}
        <div>
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
          <label htmlFor="bikeLayer">Traffic Layer</label>
        </div>

        <div>
          <input
            type="checkbox"
            name="transitLayer"
            id="transitLayer"
            onClick={handleTransitLayer}
          />
          <label htmlFor="bikeLayer">Transit Layer</label>
        </div>
      </div>
    </div>
  );
};
export default MapFilter;
