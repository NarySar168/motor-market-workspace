use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateUser {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub status: String,
}

// GET /api/users
pub async fn list_users(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<UserResponse>>, (StatusCode, String)> {
    let records = sqlx::query!("SELECT id, email FROM users ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let users = records
        .into_iter()
        .map(|r| UserResponse {
            id: r.id,
            email: r.email,
            status: "active".to_string(),
        })
        .collect();

    Ok(Json(users))
}

// POST /api/users
pub async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let mock_password = "hashed_password_123";
    let record = sqlx::query!(
        "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email",
        payload.email, mock_password, payload.first_name, payload.last_name
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(UserResponse {
        id: record.id,
        email: record.email,
        status: "Success".to_string(),
    }))
}