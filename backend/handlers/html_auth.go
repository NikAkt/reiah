package handlers

import (
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
)

// HashPassword generates a bcrypt hash for the given password.
// using the bcrypt lib in go
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// VerifyPassword verifies if the given password matches the stored hash.
// using the bcrypt lib in go
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// User JWT Information is a type representing the claims in a token
// Claims I find is a confusing way of explaining things so I changed the name to Informatoion
// By adding in the jwt.Standard claims we embed fields jwt standard claim type this is a form of composition
type UserJWTInformation struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayname"`
	Name        string `json:"name"`
	Surname     string `json:"surname"`
	jwt.StandardClaims
}

// FUNCTION FOR GENERATING A NEW JSON WEB TOKEN FOR USERS LOGGING IN
func GenerateJWTToken(u *db.User) (string, error) {
	// create a new user clims
	userInformation := UserJWTInformation{
		ID:          u.Id,
		DisplayName: u.Username,
		Name:        u.Name,
		Surname:     u.Surname,
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  time.Now().Unix(),
			ExpiresAt: time.Now().Add(60 * time.Minute).Unix(),
		},
	}

	// Return jwt token string
	// The string returned is the jwt.Token that will be encypted using the HS256 signing signing method
	// Finally we use the token secret that is defined in the os environment and create a byte slice from it
	return jwt.NewWithClaims(jwt.SigningMethodHS256, userInformation).SignedString([]byte(os.Getenv("TOKEN_SECRET")))
}

// THIS FUNCTION IS THE OPPOSITE TO GENERATE TOKEN IT WILL PARSE OUR TOKEN AND RETURN IT IF IT DOES NOT ERROR
func ParseToken(t string) (*UserJWTInformation, error) {
	parsedaccesstoken, err := jwt.ParseWithClaims(
		t,                     // The string passed in representing a token
		&UserJWTInformation{}, // This initialised a new UserJWTInformation and passes in the memory address
		func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("TOKEN_SECRET")), nil // returns the secret as a slice
		},
	)

	if err != nil {
		return nil, err
	}

	return parsedaccesstoken.Claims.(*UserJWTInformation), nil
}

// THIS AUTH MIDDLEWARE IS USED TO CHECK FOR A SESSION AND IF NOT REDIRECT THE USER TO A LOGIN PAGE
func CustomAuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		jwtToken, err := c.Cookie("session")
		if err != nil {
			return c.Redirect(302, "/login")
		}

		userClaims, err := ParseToken(jwtToken.Value)
		if err != nil { // valid checks for expiry
			return c.Redirect(302, "/login")
		}

		if userClaims.Valid() != nil { // valid checks for expiry
			return c.Redirect(302, "/login")
		}

		var user db.User
		err = db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userClaims.ID) // Get the first entry if there is any any in the databse matching this query
		if err != nil {
			return c.Redirect(302, "login")
		}

		c.Set("userid", user.Id)
		return next(c)
	}
}
