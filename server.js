const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDB } = require('./db');
const { EmbedBuilder } = require('discord.js');

function startServer(botClient) {
    const app = express();
    
    // Reusable Notification Function
    const sendNotification = async (userId, title, description, color = '#FFD700', url = 'http://localhost:5173') => {
        if (!botClient || !userId) return;
        try {
            const user = await botClient.users.fetch(userId);
            if (!user) return;
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setURL(url)
                .setFooter({ text: 'Colombia Exotic Reports' })
                .setTimestamp();
            await user.send({ embeds: [embed] });
        } catch (err) {
            console.error(`No se pudo enviar DM a ${userId}:`, err.message);
        }
    };
    
    // Configuración para admitir credenciales (cookies) entre puertos diferentes
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }));
    
    app.use(express.json());

    const pgSession = require('connect-pg-simple')(session);
    const { pool } = require('./db');

    app.use(session({
        store: new pgSession({
            pool: pool,
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 30 } // 30 days expiration
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Multer Config
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
    const upload = multer({ storage: storage });

    app.use(passport.initialize());
    app.use(passport.session());

    // Configuración de Passport-Discord
    const callbackURL = (process.env.BACKEND_URL || 'http://localhost:3000') + '/api/auth/discord/callback';
    
    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: callbackURL,
        scope: ['identify']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const db = await getDB();
            const avatarUrl = profile.avatar 
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` 
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator) % 5 || 0}.png`;

            let existingUser = await db.get('SELECT * FROM users WHERE discord_id = ?', [profile.id]);
            
            let isAdmin = existingUser ? existingUser.is_admin : 0;
            let role = existingUser ? existingUser.role : 'Usuario';

            // Super Admin manual:
            if (profile.id === '695026214683017236') {
                isAdmin = 1;
                role = 'Fundador';
            }

            await db.run(
                'INSERT INTO users (discord_id, username, avatar, is_admin, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT(discord_id) DO UPDATE SET username=excluded.username, avatar=excluded.avatar',
                [profile.id, profile.username, avatarUrl, isAdmin, role]
            );
            return done(null, { id: profile.id, username: profile.username, avatar: avatarUrl, is_admin: isAdmin, role: role });
        } catch (err) {
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    // Rutas de Usuarios / Perfiles
    app.get('/api/users/:id', async (req, res) => {
        try {
            const db = await getDB();
            const user = await db.get('SELECT discord_id, username, avatar, role, created_at FROM users WHERE discord_id = ?', [req.params.id]);
            
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const threads = await db.all('SELECT id, title, category_id, date, status FROM reports WHERE author_id = ? ORDER BY id DESC', [req.params.id]);
            const comments = await db.all('SELECT id, report_id, text, date FROM comments WHERE author_id = ? ORDER BY id DESC', [req.params.id]);

            res.json({
                user,
                threads,
                comments
            });
        } catch (err) {
            res.status(500).json({ error: 'Error del servidor' });
        }
    });

    // Rutas de Administración
    app.get('/api/admin/users', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(403).json({ error: 'Acceso denegado' });
        try {
            const db = await getDB();
            const users = await db.all('SELECT discord_id as id, username, avatar, role, is_admin FROM users ORDER BY username ASC');
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: 'Error' });
        }
    });

    app.put('/api/admin/users/:id/role', async (req, res) => {
        if (!req.user || req.user.role !== 'Fundador') return res.status(403).json({ error: 'Solo el Fundador puede gestionar rangos' });
        try {
            const { role } = req.body;
            const isAdmin = ['Fundador', 'Administrador', 'Moderador'].includes(role) ? 1 : 0;
            const db = await getDB();
            await db.run('UPDATE users SET role = ?, is_admin = ? WHERE discord_id = ?', [role, isAdmin, req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Error' });
        }
    });

    // Rutas de Autenticación
    app.get('/api/auth/discord', passport.authenticate('discord'));

    app.get('/api/auth/discord/callback', passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173'
    }), (req, res) => {
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    });

    app.get('/api/auth/me', (req, res) => {
        if (req.user) {
            res.json(req.user);
        } else {
            res.status(401).json({ error: 'No autorizado' });
        }
    });

    app.post('/api/auth/logout', (req, res) => {
        req.logout(() => {
            res.json({ success: true });
        });
    });

    // Subida de archivos
    app.post('/api/upload', upload.single('image'), (req, res) => {
        if (!req.user) return res.status(401).json({ error: 'No autorizado' });
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
        const url = `http://localhost:3000/uploads/${req.file.filename}`;
        res.json({ url });
    });

    // Rutas de Categorías
    app.get('/api/categories', async (req, res) => {
        const db = await getDB();
        const categories = await db.all('SELECT * FROM categories ORDER BY order_index ASC');
        res.json(categories);
    });

    // CRUD Categorías (STAFF)
    app.post('/api/admin/categories', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(403).json({ error: 'Denegado' });
        const { name, description, icon } = req.body;
        const db = await getDB();
        await db.run('INSERT INTO categories (name, description, icon, order_index) VALUES (?, ?, ?, 99)', [name, description, icon || 'fa-solid fa-folder']);
        res.json({ success: true });
    });

    app.put('/api/admin/categories/:id', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(403).json({ error: 'Denegado' });
        const { name, description, icon } = req.body;
        const db = await getDB();
        await db.run('UPDATE categories SET name=?, description=?, icon=? WHERE id=?', [name, description, icon, req.params.id]);
        res.json({ success: true });
    });

    app.delete('/api/admin/categories/:id', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(403).json({ error: 'Denegado' });
        const db = await getDB();
        await db.run('DELETE FROM categories WHERE id=?', [req.params.id]);
        res.json({ success: true });
    });

    // Rutas de la API de Reportes
    app.get('/api/reports', async (req, res) => {
        const db = await getDB();
        const reports = await db.all(`
            SELECT r.*, u.role as author_role 
            FROM reports r 
            LEFT JOIN users u ON r.author_id = u.discord_id 
            ORDER BY r.id DESC
        `);
        for (let report of reports) {
            const comments = await db.all(`
                SELECT c.*, u.role as author_role 
                FROM comments c 
                LEFT JOIN users u ON c.author_id = u.discord_id 
                WHERE c.report_id = ?
                ORDER BY c.id ASC
            `, [report.id]);
            report.comments = comments;
            report.replies = comments.length;
        }
        res.json(reports);
    });

    app.post('/api/reports', async (req, res) => {
        if (!req.user) return res.status(401).json({ error: 'Inicia sesión primero' });
        
        const { title, rule, description, videoUrl, reportedUsername, categoryId } = req.body;
        const date = new Date().toLocaleDateString('es-ES');
        const db = await getDB();
        
        const finalCategoryId = categoryId || 1; // Default a 1 (Reportes)
        let reportedId = null;

        const result = await db.run(
            `INSERT INTO reports (title, author_id, author_name, author_avatar, reported_id, rule, description, video_url, date, category_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, req.user.id, req.user.username, req.user.avatar, reportedId, rule, description, videoUrl, date, finalCategoryId]
        );

        const reportUrl = `http://localhost:5173`;

        // Enviar confirmación al autor
        await sendNotification(
            req.user.id,
            '✅ Tema creado exitosamente',
            `Tu tema **"${title}"** ha sido publicado correctamente en el foro. Recibirás una notificación cuando el STAFF lo revise o alguien responda.`,
            '#4CAF50',
            reportUrl
        );

        res.json({ success: true, id: result.lastID });
    });

    app.post('/api/reports/:id/comments', async (req, res) => {
        if (!req.user) return res.status(401).json({ error: 'Inicia sesión primero' });
        
        const { text } = req.body;
        const reportId = req.params.id;
        const date = new Date().toLocaleDateString('es-ES');
        const db = await getDB();

        await db.run(
            'INSERT INTO comments (report_id, author_id, author_name, author_avatar, text, date) VALUES (?, ?, ?, ?, ?, ?)',
            [reportId, req.user.id, req.user.username, req.user.avatar, text, date]
        );

        // Notificar a las partes
        const report = await db.get('SELECT title, author_id, reported_id FROM reports WHERE id = ?', [reportId]);
        if (report) {
            const cleanReportedId = report.reported_id ? report.reported_id.replace(/[^0-9]/g, '') : null;
            const message = `Alguien ha comentado en el hilo **"${report.title}"**. Ingresa para leer la respuesta.`;
            
            // Notificar al autor si no fue él
            if (report.author_id !== req.user.id) {
                await sendNotification(report.author_id, '💬 Nueva Respuesta', message, '#3498db');
            }
            // Notificar al reportado si no fue él
            if (cleanReportedId && cleanReportedId !== req.user.id) {
                await sendNotification(cleanReportedId, '💬 Nueva Respuesta', message, '#3498db');
            }
        }

        res.json({ success: true });
    });

    app.put('/api/reports/:id/status', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(401).json({ error: 'No autorizado' });
        
        const { status, verdict, reportedUsername } = req.body;
        const db = await getDB();
        
        let newReportedId = null;
        if (status === 'accepted' && reportedUsername && botClient) {
            const cleanUsername = reportedUsername.replace('@', '').toLowerCase();
            try {
                const guild = await botClient.guilds.fetch(process.env.GUILD_ID);
                const members = await guild.members.fetch({ query: cleanUsername, limit: 1 });
                const member = members.first();
                if (member) {
                    newReportedId = member.user.id;
                } else {
                    return res.status(400).json({ error: 'No se encontró a nadie en el Discord de Colombia Exotic con ese nombre.' });
                }
            } catch (err) {
                console.error("Error buscando usuario:", err);
            }
        }
        
        if (newReportedId) {
            await db.run('UPDATE reports SET status = ?, verdict = ?, closed_by = ?, reported_id = ? WHERE id = ?', [status, verdict || '', req.user.id, newReportedId, req.params.id]);
        } else {
            await db.run('UPDATE reports SET status = ?, verdict = ?, closed_by = ? WHERE id = ?', [status, verdict || '', req.user.id, req.params.id]);
        }

        // Notificar cambio de estado
        const report = await db.get('SELECT title, author_id, reported_id, rule FROM reports WHERE id = ?', [req.params.id]);
        if (report) {
            const cleanReportedId = report.reported_id ? report.reported_id.replace(/[^0-9]/g, '') : null;
            let title = '';
            let desc = '';
            let color = '#FFD700';

            if (status === 'accepted') {
                title = '🔓 Reporte Aceptado';
                desc = `El reporte **"${report.title}"** ha sido aceptado por la administración y está abierto a debate.`;
                color = '#003580';
                
                // Si acabamos de encontrar y guardar al reportado, enviarle el DM inicial
                if (newReportedId) {
                    await sendNotification(
                        newReportedId,
                        '🚨 Has sido reportado',
                        `Has sido reportado en el foro por **${report.rule}**.\n\n**Tema:** ${report.title}\n\nEl reporte ha sido aceptado por el STAFF. Ingresa al panel para revisar tu caso y responder.`,
                        '#FF0000'
                    );
                }
            } else if (status === 'archived') {
                title = '🔒 Tema Archivado';
                desc = `El tema **"${report.title}"** ha sido cerrado y archivado.\n\n**Veredicto del STAFF:**\n${verdict}`;
                color = '#666666';
            }

            if (title) {
                await sendNotification(report.author_id, title, desc, color);
                // Si el status es archivado (o aceptado y ya tenia reportedId de antes), le notificamos el cambio de estado normalmente
                // Pero si es 'accepted' y lo acabamos de setear (newReportedId), ya le mandamos la alerta de arriba, evitamos doble ping
                if (cleanReportedId && !newReportedId) {
                    await sendNotification(cleanReportedId, title, desc, color);
                }
            }
        }

        res.json({ success: true });
    });

    app.get('/api/admin/stats', async (req, res) => {
        if (!req.user || req.user.is_admin !== 1) return res.status(403).json({ error: 'No autorizado' });
        const db = await getDB();
        const stats = await db.all(`
            SELECT r.closed_by, u.username, u.role, u.avatar, COUNT(*) as count 
            FROM reports r 
            JOIN users u ON r.closed_by = u.discord_id 
            WHERE r.closed_by IS NOT NULL AND r.status IN ('accepted', 'archived')
            GROUP BY r.closed_by 
            ORDER BY count DESC
        `);
        res.json(stats);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor web corriendo en puerto ${PORT}`);
    });
}

module.exports = { startServer };
