import { Request, Response } from 'express';
import { getConnection } from '../config/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen, PDF y documentos'));
    }
  }
});

// Middleware de subida de archivos
export const uploadMiddleware = upload.single('document');

// Obtener todos los documentos del usuario
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.rol;

    console.log("🔍 DOCUMENTOS - Usuario solicitando documentos:", userId);

    const pool = await getConnection();
    
    let query = `
      SELECT 
        d.id,
        d.filename,
        d.originalName,
        d.filePath,
        d.fileSize,
        d.mimeType,
        d.category,
        d.description,
        d.amount,
        d.date,
        d.createdAt,
        ec.name as categoryName,
        ec.color as categoryColor
      FROM documents d
      LEFT JOIN expense_categories ec ON d.category = ec.name
    `;

    // Si no es admin, solo mostrar sus documentos
    if (userRole !== 'admin') {
      query += ` WHERE d.userId = @userId`;
    }

    query += ` ORDER BY d.date DESC, d.createdAt DESC`;

    const result = await pool.request();
    if (userRole !== 'admin') {
      result.input('userId', userId);
    }
    
    const documents = await result.query(query);

    console.log("📋 DOCUMENTOS - Documentos encontrados:", documents.recordset.length);
    return res.json(documents.recordset);
  } catch (dbError) {
    console.log("⚠️ DOCUMENTOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

// Subir un nuevo documento
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, description, amount, date } = req.body;
    const file = req.file;

    console.log("📤 DOCUMENTOS - Subiendo documento:", file?.originalname);

    if (!file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    if (!category || !date) {
      return res.status(400).json({ error: "Categoría y fecha son obligatorios" });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('filename', file.filename)
      .input('originalName', file.originalname)
      .input('filePath', file.path)
      .input('fileSize', file.size)
      .input('mimeType', file.mimetype)
      .input('category', category)
      .input('description', description || '')
      .input('amount', amount ? parseFloat(amount) : null)
      .input('date', date)
      .input('userId', userId)
      .query(`
        INSERT INTO documents (filename, originalName, filePath, fileSize, mimeType, category, description, amount, date, userId)
        OUTPUT INSERTED.id, INSERTED.filename, INSERTED.originalName, INSERTED.category, INSERTED.amount, INSERTED.date
        VALUES (@filename, @originalName, @filePath, @fileSize, @mimeType, @category, @description, @amount, @date, @userId)
      `);

    console.log("✅ DOCUMENTOS - Documento subido exitosamente:", result.recordset[0]);
    return res.json({
      message: "Documento subido exitosamente",
      document: result.recordset[0]
    });
  } catch (dbError) {
    console.log("⚠️ DOCUMENTOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

// Descargar un documento
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.rol;

    console.log("📥 DOCUMENTOS - Descargando documento:", id);

    const pool = await getConnection();
    
    let query = `SELECT * FROM documents WHERE id = @id`;
    if (userRole !== 'admin') {
      query += ` AND userId = @userId`;
    }

    const result = await pool.request()
      .input('id', id);
    
    if (userRole !== 'admin') {
      result.input('userId', userId);
    }
    
    const document = await result.query(query);

    if (document.recordset.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const doc = document.recordset[0];
    const filePath = doc.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
    }

    res.download(filePath, doc.originalName);
    console.log("✅ DOCUMENTOS - Documento descargado:", doc.originalName);
  } catch (dbError) {
    console.log("⚠️ DOCUMENTOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

// Eliminar un documento
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.rol;

    console.log("🗑️ DOCUMENTOS - Eliminando documento:", id);

    const pool = await getConnection();
    
    // Primero obtener la información del documento
    let query = `SELECT * FROM documents WHERE id = @id`;
    if (userRole !== 'admin') {
      query += ` AND userId = @userId`;
    }

    const result = await pool.request()
      .input('id', id);
    
    if (userRole !== 'admin') {
      result.input('userId', userId);
    }
    
    const document = await result.query(query);

    if (document.recordset.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const doc = document.recordset[0];

    // Eliminar el archivo del sistema de archivos
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    // Eliminar el registro de la base de datos
    await pool.request()
      .input('id', id)
      .query(`DELETE FROM documents WHERE id = @id`);

    console.log("✅ DOCUMENTOS - Documento eliminado exitosamente");
    return res.json({ message: "Documento eliminado exitosamente" });
  } catch (dbError) {
    console.log("⚠️ DOCUMENTOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

// Obtener categorías de gastos
export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    console.log("🔍 CATEGORÍAS - Obteniendo categorías de gastos");

    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT id, name, description, color 
      FROM expense_categories 
      ORDER BY name
    `);

    console.log("📋 CATEGORÍAS - Categorías encontradas:", result.recordset.length);
    return res.json(result.recordset);
  } catch (dbError) {
    console.log("⚠️ CATEGORÍAS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

// Simular descarga automática desde correo
export const simulateEmailDownload = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { email, password, provider } = req.body;

    console.log("📧 EMAIL - Simulando descarga desde:", email);

    // Simular descarga de documentos desde correo
    const mockDocuments = [
      {
        filename: `factura-luz-${Date.now()}.pdf`,
        originalName: "Factura de Luz - Enero 2025.pdf",
        category: "Servicios Públicos",
        description: "Factura de electricidad del mes de enero",
        amount: 125000,
        date: new Date().toISOString().split('T')[0]
      },
      {
        filename: `factura-agua-${Date.now()}.pdf`,
        originalName: "Factura de Agua - Enero 2025.pdf",
        category: "Servicios Públicos",
        description: "Factura de acueducto del mes de enero",
        amount: 45000,
        date: new Date().toISOString().split('T')[0]
      }
    ];

    console.log("✅ EMAIL - Simulación completada, documentos encontrados:", mockDocuments.length);
    return res.json({
      message: "Descarga simulada exitosamente",
      documents: mockDocuments,
      note: "Esta es una simulación. En producción se conectaría con la API del proveedor de correo."
    });
  } catch (error) {
    console.log("⚠️ EMAIL - Error en simulación:", error.message);
    return res.status(500).json({ 
      error: "Error en la simulación de descarga", 
      details: error.message 
    });
  }
};
