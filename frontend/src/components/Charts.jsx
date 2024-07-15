import Chart from "chart.js/auto";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import arrow_down from "../assets/down-arrow-backup-2-svgrepo-com.svg";
import arrow_up from "../assets/down-arrow-backup-3-svgrepo-com.svg";

const colors = [
  "rgb(75,192,192)",
  "rgb(54,162,235)",
  "rgb(255,99,132)",
  "rgb(255,159,64)",
  "rgb(255,205,86)",
  "rgb(153,102,255)",
  "rgb(201,203,207)",
];

const ChartLoadingIndicator = () => {
  return (
    <div class="w-full h-full flex justify-center items-center">
      <h1 class="text-black">Loading ...</h1>
    </div>
  );
};

let barchartInstance;

const createBarChart = (ctx, data) => {
  if (ctx === undefined) {
    return;
  }
  if (barchartInstance) {
    barchartInstance.destroy();
  }

  return new Chart(ctx, {
    type: "bar",
    data,
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
  let ref;

  onMount(() => {
    barchartInstance = createBarChart(ref);
  });

  createEffect(() => {
    if (props.datasets) {
      barchartInstance = createBarChart(ref, props.datasets);
    }
  });

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show when={props.datasets} fallback={<ChartLoadingIndicator />}>
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
  //whether the line chart is multiline or not
  const [clean, setClean] = createSignal(false);

  const handleCleanSubmit = () => {
    chartInstance.data.datasets = [
      chartInstance.data.datasets.filter(
        (obj) => obj.label * 1 == props.getSelectedZip()
      )[0],
    ];

    // chartInstance.data.datasets = null;
    chartInstance.update();
    props.setCreateMoreDashboardInfo(false);
    for (let zip of props.getComparedZip()) {
      const checkbox = document.getElementById(`compareCheckbox-${zip}`);
      checkbox.checked = false;
    }
    props.setComparedZip([]);
  };

  let ref;
  const handleSubmit = () => {
    const zipArray = [...new Set([...props.getComparedZip()])];
    if (!zipArray.includes(props.getSelectedZip() * 1)) {
      zipArray.unshift(props.getSelectedZip() * 1);
    }
    setZipOnCharts(zipArray);
    if (zipArray.length > 1) {
      let query = "";
      for (let i = 0; i < zipArray.length; i++) {
        if (i > 6) {
          //limit is 7
          break;
        }
        // console.log(zipArray[i]);
        if (i == 0) {
          query += `?zipcode=${zipArray[i]}`;
        } else {
          query += `&zipcode=${zipArray[i]}`;
        }
      }
    }
    fetchMultipleHistoricPrices(getZipOnCharts()).then((comparedAsyncData) => {
      generateMultiLineChart(comparedAsyncData);
      setClean(true);
    });
    props.setCreateMoreDashboardInfo(true);
  };

  const generateMultiLineChart = (comparedAsyncData) => {
    if (comparedAsyncData) {
      const comparedNewData = comparedAsyncData;
      const transformedDataArr = [...Object.values(comparedNewData)];
      transformedDataArr.forEach((obj) => {
        Object.keys(obj).forEach((key) =>
          obj[key] === 0 ? (obj[key] = null) : ""
        );
      });

      try {
        let datasets = [];
        for (let i = 0; i < transformedDataArr.length; i++) {
          const obj = {
            label: Object.keys(comparedAsyncData)[i],
            data: transformedDataArr[i],
            fill: false,
            borderColor: colors[i % 7],
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
      if (transformedData) {
        Object.keys(transformedData).forEach((key) => {
          transformedData[key] === 0 ? (transformedData[key] = null) : "";
        });
      }

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
                <Show when={props.getSelectedZip()}>
                  <div
                    class="rounded-lg text-center w-[30%] 
                  relative bg-[#ffffff] flex gap-2
                  items-center justify-center"
                  >
                    <Show
                      when={showDropDown() === false}
                      fallback={
                        <button
                          onClick={() => setShowDropDown(false)}
                          class="hover:bg-teal-500"
                        >
                          <img src={arrow_up} class="w-[15px] h-[15px]" />
                        </button>
                      }
                    >
                      <button
                        onClick={() => setShowDropDown(true)}
                        class="hover:bg-teal-500"
                      >
                        <img src={arrow_down} class="w-[15px] h-[15px]" />
                      </button>
                    </Show>

                    <input
                      type="text"
                      placeholder={`Compare To? ${props.getComparedZip()}`}
                      id="compareSearchBar"
                      onKeyUp={(event) => {
                        if (event.key === "Enter") {
                          if (uniqueZipcode.includes(event.target.value)) {
                            props.setComparedZip((prev) => [
                              ...prev,
                              event.target.value * 1,
                            ]);

                            if (
                              !document.getElementById(
                                `compareCheckbox-${event.target.value}`
                              ).checked
                            ) {
                              document.getElementById(
                                `compareCheckbox-${event.target.value}`
                              ).checked = true;
                            }

                            // event.target.placeholder = [
                            //   ...new Set(props.getComparedZip()),
                            // ];
                            event.target.value = "";
                          } else {
                            alert("The zipcode you provided is not included.");
                          }
                        }
                      }}
                    />
                  </div>

                  <input
                    type="Submit"
                    class="relative ml-[2%] rounded-lg bg-black text-white w-[10%] cursor-pointer px-2"
                    onClick={handleSubmit}
                  />
                  <button
                    class={
                      clean()
                        ? "relative ml-[2%] bg-black px-[2%] rounded-lg text-center text-white cursor-pointe r"
                        : "relative ml-[2%] bg-black px-[2%] rounded-lg text-center text-white cursor-not-allowed opacity-50"
                    }
                    onClick={handleCleanSubmit}
                  >
                    Clean Comparison
                  </button>
                </Show>
              </div>

              <div
                class={`overflow-y-auto absolute w-[15vw] h-[20vh] mt-[3vh] bg-white 
                  border rounded-lg mt-1 z-10 ${
                    showDropDown() ? "block" : "hidden"
                  }`}
              >
                <div>
                  <div>
                    {uniqueZipcode.map((zip) => (
                      <div key={zip} class="p-2">
                        <input
                          type="checkbox"
                          id={`compareCheckbox-${zip}`}
                          value={zip}
                          class="accent-teal-500 compareCheckbox"
                          onClick={(event) => {
                            if (event.target.checked) {
                              props.setComparedZip((prev) => [
                                ...prev,
                                event.target.value * 1,
                              ]);
                              // document.getElementById(
                              //   "compareSearchBar"
                              // ).placeholder = props.getComparedZip();
                            } else {
                              props.setComparedZip((prev) =>
                                prev.filter(
                                  (el) => el != event.target.value * 1
                                )
                              );
                              // document.getElementById(
                              //   "compareSearchBar"
                              // ).placeholder = props.getComparedZip();
                            }
                          }}
                        />
                        <label htmlFor={`compareCheckbox-${zip}`} class="ml-2">
                          {zip}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
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
  let ref2;
  let doughnutChartInstance;
  onMount(() => {
    doughnutChartInstance = createDoughnutChart(ref2, doughnutChartInstance);
  });

  createEffect(() => {
    if (props.datasets) {
      doughnutChartInstance = createDoughnutChart(
        ref2,
        props.datasets,
        props.type,
        doughnutChartInstance,
        props
        // footer
      );
    }
  });

  onCleanup(() => {
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
  });

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <canvas ref={(el) => (ref2 = el)} id="doughnutchart"></canvas>
    </div>
  );
};

const createDoughnutChart = (
  ctx,
  dataset,
  type,
  doughnutChartInstance,
  props
  // footer = null
) => {
  if (ctx === undefined) {
    return;
  }

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const doughnutLabel = {
    id: "doughnutLabel",
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;
      ctx.save();
      const xCoor = chart.getDatasetMeta(0).data[0].x;
      const yCoor = chart.getDatasetMeta(0).data[0].y;

      //responsive text size
      let newVal;
      let val = 15;
      const innerWidth = window.innerWidth;
      if (innerWidth > 800) {
        newVal = 15;
      } else if (innerWidth <= 800 && innerWidth > 600) {
        newVal = 7.5;
      } else {
        newVal = 5;
      }

      if (val !== newVal) {
        val = newVal;
        chart.update();
      }

      ctx.font = `bold ${val}px sans-serif`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let sum = 0;
      data.datasets[0].data.forEach((num) => (sum += num));

      ctx.fillText(`Total:${sum}`, xCoor, yCoor);
    },
  };
  if (type === "property") {
    return new Chart(ctx, {
      type: "doughnut",
      data: dataset,
      options: {
        responsive: true,
        onClick: function (event) {
          props.setHoverType(event.chart.tooltip.title[0]);
          // Actions to be performed
        },
        plugins: {
          legend: {
            position: "left",
          },
        },
      },
      // plugins: [doughnutLabel],
    });
  } else if (type === "amenities") {
    return new Chart(ctx, {
      type: "doughnut",
      data: dataset,
      options: {
        responsive: true,
        onClick: function (event) {
          props.setHoverAmenity(event.chart.tooltip.title[0]);
          // Actions to be performed
        },
        plugins: {
          legend: {
            position: "left",
          },
        },
      },
      // plugins: [doughnutLabel],
    });
  } else {
    return new Chart(ctx, {
      type: "doughnut",
      data: dataset,
      options: {
        responsive: true,

        plugins: {
          legend: {
            display: true,
            position: "left",
          },
        },
      },
    });
  }
};

export { BarChart, LineChart, DoughnutChart };
