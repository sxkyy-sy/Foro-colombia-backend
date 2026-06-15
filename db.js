const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.uikkovslbkuejdpijemy:Mercuys.Flip_iphone02@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

// Wrapper object to mimic SQLite API for easy migration in server.js
const dbWrapper = {
    all: async (query, params = []) => {
        // convert SQLite ? to Postgres $1, $2, etc.
        let i = 1;
        const pgQuery = query.replace(/\?/g, () => `$${i++}`);
        const res = await pool.query(pgQuery, params);
        return res.rows;
    },
    get: async (query, params = []) => {
        let i = 1;
        const pgQuery = query.replace(/\?/g, () => `$${i++}`);
        const res = await pool.query(pgQuery, params);
        return res.rows[0];
    },
    run: async (query, params = []) => {
        let i = 1;
        const pgQuery = query.replace(/\?/g, () => `$${i++}`);
        // If it's an insert, we need RETURNING id to get lastID
        if (pgQuery.trim().toUpperCase().startsWith('INSERT')) {
            const insertQuery = `${pgQuery} RETURNING id`;
            try {
                const res = await pool.query(insertQuery, params);
                return { lastID: res.rows[0]?.id };
            } catch (err) {
                // If it fails (maybe the table doesn't have an id), fallback to normal
                const res = await pool.query(pgQuery, params);
                return res;
            }
        }
        const res = await pool.query(pgQuery, params);
        return res;
    },
    exec: async (query) => {
        // exec is usually for raw DDL
        const res = await pool.query(query);
        return res;
    }
};

async function setupDB() {
    await dbWrapper.exec(`
        CREATE TABLE IF NOT EXISTS users (
            discord_id VARCHAR PRIMARY KEY,
            username VARCHAR,
            avatar VARCHAR,
            is_admin INTEGER DEFAULT 0,
            role VARCHAR DEFAULT 'Usuario',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR,
            description TEXT,
            icon VARCHAR,
            order_index INTEGER
        );

        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            title VARCHAR,
            author_id VARCHAR REFERENCES users(discord_id),
            author_name VARCHAR,
            author_avatar VARCHAR,
            reported_id VARCHAR,
            rule VARCHAR,
            description TEXT,
            video_url VARCHAR,
            date VARCHAR,
            status VARCHAR DEFAULT 'pending',
            verdict TEXT,
            category_id INTEGER DEFAULT 1,
            closed_by VARCHAR
        );

        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            report_id INTEGER REFERENCES reports(id),
            author_id VARCHAR REFERENCES users(discord_id),
            author_name VARCHAR,
            author_avatar VARCHAR,
            text TEXT,
            date VARCHAR
        );
    `);

    // Add new columns for GTA World style handling admin (safe to run multiple times)
    await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS handling_admin_id VARCHAR`);
    await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS handling_admin_name VARCHAR`);
    await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS handling_admin_avatar VARCHAR`);
    await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS character_name VARCHAR`);

    // Add session table for connect-pg-simple if not exists
    await dbWrapper.exec(`
        CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        );
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // Insert default categories
    const countRes = await dbWrapper.get("SELECT count(*) as count FROM categories");
    if (parseInt(countRes.count) === 0) {
        await dbWrapper.run("INSERT INTO categories (name, description, icon, order_index) VALUES ('Reportes de Jugadores', 'Reporta faltas a las normativas de la comunidad.', 'fa-gavel', 1)");
        await dbWrapper.run("INSERT INTO categories (name, description, icon, order_index) VALUES ('Reportes de STAFF', 'Reporta abuso de poder por parte de la administración.', 'fa-shield-halved', 2)");
        await dbWrapper.run("INSERT INTO categories (name, description, icon, order_index) VALUES ('Apelaciones de Sanciones', 'Si crees que tu sanción fue injusta, apela aquí.', 'fa-scale-balanced', 3)");
    }

    console.log("Base de datos Supabase (PostgreSQL) conectada e inicializada correctamente.");
    return dbWrapper;
}

async function getDB() {
    return dbWrapper;
}

module.exports = { setupDB, getDB, pool };
