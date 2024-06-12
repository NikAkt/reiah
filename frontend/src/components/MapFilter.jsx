import { createSignal } from "solid-js";
import { layerStore } from "./layerStore";
const MapFilter = (props) => {
  const [haveBikeLayer, setBikeLayer] = createSignal(false);
  const [haveTrafficLayer, setTrafficLayer] = createSignal(false);
  const [haveTransitLayer, setTransitLayer] = createSignal(false);
  const [showdropdown, setShowdropdown] = createSignal(false);
  const handleClick = () => {
    setShowdropdown((prev) => !prev);
    console.log(showdropdown());
  };
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
    <div class="absolute left-[20vw] top-[6.5vh] h-[15vh] w-[8vw]  flex flex-row">
      <div
        class="absolute z-20 text-white w-[100%] h-[5vh]
      bg-blue hover:bg-violet-700 flex flex-col
      duration-300 active:bg-violet-700 
      justify-center items-center cursor-pointer"
        onClick={handleClick}
      >
        Map Filter{" "}
      </div>
      <div
        class={`absolute bg-blue z-20 w-[100%] top-[3vh] h-[9vh]
        text-white cursor-pointer delay-[300ms] animate-fade-down items-center 
        justify-center ${showdropdown() ? "block" : "hidden"}`}
      >
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
