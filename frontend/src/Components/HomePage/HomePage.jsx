import React from "react";
import GoogleMap from "../GoogleMap/GoogleMap";
import MapComponent from "../LeafletMap/LeafletMap";
import Introduction from "../Introduction/Introduction";
import Filter from "../Filter/Filter";

const HomePage = ({ intro, triggerIntro }) => {
  const API_KEY = "AIzaSyAX_iqnLB8j7JggiCSHd-pm6RDBBeSbRU0";
  return (
    <div className="homepage">
      {intro ? <Introduction /> : ""}
      <GoogleMap API_KEY={API_KEY} />
      <Filter />
    </div>
  );
};

export default HomePage;
