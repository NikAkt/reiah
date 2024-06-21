const dataLayer = (map, data) => {
  console.log("trigger dataLayer function");
  map.data.addGeoJson(data);
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
  map.data.addListener("click", function (event) {
    event.feature.setProperty("isColorful", true);
    console.log(event);
    // const viewportWidth = window.innerWidth;
    // const viewportHeight = window.innerHeight;

    // const vw = (event["domEvent"].x / viewportWidth) * 100;
    // const vh = (event["domEvent"].y / viewportHeight) * 100;
    document.getElementById(
      "infowindow"
    ).innerHTML = `<p>${event["feature"]["Gg"]["boroname"]}:
    ${event["feature"]["Gg"]["ntaname"]}</p><p>Hello World</p>`;
    // return <InfoWindow x={vw} y={vh} />;
    // event.feature.setStyle
  });

  map.data.addListener("mouseover", function (event) {
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, { strokeWeight: 8 });
  });

  map.data.addListener("mouseout", function (event) {
    map.data.revertStyle();
  });

  return null;
};
export default dataLayer;
