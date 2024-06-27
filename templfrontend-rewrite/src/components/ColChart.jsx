/**
 *@property {data}: Array
 */

import { DualRangeSlider } from "./DualRangeSlider";

function ColChart() {
  const data = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22,
  ];
  const numCols = 20;
  //10% to 90% are in the range
  //20 columns in total
  const range = Math.max(...data) - Math.min(...data);

  //10%
  const lower_point = Math.floor(range * 0.1);

  //90%
  const upper_point = Math.floor(range * 0.9);

  //gap of the column chart: how many units of column bar represent
  const gap = Math.max(...[1, Math.floor((upper_point - lower_point) / 20)]);

  //calculate the frequency
  let freqArray = [];
  for (let i = 0; i <= 21; i++) {
    freqArray.push(0);
  }

  data.forEach((el) => {
    console.log("el", el);
    console.log("gap", gap);
    //numCol: which column el should be represented by
    const numCol = Math.floor(el / gap);
    console.log("numCol", numCol);

    if (numCol > 20) {
      freqArray[21] += 1;
    } else {
      freqArray[numCol] += 1;
    }
    //numCol = 0: lower than 10%, should change in width on the graph
    //numCol > 20: higher than 90%, should also change in width on the graph
  });

  return (
    <div
      class={`flex flex-col gap-2 w-[500px] h-[700px] bg-white 
        items-center justify-center p-0 m-0`}
    >
      <div class="flex flex-row place-content-between items-end gap-[1%]">
        <For each={freqArray} fallback={<div>Loading...</div>}>
          {(item) => <Column width={50} height={item * 100} label={item} />}
        </For>
      </div>
      <DualRangeSlider data={data} />
    </div>
  );
}

function Column({ height, width, label }) {
  return (
    <div
      class="bg-black z-10 border-dashed border-2 border-indigo-600 bottom-0 w-[22px]"
      style={{ height: `${height}px` }}
      title={label}
    ></div>
  );
}

// function Scrollbar({ data }) {
//   return (
//     <div class="flex flex-col">
//       <div id="scrollbar-container" class="relative w-[500px]">
//         <div id="scrollbar1" class="w-[100%] absolute ml-[0]">
//           <label htmlFor="scrollbar"></label>
//           <input
//             type="range"
//             id="fromScroll"
//             name="scrollbar"
//             x-bind:min="min"
//             x-bind:max="max"
//             x-on:input="mintrigger"
//             x-model="minprice"
//             value="0"
//             class="w-[100%]
//           absolute pointer-events-none appearance-none z-20 opacity-0 cursor-pointer
//           [&::-webkit-slider-runnable-track]:rounded-full
//           [&::-webkit-slider-runnable-track]:bg-black/25
//           [&::-webkit-slider-thumb]:appearance-none
//           [&::-webkit-slider-thumb]:h-[25px]
//           [&::-webkit-slider-thumb]:w-[25px]
//           [&::-webkit-slider-thumb]:rounded-full
//           [&::-webkit-slider-thumb]:bg-purple-500
//           [&::-webkit-slider-thumb]:pointer-events-all"
//           ></input>
//         </div>
//         <div id="scrollbar2" class="w-[100%] absolute ml-[0]">
//           <label htmlFor="scrollbar"></label>
//           <input
//             type="range"
//             id="toScroll"
//             name="scrollbar"
//             x-bind:min="min"
//             x-bind:max="max"
//             x-on:input="maxtrigger"
//             x-model="maxprice"
//             value="50"
//             class="w-[100%] appearance-none
//           pointer-events-none
//           [&::-webkit-slider-runnable-track]:rounded-full
//           [&::-webkit-slider-runnable-track]:bg-black/25
//           [&::-webkit-slider-thumb]:appearance-none
//           [&::-webkit-slider-thumb]:h-[25px]
//           [&::-webkit-slider-thumb]:w-[25px]
//           [&::-webkit-slider-thumb]:rounded-full
//           [&::-webkit-slider-thumb]:bg-purple-500
//           [&::-webkit-slider-thumb]:pointer-events-all
//           opacity-0
//           cursor-pointer"
//           ></input>
//         </div>
//         <div class="relative z-10 h-2">
//           <div class="absolute z-10 left-0 right-0 bottom-0 top-0 rounded-md bg-gray-200"></div>

//           <div
//             class="absolute z-20 top-0 bottom-0 rounded-md bg-green-300"
//             x-bind:style="'right:'+maxthumb+'%; left:'+minthumb+'%'"
//           ></div>

//           <div
//             class="absolute z-30 w-6 h-6 top-0 left-0 bg-green-300 rounded-full -mt-2 -ml-1"
//             x-bind:style="'left: '+minthumb+'%'"
//           ></div>

//           <div
//             class="absolute z-30 w-6 h-6 top-0 right-0 bg-green-300 rounded-full -mt-2 -mr-3"
//             x-bind:style="'right: '+maxthumb+'%'"
//           ></div>
//         </div>
//       </div>

//       <div class="flex flex-row place-content-between" id="input-container">
//         <div id="minimum_vol" class="w-[10%]">
//           <label htmlFor="minimum_vol">Minimum</label>
//           <input
//             type="number"
//             placeholder={`${Math.min(...data).toString()}`}
//             class="border-2 border-black border-solid w-[100%]"
//           ></input>
//         </div>
//         <div id="maximum_vol" class="w-[10%]">
//           <label htmlFor="maximum_vol">Maximum</label>
//           <input
//             type="number"
//             placeholder={`${Math.max(...data).toString()}`}
//             class="border-2 border-black border-solid w-[100%]"
//           ></input>
//         </div>
//       </div>
//     </div>

export { ColChart };
