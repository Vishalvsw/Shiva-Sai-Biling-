import { TestCategory } from './types';

export const TEST_DATA: TestCategory[] = [
  {
    category: 'HAEMATOLOGY',
    tests: [
      { id: 'h1', name: 'CBC', price: 300 },
      { id: 'h2', name: 'Hb%', price: 100 },
      { id: 'h3', name: 'TC & DC', price: 150 },
      { id: 'h4', name: 'RBC count', price: 120 },
      { id: 'h5', name: 'Platelet count', price: 150 },
      { id: 'h6', name: 'Complete hemogram', price: 400 },
      { id: 'h7', name: 'Peripheral blood smear study', price: 200 },
      { id: 'h8', name: 'ESR', price: 100 },
      { id: 'h9', name: 'Absolute eosinophil count', price: 180 },
      { id: 'h10', name: 'Reticulocyte count', price: 250 },
      { id: 'h11', name: 'Blood group & Rh typing', price: 100 },
    ],
  },
  {
    category: 'BIOCHEMISTRY',
    tests: [
        { id: 'b1', name: 'Ferritin', price: 600 },
        { id: 'b2', name: 'Blood sugar - Fasting', price: 100 },
        { id: 'b3', name: 'Blood sugar - Post Prandial', price: 100 },
        { id: 'b4', name: 'Blood sugar - Random', price: 100 },
        { id: 'b5', name: 'GCT/OGCT', price: 200 },
        { id: 'b6', name: 'HbA1c', price: 450 },
        { id: 'b7', name: 'Lipid Profile', price: 800 },
    ]
  },
  {
    category: 'LIVER FUNCTION TESTS',
    tests: [
      { id: 'lft1', name: 'Serum Bilirubin (Total, Direct, Indirect)', price: 250 },
      { id: 'lft2', name: 'SGOT', price: 180 },
      { id: 'lft3', name: 'SGPT', price: 180 },
      { id: 'lft4', name: 'Alk.Phosphatase', price: 200 },
      { id: 'lft5', name: 'Total protein', price: 150 },
      { id: 'lft6', name: 'Albumin', price: 150 },
      { id: 'lft7', name: 'Globulin', price: 150 },
      { id: 'lft8', name: 'A/G Ratio', price: 100 },
    ],
  },
    {
    category: 'RENAL FUNCTION TESTS',
    tests: [
        { id: 'rft1', name: 'Blood Urea', price: 180 },
        { id: 'rft2', name: 'Serum Creatinine', price: 180 },
        { id: 'rft3', name: 'Serum Uric Acid', price: 200 },
        { id: 'rft4', name: 'Serum Amylase', price: 400 },
        { id: 'rft5', name: 'Serum Lipase', price: 450 },
        { id: 'rft6', name: 'Protein - Total & Albumin', price: 250 },
        { id: 'rft7', name: 'LDH', price: 350 },
        { id: 'rft8', name: 'ADA', price: 500 },
        { id: 'rft9', name: 'CK - MB', price: 600 },
        { id: 'rft10', name: 'Troponin - I', price: 900 },
    ]
  },
  {
    category: 'CT SCAN',
    tests: [
      { id: 'ct1', name: 'CT Brain', price: 2000 },
      { id: 'ct2', name: 'CT PNS', price: 2500 },
      { id: 'ct3', name: 'CT Chest', price: 3500 },
      { id: 'ct4', name: 'CT KUB', price: 3000 },
      { id: 'ct5', name: 'CT Abdomen + Pelvis', price: 4500 },
      { id: 'ct6', name: 'CT Neck', price: 3000 },
      { id: 'ct7', name: 'CT Orbits', price: 3000 },
      { id: 'ct8', name: 'CT Face', price: 3000 },
    ],
  },
  {
    category: 'ULTRASONOGRAPHY',
    tests: [
      { id: 'us1', name: 'Pelvis', price: 800 },
      { id: 'us2', name: 'Abdomen & pelvis', price: 1200 },
      { id: 'us3', name: 'KUB', price: 800 },
      { id: 'us4', name: 'Early pregnancy', price: 1000 },
      { id: 'us5', name: 'NT scan (11 - 14 weeks)', price: 1500 },
      { id: 'us6', name: 'TIFFA / Anomaly scan (20 - 24 weeks)', price: 2000 },
      { id: 'us7', name: 'Obstetric Doppler', price: 1800 },
    ],
  },
   {
    category: 'DIGITAL X-RAY',
    tests: [
      { id: 'x1', name: 'Chest PA View', price: 400 },
      { id: 'x2', name: 'KUB X-Ray', price: 400 },
      { id: 'x3', name: 'Abdomen Erect', price: 400 },
      { id: 'x4', name: 'Cervical Spine AP/Lat', price: 500 },
      { id: 'x5', name: 'Skull AP/Lat', price: 500 },
    ],
  },
  {
    category: 'CARDIAC INVESTIGATION',
    tests: [
      { id: 'c1', name: 'ECG', price: 300 },
      { id: 'c2', name: '2D - Echo', price: 2000 },
    ]
  },
];

export const TAX_RATE = 0.05; // 5% tax
