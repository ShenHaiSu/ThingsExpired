package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"things-expired/config"
)

func TestJWTUtil_GenerateToken(t *testing.T) {
	cfg := &config.JWTConfig{
		Secret:      "test-secret-key",
		ExpireHours: 24,
	}
	jwtUtil := NewJWTUtil(cfg)

	token, expireTime, err := jwtUtil.GenerateToken(1, "testuser", "test@example.com")

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.True(t, expireTime.After(time.Now()))
	assert.True(t, expireTime.Before(time.Now().Add(25*time.Hour)))
}

func TestJWTUtil_ValidateToken(t *testing.T) {
	cfg := &config.JWTConfig{
		Secret:      "test-secret-key",
		ExpireHours: 24,
	}
	jwtUtil := NewJWTUtil(cfg)

	// 生成 token
	token, _, err := jwtUtil.GenerateToken(1, "testuser", "test@example.com")
	assert.NoError(t, err)

	// 验证 token
	claims, err := jwtUtil.ValidateToken(token)

	assert.NoError(t, err)
	assert.NotNil(t, claims)
	assert.Equal(t, uint(1), claims.UserID)
	assert.Equal(t, "testuser", claims.Username)
	assert.Equal(t, "test@example.com", claims.Email)
}

func TestJWTUtil_ValidateToken_InvalidToken(t *testing.T) {
	cfg := &config.JWTConfig{
		Secret:      "test-secret-key",
		ExpireHours: 24,
	}
	jwtUtil := NewJWTUtil(cfg)

	// 使用无效的 token
	claims, err := jwtUtil.ValidateToken("invalid-token")

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestJWTUtil_ValidateToken_WrongSecret(t *testing.T) {
	// 使用不同的 secret 生成和验证
	cfg1 := &config.JWTConfig{
		Secret:      "secret-key-1",
		ExpireHours: 24,
	}
	cfg2 := &config.JWTConfig{
		Secret:      "secret-key-2",
		ExpireHours: 24,
	}

	jwtUtil1 := NewJWTUtil(cfg1)
	jwtUtil2 := NewJWTUtil(cfg2)

	// 使用第一个 secret 生成 token
	token, _, err := jwtUtil1.GenerateToken(1, "testuser", "test@example.com")
	assert.NoError(t, err)

	// 使用第二个 secret 验证 token（应该失败）
	claims, err := jwtUtil2.ValidateToken(token)

	assert.Error(t, err)
	assert.Nil(t, claims)
}
