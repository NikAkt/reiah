import { SliderProvider, SliderButton, Slider } from "solid-slider";
import "solid-slider/slider.css";

const SliderExp = () => {
  return (
    <SliderProvider>
      <Slider options={{ loop: true }}>
        <div>Slide 1</div>
        <div>Slide 2</div>
        <div>Slide 3</div>
      </Slider>
      <SliderButton prev>Previous</SliderButton>
      <SliderButton next>Next</SliderButton>
    </SliderProvider>
  );
};

export default SliderExp;
