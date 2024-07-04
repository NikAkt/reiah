import Chart from "chart.js/auto";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";

const transformData = (historicpricesObject) => {
  if (historicpricesObject == undefined) {
    return [];
  }
  const chartDataList = [];
  for (const [key, value] of Object.entries(historicpricesObject)) {
    const newObject = { x: key, y: value };
    chartDataList.push(newObject);
  }

  return chartDataList;
};

const ChartLoadingIndicator = () => {
  return (
    <div class="w-full h-full flex justify-center items-center">
      <h1 class="text-black">Loading ...</h1>
    </div>
  );
};

const createBarChart = (ctx, data, label) => {
  if (ctx === undefined) {
    return;
  }

  let datasets = [];
  if (data.length > 1) {
    data.forEach((d) => {
      datasets.push({ label: label, data: d, borderWidth: 1 });
    });
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      datasets: [
        {
          label: label,
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const BarChart = (props) => {
  console.log("Barchart");
  let ref;

  onMount(() => {
    createBarChart(ref);
  });

  createEffect(() => {
    if (!props.asyncData.loading) {
      let newData = props.asyncData()?.[0];
      console.log("newData", newData);
      let transformedData = transformData(newData?.historicprices);
      createBarChart(ref, transformedData, newData.zipcode);
    }
  });

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show
        when={!props.asyncData.loading}
        fallback={<ChartLoadingIndicator />}
      >
        <div class="relative w-full h-full">
          <canvas ref={(el) => (ref = el)}></canvas>
        </div>
      </Show>
    </div>
  );
};

let chartInstance;

const createLineChart = (ctx, datasets) => {
  if (ctx === undefined) {
    return;
  }
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Historic Home Prices",
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
    },
  });
};
const [getZipOnCharts, setZipOnCharts] = createSignal([]);

async function fetchMultipleHistoricPrices(zipArray) {
  if (zipArray.length > 1) {
    let query = "";
    for (let i = 0; i <= zipArray.length; i++) {
      if (i == 0) {
        query += `?zipcode=${zipArray[i]}`;
      } else {
        query += `&zipcode=${zipArray[i]}`;
      }
    }
    const response = await fetch(
      `http://localhost:8000/api/historic-prices${query}`
    );
    if (!response.ok) {
      return [];
    }
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
}

const LineChart = (props) => {
  const uniqueZipcode = Object.keys(props.historicalRealEstateData);
  const [showDropDown, setShowDropDown] = createSignal(false);

  let ref;
  const handleSubmit = () => {
    const zipArray = [
      ...new Set([props.getSelectedZip() * 1, ...props.getComparedZip()]),
    ];
    setZipOnCharts(zipArray);
    if (zipArray.length > 1) {
      let query = "";
      for (let i = 0; i < zipArray.length; i++) {
        if (i > 6) {
          //limit is 7
          break;
        }
        console.log(zipArray[i]);
        if (i == 0) {
          query += `?zipcode=${zipArray[i]}`;
        } else {
          query += `&zipcode=${zipArray[i]}`;
        }
      }
    }
    fetchMultipleHistoricPrices(getZipOnCharts()).then((comparedAsyncData) => {
      generateMultiLineChart(comparedAsyncData);
    });
  };

  const generateMultiLineChart = (comparedAsyncData) => {
    if (comparedAsyncData) {
      const comparedNewData = comparedAsyncData;
      const transformedDataArr = [...Object.values(comparedNewData)];

      try {
        let datasets = [];
        for (let i = 0; i < transformedDataArr.length; i++) {
          const obj = {
            label: Object.keys(comparedAsyncData)[i],
            data: transformedDataArr[i],
            fill: false,
          };
          datasets.push(obj);
        }
        createLineChart(ref, datasets);
      } catch (error) {
        console.log(
          "error when creating compared async data line charts",
          error
        );
      }
    }
  };

  onMount(() => {
    createLineChart(ref);
  });

  createEffect(() => {
    if (!props.asyncData.loading) {
      let newData = props.asyncData();
      let transformedData = Object.values(newData)[0];
      try {
        createLineChart(ref, [
          {
            label: Object.keys(newData)[0],
            data: transformedData,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
    }
    onCleanup((ref) => {
      if (ref) {
        ref = null;
      }
    });
  });

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show
        when={!props.asyncData.loading}
        fallback={<ChartLoadingIndicator />}
      >
        <div class="relative w-full h-[40vh]">
          <div>
            <div class="flex flex-col">
              <div class="flex flex-row gap-2">
                <input
                  type="text"
                  class="rounded-lg text-center w-[40%] relative"
                  placeholder="Compare To?"
                  id="compareSearchBar"
                  onMouseOver={() => {
                    setShowDropDown(true);
                  }}
                />
                <input
                  type="Submit"
                  class="relative ml-[2%] rounded-lg bg-black text-white w-[10%] cursor-pointer"
                  onClick={handleSubmit}
                />
              </div>

              <div
                class={`overflow-y-auto absolute w-[15vw] h-[20vh] mt-[3vh] bg-white 
                  border rounded-lg mt-1 z-10 ${
                    showDropDown() ? "block" : "hidden"
                  }`}
                onMouseOver={() => setShowDropDown(true)}
                onMouseLeave={() => setShowDropDown(false)}
              >
                {uniqueZipcode.map((zip) => (
                  <div key={zip} class="p-2">
                    <input
                      type="checkbox"
                      id={`compareCheckbox-${zip}`}
                      value={zip}
                      class="accent-teal-500 compareCheckbox"
                      onClick={(event) =>
                        event.target.checked
                          ? props.setComparedZip((prev) => [
                              ...prev,
                              event.target.value * 1,
                            ])
                          : props.setComparedZip((prev) =>
                              prev.filter((el) => el != event.target.value * 1)
                            )
                      }
                    />
                    <label htmlFor={`compareCheckbox-${zip}`} class="ml-2">
                      {zip}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <canvas ref={(el) => (ref = el)}></canvas>
        </div>
      </Show>
    </div>
  );
};

const DoughnutChart = (props) => {
  let ref;
  // createDoughnutChart(ref, dataset);
  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <div>{props.amenities}</div>
      <canvas ref={(el) => (ref = el)}></canvas>
    </div>
  );
};

const createDoughnutChart = (ctx, dataset) => {
  if (ctx === undefined) {
    return;
  }

  // {
  //   labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
  //   datasets: [
  //     {
  //       label: 'Dataset 1',
  //       data: Utils.numbers(NUMBER_CFG),
  //       backgroundColor: Object.values(Utils.CHART_COLORS),
  //     }
  //   ]
  // };

  new Chart(ctx, {
    type: "doughnut",
    data: dataset,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Amenities",
        },
      },
    },
  });
};

export { BarChart, LineChart, DoughnutChart };
