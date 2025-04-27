import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import path from "node:path";

export default async function status(req, res) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: `${req.method} is not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

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

      return res.status(200).json(pendingMigrations);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    dbClient.end();
  }
}
