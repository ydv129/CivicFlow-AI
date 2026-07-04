export interface ColumnProfile {
  name: string;
  type: "numeric" | "date" | "text";
  missingCount: number;
  uniqueCount: number;
  mean?: number;
  min?: number;
  max?: number;
}

/**
 * Computes descriptive statistics and column profiles for a raw matrix dataset.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function profileColumnData(headers: string[], rows: any[][]): ColumnProfile[] {
  const profiles: ColumnProfile[] = [];
  const rowCount = rows.length;

  if (rowCount === 0) return [];

  headers.forEach((header, colIdx) => {
    let missingCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueValues = new Set<any>();
    let numericCount = 0;
    let dateCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    rows.forEach((row) => {
      const cell = row[colIdx];
      if (cell === undefined || cell === null || String(cell).trim() === "") {
        missingCount++;
      } else {
        uniqueValues.add(cell);
        
        // Try parsing numeric values
        const cleanCell = String(cell).replace(/[$,%]/g, "");
        const num = Number(cleanCell);
        if (!isNaN(num)) {
          numericCount++;
          sum += num;
          if (num < min) min = num;
          if (num > max) max = num;
        }

        // Try parsing date values (avoid pure numeric strings)
        if (typeof cell === "string" && isNaN(Number(cell))) {
          const parsedDate = Date.parse(cell);
          if (!isNaN(parsedDate)) {
            dateCount++;
          }
        }
      }
    });

    // Infer column type based on dominant patterns (e.g. 60% threshold of valid cells)
    const validCount = rowCount - missingCount;
    let type: "numeric" | "date" | "text" = "text";
    
    if (validCount > 0) {
      if (numericCount >= validCount * 0.6) {
        type = "numeric";
      } else if (dateCount >= validCount * 0.6) {
        type = "date";
      }
    }

    const profile: ColumnProfile = {
      name: header,
      type,
      missingCount,
      uniqueCount: uniqueValues.size,
    };

    if (type === "numeric" && numericCount > 0) {
      profile.mean = sum / numericCount;
      profile.min = min;
      profile.max = max;
    }

    profiles.push(profile);
  });

  return profiles;
}
