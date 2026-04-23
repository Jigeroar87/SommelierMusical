import { QUADRANTS_DATA, QuadrantType } from './songs';

export interface EditorialReading {
  short_diagnosis: string;
  long_reading: string;
  cta_final: string;
}

export const FALLBACK_READINGS: Record<QuadrantType, EditorialReading> = {
  abraza: {
    short_diagnosis: "Un refugio vibrante tallado en el pulso del mundo.",
    long_reading: "Tu música hoy no te empuja: te sostiene. Hay una necesidad de abrigo, memoria y reparación emocional. Tu lectura revela una búsqueda de refugio interior, intimidad y verdad afectiva que valida cada rincón de tu historia presente.",
    cta_final: "Certificar Hallazgo"
  },
  prende: {
    short_diagnosis: "La frecuencia de hoy es un incendio controlado; una urgencia de cuerpo y calle que reclama su lugar.",
    long_reading: "Tus elecciones vibran con una energía cinética innegable. Has buscado el ritmo que rompe la inercia, piezas que no piden permiso para existir. Esta fase es una catarsis necesaria, un desborde de vitalidad que utiliza la frecuencia sonora para reconectar con el pulso más primitivo y honesto de tu identidad.",
    cta_final: "Validar Fuego"
  },
  eleva: {
    short_diagnosis: "Te encuentras en una fase de ascenso vertical; una expansión sonora que busca el rastro de un himno colectivo.",
    long_reading: "Tu cata revela una búsqueda de luz y amplitud. Has seleccionado frecuencias que empujan los límites de lo cotidiano, buscando la épica en lo sencillo. Es un momento de optimismo arquitectónico, donde cada pieza musical sirve como un escalón hacia una versión más luminosa y vibrante de tu estado actual.",
    cta_final: "Sellar Ascenso"
  },
  revela: {
    short_diagnosis: "Tu escucha ha descendido a las profundidades; una búsqueda de verdad y legado que no teme al silencio.",
    long_reading: "Hoy no has buscado entretenimiento, sino trascendencia. Tu paladar se ha inclinado por lo complejo, por lo que tiene peso y sombra. Esta tendencia revela una madurez que entiende la música como un manuscrito de verdades ocultas. Estás en un momento de gran calado, donde la identidad se forja en la profundidad de la frecuencia.",
    cta_final: "Reivindicar Verdad"
  }
};
