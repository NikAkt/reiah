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
  console.log("chartDataList", chartDataList);

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
  console.log("createBarChart");
  console.log("data in create Bar Chart", data);
  if (ctx === undefined) {
    return;
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
      let transformedData = transformData(newData?.history);
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

const createLineChart = (ctx, data, label) => {
  if (ctx === undefined) {
    return;
  }
  new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: label,
          data: data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
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
      let transformedData = transformData(newData?.history);
      createLineChart(ref, transformedData, newData.zipcode);
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
        <div class="relative w-full h-full">
          <canvas ref={ref}></canvas>
        </div>
      </Show>
    </div>
  );
};

export { BarChart, LineChart };
