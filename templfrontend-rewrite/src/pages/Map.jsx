import { MapView } from "../layouts/Layout";
import { MapComponent } from "../components/Map";
import { BarChart, LineChart } from "../components/Charts";
import { createResource, createSignal } from "solid-js";

export const Map = () => {
  async function fetchHistoricPrices(zip) {
    const response = await fetch(`http://localhost:8000/api/historic-prices?zipcode=${zip}&aggregateBy=year`)
    if (!response.ok) {
      return []
    }
    try {
      const data = await response.json()
      return data
    } catch (e) {
      throw new Error(e)
    }
  }
  const [getSelectedZip, setSelectedZip] = createSignal(11385)
  const [historicPrices] = createResource(() => getSelectedZip(), fetchHistoricPrices)

  return (
    <MapView>
      <div class="h-screen flex">
        <MapComponent zipcodeSetter={setSelectedZip} isLoading={false}>
          <LineChart asyncData={historicPrices}></LineChart>
          <BarChart asyncData={historicPrices} ></BarChart>
        </MapComponent>
      </div >
    </MapView>
  )
}
