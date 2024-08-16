export const getCurrentDate = (): string => {
    const now = new Date();
  
    // Obtener el año, mes y día
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
    const day = String(now.getDate()).padStart(2, '0');
  
    // Formatear la fecha en YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;
  
    return formattedDate;
  };