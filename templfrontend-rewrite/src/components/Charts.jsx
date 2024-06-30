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

const ChartLoading = () => {
  return (
    <div class='w-full h-full flex justify-center items-center'>
      <h1 class='text-black'>Loading ...</h1>
    </div>
  )
}

const BarChart = () => {
  let ref

  onMount(() => {
    new Chart(ref, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
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
  })

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-full">
      <div class="relative w-full h-full">
        <canvas ref={ref}></canvas>
      </div>
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
      <Show when={!props.asyncData.loading} fallback={<ChartLoading />}>
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
