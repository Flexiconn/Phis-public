import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { GenerateValidLinkObject } from '../LinkObjectGenerator'
import { DI } from '../server';
import { Brand, LinkObject } from '../Entities';
import { GetNewDataCustom } from '../DataGatherer'

const router = Router();



export const DataGatheringController = router