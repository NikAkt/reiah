// dataWorker.js
self.onmessage = async function (e) {
  const { zipcode } = e.data;

  // Combine all fetch requests into a single Promise.all
  const [propertyData, amenitiesData, demographicData] = await Promise.all([
    fetch(`/api/property-data?zipcode=${zipcode}`).then(res => res.json()),
    fetch(`/api/amenities-data?zipcode=${zipcode}`).then(res => res.json()),
    fetch(`/api/demographic-data?zipcode=${zipcode}`).then(res => res.json()),
  ]);

  self.postMessage({ propertyData, amenitiesData, demographicData });
};
