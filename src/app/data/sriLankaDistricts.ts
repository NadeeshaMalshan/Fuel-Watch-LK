import type { Language } from '../types';

/** Administrative districts — reference point is used for nearest-district assignment from coordinates. */
export interface SriLankaDistrict {
  id: string;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  /** Approximate admin centre [lat, lng] */
  ref: [number, number];
}

export const SL_DISTRICTS: SriLankaDistrict[] = [
  { id: 'colombo', nameEn: 'Colombo', nameSi: 'කොළඹ', nameTa: 'கொழும்பு', ref: [6.9271, 79.8612] },
  { id: 'gampaha', nameEn: 'Gampaha', nameSi: 'ගම්පහ', nameTa: 'கம்பஹா', ref: [7.0847, 80.0098] },
  { id: 'kalutara', nameEn: 'Kalutara', nameSi: 'කළුතර', nameTa: 'களுத்துறை', ref: [6.5854, 79.9607] },
  { id: 'kandy', nameEn: 'Kandy', nameSi: 'මහනුවර', nameTa: 'கண்டி', ref: [7.2906, 80.6337] },
  { id: 'matale', nameEn: 'Matale', nameSi: 'මාතලේ', nameTa: 'மாத்தளை', ref: [7.4675, 80.6234] },
  { id: 'nuwara-eliya', nameEn: 'Nuwara Eliya', nameSi: 'නුවර එළිය', nameTa: 'நுவரெலியா', ref: [6.9497, 80.7891] },
  { id: 'galle', nameEn: 'Galle', nameSi: 'ගාල්ල', nameTa: 'காலி', ref: [6.0329, 80.216] },
  { id: 'matara', nameEn: 'Matara', nameSi: 'මාතර', nameTa: 'மாத்தறை', ref: [5.9549, 80.555] },
  { id: 'hambantota', nameEn: 'Hambantota', nameSi: 'හම්බන්තොට', nameTa: 'அம்பாந்தோட்டை', ref: [6.1246, 81.1185] },
  { id: 'jaffna', nameEn: 'Jaffna', nameSi: 'යාපනය', nameTa: 'யாழ்ப்பாணம்', ref: [9.6615, 80.0255] },
  { id: 'kilinochchi', nameEn: 'Kilinochchi', nameSi: 'කිලිනොච්චි', nameTa: 'கிளிநொச்சி', ref: [9.3961, 80.3982] },
  { id: 'mannar', nameEn: 'Mannar', nameSi: 'මන්නාරම', nameTa: 'மன்னார்', ref: [8.9801, 79.9044] },
  { id: 'vavuniya', nameEn: 'Vavuniya', nameSi: 'වවුනියාව', nameTa: 'வவுனியா', ref: [8.75, 80.5001] },
  { id: 'mullaitivu', nameEn: 'Mullaitivu', nameSi: 'මුලතිව්', nameTa: 'முல்லைத்தீவு', ref: [9.267, 80.814] },
  { id: 'batticaloa', nameEn: 'Batticaloa', nameSi: 'මඩකලපුව', nameTa: 'மட்டக்களப்பு', ref: [7.73, 81.6741] },
  { id: 'ampara', nameEn: 'Ampara', nameSi: 'අම්පාර', nameTa: 'அம்பாறை', ref: [7.297, 81.679] },
  { id: 'trincomalee', nameEn: 'Trincomalee', nameSi: 'ත්‍රිකුණාමලය', nameTa: 'திருகோணமலை', ref: [8.5691, 81.2335] },
  { id: 'kurunegala', nameEn: 'Kurunegala', nameSi: 'කුරුණෑගල', nameTa: 'குருணாகல்', ref: [7.4813, 80.3623] },
  { id: 'puttalam', nameEn: 'Puttalam', nameSi: 'පුත්තලම', nameTa: 'புத்தளம்', ref: [8.0362, 79.8283] },
  { id: 'anuradhapura', nameEn: 'Anuradhapura', nameSi: 'අනුරාධපුර', nameTa: 'அனுராதபுரம்', ref: [8.335, 80.4106] },
  { id: 'polonnaruwa', nameEn: 'Polonnaruwa', nameSi: 'පොළොන්නරුව', nameTa: 'பொலன்னறுவை', ref: [7.9396, 81.0005] },
  { id: 'badulla', nameEn: 'Badulla', nameSi: 'බදුල්ල', nameTa: 'பதுளை', ref: [6.9934, 81.055] },
  { id: 'moneragala', nameEn: 'Monaragala', nameSi: 'මොනරාගල', nameTa: 'மொனராகலை', ref: [6.8744, 81.3513] },
  { id: 'ratnapura', nameEn: 'Ratnapura', nameSi: 'රත්නපුර', nameTa: 'இரத்தினபுரி', ref: [6.6828, 80.3992] },
  { id: 'kegalle', nameEn: 'Kegalle', nameSi: 'කෑගල්ල', nameTa: 'கேகாலை', ref: [7.2513, 80.3464] },
];

const byId = new Map(SL_DISTRICTS.map((d) => [d.id, d]));

export function getDistrictById(id: string): SriLankaDistrict | undefined {
  return byId.get(id);
}

export function districtLabel(d: SriLankaDistrict, language: Language): string {
  if (language === 'si') return d.nameSi;
  if (language === 'ta') return d.nameTa;
  return d.nameEn;
}
