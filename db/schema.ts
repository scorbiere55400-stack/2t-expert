import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
};

export const manufacturers = sqliteTable("manufacturers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  country: text("country"),
  website: text("website"),
  ...timestamps,
}, (t) => [
  uniqueIndex("manufacturers_slug_uq").on(t.slug),
]);

export const vehicleModels = sqliteTable("vehicle_models", {
  id: text("id").primaryKey(),
  manufacturerId: text("manufacturer_id").notNull().references(() => manufacturers.id),
  name: text("name").notNull(),
  family: text("family"),
  ...timestamps,
}, (t) => [
  index("vehicle_models_manufacturer_idx").on(t.manufacturerId),
  index("vehicle_models_name_idx").on(t.name),
]);

export const vehicleVariants = sqliteTable("vehicle_variants", {
  id: text("id").primaryKey(),
  modelId: text("model_id").notNull().references(() => vehicleModels.id),
  yearFrom: integer("year_from"),
  yearTo: integer("year_to"),
  market: text("market"),
  trim: text("trim"),
  displacementCc: real("displacement_cc"),
  ...timestamps,
}, (t) => [
  index("vehicle_variants_model_idx").on(t.modelId),
  index("vehicle_variants_year_idx").on(t.yearFrom, t.yearTo),
]);

export const engines = sqliteTable("engines", {
  id: text("id").primaryKey(),
  maker: text("maker"),
  family: text("family"),
  code: text("code").notNull(),
  cycle: integer("cycle").notNull().default(2),
  displacementCc: real("displacement_cc"),
  boreMm: real("bore_mm"),
  strokeMm: real("stroke_mm"),
  specsJson: text("specs_json", { mode: "json" }),
  ...timestamps,
}, (t) => [
  uniqueIndex("engines_code_uq").on(t.code),
]);

export const vehicleEngines = sqliteTable("vehicle_engines", {
  id: text("id").primaryKey(),
  vehicleVariantId: text("vehicle_variant_id").notNull().references(() => vehicleVariants.id),
  engineId: text("engine_id").notNull().references(() => engines.id),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  uniqueIndex("vehicle_engines_pair_uq").on(t.vehicleVariantId, t.engineId),
]);

export const assemblies = sqliteTable("assemblies", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  code: text("code").notNull(),
  name: text("name").notNull(),
  systemType: text("system_type"),
  engineId: text("engine_id").references(() => engines.id),
  ...timestamps,
}, (t) => [
  index("assemblies_parent_idx").on(t.parentId),
  index("assemblies_engine_idx").on(t.engineId),
]);

export const parts = sqliteTable("parts", {
  id: text("id").primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  partType: text("part_type"),
  specsJson: text("specs_json", { mode: "json" }),
  ...timestamps,
}, (t) => [
  index("parts_name_idx").on(t.canonicalName),
]);

export const oemRefs = sqliteTable("oem_refs", {
  id: text("id").primaryKey(),
  manufacturerId: text("manufacturer_id").notNull().references(() => manufacturers.id),
  reference: text("reference").notNull(),
  normalizedRef: text("normalized_ref").notNull(),
  status: text("status").notNull().default("active"),
  ...timestamps,
}, (t) => [
  index("oem_refs_normalized_idx").on(t.normalizedRef),
  uniqueIndex("oem_refs_brand_ref_uq").on(t.manufacturerId, t.normalizedRef),
]);

export const partOemRefs = sqliteTable("part_oem_refs", {
  id: text("id").primaryKey(),
  partId: text("part_id").notNull().references(() => parts.id),
  oemRefId: text("oem_ref_id").notNull().references(() => oemRefs.id),
  qty: integer("qty").notNull().default(1),
  assemblyId: text("assembly_id").references(() => assemblies.id),
  ...timestamps,
}, (t) => [
  uniqueIndex("part_oem_refs_pair_uq").on(t.partId, t.oemRefId, t.assemblyId),
]);

export const supersessions = sqliteTable("supersessions", {
  id: text("id").primaryKey(),
  oldOemRefId: text("old_oem_ref_id").notNull().references(() => oemRefs.id),
  newOemRefId: text("new_oem_ref_id").notNull().references(() => oemRefs.id),
  validFrom: text("valid_from"),
  sourceId: text("source_id"),
  ...timestamps,
}, (t) => [
  uniqueIndex("supersessions_pair_uq").on(t.oldOemRefId, t.newOemRefId),
]);

