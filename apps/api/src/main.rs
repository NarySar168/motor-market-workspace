use axum::{
    extract::{State, Path},
    routing::{get, post},
    Json, Router,
};
use dotenvy::dotenv;
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

// --- DATA STRUCTURES ---

#[derive(Serialize)]
struct ApiResponse {
    message: String,
    status: String,
}

#[derive(Deserialize)]
struct CreateUser {
    email: String,
    first_name: String,
    last_name: String,
}

#[derive(Serialize)]
struct UserResponse {
    id: Uuid,
    email: String,
    status: String,
}

#[derive(Deserialize)]
struct CreateListing {
    user_id: Uuid,
    make: String,
    model: String,
    year: i32,
    price: i32, 
    description: Option<String>,
    // NEW: Accepts an array of image links from the frontend!
    image_urls: Option<Vec<String>>, 
}

#[derive(Serialize)]
struct ListingResponse {
    id: Uuid,
    make: String,
    model: String,
    status: String,
}

#[derive(Serialize)]
struct FeedItem {
    id: Uuid,
    make: String,
    model: String,
    year: i32,
    price: i32,
    description: Option<String>,
    seller_email: String,
    // NEW: Returns an array of image links to the frontend!
    image_urls: Vec<String>, 
}

// --- MAIN SERVER ---

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    println!("✅ Database connected!");

    let app = Router::new()
        .route("/api/hello", get(hello_world))
        .route("/api/users", get(list_users).post(create_user))
        .route("/api/listings", get(list_listings).post(create_listing))
        .route("/api/listings/:id", get(get_listing))
        .with_state(pool)
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("🚀 Server is running and listening on http://localhost:8080");
    
    axum::serve(listener, app).await?;

    Ok(())
}

// --- ROUTE HANDLERS ---

async fn hello_world() -> Json<ApiResponse> {
    Json(ApiResponse {
        message: "Hello from the Rust Backend!".to_string(),
        status: "success".to_string(),
    })
}

async fn list_users(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<UserResponse>>, (axum::http::StatusCode, String)> {
    let records = sqlx::query!("SELECT id, email FROM users ORDER BY created_at DESC")
        .fetch_all(&pool).await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let users = records.into_iter().map(|r| UserResponse {
        id: r.id, email: r.email, status: "active".to_string(),
    }).collect();

    Ok(Json(users))
}

async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<UserResponse>, (axum::http::StatusCode, String)> {
    let mock_password = "hashed_password_123";
    let record = sqlx::query!(
        "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email",
        payload.email, mock_password, payload.first_name, payload.last_name
    ).fetch_one(&pool).await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(UserResponse { id: record.id, email: record.email, status: "Success".to_string() }))
}

// GET /api/listings (The Shopping Feed)
async fn list_listings(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<FeedItem>>, (axum::http::StatusCode, String)> {
    
    // NEW: We use ARRAY_AGG to squish all the linked images into a single list for each car
    let records = sqlx::query!(
        r#"
        SELECT 
            l.id, l.make, l.model, l.year, l.price, l.description, 
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
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

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
            image_urls: record.image_urls, // Maps the array directly!
        })
        .collect();

    Ok(Json(feed))
}

// POST /api/listings
async fn create_listing(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateListing>,
) -> Result<Json<ListingResponse>, (axum::http::StatusCode, String)> {
    
    // 1. Insert the car first to get its new UUID
    let record = sqlx::query!(
        r#"
        INSERT INTO listings (user_id, make, model, year, price, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, make, model
        "#,
        payload.user_id, payload.make, payload.model, payload.year, payload.price, payload.description
    )
    .fetch_one(&pool)
    .await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Insert error: {}", e)))?;

    // 2. If the frontend sent us images, loop through them and insert them into the gallery table!
    if let Some(urls) = payload.image_urls {
        for url in urls {
            sqlx::query!(
                "INSERT INTO listing_images (listing_id, image_url) VALUES ($1, $2)",
                record.id,
                url
            )
            .execute(&pool)
            .await
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Image save error: {}", e)))?;
        }
    }

    Ok(Json(ListingResponse {
        id: record.id,
        make: record.make,
        model: record.model,
        status: "Successfully posted vehicle with images!".to_string(),
    }))
}

// GET /api/listings/:id (Single Vehicle Details)
async fn get_listing(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<FeedItem>, (axum::http::StatusCode, String)> {
    let record = sqlx::query!(
        r#"
        SELECT 
            l.id, l.make, l.model, l.year, l.price, l.description, 
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
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)))?;

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
        })),
        None => Err((axum::http::StatusCode::NOT_FOUND, "Listing not found".to_string())),
    }
}