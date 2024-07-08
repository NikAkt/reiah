package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {
	// Set working directory to project root
	if err := os.Chdir(".."); err != nil {
		panic(err)
	}
	os.Exit(m.Run())
}

func TestGetAmenitiesData(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/amenities", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetAmenitiesData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetBusinessData(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses?taxizone=3", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetBusinessData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)

		var responseData []Businesses
		if assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &responseData)) {
			// Asserts that it is not empty
			if assert.Greater(t, len(responseData), 0) {
				// Checks the first element
				assert.Equal(t, 3, responseData[0].TaxiZone)
			}
		}
	}
}

func TestGetRealEstatePriceData(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/prices", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetRealEstatePriceData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetHistoricRealEstatePriceData(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/historic-prices", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetHistoricRealEstatePriceData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetNeighbourhoods(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/neighbourhoods", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetNeighbourhoods(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetBoroughs(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/borough", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetBoroughs(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetZipCodes(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/zipcodes", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetZipCodes(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestGetZipCodeAreas(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/zipcode-areas", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetZipCodeAreas(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}
