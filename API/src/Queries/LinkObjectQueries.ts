import { LinkObject } from "../Entities/LinkObject";
import { MikroORM} from "@mikro-orm/core"
export async function Insert(obj : LinkObject){
    const em = (await MikroORM.init()).em
    await em.insert(obj)
}

export async function FindOne(url:string) {
    const em = (await MikroORM.init()).em
    return await em.getRepository("LinkObject").findOne(url)
}

export async function Exists(url:string) {
    
}