/**
 *@property {data}: Array
 */

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
      class={`flex flex-col gap-2 w-[500px] h-[700px] bg-white items-center justify-center p-0 m-0`}
    >
      <div class="flex flex-row place-content-between items-end gap-[1%]">
        <For each={freqArray} fallback={<div>Loading...</div>}>
          {(item) => <Column width={50} height={item * 100} label={item} />}
        </For>
      </div>
      <Scrollbar />
    </div>
  );
}

function Column({ height, width, label }) {
  return (
    <div
      class="bg-white z-10 border-dashed border-2 border-indigo-600 bottom-0 w-[22px]"
      style={{ height: `${height}px` }}
      title={label}
    ></div>
  );
}

function Scrollbar() {
  return (
    <div>
      <label for="vol">Volume (between minimum and maximum):</label>
      <input
        type="range"
        id="vol"
        name="vol"
        min="0"
        max="50"
        class="w-[100%] border-2 border-solid border-indigo-600"
      ></input>
    </div>
  );
}

export { ColChart };
