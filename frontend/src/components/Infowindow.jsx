export default function InfoWindow(props) {
  return (
    <div
      class={`absolute bg-black z-30 w-[20vw] h-[20vh]
        left-[50px] top-[500px] text-white bottom-[0]`}
      id="infowindow"
    >
      {props.infoWindowContent}
    </div>
  );
}
