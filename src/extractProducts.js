// extractProducts.js

function extractProducts(excelData) {
    const extractedProducts = [];
  
    if (Array.isArray(excelData)) {
      excelData.forEach((rowData) => {
        if (Array.isArray(rowData)) {
          const product = processRow(rowData);
          if (product) {
            extractedProducts.push(product);
          }
        }
      });
    }
  
    return extractedProducts;
  }
  
  function processRow(row) {
    const filteredRow = row.filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
  
    if (filteredRow.length >= 3) {
      return {
        codigo: filteredRow[0],
        descripcion: filteredRow[1],
        precio: filteredRow[2]
      };
    }
    return null;
  }
  
  export { extractProducts, processRow };
  