import { Router } from "express";
import { cityController } from "./city.controller";

const router = Router();

router.get("/", cityController.getCities);

export const citiesRouter = router;
