const data = {
  10001: [
    {
      PRICE: 1075000,
      BEDS: 2,
      TYPE: "Condo",
      BATH: 2,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.7507895,
      LONGITUDE: -73.9974127,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 492.1692750504347,
    },
    {
      PRICE: 399000,
      BEDS: 3,
      TYPE: "Co-op",
      BATH: 1,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.7497074,
      LONGITUDE: -73.9859244,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 182.67492162337064,
    },
    {
      PRICE: 995000,
      BEDS: 2,
      TYPE: "Co-op",
      BATH: 2,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.747844,
      LONGITUDE: -74.00189,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 455.542724349007,
    },
    {
      PRICE: 995000,
      BEDS: 2,
      TYPE: "Co-op",
      BATH: 2,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.747844,
      LONGITUDE: -74.00189,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 455.542724349007,
    },
    {
      PRICE: 799000,
      BEDS: 1,
      TYPE: "Co-op",
      BATH: 1,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.7536573,
      LONGITUDE: -73.9975607,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 365.80767513050915,
    },
    {
      PRICE: 2399000,
      BEDS: 2,
      TYPE: "Co-op",
      BATH: 2,
      PROPERTYSQFT: 2391,
      LATITUDE: 40.7489369,
      LONGITUDE: -73.9948023,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 1003.3458803847763,
    },
    {
      PRICE: 1300000,
      BEDS: 2,
      TYPE: "Co-op",
      BATH: 2,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.747844,
      LONGITUDE: -74.00189,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 595.1814488982001,
    },
    {
      PRICE: 499000,
      BEDS: 3,
      TYPE: "Co-op",
      BATH: 1,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.7460725,
      LONGITUDE: -73.9865041,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 228.45811000015527,
    },
    {
      PRICE: 875000,
      BEDS: 1,
      TYPE: "Co-op",
      BATH: 1,
      PROPERTYSQFT: 2184.207862,
      LATITUDE: 40.7459915,
      LONGITUDE: -73.9956777,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 400.6028982968654,
    },
    {
      PRICE: 2500000,
      BEDS: 3,
      TYPE: "Co-op",
      BATH: 2,
      PROPERTYSQFT: 3200,
      LATITUDE: 40.7468872,
      LONGITUDE: -73.9910651,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 781.25,
    },
    {
      PRICE: 1995000,
      BEDS: 3,
      TYPE: "Condo",
      BATH: 2,
      PROPERTYSQFT: 1376,
      LATITUDE: 40.7451522,
      LONGITUDE: -73.9927778,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 1449.8546511627908,
    },
    {
      PRICE: 950000,
      BEDS: 2,
      TYPE: "Co-op",
      BATH: 1,
      PROPERTYSQFT: 775,
      LATITUDE: 40.7497074,
      LONGITUDE: -73.9859244,
      ZIPCODE: "10001",
      BOROUGH: "Manhattan",
      NEIGHBORHOOD: "Chelsea - Clinton",
      PRICE_PER_SQFT: 1225.8064516129032,
    },
  ],
};
const result = Object.values(data).map((obj) =>
  obj.filter((ob) => ob.TYPE === "Condo")
);
console.log(result);

const DevelopExperiment = () => {
  return <div>{data}</div>;
};

export default DevelopExperiment;