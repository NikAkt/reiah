import { For, Show, onMount } from "solid-js";

const InfoCard = (props) => {
  const data = props.data;
  //   const fetchAmenities = async (borough) => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:8000/api/amenities?borough=${borough}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           credentials: "include", // Include credentials if needed (like cookies)
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }

  //       const data = await response.json();
  //       console.log(data);
  //     } catch (error) {
  //       console.error("There was a problem with the fetch operation:", error);
  //     }
  //   };

  //   fetchAmenities("Bronx");

  return (
    <div
      class="my-auto w-full max-w-[80%] h-[40%]
     overflow-hidden rounded-lg @xl:max-w-[400px] 
     border-dashed border-2 border-blue bg-green"
      id={`infocard-${data.title}`}
    >
      <div
        class="bg-blue text-white
      "
      >
        {data.title}
      </div>
      <Show when={props.area === "borough"}>
        <div>
          <p>Neighbourhood</p>
          <ul></ul>
        </div>
      </Show>
      <Show when={props.area === "borough" || props.area === "neighbourhood"}>
        <div class="relative w-[100%] h-[22%] overflow-y-scroll">
          <p>{data.markersInclude.length} zip code included are:</p>
          <ul>
            <For
              each={data.markersInclude}
              fallback={<div>Loading all zip codes...</div>}
            >
              {(item, index) => <li>{item}</li>}
            </For>
          </ul>
        </div>
      </Show>
      <div>
        <p>Average Home Value: {data.avgPrice}</p>
      </div>

      <div>
        <p>Amenities</p>
      </div>

      <div>
        <p>Demographic</p>
      </div>
    </div>
  );
};

export default InfoCard;