export const fitments = sqliteTable("fitments", {
  id: text("id").primaryKey(),
  partId: text("part_id").references(() => parts.id),
  oemRefId: text("oem_ref_id").references(() => oemRefs.id),
  vehicleVariantId: text("vehicle_variant_id").references(() => vehicleVariants.id),
  engineId: text("engine_id").references(() => engines.id),
  confidence: text("confidence").notNull().default("unverified"),
  sourceId: text("source_id"),
  evidenceId: text("evidence_id"),
  ...timestamps,
}, (t) => [
  index("fitments_part_idx").on(t.partId),
  index("fitments_vehicle_idx").on(t.vehicleVariantId),
  index("fitments_engine_idx").on(t.engineId),
]);

export const rights = sqliteTable("rights", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  license: text("license"),
  commercialUse: integer("commercial_use", { mode: "boolean" }).notNull().default(false),
  derivativeUse: integer("derivative_use", { mode: "boolean" }).notNull().default(false),
  territory: text("territory"),
  expiresAt: text("expires_at"),
  proofUri: text("proof_uri"),
  ...timestamps,
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  publisher: text("publisher").notNull(),
  url: text("url"),
  retrievedAt: text("retrieved_at").notNull(),
  ...timestamps,
});

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  sourceId: text("source_id").notNull().references(() => sources.id),
  rightsId: text("rights_id").references(() => rights.id),
  note: text("note"),
  verifiedAt: text("verified_at"),
  ...timestamps,
}, (t) => [
  index("evidence_entity_idx").on(t.entityType, t.entityId),
]);

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  owner: text("owner"),
  type: text("type").notNull(),
  uri: text("uri").notNull(),
  rightsId: text("rights_id").notNull().references(() => rights.id),
  checksum: text("checksum").notNull(),
  version: integer("version").notNull().default(1),
  ...timestamps,
}, (t) => [
  uniqueIndex("media_assets_checksum_uq").on(t.checksum),
]);

export const diagrams = sqliteTable("diagrams", {
  id: text("id").primaryKey(),
  assemblyId: text("assembly_id").notNull().references(() => assemblies.id),
  mediaAssetId: text("media_asset_id").notNull().references(() => mediaAssets.id),
  kind: text("kind").notNull(),
  ...timestamps,
});

export const diagramNodes = sqliteTable("diagram_nodes", {
  id: text("id").primaryKey(),
  diagramId: text("diagram_id").notNull().references(() => diagrams.id),
  partId: text("part_id").notNull().references(() => parts.id),
  nodeKey: text("node_key").notNull(),
  transformJson: text("transform_json", { mode: "json" }),
  ...timestamps,
}, (t) => [
  uniqueIndex("diagram_nodes_node_uq").on(t.diagramId, t.nodeKey),
]);

export const merchants = sqliteTable("merchants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  programType: text("program_type"),
  network: text("network"),
  status: text("status").notNull().default("pending"),
  ...timestamps,
});

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").notNull().references(() => merchants.id),
  partId: text("part_id").notNull().references(() => parts.id),
  sku: text("sku").notNull(),
  price: real("price"),
  currency: text("currency").notNull().default("EUR"),
  stock: text("stock"),
  deeplink: text("deeplink"),
  updatedAt: text("updated_at").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (t) => [
  uniqueIndex("offers_merchant_sku_uq").on(t.merchantId, t.sku),
  index("offers_part_idx").on(t.partId),
]);

