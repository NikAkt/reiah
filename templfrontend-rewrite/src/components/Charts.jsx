import Chart from 'chart.js/auto';
import { onMount } from 'solid-js';

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
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-2">
      <div class="relative w-full h-full">
        <canvas ref={ref}></canvas>
      </div>
    </div>
  )
}

const LineChart = () => {
  let ref

  onMount(() => {
    new Chart(ref, {
      type: 'line',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [{
          label: 'My First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
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
  })

  return (
    <div class="aspect-video rounded bg-white dark:bg-slate-800 p-4 col-span-2">
      <div class="relative w-full h-full">
        <canvas ref={ref}></canvas>
      </div>
    </div>
  )
}

export {
  BarChart,
  LineChart
}
