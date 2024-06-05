import { useState } from "react";
// import "./index.css";
import HomePage from "./Components/HomePage/HomePage";
import WelcomePage from "./Components/WelcomePage/WelcomePage";

function App() {
  //intro: by default false, means the introduction animation is not triggered
  const [intro, setIntro] = useState(false);
  const triggerIntro = () => {
    setIntro((prevIntro) => !prevIntro);
    console.log(intro);
  };

  const goToHome = () => {
    setWelcome(false);
  };

  const [welcome, setWelcome] = useState(true);
  return (
    <div className="App">
      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
      {welcome ? (
        <WelcomePage
          intro={intro}
          triggerIntro={triggerIntro}
          welcome={welcome}
          goToHome={goToHome}
        />
      ) : (
        <HomePage intro={intro} triggerIntro={triggerIntro} />
      )}
    </div>
  );
}

export default App;
