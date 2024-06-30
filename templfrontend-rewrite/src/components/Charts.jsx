import Chart from 'chart.js/auto';
import { createEffect, onMount, Show } from 'solid-js';



const transformData = (historicpricesObject) => {
  if (historicpricesObject == undefined) {
    return []
  }
  const chartDataList = []
  for (const [key, value] of Object.entries(historicpricesObject)) {
    const newObject = { x: key, y: value }
    chartDataList.push(newObject)
  }

  return chartDataList
}

const ChartLoadingIndicator = () => {
  return (
    <div class='w-full h-full flex justify-center items-center'>
      <h1 class='text-black'>Loading ...</h1>
    </div>
  )
}



const createBarChart = (ctx, data, label) => {
  if (ctx === undefined) {
    return
  }
  new Chart(ctx, {
    type: 'bar',
    data: {
      datasets: [{
        label: label,
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

const BarChart = (props) => {
  let ref

  onMount(() => {
    createBarChart(ref)
  })

  createEffect(() => {
    if (!props.asyncData.loading) {
      let newData = props.asyncData()?.[0]
      let transformedData = transformData(newData?.historicprices)
      createBarChart(ref, transformedData, newData.zipcode)
    }
  })

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show when={!props.asyncData.loading} fallback={<ChartLoadingIndicator />}>
        <div class="relative w-full h-full">
          <canvas ref={ref}></canvas>
        </div>
      </Show>
    </div>
  )
}



const createLineChart = (ctx, data, label) => {
  if (ctx === undefined) {
    return
  }
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: label,
        data: data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

const LineChart = (props) => {
  let ref

  onMount(() => {
    createLineChart(ref)
  })

  createEffect(() => {
    if (!props.asyncData.loading) {
      let newData = props.asyncData()?.[0]
      let transformedData = transformData(newData?.historicprices)
      createLineChart(ref, transformedData, newData.zipcode)
    }
  })

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <Show when={!props.asyncData.loading} fallback={<ChartLoadingIndicator />}>
        <div class="relative w-full h-full">
          <canvas ref={ref}></canvas>
        </div>
      </Show>
    </div>
  )
}

export {
  BarChart,
  LineChart
}
