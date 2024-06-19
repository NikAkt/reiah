package handlers

import "testing"

func TestHashPassword(t *testing.T) {
	cases := []struct {
		password string
		hash     string
	}{
		{"helloworld", "$2a$14$PiVxuPcxhIcJZCFNBRIFrur64rmbznGwN/5V.vbLHpiVbaMvPMM9y"},
		{"complicated1234@@@9", "$2a$14$V2IpuCHGyJW0Hc7tHJwlv.cxwYXnRR3KRZYnsI5tVD89oeZPLj.UW"},
		{"lkrn3 fo;I@gv2 kj", "$2a$14$FNH2ZiPzS79Rf0RSxQIFv.VlANuE567bY8knWm.yZh62dLjgtYnwC"},
	}

	for _, c := range cases {
		if !VerifyPassword(c.password, c.hash) {
			t.Errorf("incorrect output for (`%s` `%s): expected true but got false", c.password, c.hash)
		}
	}
}
