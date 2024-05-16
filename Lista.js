import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
  codigo: String,
  descripcion: String,
  precio: Number,
});

const listaSchema = new Schema({
  nombre: String,
  productos: [productoSchema],
});

const Lista = model('Lista', listaSchema);

export default Lista;
