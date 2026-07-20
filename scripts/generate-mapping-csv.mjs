// Generates CSV mapping tables (id <-> value) for the static reference data
// in src/data into the root `mappings/` directory.
//
// Run: node --experimental-strip-types scripts/generate-mapping-csv.mjs
// (regenerate whenever the source data in src/data/*.ts changes)
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { departments } from "../src/data/departments.ts";
import { religions } from "../src/data/religions.ts";
import { countries } from "../src/data/countries.ts";
import { provinces } from "../src/data/provinces.ts";
import { districts } from "../src/data/districts.ts";

function escapeCsv(value) {
    if (value === null || value === undefined) return "";
    const s = String(value);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// UTF-8 BOM + CRLF so Excel opens the Thai columns correctly.
function toCsv(rows, columns) {
    const header = columns.join(",");
    const body = rows.map((row) =>
        columns.map((col) => escapeCsv(row[col])).join(","),
    );
    return "﻿" + [header, ...body].join("\r\n") + "\r\n";
}

const outDir = join(process.cwd(), "mappings");
mkdirSync(outDir, { recursive: true });

const tables = [
    {
        file: "departments.csv",
        columns: ["id", "code", "nameTh", "nameEn"],
        rows: departments,
    },
    {
        file: "religions.csv",
        columns: ["id", "nameTh", "nameEn"],
        rows: religions,
    },
    {
        file: "countries.csv",
        columns: ["id", "code", "name"],
        rows: countries,
    },
    {
        file: "provinces.csv",
        columns: ["id", "provinceCode", "nameTh", "nameEn"],
        rows: provinces,
    },
    {
        file: "districts.csv",
        columns: ["id", "districtCode", "provinceCode", "nameTh", "nameEn"],
        rows: districts,
    },
];

for (const { file, columns, rows } of tables) {
    writeFileSync(join(outDir, file), toCsv(rows, columns), "utf8");
    console.log(`wrote mappings/${file} (${rows.length} rows)`);
}
