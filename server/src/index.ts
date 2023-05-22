import express, { Request, Response } from "express";
import cors from "cors";
import { Project } from "ts-morph";
import { getDependencies, getMethodDependencies } from "./dependency";

const app = express();
const port = 3030;

app.use(cors());

const folderPath = "/home/fajuchem/dev/automatic-waffle/";
const project = new Project();

project.addSourceFilesAtPaths([
  `${folderPath}/**/*.ts`,
  `!${folderPath}/node_modules/**/*`,
]);

getMethodDependencies(
  project,
  "criar",
  //"/home/fajuchem/dev/automatic-waffle/src/laboratorio/laboratorio.servico.ts"
  "src/laboratorio/laboratorio.servico.ts"
);

app.get("/dependecies", (req: Request, res: Response) => {
  const symbol = req.query.symbol as string;
  const file = req.query.file as string;

  const dependecies = getDependencies(project, symbol, file);
  console.log('deps', dependecies);
  if (dependecies.children.length === 0) {
    const methodDependencies = getMethodDependencies(project, symbol, file);
    res.json(methodDependencies);
  }
  res.json(dependecies);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
