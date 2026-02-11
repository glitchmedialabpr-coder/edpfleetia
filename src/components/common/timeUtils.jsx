/**
 * Convierte hora en formato 24h (HH:mm) a formato 12h (h:mm AM/PM)
 * @param {string} time24 - Hora en formato 24h (ej: "14:30")
 * @returns {string} - Hora en formato 12h (ej: "2:30 PM")
 */
export function convertTo12Hour(time24) {
  if (!time24) return '';
  
  // Si ya tiene AM/PM, retornar como está
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24;
  }
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${period}`;
}

/**
 * Convierte hora en formato 12h (h:mm AM/PM) a formato 24h (HH:mm)
 * @param {string} time12 - Hora en formato 12h (ej: "2:30 PM")
 * @returns {string} - Hora en formato 24h (ej: "14:30")
 */
export function convertTo24Hour(time12) {
  if (!time12) return '';
  
  // Si no tiene AM/PM, asumir que ya está en 24h
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12;
  }
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Obtiene la hora actual de Puerto Rico en formato 12h
 * Puerto Rico usa AST (Atlantic Standard Time) - UTC-4
 * @returns {string} - Hora actual en formato 12h (ej: "2:30 PM")
 */
export function getCurrentTime12Hour() {
  const now = new Date();
  const prTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Puerto_Rico' }));
  const hours = prTime.getHours();
  const minutes = prTime.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Obtiene la fecha y hora actual de Puerto Rico
 * @returns {Date} - Fecha/hora actual de Puerto Rico
 */
export function getPuertoRicoTime() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Puerto_Rico' }));
}

/**
 * Formatea fecha/hora de Puerto Rico
 * @param {Date} date - Fecha a formatear (opcional, usa hora actual si no se provee)
 * @returns {string} - Fecha formateada en formato ISO
 */
export function getPuertoRicoISOString(date = null) {
  const prTime = date || getPuertoRicoTime();
  return prTime.toISOString();
}