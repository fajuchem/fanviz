import { on } from "events";
import {
  FunctionDeclaration,
  Project,
  ReferencedSymbol,
  SyntaxKind,
  ts,
} from "ts-morph";

function getFileReferences(referencedSymbols: ReferencedSymbol[]) {
  const result: string[] = [];
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      result.push(reference.compilerObject.fileName);
    }
  }

  return [...new Set(result)];
}

enum DependencyType {
  Class = "Class",
  Function = "Function",
  Method = "Method",
  File = "File",
}

interface Node {
  name: string;
  value: number;
  type: DependencyType;
  children: Node[];
  parent?: any[];
}

export function getMethodDependencies(
  project: Project,
  symbol: string,
  fileOriginal: string
) {
  const file = `/home/fajuchem/dev/automatic-waffle/${fileOriginal}`;
  const result: Node = {
    name: symbol,
    value: 100,
    type: DependencyType.Method,
    children: [],
  };

  const sourceFile = project.getSourceFile(file);

  if (sourceFile) {
    const classes = sourceFile.getClasses();
    for (const cl of classes) {
      const method = cl.getMethod(symbol);
      if (method) {
        const referencedSymbols = method.findReferences();

        for (const referencedSymbol of referencedSymbols) {
          for (const reference of referencedSymbol.getReferences()) {
            const method = reference
              .getNode()
              .getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
            if (method) {
              const classDeclaration = reference
                .getNode()
                .getFirstAncestorByKind(SyntaxKind.ClassDeclaration);

              const className = classDeclaration?.getName();
              const methodName = method?.getName();
              if (className && methodName && methodName !== symbol) {
                const name = `${className}.${methodName}`;
                const children = getMethodDependencies(
                  project,
                  methodName,
                  method.getSourceFile().getFilePath()
                );

                result.children.push({
                  name,
                  value: 100,
                  type: DependencyType.Method,
                  children: children.children || [],
                });
                // console.log(methodName);
                console.log(children);
                console.log(classDeclaration?.getName(), method?.getName());
              }
            }
          }
        }
      }
    }
  }

  console.log(result);
  return result;
}

export function getDependencies(
  project: Project,
  symbol: string,
  fileOriginal: string
) {
  const file = `/home/fajuchem/dev/automatic-waffle/${fileOriginal}`;
  const sourceFiles = project.getSourceFiles();
  const result: Node = {
    name: symbol,
    value: 100,
    type: DependencyType.Function,
    children: [],
  };

  const sourceFile = project.getSourceFile(file);

  if (sourceFile) {
    const c = sourceFile.getFunction(symbol);

    if (c) {
      const referencedSymbols = c.findReferences();

      for (const referencedSymbol of referencedSymbols) {
        for (const reference of referencedSymbol.getReferences()) {
          const func = reference
            .getNode()
            .getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);

          if (func) {
            const identifier = func
              ?.getFirstChildByKind(SyntaxKind.Identifier)
              ?.getText();

            if (identifier && identifier !== c.getName()) {
              const children = getDependencies(project, identifier, file);
              result.children.push({
                name: identifier,
                value: 100,
                type: DependencyType.Function,
                children: children.children || [],
              });
            }
          } else {
            const call = reference
              .getNode()
              .getFirstAncestorByKind(SyntaxKind.CallExpression);

            if (call) {
              result.children.push({
                name: call.getSourceFile().getBaseName(),
                value: 100,
                type: DependencyType.File,
                children: [],
              });
            }
          }
        }
      }
      console.log(result);
    }
  }
  return result;
}

function getCall(node: ts.Node) {
  const result: ts.CallExpression[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (ts.isIdentifier(expression)) {
        result.push(node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(node);

  return result;
}

export function getData(
  pproject: Project,
  psymbol: string,
  pfileOriginal: string
) {
  const temp = {};
  const alreadyMapped = {};

  const inside = (project, symbol, fileOriginal) => {
    const result: Node = {
      name: psymbol,
      value: 100,
      type: DependencyType.Function,
      children: [],
    };
    const base = `/home/fajuchem/dev/automatic-waffle/`;
    const file = `/home/fajuchem/dev/automatic-waffle/${fileOriginal.replace(
      base,
      ""
    )}`;

    if (alreadyMapped[symbol]) {
      return;
    } else {
      alreadyMapped[symbol] = true;
    }

    const sourceFile = project.getSourceFile(file);

    for (let sourceFile of project.getSourceFiles()) {
      // console.log(sourceFile);
      const c = sourceFile.getFunction(symbol);

      if (c) {
        const referencedSymbols = c.findReferences();

        for (const referencedSymbol of referencedSymbols) {
          for (const reference of referencedSymbol.getReferences()) {
            const func = reference
              .getNode()
              .getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);

            if (func) {
              const identifier = func
                ?.getFirstChildByKind(SyntaxKind.Identifier)
                ?.getText();

              if (identifier && identifier !== c.getName()) {
                // console.log("-".repeat(20));
                // console.log(identifier, c.getName());
                // console.log("-".repeat(20));
                //console.log(identifier);
                //console.log("calls:", getCall(c.compilerNode));
                //console.log("-".repeat(20));

                const children = inside(
                  project,
                  identifier,
                  func.getSourceFile().getFilePath()
                );
                result.children.push({
                  name: identifier,
                  value: 100,
                  type: DependencyType.Function,
                  children: children?.children || [],
                });

                temp[`${identifier}:${symbol}`] = {
                  source: identifier,
                  target: symbol,
                };
                const calls = getCall(c.compilerNode);

                console.log("-".repeat(20));
                calls.forEach((f) => {
                  const target = f.expression.getText();
                  const file = f.getSourceFile().fileName;
                  console.log(target);
                  console.log(inside(project, target, file));
                  temp[`${symbol}:${target}`] = {
                    source: symbol,
                    target: target,
                  };
                });
                console.log("-".repeat(20));
              }
            } else {
              const call = reference
                .getNode()
                .getFirstAncestorByKind(SyntaxKind.CallExpression);

              if (call) {
                result.children.push({
                  name: call.getSourceFile().getBaseName(),
                  value: 100,
                  type: DependencyType.File,
                  children: [],
                });
                temp[`${call.getSourceFile().getBaseName()}:${symbol}`] = {
                  source: call.getSourceFile().getBaseName(),
                  target: symbol,
                };
              }
            }
          }
        }
      }
    }
    return result;
  };

  inside(pproject, psymbol, pfileOriginal);

  const fanIn = {};
  const fanOut = {};

  Object.keys(temp).forEach((key) => {
    const f = temp[key];
    fanIn[f.target] = (fanIn[f.target] || 0) + 1;
    fanOut[f.source] = (fanOut[f.source] || 0) + 1;
  });

  const graph = Object.values(temp);
  const meta = { fanIn, fanOut, selected: psymbol };

  return { graph, meta };
}
