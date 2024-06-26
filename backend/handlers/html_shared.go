package handlers

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

// This is a function which wraps the render function for templ
// It's use is for working easier with the echo Context interface which differs from the go context
func Render(ctx echo.Context, cmp templ.Component) error {
	return cmp.Render(ctx.Request().Context(), ctx.Response())
}
