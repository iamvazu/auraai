
export interface FurnitureItem {
  id: string;
  name: string;
  type: string;
  category: string;
  collection: 'Oasis' | 'Terra' | 'Astra' | 'Bestseller';
  price: number;
  image: string;
  material: string;
  description: string;
  dimensions: string;
  productUrl?: string;
}

export interface SpatialObject {
  object: string;
  bbox: [number, number, number, number];
  confidence: number;
  suggestedSKU?: string;
}

export interface VastuViolation {
  item: string;
  issue: string;
  impact: string;
}

export interface VastuRemedy {
  action: string;
  reason: string;
  ul_product_boost: string;
}

export interface ArchitectureElement {
  type: 'wall' | 'window' | 'door' | 'opening';
  bbox: [number, number, number, number];
}

export interface AnalysisResult {
  objects: SpatialObject[];
  architecture?: ArchitectureElement[];
  vastu_score: number;
  status: 'Auspicious' | 'Neutral' | 'Needs Remedy';
  violations: VastuViolation[];
  remedies: VastuRemedy[];
  summary: string;
  roomType: string;
  layoutAnalysis?: string;
  remedialPath?: string;
}

export interface ExperienceCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  rating?: number;
  highlights?: string[];
  distance?: number;
}
