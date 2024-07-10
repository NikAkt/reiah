import labradorDontCare from "../assets/labrador_dont_care.gif";

const ErrorPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <img
          src={labradorDontCare}
          alt="Dog fumbled the ball"
          className="w-1/2 mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold text-red-500 mb-2">
          Oops! Something went wrong...
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          We're experiencing technical difficulties. <br />
          Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export { ErrorPage };