export const affiliateClicks = sqliteTable("affiliate_clicks", {
  clickId: text("click_id").primaryKey(),
  merchantId: text("merchant_id").notNull().references(() => merchants.id),
  partId: text("part_id").notNull().references(() => parts.id),
  sessionId: text("session_id"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const conversions = sqliteTable("conversions", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").notNull().references(() => merchants.id),
  externalOrderId: text("external_order_id").notNull(),
  clickId: text("click_id").references(() => affiliateClicks.clickId),
  amount: real("amount"),
  commission: real("commission"),
  currency: text("currency").default("EUR"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (t) => [
  uniqueIndex("conversions_merchant_order_uq").on(t.merchantId, t.externalOrderId),
]);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  beforeJson: text("before_json", { mode: "json" }),
  afterJson: text("after_json", { mode: "json" }),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const fitmentFeedback = sqliteTable("fitment_feedback", {
  id: text("id").primaryKey(),
  partId: text("part_id").references(() => parts.id),
  vehicleVariantId: text("vehicle_variant_id").references(() => vehicleVariants.id),
  reporterId: text("reporter_id"),
  status: text("status").notNull().default("pending"),
  note: text("note"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  reviewedAt: text("reviewed_at"),
});


export const userGarages = sqliteTable("user_garages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull().default("Mon garage"),
  ...timestamps,
}, (t) => [
  index("user_garages_user_idx").on(t.userId),
]);

export const garageVehicles = sqliteTable("garage_vehicles", {
  id: text("id").primaryKey(),
  garageId: text("garage_id").notNull().references(() => userGarages.id),
  vehicleVariantId: text("vehicle_variant_id").references(() => vehicleVariants.id),
  externalVehicleKey: text("external_vehicle_key"),
  displayName: text("display_name").notNull(),
  currentSnapshotId: text("current_snapshot_id"),
  ...timestamps,
}, (t) => [
  index("garage_vehicles_garage_idx").on(t.garageId),
  index("garage_vehicles_variant_idx").on(t.vehicleVariantId),
]);

export const vehicleConfigurations = sqliteTable("vehicle_configurations", {
  id: text("id").primaryKey(),
  garageVehicleId: text("garage_vehicle_id").notNull().references(() => garageVehicles.id),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  stateJson: text("state_json", { mode: "json" }).notNull(),
  confirmedInstalled: integer("confirmed_installed", { mode: "boolean" }).notNull().default(false),
  version: integer("version").notNull().default(1),
  ...timestamps,
}, (t) => [
  index("vehicle_configurations_vehicle_idx").on(t.garageVehicleId),
  index("vehicle_configurations_kind_idx").on(t.kind),
]);

export const configurationHistory = sqliteTable("configuration_history", {
  id: text("id").primaryKey(),
  configurationId: text("configuration_id").notNull().references(() => vehicleConfigurations.id),
  version: integer("version").notNull(),
  stateJson: text("state_json", { mode: "json" }).notNull(),
  changeReason: text("change_reason"),
  actorId: text("actor_id"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (t) => [
  uniqueIndex("configuration_history_version_uq").on(t.configurationId, t.version),
]);

export const buildItems = sqliteTable("build_items", {
  id: text("id").primaryKey(),
  configurationId: text("configuration_id").notNull().references(() => vehicleConfigurations.id),
  partId: text("part_id").references(() => parts.id),
  externalPartKey: text("external_part_key"),
  category: text("category").notNull(),
  status: text("status").notNull(),
  settingsJson: text("settings_json", { mode: "json" }),
  ...timestamps,
}, (t) => [
  index("build_items_configuration_idx").on(t.configurationId),
  index("build_items_part_idx").on(t.partId),
]);

export const simulationModels = sqliteTable("simulation_models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  version: integer("version").notNull(),
  domain: text("domain").notNull(),
  evidenceLevel: text("evidence_level").notNull(),
  requiredInputsJson: text("required_inputs_json", { mode: "json" }).notNull(),
  assumptionsJson: text("assumptions_json", { mode: "json" }).notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (t) => [
  uniqueIndex("simulation_models_version_uq").on(t.name, t.version),
]);

export const simulationResults = sqliteTable("simulation_results", {
  id: text("id").primaryKey(),
  configurationId: text("configuration_id").references(() => vehicleConfigurations.id),
  modelId: text("model_id").notNull().references(() => simulationModels.id),
  modelVersion: integer("model_version").notNull(),
  inputsJson: text("inputs_json", { mode: "json" }).notNull(),
  outputsJson: text("outputs_json", { mode: "json" }).notNull(),
  limitationsJson: text("limitations_json", { mode: "json" }),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (t) => [
  index("simulation_results_configuration_idx").on(t.configurationId),
  index("simulation_results_model_idx").on(t.modelId),
]);

export const diagnosticSnapshots = sqliteTable("diagnostic_snapshots", {
  id: text("id").primaryKey(),
  garageVehicleId: text("garage_vehicle_id").references(() => garageVehicles.id),
  configurationId: text("configuration_id").references(() => vehicleConfigurations.id),
  sourceKind: text("source_kind").notNull(),
  snapshotJson: text("snapshot_json", { mode: "json" }).notNull(),
  compatibilityJson: text("compatibility_json", { mode: "json" }),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
}, (t) => [
  index("diagnostic_snapshots_vehicle_idx").on(t.garageVehicleId),
  index("diagnostic_snapshots_configuration_idx").on(t.configurationId),
]);
