import { createStore } from "solid-js/store";
const [layerStore, setLayerStore] = createStore({
  bikeLayer: null,
  trafficLayer: null,
  transitLayer: null,
  map: null,
  markerList: null,
  AdvancedMarkerElement: null,
  PinElement: null,
});

export { layerStore, setLayerStore };
