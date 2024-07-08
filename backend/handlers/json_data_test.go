package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func setupTestEcho() *echo.Echo {
	e := echo.New()
	e.Static("/", "public")
	e.GET("/api/amenities", GetAmenitiesData)
	e.GET("/api/businesses", GetBusinessData)
	e.GET("/api/prices", GetRealEstatePriceData)
	e.GET("/api/historic-prices", GetHistoricRealEstatePriceData)
	e.GET("/api/neighbourhoods", GetNeighbourhoods)
	e.GET("/api/borough", GetBoroughs)
	e.GET("/api/zipcodes", GetZipCodes)
	e.GET("/api/zipcode-areas", GetZipCodeAreas)
	return e
}

func TestMain(m *testing.M) {
	// Set working directory to project root
	if err := os.Chdir(".."); err != nil {
		panic(err)
	}
	os.Exit(m.Run())
}

func TestGetAmenitiesData(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/amenities", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetAmenitiesData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetBusinessData(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetBusinessData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

// Continue similarly for other handler functions

func TestGetRealEstatePriceData(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/prices", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetRealEstatePriceData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetHistoricRealEstatePriceData(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/historic-prices", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetHistoricRealEstatePriceData(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetNeighbourhoods(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/neighbourhoods", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetNeighbourhoods(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetBoroughs(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/borough", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetBoroughs(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetZipCodes(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/zipcodes", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetZipCodes(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}

func TestGetZipCodeAreas(t *testing.T) {
	e := setupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/zipcode-areas", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GetZipCodeAreas(c)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)
		// Add more assertions based on the expected response
	}
}
