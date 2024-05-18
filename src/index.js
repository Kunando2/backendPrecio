import express from 'express';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { server as WebSocketServer } from 'websocket';
import { extractProducts } from './extractProducts.js';
import __dirname from './utils.js'; // Asegúrate de tener utils.js configurado para obtener __dirname

const app = express();

const PORT = process.env.PORT || 3001;

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

// Conexión a la base de datos
mongoose.connect('mongodb+srv://bufano:logistica@cluster0.nqmrv3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Lista = mongoose.model('Lista', {
  nombre: String,
  contenido: mongoose.Schema.Types.Mixed,
});

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));
app.use(express.json());
const upload = multer();

app.use(express.static(`${__dirname}/public`));

// Ruta para obtener listas (API)
app.get('/api/listas', async (req, res) => {
  try {
    const listas = await Lista.find();
    res.json(listas);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});

// Ruta para obtener lista por ID (API)
app.get('/api/listas/:id', async (req, res) => {
  try {
    const lista = await Lista.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const listaReducida = {
      nombre: lista.nombre,
      contenido: lista.contenido,
    };

    res.json(listaReducida);
  } catch (error) {
    console.error('Error al obtener lista por ID:', error);
    res.status(500).json({ error: 'Error al obtener lista por ID' });
  }
});

// Ruta para renderizar la vista de listas
app.get('/listas', async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || '';
    const listas = await Lista.find();
    const jsonData = listas.map((lista) => lista.contenido);
    const filteredProducts = extractProducts(jsonData.flat()).filter((item) => {
      const lowerCasedTerm = searchTerm.toLowerCase();
      return (
        String(item.codigo).toLowerCase().includes(lowerCasedTerm) ||
        String(item.descripcion).toLowerCase().includes(lowerCasedTerm) ||
        String(item.precio).toLowerCase().includes(lowerCasedTerm)
      );
    });
    res.render('mostrarLista', { filteredProducts, searchTerm });
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});


// Ruta para crear una nueva lista
app.post('/api/listas', async (req, res) => {
  try {
    const { nombre, contenido } = req.body;
    const nuevaLista = new Lista({ nombre, contenido });
    await nuevaLista.save();
    res.json(nuevaLista);
  } catch (error) {
    console.error('Error al crear lista:', error);
    res.status(500).json({ error: 'Error al crear lista', details: error.message });
  }
});

// Ruta para procesar el archivo Excel
app.post('/api/procesar-excel', upload.single('archivo'), async (req, res) => {
  try {
    const contenido = req.body.contenido;

    if (!contenido) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún contenido' });
    }

    const nombreLista = 'Lista desde Excel';
    const nuevaLista = new Lista({ nombre: nombreLista, contenido: contenido });
    await nuevaLista.save();

    res.json({ mensaje: 'Datos del archivo Excel procesados y lista creada correctamente' });
  } catch (error) {
    console.error('Error al cargar el archivo Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el archivo Excel', details: error.message });
  }
});

// Iniciar el servidor
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});

// Configurar el servidor WebSocket
const wsServer = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: false
});

// Manejador de eventos de conexión WebSocket
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  console.log('Cliente conectado al WebSocket.');

  // Manejar mensajes entrantes desde el cliente WebSocket
  connection.on('message', (message) => {
    console.log('Mensaje recibido desde el cliente:', message.utf8Data);
  });

  // Manejar cierre de conexión WebSocket
  connection.on('close', () => {
    console.log('Cliente desconectado del WebSocket.');
  });
});
