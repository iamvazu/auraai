
import { SpatialObject } from '../types';

/**
 * CLIENT-SIDE VISION ALGORITHM
 * Uses Connected Component Labeling (Union-Find) to detect "objects" 
 * based on ink density in the sketch.
 */

// Configuration for detection sensitivity
const THRESHOLD = 200; // Pixel brightness (0-255). Below this = Ink.
const MIN_BLOB_SIZE = 1000; // Minimum pixels to count as an object (ignore noise)
const GRID_SIZE = 10; // Downsample for performance (process every 10th pixel)

export const detectObjectsInSketch = async (imageSrc: string): Promise<SpatialObject[]> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const width = img.width;
            const height = img.height;

            // Create hidden canvas for pixel analysis
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve([]);

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height).data;

            // 1. Threshold & Downsample Map
            // We map the image to a smaller grid to make Union-Find fast
            const gridW = Math.ceil(width / GRID_SIZE);
            const gridH = Math.ceil(height / GRID_SIZE);
            const grid = new Int32Array(gridW * gridH).fill(0); // 0 = Empty, 1 = Ink

            for (let y = 0; y < height; y += GRID_SIZE) {
                for (let x = 0; x < width; x += GRID_SIZE) {
                    const i = (y * width + x) * 4;
                    // Check if pixel is dark (ink)
                    const avg = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
                    if (avg < THRESHOLD) {
                        const gx = Math.floor(x / GRID_SIZE);
                        const gy = Math.floor(y / GRID_SIZE);
                        grid[gy * gridW + gx] = 1;
                    }
                }
            }

            // 2. Connected Component Labeling (Simplified Two-Pass)
            const labels = new Int32Array(gridW * gridH).fill(0);
            let nextLabel = 1;
            const equivalences: { [key: number]: number } = {};

            const getRoot = (k: number): number => {
                while (equivalences[k] !== undefined && equivalences[k] !== k) k = equivalences[k];
                return k;
            };

            const union = (a: number, b: number) => {
                const rootA = getRoot(a);
                const rootB = getRoot(b);
                if (rootA !== rootB) equivalences[Math.max(rootA, rootB)] = Math.min(rootA, rootB);
            };

            // Pass 1: Assign Labels
            for (let y = 0; y < gridH; y++) {
                for (let x = 0; x < gridW; x++) {
                    const idx = y * gridW + x;
                    if (grid[idx] === 1) {
                        // Check neighbors (Left and Top)
                        const left = (x > 0 && grid[idx - 1] === 1) ? labels[idx - 1] : 0;
                        const top = (y > 0 && grid[idx - gridW] === 1) ? labels[idx - gridW] : 0;

                        if (left === 0 && top === 0) {
                            labels[idx] = nextLabel++;
                        } else if (left !== 0 && top === 0) {
                            labels[idx] = left;
                        } else if (left === 0 && top !== 0) {
                            labels[idx] = top;
                        } else {
                            // Both present - min label wins, record equivalence
                            labels[idx] = Math.min(left, top);
                            union(left, top);
                        }
                    }
                }
            }

            // 3. Group & Calculate Bounding Boxes
            const regions: { [label: number]: { minX: number, maxX: number, minY: number, maxY: number, count: number } } = {};

            for (let y = 0; y < gridH; y++) {
                for (let x = 0; x < gridW; x++) {
                    const idx = y * gridW + x;
                    if (grid[idx] === 1) {
                        let label = labels[idx];
                        label = getRoot(label); // Resolve equivalence

                        if (!regions[label]) {
                            regions[label] = { minX: x, maxX: x, minY: y, maxY: y, count: 0 };
                        }
                        const r = regions[label];
                        r.minX = Math.min(r.minX, x);
                        r.maxX = Math.max(r.maxX, x);
                        r.minY = Math.min(r.minY, y);
                        r.maxY = Math.max(r.maxY, y);
                        r.count++;
                    }
                }
            }

            // 4. Convert to SpatialObjects (Normalized %)
            const detectedObjects: SpatialObject[] = [];
            Object.values(regions).forEach(r => {
                if (r.count * GRID_SIZE * GRID_SIZE < MIN_BLOB_SIZE) return; // Filter noise

                // Convert grid coords back to image %
                const bbox: [number, number, number, number] = [
                    (r.minY * GRID_SIZE / height) * 100, // Top
                    (r.minX * GRID_SIZE / width) * 100,  // Left
                    (r.maxY * GRID_SIZE / height) * 100, // Bottom
                    (r.maxX * GRID_SIZE / width) * 100   // Right
                ];

                // Simple Heuristic classification based on Aspect Ratio
                const w = bbox[3] - bbox[1];
                const h = bbox[2] - bbox[0];
                const ratio = w / h;

                let label = "Furniture";
                let sku = "UL-GEN-001";

                if (ratio > 1.8) { label = "Sofa / Console"; sku = "UL-SOF-001"; }
                else if (ratio > 1.2) { label = "Lounge Chair / Table"; sku = "UL-LNG-001"; }
                else if (ratio < 0.6) { label = "Floor Lamp / Tall Unit"; sku = "UL-LMP-001"; }
                else { label = "Accent Chair"; sku = "UL-CHR-001"; }

                detectedObjects.push({
                    object: label,
                    bbox: bbox,
                    confidence: 0.85 + (Math.random() * 0.1), // Sim confidence
                    suggestedSKU: sku
                });
            });

            resolve(detectedObjects);
        };
    });
};
