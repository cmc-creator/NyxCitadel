export interface HVAQuestion {
  id: string;
  label: string;
  type: 'select' | 'text' | 'textarea';
  options?: { value: string; label: string }[];
  required: boolean;
}

export interface HVACategory {
  id: string;
  name: string;
  color: string;
  events: HVAEvent[];
}

export interface HVAEvent {
  id: string;
  name: string;
  scoringDimensions: ScoringDimension[];
}

export interface ScoringDimension {
  id: string;
  name: string;
  description: string;
  scores: { value: number; label: string }[];
}

export const HVA_SCORING_DIMENSIONS: ScoringDimension[] = [
  {
    id: 'probability',
    name: 'Probability',
    description: 'Likelihood this will occur',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: 'Low' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'High' },
    ],
  },
  {
    id: 'humanImpact',
    name: 'Human Impact',
    description: 'Possibility of death or injury',
    scores: [
      { value: 0, label: 'No Impact' },
      { value: 1, label: 'Little Impact' },
      { value: 2, label: 'Some Impact' },
      { value: 3, label: 'Significant Impact' },
    ],
  },
  {
    id: 'propertyImpact',
    name: 'Property Impact',
    description: 'Physical losses and damages',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: '<$10K' },
      { value: 2, label: '$10-$100K' },
      { value: 3, label: '>$100K' },
    ],
  },
  {
    id: 'businessImpact',
    name: 'Business Impact',
    description: 'Interruption of services',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: '<$10K' },
      { value: 2, label: '$10-$100K' },
      { value: 3, label: '>$100K' },
    ],
  },
  {
    id: 'preparedness',
    name: 'Preparedness',
    description: 'Preplanning',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: 'High' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'Low or none' },
    ],
  },
  {
    id: 'internalResponse',
    name: 'Internal Response',
    description: 'Time, effectiveness, resources',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: 'High' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'Low or none' },
    ],
  },
  {
    id: 'externalResponse',
    name: 'External Response',
    description: 'Community/Mutual Aid staff and supplies',
    scores: [
      { value: 0, label: 'N/A' },
      { value: 1, label: 'High' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'Low or none' },
    ],
  },
];

