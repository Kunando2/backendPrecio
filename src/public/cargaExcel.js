const Cargadeexcel = () => {
    const [uploadMessage, setUploadMessage] = useState(null);
    const [selectedLista, setSelectedLista] = useState('consumoPersonal');
  
    const handleFileChange = async (e) => {
      try {
        const file = e.target.files[0];
        const reader = new FileReader();
  
        reader.onload = async (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
            if (jsonData.length > 0 && jsonData[0].length === 0) {
              jsonData.shift();
            }
  
            console.log('Datos del Excel:', jsonData);
  
            
  
            // Enviar los datos del archivo Excel al backend para procesarlos y guardarlos en la base de datos
            const response = await axios.post('http://localhost:3001/api/procesar-excel', { contenido: jsonData });
            console.log('Respuesta del backend:', response.data);
  
            setUploadMessage(`El archivo se cargó correctamente en la lista: ${selectedLista}.`);
          } catch (error) {
            console.error('Error al procesar el archivo Excel:', error);
            setUploadMessage('Error al procesar el archivo. Por favor, verifica el formato.');
          }
        };
  
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error al cargar datos desde el archivo:', error);
        setUploadMessage('Error al cargar el archivo. Por favor, verifica el formato.');
      }
    };
  
    const handleListaChange = (e) => {
      setSelectedLista(e.target.value);
    };
}