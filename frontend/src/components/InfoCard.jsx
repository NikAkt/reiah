const InfoCard = (props) => {
  const data = props.data;
  return (
    <>
      <div class="relative inline-block w-[90%] h-[30%] bg-green flex flex-col ">
        <p class="w-[100%] h-[20%]">BOROUGH: {data.title}</p>
        <div class="w-[80%] h-[80%]">
          <p>ZIPCODE INCLUDED</p>
          <ul class="flex flex-row gap-2">
            {data.markersInclude.map((el) => (
              <li>{el}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default InfoCard;
