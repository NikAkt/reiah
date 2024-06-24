import { createSignal, onCleanup, onMount } from "solid-js";
// import spinning_circles from "127.0.0.1:3000/assets/loading_svg/spinning_circles.svg";
import InfoCard from "./InfoCard";

const Dashboard = (props) => {
  const [dashboardDisplay, setDashboardDisplay] = createSignal(false);

  const toggleDashboard = () => {
    setDashboardDisplay(!dashboardDisplay());
  };

  return (
    <div
      class="w-[35vw] flex flex-col h-[100vh]
    items-center gap-0.5 bg-white z-20
    border-solid border-2 border-indigo-600 
    text-black overflow-y-auto fixed right-[0]"
      id="dashboard"
    >
      <span class="">Dashboard</span>
      <div
        class="w-[80%] h-[80%] border-2 border-indigo-600 
      flex flex-col items-center  gap-2 overflow-y-auto"
      >
        <Show when={props.infoCardData()} fallback={""} keyed>
          <For each={props.infoCardData()} fallback={""}>
            {(item, index) => <InfoCard data={item} />}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default Dashboard;
