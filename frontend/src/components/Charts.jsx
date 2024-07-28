import Chart from "chart.js/auto";
import {
  createEffect,
  onCleanup,
  onMount,
  Show,
  createResource,
} from "solid-js";
import loading_svg from "../assets/spinning-circles.svg";
import labradorDontCare from "../assets/labrador_dont_care.gif";
import { store } from "../data/stores";

const LoadingSvg = () => {
  return (
    <div>
      <img src={loading_svg} />
    </div>
  );
};

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
      <LoadingSvg />
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
          text: "General Trend of Historic Home Values",
          padding: {
            top: 10,
            bottom: 30,
          },
        },
      },
    },
  });
};

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
      if (data) {
        return data;
      } else {
        return null;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

async function fetchHistoricPrices(zip) {
  const response = await fetch(
    `http://localhost:8000/api/historic-prices?zipcode=${zip}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
}

const LineChart = ({
  getSelectedZip,
  updateLineChart,
  setUpdateLineChart,
  cleanLineChart,
  setCleanLineChart,
  getComparedZip,
  noHistoricData,
  setNoHistoricData,
}) => {
  //whether the line chart is multiline or not
  let ref;

  const [historicPrices] = createResource(
    () => getSelectedZip(),
    fetchHistoricPrices
  );

  createEffect(() => {
    if (cleanLineChart() === true && !noHistoricData()) {
      chartInstance.data.datasets = [
        chartInstance.data.datasets.filter(
          (obj) => obj.label * 1 == getSelectedZip()
        )[0],
      ];
      chartInstance.update();
      setCleanLineChart(false);
    }
  });

  createEffect(() => {
    if (updateLineChart() && !noHistoricData()) {
      fetchMultipleHistoricPrices(getComparedZip()).then(
        (comparedAsyncData) => {
          generateMultiLineChart(comparedAsyncData);
        }
      );
    }
  });

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
        for (let i = 0; i < transformedDataArr.length; i++) {
          const obj = {
            label: Object.keys(comparedAsyncData)[i],
            data: transformedDataArr[i],
            fill: false,
            borderColor: colors[i % 7],
          };
          const existingZip = [
            ...chartInstance.data.datasets.map((el) => el["label"]),
          ];
          if (!existingZip.includes(obj["label"])) {
            chartInstance.data.datasets.push(obj);
          }
        }
        chartInstance.update();
        setUpdateLineChart(false);
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
    if (!historicPrices.loading) {
      try {
        if (Object.keys(historicPrices()).length > 0) {
          console.log("triggered", historicPrices());
          let newData = historicPrices();
          let transformedData = Object.values(newData)[0];

          if (transformedData) {
            Object.keys(transformedData).forEach((key) => {
              transformedData[key] === 0 ? (transformedData[key] = null) : "";
            });
          }
          createLineChart(ref, [
            {
              label: Object.keys(newData)[0],
              data: transformedData,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ]);
          setNoHistoricData(false);
        } else {
          setNoHistoricData(true);
        }
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
      <Show when={noHistoricData()}>
        <div class="text-center w-[80%] relative flex flex-col gap-2 max-h-[10%]">
          Sorry, we don't have the historical data for this zip code.
          <img
            src={labradorDontCare}
            alt="Dog fumbled the ball"
            className="w-1/2 mx-auto"
          />
        </div>
      </Show>
      <Show when={!historicPrices.loading} fallback={<ChartLoadingIndicator />}>
        <div>
          <canvas
            ref={(el) => (ref = el)}
            class="w-full h-full min-w-[500px] min-h-[400px]"
          ></canvas>
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
      );
    }
  });

  onCleanup(() => {
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
  });

  return (
    <div
      class="relative min-h-[300px] max-w-[300px] aspect-square
    rounded bg-white dark:bg-slate-800 p-4 col-span-full text-white"
    >
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
) => {
  if (ctx === undefined) {
    return;
  }

  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          padding: 10,
          usePointStyle: true,
          pointStyle: "circle",
          // Display labels two per row
          generateLabels: function (chart) {
            const data = chart.data;
            const fontColor = store.darkModeOn ? "white" : "black";
            if (data.labels.length > 0) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const ds = data.datasets[0];
                const arc = meta.data[i];
                const color =
                  (arc && arc.options && arc.options.backgroundColor) ||
                  "transparent";
                return {
                  text: label,
                  fillStyle: color,
                  fontColor: fontColor,
                  hidden: isNaN(ds.data[i]) || ds.data[i] === null,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
    },
  };

  if (type === "property") {
    options.onClick = function (event, elements) {
      if (elements.length > 0) {
        const chartInstance = event.chart;
        const activePoint = chartInstance.getElementsAtEventForMode(
          event.native,
          "nearest",
          { intersect: true },
          false
        );
        if (activePoint.length > 0) {
          const index = activePoint[0].index;
          const label = chartInstance.data.labels[index];
          props.setHoverType(label);
        }
      }
    };
  } else if (type === "amenities") {
    options.onClick = function (event, elements) {
      if (elements.length > 0) {
        const chartInstance = event.chart;
        const activePoint = chartInstance.getElementsAtEventForMode(
          event.native,
          "nearest",
          { intersect: true },
          false
        );
        if (activePoint.length > 0) {
          const index = activePoint[0].index;
          const label = chartInstance.data.labels[index];
          props.setHoverAmenity(label);
        }
      }
    };
  }

  return new Chart(ctx, {
    type: "doughnut",
    data: dataset,
    options,
  });
};

export { BarChart, LineChart, DoughnutChart };
