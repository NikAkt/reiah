import Chart from "chart.js/auto";
const DivideLine = () => {
  return <div class="relative w-[95%] h-[2px] bg-[#bbf7d0]"></div>;
};

let ref;

const ExperimentalChart = (ref) => {
  const labels = ["1", "2", "3", "4", "5", "6", "7"];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "My First Dataset",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  new Chart(ref, {
    type: "bar",
    data: {
      datasets: [
        {
          label: labels,
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

const DashboardCard = () => {
  return (
    <div
      class="bg-white dark:bg-gray-900 w-2/5 h-screen drop-shadow overflow-scroll 
    p-6 right-0 absolute flex flex-col items-center py-6 rounded-sm"
    >
      <div class="relative w-[95%] h-[75%] bg-teal-500 flex flex-col items-center gap-2">
        <div class="ml-[-40%] mt-[10%] text-2xl">ZIPCODE 11358</div>
        <DivideLine />
        <div>
          <canvas ref={(el) => (ref = el)}></canvas>
        </div>
        <DivideLine />
        <div>
          <input
            type="text"
            class="rounded-lg text-center"
            placeholder="Compare To?"
          />
        </div>
      </div>
    </div>
  );
};

export { DashboardCard };
