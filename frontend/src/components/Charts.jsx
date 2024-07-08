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

// <block:actions:2>
const actions = [
  {
    name: "Add Dataset",
    handler(chart) {
      const data = chart.data;
      const newDataset = {
        label: "Dataset " + (data.datasets.length + 1),
        backgroundColor: [],
        data: [],
      };

      for (let i = 0; i < data.labels.length; i++) {
        newDataset.data.push(Utils.numbers({ count: 1, min: 0, max: 100 }));

        const colorIndex = i % Object.keys(Utils.CHART_COLORS).length;
        newDataset.backgroundColor.push(
          Object.values(Utils.CHART_COLORS)[colorIndex]
        );
      }

      chart.data.datasets.push(newDataset);
      chart.update();
    },
  },
  {
    name: "Add Data",
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels.push("data #" + (data.labels.length + 1));

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(0, 100));
        }

        chart.update();
      }
    },
  },
  {
    name: "Hide(0)",
    handler(chart) {
      chart.hide(0);
    },
  },
  {
    name: "Show(0)",
    handler(chart) {
      chart.show(0);
    },
  },
  {
    name: "Hide (0, 1)",
    handler(chart) {
      chart.hide(0, 1);
    },
  },
  {
    name: "Show (0, 1)",
    handler(chart) {
      chart.show(0, 1);
    },
  },
  {
    name: "Remove Dataset",
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
    },
  },
  {
    name: "Remove Data",
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
      });

      chart.update();
    },
  },
];

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
      // console.log("newData", newData);
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
                  <input
                    type="text"
                    class="rounded-lg text-center w-[40%] relative"
                    placeholder={`Compare To? ${props.getComparedZip()}`}
                    id="compareSearchBar"
                    onMouseOver={() => {
                      setShowDropDown(true);
                    }}
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
                            prev.filter((el) => el != event.target.value * 1)
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
    // Chart.register(centerTextPlugin);
  });

  createEffect(() => {
    if (props.amenities()) {
      const labels = Object.keys(props.amenities());
      let data = [];
      for (let key of labels) {
        const obj = props.amenities()[key];
        let value = 0;
        // console.log("obj in creating doughnut", obj);
        for (let desc of Object.keys(obj)) {
          value += obj[desc].length;
        }
        // console.log("value in doughnutchart", value);
        data.push(value);
      }
      const datasets = {
        labels,
        datasets: [{ label: "Amenities DoughnutChart", data }],
      };
      doughnutChartInstance = createDoughnutChart(
        ref2,
        datasets,
        props.zip,
        doughnutChartInstance,
        footer
      );
    }
  });
  onCleanup(() => {
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
  });
  const footer = (tooltipItems) => {
    const desc = Object.keys(props.amenities()[tooltipItems[0].label]);
    let footer_string = "";
    desc.forEach((d) => {
      const arr = props.amenities()[tooltipItems[0].label][d];
      footer_string += `${d}:${arr.length}\n`;
    });
    return footer_string;
  };

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <div>{props.amenities}</div>
      <canvas ref={(el) => (ref2 = el)} id="doughnutchart"></canvas>
    </div>
  );
};

// const centerTextPlugin = {
//   id: "centerText",
//   beforeDraw: function (chart) {
//     if (chart.config.type === "doughnut") {
//       const { ctx, data } = chart;
//       if (data) {
//         const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
//         const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
//         let sum;
//         for (let num of data.datasets[0].data) {
//           console.log(typeof num);
//           sum += num;
//         }
//         const text = sum.toString(); // Change this to the text you want to display
//         ctx.save();
//         ctx.font = "bold 16px Arial"; // Customize your font size and style
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillStyle = "#000"; // Customize your text color
//         ctx.fillText(text, centerX, centerY);
//         ctx.restore();
//       }
//     }
//   },
// };

const createDoughnutChart = (
  ctx,
  dataset,
  title,
  doughnutChartInstance,
  footer
) => {
  if (ctx === undefined) {
    return;
  }

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  return new Chart(ctx, {
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
          text: `Amenities of ZIPCODE ${title}`,
        },
        tooltip: {
          callbacks: {
            footer: footer,
          },
        },
      },
    },
  });
};

export { BarChart, LineChart, DoughnutChart };
