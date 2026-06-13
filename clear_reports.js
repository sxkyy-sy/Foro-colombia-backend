const { setupDB } = require('./db');

async function run() {
    const db = await setupDB();
    await db.run('DELETE FROM comments');
    await db.run('DELETE FROM reports');
    console.log("Todos los reportes y comentarios han sido borrados de la base de datos.");
}

run();
