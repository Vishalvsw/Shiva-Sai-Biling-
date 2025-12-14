
import { TestCategory, AppSettings } from './types';
import { REFERRING_DOCTORS } from './referringDoctors';

// Increment this version whenever you make structural changes to DEFAULT_TEST_DATA
export const DATA_VERSION = '2.4'; 

export const DEFAULT_TEST_DATA: TestCategory[] = [
  {
    category: 'CT SCAN',
    isMajor: true,
    tests: [
      // PLAIN Subcategory
      { id: 'ct1', name: 'CT Brain', price: 3000, priceNight: 3500, subcategory: 'PLAIN', commissionDay: 100, commissionNight: 125 },
      { id: 'ct2', name: 'CT PNS', price: 2500, priceNight: 3000, subcategory: 'PLAIN', commissionDay: 0, commissionNight: 0 },
      { id: 'ct3', name: 'CT Orbits', price: 3000, priceNight: 3500, subcategory: 'PLAIN', commissionDay: 0, commissionNight: 0 },
      { id: 'ct31', name: 'CT Abdomen', price: 4000, priceNight: 4500, subcategory: 'PLAIN', commissionDay: 150, commissionNight: 175 },
      { id: 'ct8', name: 'CT KUB', price: 3000, priceNight: 3500, subcategory: 'PLAIN', commissionDay: 0, commissionNight: 0 },
      // CONTRAST Subcategory
      { id: 'ct32', name: 'CT Abdomen', price: 5000, priceNight: 5500, subcategory: 'CONTRAST', commissionDay: 150, commissionNight: 200 },
      { id: 'ct15', name: 'CT Angio - Pulmonary', price: 6000, priceNight: 6500, subcategory: 'CONTRAST', commissionDay: 0, commissionNight: 0 },
      { id: 'ct16', name: 'CT Angio - Cerebral', price: 6000, priceNight: 6500, subcategory: 'CONTRAST', commissionDay: 0, commissionNight: 0 },
      { id: 'ct29', name: 'CT Urogram', price: 5500, priceNight: 6000, subcategory: 'CONTRAST', commissionDay: 0, commissionNight: 0 },
    ],
  },
  {
    category: 'XRAY',
    isMajor: true,
    tests: [
      { id: 'x1', name: 'Chest PA View', price: 550, priceNight: 650, commissionDay: 50, commissionNight: 75 },
      { id: 'x4', name: 'Cervical Spine AP/Lat', price: 550, priceNight: 650, commissionDay: 50, commissionNight: 100 },
      { id: 'x13', name: 'Pelvis AP and Lateral', price: 550, priceNight: 650, commissionDay: 50, commissionNight: 125 },
    ],
  },
  {
    category: 'CARDIAC',
    isMajor: true,
    tests: [
      { id: 'c1', name: 'ECG', price: 250, priceNight: 300, commissionDay: 50, commissionNight: 75 },
      { id: 'c2', name: '2D - Echo', price: 1200, priceNight: 1400, commissionDay: 100, commissionNight: 125 },
    ]
  },
  {
    category: 'ULTRASONOGRAPHY',
    isMajor: true,
    tests: [
      { id: 'us22', name: 'USG Abdomen', price: 900, priceNight: 1000, subcategory: 'General Imaging', commissionDay: 100, commissionNight: 125 },
      { id: 'us8', name: 'NT scan (11 - 14 weeks)', price: 1200, priceNight: 1400, subcategory: 'OBG Scanning', commissionDay: 150, commissionNight: 175 },
      { id: 'us23', name: 'Doppler (General)', price: 1500, priceNight: 1700, subcategory: 'General Imaging', commissionDay: 175, commissionNight: 200 },
      { id: 'us13', name: 'Fetal biophysical profile (BBP)', price: 1800, priceNight: 2000, subcategory: 'OBG Scanning', commissionDay: 175, commissionNight: 225 },
      { id: 'us10', name: 'OBG 3D/4D live scan', price: 2000, priceNight: 2200, subcategory: 'OBG Scanning', commissionDay: 175, commissionNight: 175 },
    ],
  },
  {
    category: 'LABORATORY',
    tests: [
      { id: 'h1', name: 'CBC', price: 250, priceNight: 250, subcategory: 'HAEMATOLOGY', commissionDay: 50, commissionNight: 50 },
      { id: 'b6', name: 'HbA1c', price: 600, priceNight: 600, subcategory: 'BIOCHEMISTRY', commissionDay: 100, commissionNight: 100 },
      { id: 'b13', name: 'RFT', price: 400, priceNight: 400, subcategory: 'BIOCHEMISTRY', commissionDay: 100, commissionNight: 100 },
      { id: 'el5', name: 'Serum Electrolyte', price: 500, priceNight: 500, subcategory: 'ELECTROLYTES', commissionDay: 100, commissionNight: 100 },
      { id: 'sm4', name: 'HIV', price: 350, priceNight: 350, subcategory: 'SEROLOGY', commissionDay: 75, commissionNight: 75 },
      { id: 'cp1', name: 'Urine Routine & Microscopy', price: 100, priceNight: 100, subcategory: 'CLINICAL PATHOLOGY', commissionDay: 10, commissionNight: 10 },
      { id: 'b14', name: 'LFT', price: 600, priceNight: 600, subcategory: 'BIOCHEMISTRY', commissionDay: 100, commissionNight: 100 },
      { id: 'lft1', name: 'Serum Bilirubin', price: 150, priceNight: 150, subcategory: 'LIVER FUNCTION', commissionDay: 10, commissionNight: 10 },
    ],
  },
  {
    category: 'HEALTH PACKAGE',
    tests: [
        { id: 'hp1', name: 'Basic health check up', price: 3000, priceNight: 3000, commissionDay: 300, commissionNight: 300 },
    ]
  },
];


export const DEFAULT_SETTINGS: AppSettings = {
    labName: 'SHIVASAI SCANNING, LAB & DIAGNOSTIC CENTER',
    labAddress: 'Jadhav Complex, Near Jadhav Hospital, BHALKI-585 328',
    labContact: 'Ph: 08484-467649 | shivasaiscanning@gmail.com',
    taxRate: 0,
    referringDoctors: REFERRING_DOCTORS,
    autoDeleteDays: 45,
    verificationThreshold: 1000,
    currentShift: 'Day', 
};
