import Chart from "chart.js/auto";
import { createEffect, onCleanup, onMount, Show } from "solid-js";

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

const createLineChart = (ctx, datasets) => {
  if (ctx === undefined) {
    return;
  }
  new Chart(ctx, {
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

const LineChart = (props) => {
  let ref;

  onMount(() => {
    createLineChart(ref);
  });

  createEffect(() => {
    if (!props.asyncData.loading) {
      let newData = props.asyncData()?.[0];
      let transformedData = transformData(newData?.historicprices);
      try {
        createLineChart(ref, [
          {
            label: newData[Object.keys(newData)[0]],
            data: [...transformedData],
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

  createEffect(() => {
    if (!props.comparedAsyncData.loading) {
      console.log("comparedAsyncData", props.comparedAsyncData());
      let comparedNewData = props.comparedAsyncData();
      let transformedDataArr = [];
      comparedNewData.forEach((el) => {
        const transformedData = transformData(el.historicprices);
        transformedDataArr.push(transformedData);
      });
      console.log("transformedDataArr", transformedDataArr);
      try {
        let datasets = [];
        for (let i = 0; i < transformedDataArr.length; i++) {
          const obj = {
            label: props.getComparedZip()[i],
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
      onCleanup((ref) => {
        if (ref) {
          ref = null;
        }
      });
    }
  });

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show
        when={!props.asyncData.loading}
        fallback={<ChartLoadingIndicator />}
      >
        <div class="relative w-full h-[40vh]">
          <div>
            <input
              type="text"
              class="rounded-lg text-center w-[40%] relative"
              placeholder="Compare To?"
              id="compareSearchBar"
            />
            <button
              class="relative ml-[2%] rounded-lg bg-black text-white w-[10%]"
              onClick={props.handleSubmit}
            >
              Submit
            </button>
          </div>

          <canvas ref={ref}></canvas>
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
