import { createContext, useContext, createSignal, onCleanup } from "solid-js";

const AdvancedMarkerContext = createContext();

export function AdvancedMarkerProvider(props) {
  const [markerElement, setMarkerElement] = createSignal(null);

  const initializeMarkerElement = () => {
    if (!markerElement()) {
      const markerElementInstance =
        new google.maps.marker.AdvancedMarkerElement({
          content: document.createElement("div"), // Provide your custom content here
          position: { lat: 40.8636241732, lng: -73.8558279928 },
        });
      setMarkerElement(markerElementInstance);
    }
  };

  onCleanup(() => {
    if (markerElement()) {
      markerElement().setMap(null); // Clean up when the component is unmounted
    }
  });

  return (
    <AdvancedMarkerContext.Provider
      value={{ markerElement, initializeMarkerElement }}
    >
      {props.children}
    </AdvancedMarkerContext.Provider>
  );
}

export function useAdvancedMarker() {
  return useContext(AdvancedMarkerContext);
}
