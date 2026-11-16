import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contracts = resolve(root, "packages/contracts");
const read = (path) => readFileSync(resolve(contracts, path), "utf8");
const json = (path) => JSON.parse(read(path));
const failures = [];
const fail = (message) => failures.push(message);

const version = read("VERSION").trim();
const packageJson = json("package.json");
const canonical = json("schemas/vision-ai.schema.json");
const realtimeSchema = json("schemas/realtime-envelope.schema.json");
const tsModels = read("typescript/index.ts");
const pythonModels = read("python/vision_contracts/models.py");
const openapi = read("openapi/vision-ai.openapi.yaml");
const asyncapi = read("asyncapi/vision-ai.asyncapi.yaml");

const versionChecks = [
  [packageJson.version === version, "package.json"],
  [canonical.$id?.includes(`/${version}/`), "JSON Schema"],
  [realtimeSchema.properties?.contractVersion?.const === version, "sobre WebSocket"],
  [tsModels.includes(`CONTRACT_VERSION = "${version}"`), "TypeScript"],
  [pythonModels.includes(`CONTRACT_VERSION = "${version}"`), "Python"],
  [openapi.includes(`version: ${version}`), "OpenAPI"],
  [asyncapi.includes(`version: ${version}`), "AsyncAPI"],
];
for (const [valid, target] of versionChecks) if (!valid) fail(`Versión desalineada en ${target}.`);

const expectedDefinitions = [
  "boundingBox", "camera", "session", "detection", "event", "review", "rule",
  "telemetry", "report",
];
for (const definition of expectedDefinitions) {
  if (!canonical.$defs?.[definition]) fail(`Falta $defs.${definition} en el esquema canónico.`);
}

for (const file of readdirSync(resolve(contracts, "schemas")).filter((name) => name.endsWith(".json"))) {
  const schema = json(`schemas/${file}`);
  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(`${file} no declara JSON Schema 2020-12.`);
  if (!schema.$id) fail(`${file} no tiene $id.`);
}

const resolveReference = (reference) => reference.startsWith("#/$defs/")
  ? canonical.$defs[reference.slice("#/$defs/".length)]
  : null;

function validate(value, schema, path = "$") {
  if (!schema) return fail(`${path}: esquema inexistente.`);
  if (schema.$ref) {
    const target = resolveReference(schema.$ref);
    if (target) validate(value, target, path);
    return;
  }
  if (schema.oneOf) {
    if (value === null && schema.oneOf.some((item) => item.type === "null")) return;
    validate(value, schema.oneOf.find((item) => item.type !== "null"), path);
    return;
  }
  const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (schema.type) {
    const actual = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value;
    const numberCompatible = actual === "integer" && allowedTypes.includes("number");
    if (!allowedTypes.includes(actual) && !numberCompatible) return fail(`${path}: se esperaba ${allowedTypes.join("/")} y llegó ${actual}.`);
  }
  if (schema.enum && !schema.enum.includes(value)) fail(`${path}: valor fuera del enum (${value}).`);
  if (schema.const !== undefined && value !== schema.const) fail(`${path}: se esperaba ${schema.const}.`);
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) fail(`${path}: menor que ${schema.minimum}.`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(`${path}: mayor que ${schema.maximum}.`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) fail(`${path}: debe ser mayor que ${schema.exclusiveMinimum}.`);
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail(`${path}: texto demasiado corto.`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) fail(`${path}: texto demasiado largo.`);
    if (schema.format === "uuid" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) fail(`${path}: UUID inválido.`);
    if (schema.format === "date-time" && Number.isNaN(Date.parse(value))) fail(`${path}: fecha y hora inválidas.`);
    if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`${path}: fecha inválida.`);
    if (schema.format === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) fail(`${path}: correo inválido.`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`${path}: faltan elementos.`);
    if (schema.uniqueItems && new Set(value.map(JSON.stringify)).size !== value.length) fail(`${path}: contiene duplicados.`);
    if (schema.items) value.forEach((item, index) => validate(item, schema.items, `${path}[${index}]`));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) if (!(key in value)) fail(`${path}: falta ${key}.`);
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!(key in (schema.properties ?? {}))) fail(`${path}: propiedad no permitida ${key}.`);
    }
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (key in value) validate(value[key], child, `${path}.${key}`);
  }
}

for (const [file, definition] of Object.entries({
  "camera.json": "camera", "event.json": "event", "telemetry.json": "telemetry", "report.json": "report",
})) validate(json(`examples/${file}`), canonical.$defs[definition], `examples/${file}`);

const envelope = json("examples/realtime-event-created.json");
validate(envelope, realtimeSchema, "examples/realtime-event-created.json");
validate(envelope.payload, canonical.$defs.event, "examples/realtime-event-created.json.payload");

const requiredOperations = [
  "getHealth", "listCameras", "createCamera", "getCamera", "updateCamera", "deleteCamera",
  "listSessions", "startSession", "stopSession", "listEvents", "getEvent", "reviewEvent",
  "listRules", "createRule", "getLatestTelemetry", "listReports", "generateReport",
];
for (const operation of requiredOperations) if (!openapi.includes(`operationId: ${operation}`)) fail(`OpenAPI no contiene ${operation}.`);

const requiredMessages = [
  "event.created", "event.updated", "telemetry.updated", "camera.status_changed",
  "session.status_changed", "report.ready",
];
for (const message of requiredMessages) if (!asyncapi.includes(`name: ${message}`)) fail(`AsyncAPI no contiene ${message}.`);

for (const path of ["openapi/vision-ai.openapi.yaml", "asyncapi/vision-ai.asyncapi.yaml", ...readdirSync(resolve(contracts, "examples")).map((file) => `examples/${file}`)]) {
  if (/rtsp:\/\/[^\s/:]+:[^\s/@]+@/i.test(read(path))) fail(`${path} contiene credenciales RTSP.`);
}

if (failures.length) {
  console.error("Los contratos no son válidos:\n");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Contratos válidos: versión ${version}, ${expectedDefinitions.length} entidades, ${requiredOperations.length} operaciones REST y ${requiredMessages.length} mensajes WebSocket.`);
