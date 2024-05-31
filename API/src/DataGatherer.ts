import { Brand, LinkObject } from "./Entities"
import { GenerateValidLinkObject } from "./LinkObjectGenerator"
import { OpenCSV } from "./csvOpener"
import { DI } from "./server"
import { parse } from "url"
import { parse as parsetld } from 'tldts';

export async function GetNewPhishingLinks(){
    const url = "https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-ACTIVE-today.txt"
    const req = await fetch(url)

    if(!req.ok){
        throw new Error("Could not fetch data from endpoint")
    }

    const res = await req.text()
    return res.split("\n")
}


export async function GetNewDataCustom(urls : string[]) {
    var newLinks = urls

    const resolvedPhishingLinks = await Promise.all(newLinks.map(x => GenerateValidLinkObject(x, true)))
    
    const safeLinks = await OpenCSV(resolvedPhishingLinks.length, 1)
    const resolvedSafeLinks = await Promise.all(safeLinks.map(x => GenerateValidLinkObject(x.Name, false)))

    
    await DI.brand.insertMany(safeLinks)
    await DI.linkObject.insertMany(resolvedPhishingLinks)
    await DI.linkObject.insertMany(resolvedSafeLinks)
    await DI.em.flush()
}

export async function CreateNewPair(url:string) {
    var resolvedPhishingLinks : LinkObject
    try{
        resolvedPhishingLinks = await GenerateValidLinkObject(url, true)
        await DI.linkObject.upsert(resolvedPhishingLinks)
        await DI.em.flush()
    }catch(err){
        console.log(err)
        return
    }
    var startRow = await DI.linkObject.count({ status: 0})
    console.log(startRow)
    var safeLinks : Brand[] = []
    try{
        safeLinks = await OpenCSV(1, startRow + 2)
    }catch(err){
        console.log(err)
        return 
    }
    console.log(safeLinks[0])
    var resolvedSafeLinks : LinkObject
    try{
        resolvedSafeLinks = await GenerateValidLinkObject(`https://${safeLinks[0].Name}/`, false)
    }catch(err){
        console.log(err)
        return
    }
    const parsedDomain = parsetld(safeLinks[0].Name)
    var brand = parsedDomain.domainWithoutSuffix != null ? new Brand(parsedDomain.domainWithoutSuffix) : new Brand("")
    console.log(`Safelink: ${safeLinks[0].Name}, Malicious link: ${resolvedPhishingLinks.url}`)
    await DI.brand.upsert(brand)
    console.log(resolvedPhishingLinks)
    await DI.linkObject.upsert(resolvedSafeLinks)
    await DI.em.flush()
}