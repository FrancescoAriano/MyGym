/**
 * Utility functions for formatting and displaying data
 */

/**
 * Formatta un prezzo rimuovendo decimali non necessari
 * @param {number|string} price - Prezzo da formattare
 * @returns {string} Prezzo formattato
 */
export function formatPrice(price) {
  const numPrice = Number.parseFloat(price);
  if (isNaN(numPrice)) return "0";

  // Se il prezzo è un numero intero, non mostrare decimali
  if (numPrice % 1 === 0) {
    return numPrice.toFixed(0);
  }

  // Altrimenti mostra fino a 2 decimali
  return numPrice.toFixed(2);
}

/**
 * Formatta una data in formato italiano
 * @param {string|Date} date - Data da formattare
 * @returns {string} Data formattata (gg/mm/aaaa)
 */
export function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("it-IT");
}

/**
 * Formatta la durata di un abbonamento
 * @param {number} value - Valore durata
 * @param {string} unit - Unità (DAY, WEEK, MONTH)
 * @returns {string} Durata formattata
 */
export function formatDuration(value, unit) {
  const units = {
    DAY: value === 1 ? "giorno" : "giorni",
    WEEK: value === 1 ? "settimana" : "settimane",
    MONTH: value === 1 ? "mese" : "mesi",
  };

  return `${value} ${units[unit] || unit.toLowerCase()}`;
}
