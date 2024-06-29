import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";
import { MapAreaCard, MapAreaCardSkeletonLoader } from "../components/MapAreaCard";
import { BarChart, LineChart } from "../components/Charts";

export const Map = () => {
  return (
    <MapView>
      <div class="h-screen flex">
        <MapComponent isLoading={false}>
          <BarChart></BarChart>
          <MapAreaCard></MapAreaCard>
          <MapAreaCard></MapAreaCard>
          <LineChart></LineChart>
        </MapComponent>
      </div >
    </MapView>
  )
}
