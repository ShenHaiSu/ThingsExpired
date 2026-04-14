package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"things-expired/config"
)

// Claims JWT 声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	JTI      string `json:"jti"` // Token 唯一标识
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

// GenerateToken 生成 JWT Token（兼容旧版本）
func (j *JWTUtil) GenerateToken(userID uint, username, email string) (string, time.Time, error) {
	return j.GenerateTokenWithJTI(userID, username, email, "")
}

// GenerateTokenWithJTI 生成带 JTI 的 JWT Token
func (j *JWTUtil) GenerateTokenWithJTI(userID uint, username, email, jti string) (string, time.Time, error) {
	expireTime := time.Now().Add(time.Duration(j.expireHours) * time.Hour)

	// 如果没有提供 JTI，生成一个 UUID
	if jti == "" {
		jti = generateJTI()
	}

	claims := Claims{
		UserID:   userID,
		Username: username,
		Email:    email,
		JTI:      jti,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        jti, // 使用 JTI 作为 JWT 的 ID
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expireTime, nil
}

// generateJTI 生成唯一的 Token ID
func generateJTI() string {
	return uuid.New().String()
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
