// Importa o módulo express
import express from 'express';
// Importa path para lidar com caminhos
import path from 'path';
// Importa o Multer
import multer from 'multer';
// Importa a instância do controller de finanças
import financeController from '../controllers/financeController.js'; // Note a extensão .js
// Importa fileURLToPath e dirname para obter __dirname em ES Modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Importa fs para operações de sistema de arquivos
import fs from 'fs';


// Cria um roteador do Express
const router = express.Router();

// Obtém o diretório atual em ES Modules
const __filename = import.meta.url;
const __dirname = dirname(__filename);

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define o caminho de destino.
    // O caminho é relativo ao diretório onde este arquivo (financeRoutes.js) está.
    const uploadPath = path.join(__dirname, '../uploads');

    // --- Verifica e cria a pasta de uploads se não existir ---
    if (!fs.existsSync(uploadPath)) {
        try {
            fs.mkdirSync(uploadPath, { recursive: true });
        } catch (err) {
            console.error(`Multer: Erro ao criar o diretório de uploads em ${uploadPath}:`, err);
            // Passa o erro para o callback do Multer
            return cb(err);
        }
    } else {
        console.log(`Multer: Diretório de uploads já existe em ${uploadPath}`);
    }
    // --- Fim da verificação e criação ---

    // Passa o caminho de destino para o callback do Multer
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    cb(null, originalname);
  }
});
const upload = multer({ storage: storage });


// Define a rota POST para upload da planilha
// Usa o middleware 'upload.single' e chama o método do controller
router.post('/upload', upload.single('planilha'), (req, res) => financeController.uploadPlanilha(req, res));

// Define a rota POST para o chat
// Chama o método do controller
router.post('/chat', (req, res) => financeController.handleChat(req, res));

// Exporta o roteador como export default
export default router;
