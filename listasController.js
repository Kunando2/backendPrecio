// listasController.js
import Lista from './Lista';

export async function obtenerListas(req, res) {
  try {
    const listas = await Lista.find();
    res.json(listas);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener listas' });
  }
}

export async function obtenerListaPorId(req, res) {
  try {
    const lista = await Lista.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json(lista);
  } catch (error) {
    console.error('Error al obtener lista por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener lista por ID' });
  }
}

export async function crearLista(req, res) {
  try {
    const { productos, nombre } = req.body;

    if (!productos || !nombre) {
      return res.status(400).json({ error: 'Se requieren productos y nombre para crear una lista' });
    }

    // Crear nueva lista
    const nuevaLista = new Lista({ nombre, productos });
    await nuevaLista.save();

    res.json({ mensaje: 'Lista creada correctamente' });
  } catch (error) {
    console.error('Error al crear lista:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear lista' });
  }
}


// Puedes agregar controladores para actualizar y eliminar listas según sea necesario
