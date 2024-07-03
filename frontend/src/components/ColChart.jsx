import { createEffect, createSignal, Index } from "solid-js";
import { DualRangeSlider } from "./DualRangeSlider";

function ColChart({ data }) {
  // const data = [
  //   0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  //   21, 22,
  // ];
  const numCols = 24;
  const [from, setFrom] = createSignal(0);
  const [to, setTo] = createSignal(numCols + 1);
  // const [greyColumns, setGretColumns] = createSignal([]);

  createEffect(() => {
    let i = 0;
    while (i <= numCols + 1) {
      const targetCol = document.getElementById(`col-${i}`);
      if (i < from() || i > to()) {
        targetCol.style.backgroundColor = "grey";
      } else {
        targetCol.style.backgroundColor = "black";
      }
      i++;
    }
  });

  const range = Math.max(...data) - Math.min(...data);

  const lower_point = Math.floor(range * 0.1);
  const upper_point = Math.floor(range * 0.9);

  const gap = Math.max(1, Math.floor((upper_point - lower_point) / numCols));

  let freqArray = new Array(22).fill(0);

  data.forEach((el) => {
    const numCol = Math.floor(el / gap);
    if (numCol > numCols) {
      freqArray[21] += 1;
    } else {
      freqArray[numCol] += 1;
    }
  });

  return (
    <div
      class="relative flex flex-col w-[100%] h-[10%] m-auto 
        items-center justify-center p-0 m-0 
        "
    >
      <div
        class="flex flex-row place-content-between 
      items-end gap-[0.5%] w-[90%]
      border-2 border-solid border-indigo-600"
      >
        <Index each={freqArray} fallback={<div>Loading...</div>}>
          {(item, index) => {
            return (
              <Column
                width={50}
                height={item() * 3}
                label={item()}
                backgroundColor={
                  index + 1 < from() || index + 1 > to()
                    ? "bg-[#C6C6C6]"
                    : "bg-black"
                }
                idx={index}
              />
            );
          }}
        </Index>
      </div>
      <DualRangeSlider data={data} setTo={setTo} setFrom={setFrom} gap={gap} />
    </div>
  );
}

function Column({ height, label, backgroundColor, idx }) {
  return (
    <div
      class={`${backgroundColor} w-[10px] hover:bg-violet-600 cursor-pointer relative`}
      style={{
        height: `${height}px`,
      }}
      title={label}
      id={`col-${idx}`}
    ></div>
  );
}

export { ColChart };