export const HVA_TEMPLATES: HVACategory[] = [
  {
    id: 'natural',
    name: 'Natural Hazards',
    color: 'bg-blue-100 text-blue-900',
    events: [
      { id: 'microburst', name: 'Microburst', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'dustStorm', name: 'Dust Storm', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'highWinds', name: 'High Winds', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'tornado', name: 'Tornado', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'severeThunderstorm', name: 'Severe Thunderstorm (including lightning)', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'earthquake', name: 'Earthquake', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'extremeHeat', name: 'Extreme Heat', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'drought', name: 'Drought', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'floodExternal', name: 'Flood, External', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'wildFire', name: 'Wild Fire/Smoke Damage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'damInundation', name: 'Dam Inundation', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
  {
    id: 'nonItTech',
    name: 'Non-IT Technological Hazards',
    color: 'bg-yellow-100 text-yellow-900',
    events: [
      { id: 'electricalInternal', name: 'Electrical Failure, Internal (e.g., panel, switch, fuse)', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'electricalUtility', name: 'Electrical Utility Outage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'generatorFailure', name: 'Generator Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'fuelShortage', name: 'Fuel Shortage, generators', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'naturalGasFailure', name: 'Natural Gas Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'waterFailure', name: 'Water Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'sewerFailure', name: 'Sewer Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'fireAlarmFailure', name: 'Fire Alarm Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'commFailure', name: 'Comm. Failure (e.g., cells, faxes, radios)', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'hvacFailure', name: 'HVAC Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'floodInternal', name: 'Flood, Internal', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'waterIntrusion', name: 'Water Intrusion', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'airQualityInternal', name: 'Air Quality, Internal', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'miscEnv', name: 'Misc Env, Impact (e.g., external air quality)', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'structuralDamage', name: 'Structural Damage', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
  {
    id: 'itTech',
    name: 'IT Technological Hazards',
    color: 'bg-purple-100 text-purple-900',
    events: [
      { id: 'hardwareFailure', name: 'Hardware Failure, Facility', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'applicationFailure', name: 'Application Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'dataLoss', name: 'Data Loss/Corruption', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'backupFailure', name: 'Data Back-Up Process Event', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'dataCenterOutage', name: 'Data Center Outage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'offsiteDataInaccessible', name: 'Off-site Data Inaccessible', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'unauthorizedAccess', name: 'Unauthorized System/Data Access', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'wanOutage', name: 'Wide Area Network Outage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'manOutage', name: 'Metro Area Network Outage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'lanOutage', name: 'Local Area Network Outage, Facility', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'telecomOutage', name: 'Telecom Carrier (Century Link) Outage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'computerViruses', name: 'Computer Viruses', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'spamAttack', name: 'SPAM Attack', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'hackerAttack', name: 'Hacker Attack', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
  {
    id: 'human',
    name: 'Human Hazards',
    color: 'bg-red-100 text-red-900',
    events: [
      { id: 'massCasualty', name: 'Mass Casualty Incident', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'relianceThirdParty', name: 'Reliance on 3rd Parties', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'staffShortage', name: 'Staff Shortage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'vendorFailure', name: 'Vendor Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'theftVandalism', name: 'Theft/Vandalism', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'fireInternal', name: 'Fire, Internal', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'arson', name: 'Arson', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'urbanFire', name: 'Urban Fire', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'elevatorFailure', name: 'Elevator Failure', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'workplaceViolence', name: 'Workplace Violence', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'fuelShortageHuman', name: 'Fuel Shortage', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'unauthorizedAccess', name: 'Unauth. Phy. Access', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'vipSituation', name: 'VIP Situation', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'elopement', name: 'Elopement', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'hostageSituation', name: 'Hostage Situation', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'civilDisturbance', name: 'Civil Disturbance', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'forensicAdmission', name: 'Forensic Admission', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'bombThreat', name: 'Bomb Threat', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'explosion', name: 'Explosion', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
  {
    id: 'hazmat',
    name: 'Hazardous Materials',
    color: 'bg-orange-100 text-orange-900',
    events: [
      { id: 'massCasualtyHazmat', name: 'Mass Casualty Hazmat Incident', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'smallCasualtyHazmat', name: 'Small Casualty Hazmat Incident (From historic events with < 5 victims)', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'chemicalExternalExposure', name: 'Chemical Exposure, External', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'smallMediumSpill', name: 'Small-Medium Sized Internal Spill', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'terrorismChemical', name: 'Terrorism, Chemical', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'biologicalTerrorism', name: 'Biological', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'radiologicExposureInternal', name: 'Radiologic Exposure, Internal', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'radiologicExposureExternal', name: 'Radiologic Exposure, External', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'terrorismRadiologic', name: 'Terrorism, Radiologic', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
  {
    id: 'infectiousDiseases',
    name: 'Emerging Infectious Diseases',
    color: 'bg-green-100 text-green-900',
    events: [
      { id: 'epidemic', name: 'Epidemic', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'infectiousDiseaseOutbreak', name: 'Infectious Disease Outbreak', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'influenza', name: 'Influenza', scoringDimensions: HVA_SCORING_DIMENSIONS },
      { id: 'pandemicCovid', name: 'Pandemic--COVID 19', scoringDimensions: HVA_SCORING_DIMENSIONS },
    ],
  },
];

export function getHVACategoryById(id: string): HVACategory | undefined {
  return HVA_TEMPLATES.find(cat => cat.id === id);
}

export function calculateHVARisk(scores: Record<string, number>): number {
  const probability = scores.probability || 0;
  const severity = (scores.humanImpact || 0) + (scores.propertyImpact || 0) + (scores.businessImpact || 0);
  const mitigation = (scores.preparedness || 0) + (scores.internalResponse || 0) + (scores.externalResponse || 0);
  return probability * Math.max(0, severity - mitigation);
}
