import { BaseLayout } from "../layouts/Layout";
// const HomePage = () => {
//   const [infoCardData, setInfoCardData] = createSignal([]);
//   const [mapZoom, setMapZoom] = createSignal(10);
//   let mapContainer;
//   const [coords, setCoords] = createSignal({ lat: 40.7128, lng: -74.006 });
//   const [showNav, setShowNav] = createSignal("inline-block");

//   // );
//   return (
//     <div class="m-0 px-0 flex flex-row">
//       <Nav showNav={showNav} setShowNav={setShowNav} />
//       <InfoWindow />
//       <PropertySwitchBtn class="fixed top-[2vh] left-[20vw]" />
//       <Suspense
//         fallback={
//           <div>
//             Loading...
//             <img src="/assets/loading_svg/spinning-circles.svg" />
//           </div>
//         }
//       >
//         <Switch>
//           <Match when={historicalRealEstateData() && amenitiesData()}>
//             <>
//               <GoogleMap
//                 ref={(el) => (mapContainer = el)}
//                 lat={coords().lat}
//                 lng={coords().lng}
//                 zoom={10}
//                 realEstateData={JSON.stringify(realEstateData())}
//                 historicalRealEstateData={JSON.stringify(
//                   historicalRealEstateData()
//                 )}
//                 datalayer_geonjson={JSON.stringify(datalayer_geonjson())}
//                 borough_neighbourhood={JSON.stringify(borough_neighbourhood())}
//                 us_zip_codes={JSON.stringify(us_zip_codes())}
//                 borough_geojson={JSON.stringify(borough_geojson())}
//                 showNav={showNav}
//                 setInfoCardData={setInfoCardData}
//                 setMapZoom={setMapZoom}
//                 mapZoom={mapZoom}
//               />
//               <Filter
//                 realEstateData={JSON.stringify(realEstateData())}
//                 historicalRealEstateData={JSON.stringify(
//                   historicalRealEstateData()
//                 )}
//                 amenitiesData={JSON.stringify(amenitiesData())}
//               />

//               <Dashboard
//                 infoCardData={infoCardData}
//                 setInfoCardData={setInfoCardData}
//                 demographic_info={demographic_info()}
//                 amenitiesData={amenitiesData()}
//               />
//             </>
//           </Match>
//           <Match when={realEstateData.error}>
//             <div>error loading real estate data..</div>
//           </Match>
//           <Match when={historicalRealEstateData.error}>
//             <div>error loading historic real estate data..</div>
//           </Match>
//           <Match when={amenitiesData.error}>
//             <div>error loading amenities data..</div>
//           </Match>
//           <Match when={datalayer_geonjson.error}>
//             <div>error loading datalayer geojson data..</div>
//           </Match>
//         </Switch>
//       </Suspense>
//     </div>
//   );
//   // <BaseLayout />;
// };

function HomePage(props) {
  return (
    <BaseLayout>
      <header>
        <a
          href="/dashboard"
          class="flex items-center py-2 px-4 text-gray-900 hover:bg-gray-950 hover:text-gray-100 rounded-md"
        >
          <span class="text-lg">Go To Dashboard</span>
        </a>
      </header>
      <div class="mt-8 text-3xl">
        <h1>Landing Page</h1>
      </div>
    </BaseLayout>
  );
}

export { HomePage };
