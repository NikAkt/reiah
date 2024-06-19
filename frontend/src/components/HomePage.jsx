import React from "react";
import GoogleMap from "../GoogleMap/GoogleMap";
import MapComponent from "../LeafletMap/LeafletMap";
import Introduction from "../Introduction/Introduction";
import Filter from "../Filter/Filter";
import LoginRegister from "../LoginRegister/LoginRegister";

const HomePage = ({ intro, triggerIntro }) => {
  const API_KEY = "AIzaSyAX_iqnLB8j7JggiCSHd-pm6RDBBeSbRU0";
  return (
    <div className="homepage">
      {intro ? <Introduction /> : ""}
      {/* <Filter /> */}
      <LoginRegister />
      <GoogleMap API_KEY={API_KEY} />
    </div>
  );
};

export default HomePage;
