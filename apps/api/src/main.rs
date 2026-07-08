use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

mod handlers;

#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:supersecret@localhost:5432/motor_market".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    println!("✅ Database connected!");

    // Here is where we wire up all the routes!
    let app = Router::new()
        .route(
            "/api/users", 
            get(handlers::users::list_users).post(handlers::users::create_user)
        )
        .route(
            "/api/listings", 
            get(handlers::listings::list_listings).post(handlers::listings::create_listing)
        )
        .route(
            "/api/listings/:id",
            get(handlers::listings::get_listing)
                .put(handlers::listings::update_listing)       // <-- Chains the Edit function
                .delete(handlers::listings::delete_listing)    // <-- Chains the Delete function
        )
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("🚀 Server is running and listening on http://localhost:8080");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}