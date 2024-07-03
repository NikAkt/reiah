package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

type GenericFilterFunction[T any, P any] func(T, *P) T

func GenericGetDataHandler[P any, T any](c echo.Context, file_path string, filter GenericFilterFunction[T, P]) error {
	var params P
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Query parameters either contain invalid fields or misconfigured data")
	}

	file, err := os.Open(file_path)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Could not find resource "+file_path)
	}
	defer file.Close()

	var data T
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Could not decode data from json file "+err.Error())
	}

	var filtered_data T = filter(data, &params)
	return c.JSON(http.StatusOK, filtered_data)
}
