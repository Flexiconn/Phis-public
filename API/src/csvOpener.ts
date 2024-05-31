import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';
import { Brand } from "./Entities";

type format = {
    Rank : number
    Domain : string
    OpenPageRank : number
}

export async function OpenCSV(index : number, startAt : number) : Promise<Brand[]> {
    const csvFilePath = path.resolve(__dirname, './topmilliondomains.csv');
    const headers = ["Rank","Domain","Open Page Rank"];
  
  //const fileContent = await fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  var brands : Brand[] = []
  
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({
        delimiter: ',',
        columns: headers,
        fromLine: startAt,
        to: startAt + index
    }));
  for await (const record of parser) {
    // Work with each record
    brands.push(new Brand(record.Domain));
  }

  /*parse(fileContent, {
    delimiter: ',',
    columns: headers,
    fromLine: startAt
    
  }, (error, result: format[]) => {
    if (error) {
      console.error(error);
    }
    result.forEach(element => {
        console.log()
        brands.push(new Brand(element.Domain))
    });
})*/
    return brands
}