/**
 * Formate un numéro de téléphone au format international pour WhatsApp
 * @param phone - Numéro de téléphone à formater
 * @param defaultCountryCode - Code pays par défaut (ex: "221" pour le Sénégal)
 * @returns Numéro formaté au format international (ex: "221771234567")
 */
export function formatPhoneForWhatsApp(phone: string | undefined | null, defaultCountryCode: string = "221"): string {
  if (!phone) return "";

  // Retirer TOUS les caractères non-numériques (espaces, tirets, parenthèses, +, etc.)
  let cleaned = phone.replace(/\D/g, "");

  // Si le numéro commence déjà par le code pays, le retourner tel quel
  if (cleaned.startsWith(defaultCountryCode)) {
    return cleaned;
  }

  // Si le numéro commence par 00 suivi du code pays, retirer les 00
  if (cleaned.startsWith("00" + defaultCountryCode)) {
    return cleaned.substring(2);
  }

  // Si le numéro commence par 0 (format local), le retirer et ajouter le code pays
  if (cleaned.startsWith("0")) {
    return defaultCountryCode + cleaned.substring(1);
  }

  // Si le numéro ne commence pas par 0, ajouter le code pays directement
  // (utile pour les numéros déjà sans le 0 initial comme 771234567)
  if (!cleaned.startsWith(defaultCountryCode)) {
    return defaultCountryCode + cleaned;
  }

  return cleaned;
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phone - Numéro de téléphone à formater
 * @returns Numéro formaté pour l'affichage (ex: "+221 77 123 45 67")
 */
export function formatPhoneForDisplay(phone: string | undefined | null): string {
  if (!phone) return "";

  const formatted = formatPhoneForWhatsApp(phone);

  // Pour le Sénégal (221), formater comme +221 77 123 45 67
  if (formatted.startsWith("221") && formatted.length === 12) {
    return `+221 ${formatted.substring(3, 5)} ${formatted.substring(5, 8)} ${formatted.substring(8, 10)} ${formatted.substring(10)}`;
  }

  // Format générique avec le code pays
  if (formatted.length > 3) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Crée un lien WhatsApp avec un numéro formaté et un message
 * @param phone - Numéro de téléphone
 * @param message - Message pré-rempli (optionnel)
 * @returns URL WhatsApp complète
 */
export function createWhatsAppLink(phone: string | undefined | null, message?: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);

  if (!formattedPhone) return "";

  const baseUrl = `https://wa.me/${formattedPhone}`;

  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }

  return baseUrl;
}
