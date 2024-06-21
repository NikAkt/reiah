export default function InfoWindow(props) {
  return (
    <div
      class={`absolute bg-black z-30 hidden
        w-[${props.x}vw] h-[${props.y}vh] text-white]`}
      id="infowindow"
    >
      Infowindow
    </div>
  );
}
