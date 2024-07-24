import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { DoughnutChart } from "./Charts"; // Assuming you have a DoughnutChart component
import loading_svg from "../assets/spinning-circles.svg";

const LoadingSvg = () => {
  return (
    <div>
      <img src={loading_svg} />
    </div>
  );
};

const RealEstateInfo = ({
  getSelectedZip,
  loader,
  map,
  setDialogInfo,
  setDisplayDialog,
  highlightMarker,
  loadCompared,
  setUniqueHouseType,
  setDraggableMarker,
  draggableMarker,
  setLat,
  setLon,
  noProperty,
  setNoProperty,
}) => {
  const colorsChartjs = [
    "#36A2EB",
    "#FF6384",
    "#FF9F40",
    "#FFCD56",
    "#4BC0C0",
    "#9966FF",
    "#C9CBCF",
  ];
  const [typeAvg, setTypeAvg] = createSignal([]);
  const [getPropertyType, setPropertyType] = createSignal([]);

  const [propertyOnMap, setPropertyOnMap] = createSignal([]);
  const [hoverType, setHoverType] = createSignal(null);

  function generateHouseTypeDetails(houseType, data) {
    const filterArr = data.filter((obj) => obj.TYPE === houseType);
    if (filterArr.length) {
      let avgPrice = 0;
      let avgSqft = 0;
      let avgPricePerSqft = 0;
      filterArr.forEach((el) => {
        avgPrice += el.PRICE;
        avgSqft += el.PROPERTYSQFT;
        avgPricePerSqft += el.PRICE_PER_SQFT;
      });
      avgPrice = (avgPrice / filterArr.length).toFixed(2);
      avgPricePerSqft = (avgPricePerSqft / filterArr.length).toFixed(2);
      avgSqft = (avgSqft / filterArr.length).toFixed(2);
      return { avgPrice, avgSqft, avgPricePerSqft };
    }
    return null;
  }

  const propertyMarkerIcon = {
    url: `data:image/svg+xml;base64,${window.btoa(`
      <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect x="20" y="80" width="200" height="80" rx="20" ry="20" fill="#ffffff" />
      </svg>`)}`,
    scaledSize: new google.maps.Size(60, 60),
  };

  const newPropertyMarkerIcon = {
    url: `data:image/svg+xml;base64,${window.btoa(`
      <svg fill="${"#ffffff"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect x="20" y="80" width="200" height="80" rx="20" ry="20" fill="#ffffff" />
      </svg>`)}`,
    scaledSize: new google.maps.Size(80, 80),
  };

  const cleanPropertyOnMap = () => {
    if (propertyOnMap().length > 0) {
      propertyOnMap().forEach((marker) => marker.setMap(null));
      setPropertyOnMap([]);
    }
  };

  async function fetchPropertyData(zip) {
    const response = await fetch(
      `http://localhost:8000/api/property-data?zipcode=${zip}`
    );
    if (!response.ok) {
      setNoProperty(true);
      return [];
    }
    try {
      const data = await response.json();
      if (data && data.length > 0) {
        let type = {};
        let count = 0;
        let labels = [];
        data.forEach((el) => {
          if (!type.hasOwnProperty(el.TYPE)) {
            type[el.TYPE] = 0;
          }
          count += 1;
          type[el.TYPE] += 1;
          labels.push(el.TYPE);
        });

        setTypeAvg([]);
        setHoverType("");
        if (setUniqueHouseType) {
          setUniqueHouseType(Object.keys(type));
        }

        Object.keys(type).forEach((t) => {
          const avg = generateHouseTypeDetails(t, data);
          setTypeAvg((prev) => [...prev, { [t]: avg }]);
        });

        const datasets = {
          labels: Object.keys(type),
          datasets: [{ label: "Property Type", data: Object.values(type) }],
        };
        setPropertyType(datasets);

        loader.importLibrary("marker").then(({ Marker, Animation }) => {
          cleanPropertyOnMap();

          let markers = [];

          const svgMarker = {
            path: "M19 9.77806V16.2C19 17.8801 19 18.7202 18.673 19.3619C18.3854 19.9264 17.9265 20.3854 17.362 20.673C16.7202 21 15.8802 21 14.2 21H9.8C8.11984 21 7.27976 21 6.63803 20.673C6.07354 20.3854 5.6146 19.9264 5.32698 19.3619C5 18.7202 5 17.8801 5 16.2V9.7774M21 12L15.5668 5.96393C14.3311 4.59116 13.7133 3.90478 12.9856 3.65138C12.3466 3.42882 11.651 3.42887 11.0119 3.65153C10.2843 3.90503 9.66661 4.59151 8.43114 5.96446L3 12M14 12C14 13.1045 13.1046 14 12 14C10.8954 14 10 13.1045 10 12C10 10.8954 10.8954 9.99996 12 9.99996C13.1046 9.99996 14 10.8954 14 12Z",
            fillColor: "white",
            fillOpacity: 1,
            strokeColor: "black",
            strokeWeight: 1,
            rotation: 0,
            scale: 2,
            anchor: new google.maps.Point(0, 20),
          };
          if (setDraggableMarker) {
            if (draggableMarker()) {
              draggableMarker().setMap(null);
            }
            const firstEle = data[0];
            const marker = new Marker({
              position: { lat: firstEle.LATITUDE, lng: firstEle.LONGITUDE },
              animation: Animation.DROP,
              icon: svgMarker,
              draggable: true,
              title: "Drag me!",
            });
            setLat(firstEle.LATITUDE);
            setLon(firstEle.LONGITUDE);
            marker.addListener("dragend", (event) => {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              setLat(lat);
              setLon(lng);
            });
            marker.setZIndex(1000);
            setDraggableMarker(marker);
          }

          data.forEach((el) => {
            const marker = new Marker({
              position: { lat: el.LATITUDE, lng: el.LONGITUDE },
              level: "property-data",
              type: el.TYPE,
              bath: el.BATH,
              beds: el.BEDS,
              price: el.PRICE,
              propertysqf: el.PROPERTYSQFT,
              animation: Animation.DROP,
              map: map(),
              label: {
                text: `\$${(el.PRICE / 1000).toFixed(0)}k`,
                color: "black",
              },
              icon: propertyMarkerIcon,
            });

            markers.push(marker);
            marker.addListener("click", () => {
              setDialogInfo({
                "House Type": marker.type,
                Bathroom: marker.bath,
                Bedroom: marker.beds,
                price: `\$${marker.price}`,
                size: `${marker.propertysqf} sqft`,
              });
              setDisplayDialog(true);
            });
          });
          setPropertyOnMap(markers);
        });
        setNoProperty(false);
        return true;
      } else {
        cleanPropertyOnMap();
        setNoProperty(true);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  createEffect(() => {
    if (!loadCompared) {
      fetchPropertyData(getSelectedZip());
    } else {
      fetchPropertyData(getSelectedZip);
    }
  });

  createEffect(() => {
    if (hoverType()) {
      highlightMarker(
        hoverType(),
        propertyOnMap(),
        propertyMarkerIcon,
        newPropertyMarkerIcon,
        "type"
      );
    }
  });

  onCleanup(() => {
    const propertymarkers = propertyOnMap();
    propertymarkers.forEach((marker) => {
      marker.setMap(null);
    });
    setPropertyOnMap([]);
    if (setDraggableMarker && draggableMarker()) {
      draggableMarker().setMap(null);
      setDraggableMarker(null);
    }
  });

  return (
    <div id="realEstate-info" class="dark:text-white">
      <div class="flex flex-col">
        <div class="flex flex-row place-content-between px-4 py-2">
          <Show
            when={getPropertyType() && !noProperty()}
            fallback={
              <div class="text-center">
                Sorry. We don't have records for the 2023 sales of this zip
                code.
              </div>
            }
          >
            <div>
              <DoughnutChart
                datasets={getPropertyType()}
                type="property"
                setHoverType={setHoverType}
              />
            </div>
            <div>
              <Show when={typeAvg().length}>
                <For each={typeAvg()} fallback={<LoadingSvg />}>
                  {(item, index) => (
                    <div>
                      <p
                        class="text-white rounded-lg"
                        style={{
                          "background-color": colorsChartjs[index()],
                        }}
                      >
                        {Object.keys(item)}
                      </p>
                      <div>
                        Average Price: ${Object.values(item)[0].avgPrice}
                      </div>
                      <div>
                        Average Size: {Object.values(item)[0].avgSqft} sqft
                      </div>
                      <div>
                        Average Price Per Square Foot: $
                        {Object.values(item)[0].avgPricePerSqft}/sqft
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default RealEstateInfo;
