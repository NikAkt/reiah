package handlers

import (
	"database/sql"
	"net/http"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
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

// A login form struct for when submiting the login
type CreateUserSessionForm struct {
	Username string `form:"username"`
	Password string `form:"password"`
}

// HandleLoginAttempt handles user login attempts.
func HandleLoginAttempt(c echo.Context) error {
	var userSessionForm CreateUserSessionForm
	if err := c.Bind(&userSessionForm); err != nil { // bind the form values to the user session form struct
		return err
	}

	// verify the user exists
	var userEntry db.User // create a user variable
	query := "SELECT * FROM users WHERE username=?"
	if err := db.DB.Get(&userEntry, query, userSessionForm.Username); err != nil {
		// If there is no matching entry, return the login page with invalid flag as true
		return c.JSON(401, "no user exists with that name")
	}

	// verify the user password is correct
	if !VerifyPassword(userSessionForm.Password, userEntry.PasswordHash) {
		return c.JSON(401, "Incorrect password")
	}

	// generate a token from the user
	token, err := GenerateJWTToken(&userEntry)
	if err != nil {
		return c.JSON(500, "Failed to generate session")
	}

	cookie := &http.Cookie{
		Name:     "session",
		Value:    token, // TODO: need to create an actual session value and put it in the database too
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}

	c.SetCookie(cookie) // Sets a cookie in the response with the auth
	return c.String(200, "Welcome")
}

type CreateUserForm struct {
	Username             string `form:"username"`
	Name                 string `form:"name"`
	Surname              string `form:"surname"`
	Email                string `form:"email"`
	Password             string `form:"password"`
	PasswordConfirmation string `form:"confirmpassword"`
}

// HandleRegisterAttempt handles the registration post of the register form.
// TODO: Improve error handling in this function.
func HandleRegisterAttempt(c echo.Context) error {
	var userRegistration CreateUserForm
	if err := c.Bind(&userRegistration); err != nil {
		return c.JSON(400, "UNauthorised")
	}

	if userRegistration.Password != userRegistration.PasswordConfirmation {
		return c.JSON(400, "UNauthorised")
	}

	hashedPassword, err := HashPassword(userRegistration.Password)
	if err != nil {
		return c.JSON(400, "UNauthorised")
	}

	var user db.User
	query := "SELECT * FROM users WHERE username=? OR email=?"
	if err := db.DB.Get(&user, query, userRegistration.Username, userRegistration.Email); err != nil {
		if err == sql.ErrNoRows {
			newUser := db.User{
				Id:           uuid.New().String(),
				Username:     userRegistration.Username,
				Name:         userRegistration.Name,
				Email:        userRegistration.Email,
				Surname:      userRegistration.Surname,
				PasswordHash: hashedPassword,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}

			_, err := db.DB.NamedExec("INSERT INTO users (id, username, name, email, surname, password_hash, created_at, updated_at) VALUES (:id, :username, :name, :email, :surname, :password_hash, :created_at, :updated_at)", &newUser)
			if err != nil {
				return c.JSON(400, "UNauthorised")
			}
		} else {
			return c.JSON(400, "UNauthorised")
		}
	} else {
		return c.JSON(400, "UNauthorised")
	}

	return c.JSON(200, "You registered :)")
}
