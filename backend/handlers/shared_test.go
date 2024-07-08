package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenericGetDataHandler(t *testing.T) {
	e := SetupTestEcho()
	req := httptest.NewRequest(http.MethodGet, "/api/businesses?taxizone=3", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := GenericGetDataHandler[GetBusinessQueryParams, []Businesses](c, "public/data/cleaned_business_data.json", filterBusinessGetRequest)
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusOK, rec.Code)

		var responseData []Businesses
		if assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &responseData)) {
			// Ensure the response data is not empty
			if assert.Greater(t, len(responseData), 0) {
				// Check the first element
				assert.Equal(t, 3, responseData[0].TaxiZone)
			}
		}
	}
}
