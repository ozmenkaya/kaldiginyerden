require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();

// Upload dizinlerini oluştur
const uploadDir = process.env.UPLOAD_DIR || '/var/www/kaliyorapp/uploads';
['cv', 'photos', 'logos'].forEach(dir => {
  fs.mkdirSync(path.join(uploadDir, dir), { recursive: true });
});

// Güvenlik middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static dosyalar (CV indirme sadece auth ile olmalı)
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/participant', require('./routes/participant'));
app.use('/api/company', require('./routes/company'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/trainings', require('./routes/trainings'));
app.use('/api/forms', require('./routes/forms'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Endpoint bulunamadı' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API sunucu ${PORT} portunda çalışıyor`));
