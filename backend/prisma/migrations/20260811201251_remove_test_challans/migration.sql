-- Safe deletion of Postman test challans.
-- This will cascade and delete associated challan_items.
DELETE FROM "challans"
WHERE "challanNo" IN (
  'CHL-2026-0008',
  'CHL-2026-0009',
  'CHL-2026-0010',
  'CHL-2026-0011',
  'CHL-2026-0012',
  'CHL-2026-0013',
  'CHL-2026-0014',
  'CHL-2026-0015'
);