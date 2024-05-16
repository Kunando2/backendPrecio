// Producto.js
import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
  codigo: String,
  descripcion: String,
  precio: Number,
});

const Producto = model('Producto', productoSchema);

export default Producto;
