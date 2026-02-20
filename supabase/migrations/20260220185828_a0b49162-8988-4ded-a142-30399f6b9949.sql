-- Delete duplicate EP04 projects, keeping the oldest one (442d1afb)
DELETE FROM cast_projects WHERE id IN (
  '8fd639a1-11f9-4c1e-8055-3c494a769180',
  '5b1d124b-8349-42dd-81d0-c3b38ddee42b'
);