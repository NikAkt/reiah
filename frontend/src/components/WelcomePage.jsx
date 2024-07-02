import "./WelcomePage.css";

const WelcomePage = ({ intro, triggerIntro, welcome, goToHome }) => {
  const addIntro = (addOrNot) => {
    if (addOrNot) {
      triggerIntro();
    }
    goToHome();
  };
  return (
    <div className="welcome-page">
      <div className="welcome-text">
        <p>Welcome to *App Name*</p>
        <p>Do you want to see the introduction?</p>
      </div>

      <div className="welcome-button-container">
        <button
          className="welcome-button"
          onClick={() => {
            addIntro(true);
          }}
        >
          <span className="button--text">Yes</span>
        </button>
        <button
          className="welcome-button"
          onClick={() => {
            addIntro(false);
          }}
        >
          <span className="button--text">No</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
