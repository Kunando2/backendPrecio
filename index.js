import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { server as WebSocketServer } from 'websocket';

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://bufano:logistica@cluster0.nqmrv3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const Lista = mongoose.model('Lista', {
  nombre: String,
  contenido: mongoose.Schema.Types.Mixed,
});

app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));
app.use(express.json());
const upload = multer();

app.get('/api/listas', async (req, res) => {
  try {
    const listas = await Lista.find();
    res.json(listas);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
});

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

app.post('/api/procesar-excel', upload.single('archivo'), async (req, res) => {
  try {
    const contenido = req.body.contenido;

    if (!contenido) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún contenido' });
    }

    // Guardar los datos en la base de datos
    const nombreLista = 'Lista desde Excel';
    const nuevaLista = new Lista({ nombre: nombreLista, contenido: contenido });
    await nuevaLista.save();

    res.json({ mensaje: 'Datos del archivo Excel procesados y lista creada correctamente' });
  } catch (error) {
    console.error('Error al cargar el archivo Excel:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el archivo Excel', details: error.message });
  }
});

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});

// Configurar el servidor WebSocket
const wsServer = new WebSocketServer({
  httpServer: httpServer,
  autoAcceptConnections: false // Deshabilita la aceptación automática de conexiones
});

// Manejador de eventos de conexión WebSocket
wsServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);
  console.log('Cliente conectado al WebSocket.');

  // Manejar mensajes entrantes desde el cliente WebSocket
  connection.on('message', (message) => {
    console.log('Mensaje recibido desde el cliente:', message.utf8Data);
    // Aquí puedes procesar los mensajes según sea necesario
  });

  // Manejar cierre de conexión WebSocket
  connection.on('close', () => {
    console.log('Cliente desconectado del WebSocket.');
  });
});
