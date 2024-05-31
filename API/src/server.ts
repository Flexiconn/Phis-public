import 'reflect-metadata';
import http from 'http';
import express from 'express';
import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/sqlite';
import { DataGatheringController, LinkGradingController } from './Controllers';
import { Brand, LinkObject } from './Entities';
import { OpenCSV } from './csvOpener';
import { parse as parsetld } from 'tldts';
import cron from 'node-cron';
import { GetNewPhishingLinks, CreateNewPair } from './DataGatherer';
 
//https://github.com/mikro-orm/express-ts-example-app/tree/master
export const DI = {} as {
  server: http.Server;
  orm: MikroORM,
  em: EntityManager,
  linkObject: EntityRepository<LinkObject>
  brand: EntityRepository<Brand>,
  phishingLinks: string[]
};


export const app = express();
const port = process.env.PORT || 3000;
export const init = (async () => {
  DI.orm = await MikroORM.init();
  //await DI.orm.schema.refreshDatabase()
  DI.phishingLinks = await GetNewPhishingLinks()
  DI.em = DI.orm.em;
  DI.linkObject = DI.orm.em.getRepository(LinkObject);
  DI.brand = DI.orm.em.getRepository(Brand);
  await ensure1000brandsexists()
  while(true){
    if(DI.phishingLinks.pop() == "https://www.metalurgicamunhoz.com.br/docu/Docusign/doc-new")
      break
  }
  while(true){
    if(DI.phishingLinks.length > 0){
      var item = DI.phishingLinks.pop()
      if(item != undefined){
        await CreateNewPair(item)
      }
    } else {
      break
    }
  }
})();

  
async function ensure1000brandsexists() : Promise<void>{
  const count = await DI.brand.count()
  console.log(count)
  if (count >= 1000){
    return Promise.resolve()
  }

  const brands = await OpenCSV(1000,2)
  const brandsFixed = await brands.map(x => {
    const parsedDomain = parsetld(x.Name)
    if(parsedDomain.domain == null)
        console.log(x)
    return parsedDomain.domainWithoutSuffix != null ? new Brand(parsedDomain.domainWithoutSuffix) : new Brand("")
  })
  await DI.brand.upsertMany(brandsFixed)
  await DI.em.flush()
}