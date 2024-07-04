const ErrorPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <img
          src="https://example.com/funny-image.png"
          alt="Funny Error"
          className="w-1/3 mx-auto mb-4"
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
        <div className="mt-4 text-gray-500">
          <span>Meanwhile, enjoy this random joke:</span>
          <blockquote className="italic mt-2">
            "Why don't programmers like nature? It has too many bugs."
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export { ErrorPage };
