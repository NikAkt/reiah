import { setLayerStore, layerStore } from "./layerStore";

const DataLayer = (props) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const map = layerStore.map;

  try {
    if (!layerStore.dataLayer) {
      map.data.addGeoJson(JSON.parse(props.data));
      map.data.setStyle(function (feature) {
        const geometryType = feature.getGeometry().getType();
        let color = "green";
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
      props.setInfoWindowContent(`${event["feature"]["Gg"]["boroname"]}:
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
