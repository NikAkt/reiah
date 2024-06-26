import { createSignal } from "solid-js";
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
      <div class="w-[95%] h-[40%]">
        <canvas id="chart_js"></canvas>
      </div>
      <div
        class="w-[95%] h-[60%] border-2 border-indigo-600 relative
      flex flex-col items-center gap-2 overflow-y-scroll"
      >
        <Show when={props.infoCardData()} fallback={""} keyed>
          <For each={props.infoCardData()} fallback={""}>
            {(item, index) => <InfoCard data={item} area={"borough"} />}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default Dashboard;
