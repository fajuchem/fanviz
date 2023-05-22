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

  for (const sourceFile of sourceFiles) {
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
