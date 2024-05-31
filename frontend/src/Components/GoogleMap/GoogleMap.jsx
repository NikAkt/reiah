import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function GoogleMap() {
  const API_KEY = "AIzaSyAX_iqnLB8j7JggiCSHd-pm6RDBBeSbRU0";
  const MAP_ID = "e6074194e6d06d5f";
  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: "100vw", height: "100vh" }}
        mapId={MAP_ID}
        language={"ENGLISH"}
        defaultCenter={{ lat: 40.7831, lng: -73.9712 }}
        defaultZoom={12}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />
    </APIProvider>
  );
}
