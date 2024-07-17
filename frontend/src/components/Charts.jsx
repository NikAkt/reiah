import Chart from "chart.js/auto";
import {
  createEffect,
  onCleanup,
  onMount,
  Show,
  createResource,
  createSignal,
} from "solid-js";

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
      if (data && data.length > 0) {
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
  fetch(`http://localhost:8000/api/historic-prices?zipcode=${zip}`)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        return data;
      } else {
        return null;
      }
    });
}

const LineChart = ({
  getSelectedZip,
  updateLineChart,
  setUpdateLineChart,
  cleanLineChart,
  setCleanLineChart,
  getComparedZip,
}) => {
  //whether the line chart is multiline or not
  let ref;

  const [historicPrices] = createResource(
    () => getSelectedZip(),
    fetchHistoricPrices
  );

  createEffect(() => {
    if (cleanLineChart() === true) {
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
    if (updateLineChart()) {
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
          chartInstance.data.datasets.push(obj);
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
        let newData = historicPrices();
        console.log(historicPrices());
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
    <div
      class="relative min-h-[280px] max-w-[350px]
    aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full"
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
            position: "top",
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
            position: "top",
          },
        },
      },
    });
  }
};

export { BarChart, LineChart, DoughnutChart };
