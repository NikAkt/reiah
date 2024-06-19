package handlers

import (
	"context"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

// // Define a custom type for the map keys
// type ContextKeyType string
//ContextKeyType("userid")
//TODO: use context key type throughout applicaion when you have a channce

// This is a function which wraps the render function for templ
// It's use is for working easier with the echo Context interface which differs from the go context
func Render(ctx echo.Context, cmp templ.Component) error {
	customctx := context.WithValue(ctx.Request().Context(), "userid", ctx.Get("userid"))
	return cmp.Render(customctx, ctx.Response())
}
