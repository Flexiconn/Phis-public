import { Options, SqliteDriver } from '@mikro-orm/sqlite';
//import { Options, MongoDriver} from "@mikro-orm/mongodb"
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { LinkObject, Brand } from './Entities';
const config: Options = {
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  driver: SqliteDriver,
  dbName: 'sqlite.db',
  // folder-based discovery setup, using common filename suffix
  entities: [LinkObject, Brand],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug mode to log SQL queries and discovery information
  debug: true,
  allowGlobalContext: true
};

export default config;