import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { GenerateValidLinkObject } from '../LinkObjectGenerator'
import { DI } from '../server';
import { Brand, LinkObject } from '../Entities';
import { OpenCSV } from '../csvOpener';
import { parse as parsetld } from 'tldts';
import { CreateNewPair } from '../DataGatherer';

const router = Router();

router.get('/', async(req: Request, res: Response) => {
})

router.post('/', async(req: Request, res: Response) => {
    await CreateNewPair(req.body[0])
    res.status(200).send()
})



export const LinkGradingController = router