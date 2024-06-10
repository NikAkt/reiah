import { createSignal } from "solid-js";
import { layerStore } from "./layerStore";
const MapFilter = (props) => {
  const [haveBikeLayer, setBikeLayer] = createSignal(false);
  const [haveTrafficLayer, setTrafficLayer] = createSignal(false);
  const [haveTransitLayer, setTransitLayer] = createSignal(false);

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
    <div class="">
      <div class="absolute left-[20vw] top-[6vh] w-[8vw] h-[5vh] bg-blue z-20 text-white hover:bg-green cursor-pointer items-center justify-items-center flex">
        Map Filter
      </div>
      <div class="flex flex-col absolute left-[20vw] top-[11vh] w-[8vw] h-[10vh] bg-blue z-20 border-solid border-2 border-green text-white hover:bg-green cursor-pointer">
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
