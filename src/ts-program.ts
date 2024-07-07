import { FileChangeInfo, watch } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";

const DIRECTORY_TO_WATCH = "src-to-compile";
const ENTRYPOINTS_TO_COMPILE = [join(DIRECTORY_TO_WATCH, "main.ts")];

run();

async function run() {
  const run = createRunCompilationWithDelay(2000);
  for await (const watchRes of watch(DIRECTORY_TO_WATCH)) {
    run(watchRes);
  }
}

function createRunCompilationWithDelay(delayInMs: number) {
  let timeout: NodeJS.Timeout | null = null;

  return (watchRes: FileChangeInfo<string>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      const performaceMarkName = "emit start ${timeout}";
      performance.mark(performaceMarkName);
      console.log(`${watchRes.filename} change - running compilation...`);
      emit();
      const compilationTime = performance.measure(performaceMarkName).duration;
      performance.clearMarks(performaceMarkName);
      console.log(`Done in ${compilationTime / 1000}s`);
    }, delayInMs);
  };
}

function emit() {
  const program = createProgram();
  const emitedResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitedResult.diagnostics);

  for (const diagnostic of allDiagnostics) {
    if (diagnostic.file && diagnostic.start) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.error(
        `${diagnostic.file.fileName} ${line + 1}, ${character + 1}: ${message}`
      );
    } else {
      console.error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  }
}

function createProgram() {
  return ts.createProgram(ENTRYPOINTS_TO_COMPILE, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.NodeNext,
    outDir: "build-src-to-compile",
  });
}
