import { join } from "node:path";
import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import path from "node:path";

export default async function status(req, res) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: false,
    dir: path.resolve("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
    verbose: true,
  };

  if (req.method === "POST") {
    const migratedMigrations = await migrationRunner(defaultMigrationOptions);

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations);
    }

    return res.status(200).json(migratedMigrations);
  }

  if (req.method === "GET") {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
    });

    dbClient.end();

    return res.status(200).json(pendingMigrations);
  }

  dbClient.end();

  return res.status(405).end();
}
