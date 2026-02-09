use rusqlite::{Connection, Result};
use std::sync::Mutex;

pub struct AppState {
    pub conn: Mutex<Connection>,
}

impl AppState {
    pub fn new() -> Result<Self> {
        let conn = Connection::open("portfolio.db")?;

        // Contact form submissions
        conn.execute(
            "CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                read INTEGER DEFAULT 0
            )",
            [],
        )?;

        // Projects table (for admin management)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                technologies TEXT NOT NULL,
                github_url TEXT,
                demo_url TEXT,
                image_urls TEXT NOT NULL,
                featured INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Admin users table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Insert default admin if not exists (password: admin123 - CHANGE THIS!)
        // In production, use a proper hashed password
        let admin_exists: bool = conn.query_row(
            "SELECT 1 FROM admin_users WHERE username = 'admin' LIMIT 1",
            [],
            |_| Ok(true),
        ).unwrap_or(false);

        if !admin_exists {
            // Default password: admin123
            // You should change this immediately after first login
            let password_hash = bcrypt::hash("admin123", bcrypt::DEFAULT_COST).unwrap();
            conn.execute(
                "INSERT INTO admin_users (username, password_hash) VALUES (?1, ?2)",
                ["admin", &password_hash],
            )?;
        }

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
