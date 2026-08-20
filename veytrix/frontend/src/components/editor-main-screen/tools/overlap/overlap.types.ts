export interface CropData {
  top: number;    // percentage 0-100
  bottom: number; // percentage 0-100
  left: number;   // percentage 0-100
  right: number;  // percentage 0-100
}

export interface OverlapBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}
