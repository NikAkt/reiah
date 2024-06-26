export default function InfoWindow(props) {
  return (
    <div
      class={`absolute bg-black z-30 w-[15vw] h-[10vh]
        left-[0] text-white bottom-[45vh] hidden`}
      id="infowindow"
    >
      {props.infoWindowContent}
    </div>
  );
}
