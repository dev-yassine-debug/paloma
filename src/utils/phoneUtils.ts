
// Mapping des codes pays et leurs formats
const COUNTRY_CONFIGS = {
  '+212': { // Maroc
    name: 'Maroc',
    flag: '🇲🇦',
    localPrefix: '0',
    minLength: 9,
    maxLength: 9,
    validPrefixes: ['6', '7']
  },
  '+966': { // Arabie Saoudite
    name: 'السعودية',
    flag: '🇸🇦',
    localPrefix: '0',
    minLength: 9,
    maxLength: 9,
    validPrefixes: ['5']
  },
  '+971': { // Émirats
    name: 'الإمارات',
    flag: '🇦🇪',
    localPrefix: '0',
    minLength: 9,
    maxLength: 9,
    validPrefixes: ['5']
  },
  '+965': { // Koweït
    name: 'الكويت',
    flag: '🇰🇼',
    localPrefix: '',
    minLength: 8,
    maxLength: 8,
    validPrefixes: ['5', '6', '9']
  },
  '+974': { // Qatar
    name: 'قطر',
    flag: '🇶🇦',
    localPrefix: '',
    minLength: 8,
    maxLength: 8,
    validPrefixes: ['3', '5', '6', '7']
  }
};

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  errorMessage?: string;
  country?: string;
}

/**
 * Normalise un numéro de téléphone au format E.164
 * @param phone - Le numéro de téléphone à normaliser
 * @param defaultCountryCode - Code pays par défaut (ex: '+212')
 * @returns Résultat de la validation et normalisation
 */
export function normalizePhoneNumber(
  phone: string, 
  defaultCountryCode: string = '+212'
): PhoneValidationResult {
  if (!phone) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: 'رقم الهاتف مطلوب'
    };
  }

  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  let normalizedPhone = '';
  let countryCode = '';
  let localNumber = '';

  // Cas 1: Numéro commence déjà par +
  if (cleanPhone.startsWith('+')) {
    normalizedPhone = cleanPhone;
    // Extraire le code pays
    for (const code of Object.keys(COUNTRY_CONFIGS)) {
      if (cleanPhone.startsWith(code)) {
        countryCode = code;
        localNumber = cleanPhone.substring(code.length);
        break;
      }
    }
  }
  // Cas 2: Numéro commence par 0 (format local)
  else if (cleanPhone.startsWith('0')) {
    countryCode = defaultCountryCode;
    localNumber = cleanPhone.substring(1);
    normalizedPhone = `${countryCode}${localNumber}`;
  }
  // Cas 3: Numéro commence par le code pays sans +
  else if (cleanPhone.startsWith('212') || cleanPhone.startsWith('966') || 
           cleanPhone.startsWith('971') || cleanPhone.startsWith('965') || 
           cleanPhone.startsWith('974')) {
    normalizedPhone = `+${cleanPhone}`;
    // Extraire le code pays
    for (const code of Object.keys(COUNTRY_CONFIGS)) {
      const codeWithoutPlus = code.substring(1);
      if (cleanPhone.startsWith(codeWithoutPlus)) {
        countryCode = code;
        localNumber = cleanPhone.substring(codeWithoutPlus.length);
        break;
      }
    }
  }
  // Cas 4: Numéro local sans préfixe
  else {
    countryCode = defaultCountryCode;
    localNumber = cleanPhone;
    normalizedPhone = `${countryCode}${localNumber}`;
  }

  // Validation du format
  if (!countryCode || !COUNTRY_CONFIGS[countryCode]) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: 'رمز البلد غير مدعوم'
    };
  }

  const config = COUNTRY_CONFIGS[countryCode];
  
  // Vérifier la longueur
  if (localNumber.length < config.minLength || localNumber.length > config.maxLength) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: `رقم الهاتف يجب أن يكون ${config.minLength} أرقام`
    };
  }

  // Vérifier que c'est uniquement des chiffres
  if (!/^\d+$/.test(localNumber)) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: 'رقم الهاتف يجب أن يحتوي على أرقام فقط'
    };
  }

  // Vérifier les préfixes valides
  const hasValidPrefix = config.validPrefixes.some(prefix => 
    localNumber.startsWith(prefix)
  );
  
  if (!hasValidPrefix) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: `رقم الهاتف غير صالح لـ ${config.name}`
    };
  }

  return {
    isValid: true,
    normalizedPhone,
    country: config.name
  };
}

/**
 * Valide un numéro de téléphone en temps réel
 * @param phone - Le numéro de téléphone
 * @param countryCode - Code pays sélectionné
 * @returns Résultat de la validation
 */
export function validatePhoneNumber(phone: string, countryCode: string): PhoneValidationResult {
  return normalizePhoneNumber(phone, countryCode);
}

/**
 * Liste des codes pays supportés
 */
export function getSupportedCountries() {
  return Object.entries(COUNTRY_CONFIGS).map(([code, config]) => ({
    code,
    name: config.name,
    flag: config.flag
  }));
}

/**
 * Formate un numéro pour l'affichage
 * @param phone - Numéro au format E.164
 * @returns Numéro formaté pour l'affichage
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone.startsWith('+')) return phone;
  
  // Format pour différents pays
  if (phone.startsWith('+212')) {
    const local = phone.substring(4);
    return `+212 ${local.substring(0, 1)} ${local.substring(1, 3)} ${local.substring(3, 5)} ${local.substring(5)}`;
  }
  if (phone.startsWith('+966')) {
    const local = phone.substring(4);
    return `+966 ${local.substring(0, 2)} ${local.substring(2, 5)} ${local.substring(5)}`;
  }
  
  return phone;
}
