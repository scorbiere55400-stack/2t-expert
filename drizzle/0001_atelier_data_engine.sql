CREATE TABLE IF NOT EXISTS user_garages (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mon garage',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS user_garages_user_idx ON user_garages(user_id);

CREATE TABLE IF NOT EXISTS garage_vehicles (
  id TEXT PRIMARY KEY NOT NULL,
  garage_id TEXT NOT NULL REFERENCES user_garages(id),
  vehicle_variant_id TEXT REFERENCES vehicle_variants(id),
  external_vehicle_key TEXT,
  display_name TEXT NOT NULL,
  current_snapshot_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS garage_vehicles_garage_idx ON garage_vehicles(garage_id);
CREATE INDEX IF NOT EXISTS garage_vehicles_variant_idx ON garage_vehicles(vehicle_variant_id);

CREATE TABLE IF NOT EXISTS vehicle_configurations (
  id TEXT PRIMARY KEY NOT NULL,
  garage_vehicle_id TEXT NOT NULL REFERENCES garage_vehicles(id),
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  state_json TEXT NOT NULL,
  confirmed_installed INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS vehicle_configurations_vehicle_idx ON vehicle_configurations(garage_vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_configurations_kind_idx ON vehicle_configurations(kind);

CREATE TABLE IF NOT EXISTS configuration_history (
  id TEXT PRIMARY KEY NOT NULL,
  configuration_id TEXT NOT NULL REFERENCES vehicle_configurations(id),
  version INTEGER NOT NULL,
  state_json TEXT NOT NULL,
  change_reason TEXT,
  actor_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS configuration_history_version_uq ON configuration_history(configuration_id, version);

CREATE TABLE IF NOT EXISTS build_items (
  id TEXT PRIMARY KEY NOT NULL,
  configuration_id TEXT NOT NULL REFERENCES vehicle_configurations(id),
  part_id TEXT REFERENCES parts(id),
  external_part_key TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  settings_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS build_items_configuration_idx ON build_items(configuration_id);
CREATE INDEX IF NOT EXISTS build_items_part_idx ON build_items(part_id);

CREATE TABLE IF NOT EXISTS simulation_models (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  domain TEXT NOT NULL,
  evidence_level TEXT NOT NULL,
  required_inputs_json TEXT NOT NULL,
  assumptions_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS simulation_models_version_uq ON simulation_models(name, version);

CREATE TABLE IF NOT EXISTS simulation_results (
  id TEXT PRIMARY KEY NOT NULL,
  configuration_id TEXT REFERENCES vehicle_configurations(id),
  model_id TEXT NOT NULL REFERENCES simulation_models(id),
  model_version INTEGER NOT NULL,
  inputs_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL,
  limitations_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS simulation_results_configuration_idx ON simulation_results(configuration_id);
CREATE INDEX IF NOT EXISTS simulation_results_model_idx ON simulation_results(model_id);

CREATE TABLE IF NOT EXISTS diagnostic_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  garage_vehicle_id TEXT REFERENCES garage_vehicles(id),
  configuration_id TEXT REFERENCES vehicle_configurations(id),
  source_kind TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  compatibility_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS diagnostic_snapshots_vehicle_idx ON diagnostic_snapshots(garage_vehicle_id);
CREATE INDEX IF NOT EXISTS diagnostic_snapshots_configuration_idx ON diagnostic_snapshots(configuration_id);
