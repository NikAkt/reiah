import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";

export const Map = () => {
  return (
    <MapView>
      <div class="h-screen flex">
        <MapComponent />
        <div class="bg-white dark:bg-gray-900 basis-3/5 hidden"></div>
      </div >
    </MapView>
  )
}
