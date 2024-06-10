import { createStore } from "solid-js/store";
const [layerStore, setLayerStore] = createStore({
  bikeLayer: null,
  trafficLayer: null,
  transitLayer: null,
  map: null,
  markerList: null,
});

export { layerStore, setLayerStore };
