import { setLayerStore, layerStore } from "./layerStore";

const DataLayer = (props) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const map = layerStore.map;
  const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);
  const borough_geojson = JSON.parse(props.borough_geojson);
  const cdta = [];
  let data = JSON.parse(props.data);
  // console.log("borough_neighbourhood", borough_neighbourhood);
  for (const borough in borough_neighbourhood) {
    for (const neighbourhood in borough_neighbourhood[borough]) {
      for (const cdtaCode in borough_neighbourhood[borough][neighbourhood]) {
        cdta.push(cdtaCode);
      }
    }
  }

  const all_neighborhood = data.features.filter((obj) =>
    cdta.includes(obj.properties["cdta2020"])
  );
  data.features = all_neighborhood;

  try {
    if (!layerStore.dataLayer) {
      map.data.addGeoJson(borough_geojson);
      map.data.setStyle(function (feature) {
        const geometryType = feature.getGeometry().getType();
        let color = "#81c7a5";
        if (feature.getProperty("isColorful")) {
          color = feature.getProperty("color");
        }
        if (geometryType === "MultiPolygon") {
          return {
            strokeColor: "green",
            fillColor: color,
            strokeWeight: 2,
            fillOpacity: 0.3,
            clickable: true,
          };
        }
      });
      setLayerStore("dataLayer", true);
    } else {
      console.log("already load the datalayer");
    }
    map.data.addListener("click", function (event) {
      event.feature.setProperty("isColorful", true);
      //   const vw = (event["domEvent"].x / viewportWidth) * 100;
      //   const vh = (event["domEvent"].y / viewportHeight) * 100;
      //   props.setInfoWindowContent(`${event["feature"]["Gg"]["boroname"]}:
      // ${event["feature"]["Gg"]["ntaname"]}. The infowindow should be placed at (${vw},${vh})`);
      // event.feature.setStyle
    });
    map.data.addListener("mouseover", function (event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, { strokeWeight: 3 });
      event.feature.setProperty("isColorful", true);
      // console.log(event);
      const vw = (event["domEvent"].x / viewportWidth) * 100;
      const vh = (event["domEvent"].y / viewportHeight) * 100;
      props.setInfoWindowContent(`${event["feature"]["Gg"]["boroname"]}(${event["feature"]["Gg"]["cdta2020"]}):
  ${event["feature"]["Gg"]["ntaname"]}.`);
    });

    map.data.addListener("mouseout", function (event) {
      event.feature.setProperty("isColorful", false);
      map.data.revertStyle();
    });
  } catch (error) {
    console.log(error);
  }

  return null;
};
export default DataLayer;
