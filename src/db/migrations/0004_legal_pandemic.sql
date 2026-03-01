CREATE TABLE caso_cambios (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  caso_id INTEGER NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  campo TEXT NOT NULL,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  modificado_por TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_caso_cambios_caso_id ON caso_cambios(caso_id);
