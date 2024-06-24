import Resizable from "@corvu/resizable"; // 'corvu/resizable'

const InfoCard = (props) => {
  const data = props.data;
  return (
    <>
      <div class="relative inline-block w-[90%] h-[30%] bg-green flex flex-col ">
        {/* <p class="w-[100%] h-[20%]">BOROUGH: {data.title}</p>
        <div class="w-[80%] h-[80%]">
          <p>ZIPCODE INCLUDED</p>
          <ul class="flex flex-row gap-2">
            {data.markersInclude.map((el) => (
              <li>{el}</li>
            ))}
          </ul>
        </div> */}
        <Resizable class="size-full">
          <Resizable.Panel
            initialSize={0.3}
            minSize={0.2}
            class="rounded-lg bg-corvu-100"
          />
          <Resizable.Handle
            aria-label="Resize Handle"
            class="group basis-3 px-[3px]"
          >
            <div class="size-full rounded transition-colors corvu-group-active:bg-corvu-300 corvu-group-dragging:bg-corvu-100" />
          </Resizable.Handle>
          <Resizable.Panel initialSize={0.7} minSize={0.2}>
            <Resizable orientation="vertical" class="size-full">
              <Resizable.Panel
                initialSize={0.5}
                minSize={0.2}
                class="rounded-lg bg-corvu-100"
              />
              <Resizable.Handle
                aria-label="Resize Handle"
                class="group basis-3 py-[3px]"
              >
                <div class="size-full rounded transition-colors corvu-group-active:bg-corvu-300 corvu-group-dragging:bg-corvu-100" />
              </Resizable.Handle>
              <Resizable.Panel
                initialSize={0.5}
                minSize={0.2}
                class="rounded-lg bg-corvu-100"
              />
            </Resizable>
          </Resizable.Panel>
        </Resizable>
      </div>
    </>
  );
};

export default InfoCard;
