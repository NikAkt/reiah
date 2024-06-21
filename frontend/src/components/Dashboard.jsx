import { createSignal, onCleanup, onMount } from "solid-js";
// import spinning_circles from "127.0.0.1:3000/assets/loading_svg/spinning_circles.svg";

const Dashboard = () => {
  const [dashboardDisplay, setDashboardDisplay] = createSignal(false);

  const toggleDashboard = () => {
    setDashboardDisplay(!dashboardDisplay());
  };

  return (
    <div
      class="w-[40vw] flex flex-col h-[100vh]
    items-center gap-0.5 bg-white z-20
    border-solid border-2 border-indigo-600 
    text-black overflow-y-auto fixed right-[0]"
      id="dashboard"
    >
      <span class="">Dashboard</span>
      <div class="w-[80%] h-[80%] border-2 border-indigo-600">
        Here's the chart
      </div>
      <img
        src="./assets/loading_svg/spinning-circles.svg"
        alt="spinning circles svg"
      />
    </div>
  );
};

export default Dashboard;
