import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { DoughnutChart } from "./Charts"; // Assuming you have a DoughnutChart component

const RealEstateInfo = ({
  recommendedZipcode,
  getSelectedZip,
  loader,
  query,
  predictedPrice,
  map,
  setDialogInfo,
  setDisplayDialog,
  highlightMarker,
  loadCompared,
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
  const [Yr1_Price, setYr1Price] = createSignal(null);
  const [Yr1_ROI, setYr1ROI] = createSignal(null);

  const [Yr3_Price, setYr3Price] = createSignal(null);
  const [Yr3_ROI, setYr3ROI] = createSignal(null);

  const [Yr5_Price, setYr5Price] = createSignal(null);
  const [Yr5_ROI, setYr5ROI] = createSignal(null);
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

  async function fetchPropertyData(zip) {
    const response = await fetch(
      `http://localhost:8000/api/property-data?zipcode=${zip}`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      if (data) {
        let type = {};
        let count = 0;
        let labels = [];
        data[zip].forEach((el) => {
          if (!type.hasOwnProperty(el.TYPE)) {
            type[el.TYPE] = 0;
          }
          count += 1;
          type[el.TYPE] += 1;
          labels.push(el.TYPE);
        });

        setTypeAvg([]);
        setHoverType("");

        Object.keys(type).forEach((t) => {
          const avg = generateHouseTypeDetails(t, data[zip]);
          setTypeAvg((prev) => [...prev, { [t]: avg }]);
        });

        const datasets = {
          labels: Object.keys(type),
          datasets: [{ label: "Property Type", data: Object.values(type) }],
        };
        setPropertyType(datasets);

        loader.importLibrary("marker").then(({ Marker, Animation }) => {
          propertyOnMap().forEach((marker) => marker.setMap(null));
          setPropertyOnMap([]);

          let markers = [];

          data[zip].forEach((el) => {
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
        return true;
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
    let zip = loadCompared ? getSelectedZip : getSelectedZip();
    if (recommendedZipcode().includes(parseInt(zip))) {
      fetch(`http://localhost:8000/zipcode-scores?zipcode=${zip}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            const info = data[0];
            setYr1Price(info["1Yr_forecast_price"]);
            setYr1ROI(info["1Yr_ROI"]);

            setYr3Price(info["3Yr_forecast_price"]);
            setYr3ROI(info["3Yr_ROI"]);

            setYr5Price(info["5Yr_forecast_price"]);
            setYr5ROI(info["5Yr_ROI"]);
          }
        });
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
  });

  return (
    <div id="realEstate-info" class="dark:text-white">
      <div class="flex flex-col">
        <div class="flex flex-row place-content-between px-4 py-2">
          <Show when={getPropertyType()}>
            <div>
              <DoughnutChart
                datasets={getPropertyType()}
                type="property"
                setHoverType={setHoverType}
              />
            </div>
            <div>
              <Show
                when={typeAvg().length}
                fallback={<div>Cannot get detailed information...</div>}
              >
                <For each={typeAvg()} fallback={<div>Loading...</div>}>
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
        <div>
          {loadCompared ? (
            <Show
              when={recommendedZipcode().includes(parseInt(getSelectedZip))}
            >
              <div>
                <div>
                  <span>For ZIPCODE {getSelectedZip}:</span>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next year:
                    </p>
                    <div>1 year forecast price: {Yr1_Price()}</div>
                    <div>1 year ROI: {(Yr1_ROI() * 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next 3 years:
                    </p>
                    <div>3 year forecast price: {Yr3_Price()}</div>
                    <div>3 year ROI: {(Yr3_ROI() * 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next 5 years:
                    </p>
                    <div>5 year forecast price: {Yr5_Price()}</div>
                    <div>5 year ROI: {(Yr5_ROI() * 100).toFixed(2)}%</div>
                  </div>
                </div>
                <div>
                  For a {query().house_type} that has:
                  <ul>
                    <li>Size: {query().sqft} square foot</li>
                    <li>Bedrooms: {query().bedrooms}</li>
                    <li>Bathrooms: {query().bathrooms}</li>
                  </ul>
                  the average predicted cost will be{" "}
                  {predictedPrice()[getSelectedZip]}
                </div>
              </div>
            </Show>
          ) : (
            <Show
              when={recommendedZipcode().includes(parseInt(getSelectedZip()))}
            >
              <div>
                <div>
                  <span>For ZIPCODE {getSelectedZip()}:</span>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next year:
                    </p>
                    <div>1 year forecast price: {Yr1_Price()}</div>
                    <div>1 year ROI: {(Yr1_ROI() * 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next 3 years:
                    </p>
                    <div>3 year forecast price: {Yr3_Price()}</div>
                    <div>3 year ROI: {(Yr3_ROI() * 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <p class="bg-teal-500 text-white w-[30%]">
                      In the next 5 years:
                    </p>
                    <div>5 year forecast price: {Yr5_Price()}</div>
                    <div>5 year ROI: {(Yr5_ROI() * 100).toFixed(2)}%</div>
                  </div>
                </div>
                <div>
                  For a {query().house_type} that has:
                  <ul>
                    <li>Size: {query().sqft} square foot</li>
                    <li>Bedrooms: {query().bedrooms}</li>
                    <li>Bathrooms: {query().bathrooms}</li>
                  </ul>
                  the average predicted cost will be{" "}
                  {predictedPrice()[getSelectedZip()]}
                </div>
              </div>
            </Show>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealEstateInfo;
