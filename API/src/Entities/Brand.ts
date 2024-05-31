import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Brand{
    @PrimaryKey()
    Name! : string

    constructor(name : string){
        this.Name = name
    }
}