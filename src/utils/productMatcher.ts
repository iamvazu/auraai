import { FurnitureItem } from '../types';
import { PRODUCT_CATALOG } from '../data/products';

// Helper: Client-side Fuzzy Matcher
export const findBestMatch = (query: string, visualDesc: string): FurnitureItem | null => {
    if (!query) return null;
    const searchTerms = query.toLowerCase().split(' ').filter(w => w.length > 2);

    let bestMatch: FurnitureItem | null = null;
    let maxScore = 0;

    PRODUCT_CATALOG.forEach(product => {
        let score = 0;
        const pName = product.name.toLowerCase();
        const pDesc = product.description.toLowerCase();
        const pCat = product.category.toLowerCase();
        const pMat = product.material.toLowerCase();

        // High weight: exact word match in name
        searchTerms.forEach(term => {
            if (pName.includes(term)) score += 10;
            if (pCat.includes(term)) score += 5;
            if (pDesc.includes(term)) score += 3;
            if (pMat.includes(term)) score += 4;

            // Visual characteristics bonus
            if (visualDesc && visualDesc.toLowerCase().includes(term)) score += 2;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = product;
        }
    });

    return maxScore > 5 ? bestMatch : null; // Threshold to avoid garbage matches
};
