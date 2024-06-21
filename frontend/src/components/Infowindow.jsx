export default function InfoWindow(props) {
  return (
    <div
      class={`absolute bg-black z-30 bottom-[0]
        w-[${15}vw] h-[${15}vh] text-white`}
      id="infowindow"
    >
      {props.infoWindowContent}
    </div>
  );
}
