const MapAreaCard = () => {
  return (
    <div>
      <div class="w-full aspect-square border rounded-lg overflow-hidden mb-3 bg-transparent">
        <img src="https://images.pexels.com/photos/1389339/pexels-photo-1389339.jpeg?cs=srgb&dl=pexels-wildlittlethingsphoto-1389339.jpg&fm=jpg" class="w-full h-full object-cover" />
      </div>
      <div>
        <div class="flex justify-between text-lg font-medium">
          <p>Farm stay in pembroke</p>
          <p>4.95 (298)</p>
        </div>
        <div class="text-neutral-500 font-extralight text-sm">"The Willow" Stunning location, Amazing views</div>
        <div class="text-neutral-500 font-extralight text-sm">Hosted by Pat</div>
        <div class="text-neutral-500 font-extralight text-sm">6-11 Oct</div>
        <div class="mt-1">€ 197 avg</div>
      </div>
    </div>
  )
}

const MapAreaCardSkeletonLoader = () => {
  return (
    <div class="animate-pulse">
      <div class="w-full aspect-square border rounded-lg overflow-hidden mb-3 bg-neutral-300"></div>
      <div class="flex flex-col gap-2">
        <div class="h-6 w-full rounded-lg bg-neutral-300"></div>
        <div class="h-6 w-2/3 rounded-lg bg-neutral-300"></div>
        <div class="h-6 w-1/3 rounded-lg bg-neutral-300"></div>
      </div>
    </div>
  )
}

export {
  MapAreaCard,
  MapAreaCardSkeletonLoader
}
