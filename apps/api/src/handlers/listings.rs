use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateListing {
    pub user_id: Uuid,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub price: i32,
    pub description: Option<String>,
    pub image_urls: Option<Vec<String>>,
    pub vehicle_type: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateListing {
    pub make: String,
    pub model: String,
    pub year: i32,
    pub price: i32,
    pub description: Option<String>,
    pub vehicle_type: Option<String>,
}

#[derive(Serialize)]
pub struct ListingResponse {
    pub id: Uuid,
    pub make: String,
    pub model: String,
    pub status: String,
}

#[derive(Serialize)]
pub struct FeedItem {
    pub id: Uuid,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub price: i32,
    pub description: Option<String>,
    pub seller_email: String,
    pub image_urls: Vec<String>,
    pub vehicle_type: Option<String>,
}

// GET /api/listings
pub async fn list_listings(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<FeedItem>>, (StatusCode, String)> {
    let records = sqlx::query!(
        r#"
        SELECT 
            l.id, l.make, l.model, l.year, l.price, l.description, l.vehicle_type,
            u.email as seller_email,
            COALESCE(ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), ARRAY[]::TEXT[]) as "image_urls!"
        FROM listings l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN listing_images i ON l.id = i.listing_id
        GROUP BY l.id, u.email
        ORDER BY l.created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

    let feed = records
        .into_iter()
        .map(|record| FeedItem {
            id: record.id,
            make: record.make,
            model: record.model,
            year: record.year,
            price: record.price,
            description: record.description,
            seller_email: record.seller_email,
            image_urls: record.image_urls,
            vehicle_type: record.vehicle_type,
        })
        .collect();

    Ok(Json(feed))
}

// GET /api/listings/:id
pub async fn get_listing(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<FeedItem>, (StatusCode, String)> {
    let record = sqlx::query!(
        r#"
        SELECT 
            l.id, l.make, l.model, l.year, l.price, l.description, l.vehicle_type,
            u.email as seller_email,
            COALESCE(ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), ARRAY[]::TEXT[]) as "image_urls!"
        FROM listings l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN listing_images i ON l.id = i.listing_id
        WHERE l.id = $1
        GROUP BY l.id, u.email
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

    match record {
        Some(record) => Ok(Json(FeedItem {
            id: record.id,
            make: record.make,
            model: record.model,
            year: record.year,
            price: record.price,
            description: record.description,
            seller_email: record.seller_email,
            image_urls: record.image_urls,
            vehicle_type: record.vehicle_type,
        })),
        None => Err((StatusCode::NOT_FOUND, "Listing not found".to_string())),
    }
}

// POST /api/listings
pub async fn create_listing(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateListing>,
) -> Result<Json<ListingResponse>, (StatusCode, String)> {
    let record = sqlx::query!(
        r#"
        INSERT INTO listings (user_id, make, model, year, price, description, vehicle_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, make, model
        "#,
        payload.user_id, 
        payload.make, 
        payload.model, 
        payload.year, 
        payload.price, 
        payload.description,
        payload.vehicle_type
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Insert error: {}", e)))?;

    if let Some(urls) = payload.image_urls {
        for url in urls {
            sqlx::query!(
                "INSERT INTO listing_images (listing_id, image_url) VALUES ($1, $2)",
                record.id,
                url
            )
            .execute(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Image save error: {}", e)))?;
        }
    }

    Ok(Json(ListingResponse {
        id: record.id,
        make: record.make,
        model: record.model,
        status: "Successfully posted vehicle with images!".to_string(),
    }))
}

// PUT /api/listings/:id
pub async fn update_listing(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateListing>,
) -> Result<Json<ListingResponse>, (StatusCode, String)> {
    let record = sqlx::query!(
        r#"
        UPDATE listings 
        SET make = $1, model = $2, year = $3, price = $4, description = $5, vehicle_type = $6
        WHERE id = $7
        RETURNING id, make, model
        "#,
        payload.make,
        payload.model,
        payload.year,
        payload.price,
        payload.description,
        payload.vehicle_type,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

    match record {
        Some(record) => Ok(Json(ListingResponse {
            id: record.id,
            make: record.make,
            model: record.model,
            status: "Successfully updated listing!".to_string(),
        })),
        None => Err((StatusCode::NOT_FOUND, "Listing not found".to_string())),
    }
}

// DELETE /api/listings/:id
pub async fn delete_listing(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let result = sqlx::query!("DELETE FROM listings WHERE id = $1", id)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "Listing not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT) 
}