import {
  createSignal,
  createResource,
  Switch,
  Match,
  Suspense,
  createEffect,
} from "solid-js";

export default function Number_filter(props) {
  return (
    <div class="flex flex-col items-center">
      <p>{props.title}</p>
      <canvas ref={(el) => (props.ref = el)}></canvas>
      <div class="flex gap-2 ">
        <div
          class="flex flex-col w-[35%] h-[10%] 
                border-solid border-2 border-indigo-600 rounded-lg"
        >
          <p>Minimum</p>
          <input
            type="number"
            placeholder={`${Math.min(...props.data).toString()}`}
          ></input>
        </div>
        <div>---</div>
        <div class="flex w-[35%] h-[10%] flex-col border-solid border-2 border-indigo-600 rounded-lg">
          <p>Maximum</p>
          <input
            type="number"
            placeholder={`${Math.max(...avg_props.data).toString()}`}
          ></input>
        </div>
      </div>
    </div>
  );
}
