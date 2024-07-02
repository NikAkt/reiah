const AirBNBSlider = () => {
  const leftButton = document.getElementById("BUTTON-LEFT");
  const rightButton = document.getElementById("BUTTON-RIGHT");
  const bars = Array.from(document.querySelectorAll(".rounded-t-sm"));
  const bottomBar = document.getElementById("BOTTOM");
  const container = document.querySelector("#container");
  const minInput = document.getElementById("min");
  const maxInput = document.getElementById("max");

  minInput.value = 0;
  maxInput.value = 450;

  function updatePriceFields(leftPosition, rightPosition) {
    if (leftPosition) {
      minInput.value = Math.floor((leftPosition / getContainerWidth()) * 450);
    }
    if (rightPosition) {
      maxInput.value = Math.floor((rightPosition / getContainerWidth()) * 450);
    }
  }

  function getSliderCenter(button) {
    return button.getBoundingClientRect().left + 16;
  }

  function getContainerLeft() {
    return container.getBoundingClientRect().left;
  }

  function getContainerWidth() {
    return (
      container.getBoundingClientRect().right -
      container.getBoundingClientRect().left
    );
  }

  function updateBottomBar(
    leftSliderCenter,
    rightSliderCenter,
    containerLeft,
    containerWidth
  ) {
    bottomBar.style.left = `${
      (100 * (leftSliderCenter - containerLeft)) / containerWidth
    }%`;
    bottomBar.style.width = `${
      (100 * (rightSliderCenter - leftSliderCenter)) / containerWidth
    }%`;
  }

  function updateBarsColor(leftSliderCenter, rightSliderCenter) {
    bars.forEach((bar) => {
      const leftSideOfBar = bar.getBoundingClientRect().left;
      const rightSideOfBar = bar.getBoundingClientRect().right;
      bar.style.background =
        leftSliderCenter > leftSideOfBar || rightSliderCenter < rightSideOfBar
          ? "#E4E4E7"
          : "#000000";
    });
  }

  function switchBarColor() {
    const leftSliderCenter = getSliderCenter(leftButton);
    const rightSliderCenter = getSliderCenter(rightButton);
    const containerLeft = getContainerLeft();
    const containerWidth = getContainerWidth();

    updateBottomBar(
      leftSliderCenter,
      rightSliderCenter,
      containerLeft,
      containerWidth
    );
    updateBarsColor(leftSliderCenter, rightSliderCenter);
  }

  function updateSliderFromPrice(event) {
    if (maxInput.value - minInput.value < 10) {
      return;
    }
    if (event.target.id === minInput.id) {
      if (minInput.value < 5) {
        return;
      }
      const leftPercentage = event.target.value / 450;
      leftButton.style.left = `${100 * leftPercentage}%`;
      switchBarColor();
    }
    if (event.target.id === maxInput.id) {
      if (maxInput.value > 434) {
        return;
      }
      const rightPercentage = event.target.value / 450;
      rightButton.style.left = `${100 * rightPercentage}%`;
      switchBarColor();
    }
  }

  function createMouseHandlers(isTouch, isLeftButton) {
    return function (event) {
      const containerRect = container.getBoundingClientRect();
      const element = event.target;

      function mouseMoveHandler(e) {
        const mouseX = isTouch
          ? e.touches[0].clientX - containerRect.left
          : e.clientX - containerRect.left;
        const maxX = containerRect.width - element.offsetWidth;
        const adjustedMouseX = Math.max(0, Math.min(mouseX, maxX));

        const diff =
          rightButton.getBoundingClientRect().left -
          leftButton.getBoundingClientRect().right;
        const offset = isLeftButton ? 16 : 0;
        const newPosition = adjustedMouseX - offset;

        if (isLeftButton) {
          if (newPosition > 0 && diff > -10) {
            element.style.left = `${newPosition}px`;
            updatePriceFields(newPosition, false);
          }
        } else {
          if (adjustedMouseX + 32 < containerRect.right && diff > -10) {
            element.style.left = `${adjustedMouseX}px`;
            updatePriceFields(false, newPosition);
          }
        }

        switchBarColor();
      }

      function mouseUpHandler() {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document.removeEventListener("touchmove", mouseMoveHandler);
        document.removeEventListener("touchend", mouseUpHandler);
        const diff =
          rightButton.getBoundingClientRect().left -
          leftButton.getBoundingClientRect().right;
        if (diff < 0) {
          let int = parseInt(element.style.left);
          element.style.left = `${int + (isLeftButton ? diff : -diff)}px`;
        }
        switchBarColor();
      }

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
      document.addEventListener("touchmove", mouseMoveHandler);
      document.addEventListener("touchend", mouseUpHandler);
    };
  }

  leftButton.addEventListener("mousedown", createMouseHandlers(false, true));
  rightButton.addEventListener("mousedown", createMouseHandlers(false, false));
  leftButton.addEventListener("touchstart", createMouseHandlers(true, true));
  rightButton.addEventListener("touchstart", createMouseHandlers(true, false));
  minInput.addEventListener("input", updateSliderFromPrice);
  maxInput.addEventListener("input", updateSliderFromPrice);

  return (
    <div
      class="h-screen flex flex-col justify-center items-center"
      draggable="false"
    >
      <div class="w-1/3 h-16 flex flex-col items-center">
        <div id="GRID" class="w-full h-full grid grid-cols-24 gap-1">
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[30%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[50%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[60%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[60%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[90%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[90%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[20%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[40%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[20%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[20%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[40%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[40%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[60%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[50%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[50%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[20%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[10%] bg-black rounded-t-sm"></div>
          </div>
          <div class="h-full flex flex-col justify-end">
            <div class="h-[20%] bg-black rounded-t-sm"></div>
          </div>
        </div>
        <div class="relative bg-zinc-200 h-1 w-[110%] mt-px">
          <div id="BOTTOM" class="absolute left-0 h-full w-full bg-black"></div>
        </div>
        <div id="container" class="bg-transparent h-4 -translate-y-4 w-[115%]">
          <div
            id="BUTTON-LEFT"
            class="z-30 rounded-full h-8 bg-white border aspect-square absolute left-0 drop-shadow hover:cursor-pointer"
            draggable="false"
          ></div>
          <div
            id="BUTTON-RIGHT"
            class="z-50 rounded-full h-8 bg-white border aspect-square absolute right-0 drop-shadow hover:cursor-pointer"
            draggable="false"
          ></div>
        </div>
      </div>
      <div class="w-1/3">
        <form class="grid grid-cols-4 gap-1 w-full p-8">
          <input
            id="min"
            name="min"
            min="0"
            max="450"
            type="number"
            class=" border"
          ></input>
          <input
            id="max"
            name="max"
            min="0"
            max="450"
            type="number"
            class="border col-start-4"
          ></input>
        </form>
      </div>
    </div>
  );
};

export { AirBNBSlider };
