import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Diretório onde os arquivos serão salvos
const uploadDir = path.resolve('uploads');

// Garante que a pasta de uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

// Instância do Multer com validações
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Tipo de arquivo não permitido.'));
  }
});

// Servir arquivos estáticos (HTML do formulário)
app.use(express.static(path.resolve('public')));

// Rota de upload
app.post('/upload', upload.single('arquivo'), (req, res) => {
  if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
  res.send(`Upload concluído com sucesso! Nome: ${req.file.filename}`);
});

// Middleware para tratamento de erros
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(`Erro no upload: ${err.message}`);
  }
  if (err) {
    return res.status(400).send(`Erro: ${err.message}`);
  }
  res.status(500).send('Erro desconhecido.');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
