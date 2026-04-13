package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"things-expired/config"
)

// Claims JWT 声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// JWTUtil JWT 工具
type JWTUtil struct {
	secret      []byte
	expireHours int
}

// NewJWTUtil 创建 JWT 工具
func NewJWTUtil(cfg *config.JWTConfig) *JWTUtil {
	return &JWTUtil{
		secret:      []byte(cfg.Secret),
		expireHours: cfg.ExpireHours,
	}
}

// GenerateToken 生成 JWT Token
func (j *JWTUtil) GenerateToken(userID uint, username, email string) (string, time.Time, error) {
	expireTime := time.Now().Add(time.Duration(j.expireHours) * time.Hour)

	claims := Claims{
		UserID:   userID,
		Username: username,
		Email:    email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expireTime, nil
}

// ValidateToken 验证 JWT Token
func (j *JWTUtil) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token signing method")
		}
		return j.secret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
