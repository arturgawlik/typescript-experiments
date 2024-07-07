import { watch } from "node:fs/promises";
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
function createRunCompilationWithDelay(delayInMs) {
    let timeout = null;
    return (watchRes) => {
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
            const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.error(`${diagnostic.file.fileName} ${line + 1}, ${character + 1}: ${message}`);
        }
        else {
            console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHMtcHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90cy1wcm9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0IsS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDekQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqQyxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFNUIsTUFBTSxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUM1QyxNQUFNLHNCQUFzQixHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFFckUsR0FBRyxFQUFFLENBQUM7QUFFTixLQUFLLFVBQVUsR0FBRztJQUNoQixNQUFNLEdBQUcsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxJQUFJLEtBQUssRUFBRSxNQUFNLFFBQVEsSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1FBQ3ZELEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoQixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsNkJBQTZCLENBQUMsU0FBaUI7SUFDdEQsSUFBSSxPQUFPLEdBQTBCLElBQUksQ0FBQztJQUUxQyxPQUFPLENBQUMsUUFBZ0MsRUFBRSxFQUFFO1FBQzFDLElBQUksT0FBTyxFQUFFLENBQUM7WUFDWixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVELE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ3hCLE1BQU0sa0JBQWtCLEdBQUcsdUJBQXVCLENBQUM7WUFDbkQsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxrQ0FBa0MsQ0FBQyxDQUFDO1lBQ3BFLElBQUksRUFBRSxDQUFDO1lBQ1AsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUN6RSxXQUFXLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1gsTUFBTSxPQUFPLEdBQUcsYUFBYSxFQUFFLENBQUM7SUFDaEMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXBDLE1BQU0sY0FBYyxHQUFHLEVBQUU7U0FDdEIscUJBQXFCLENBQUMsT0FBTyxDQUFDO1NBQzlCLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFcEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN4QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3hDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLDZCQUE2QixDQUMxRCxVQUFVLENBQUMsSUFBSSxFQUNmLFVBQVUsQ0FBQyxLQUFLLENBQ2pCLENBQUM7WUFDRixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsNEJBQTRCLENBQzdDLFVBQVUsQ0FBQyxXQUFXLEVBQ3RCLElBQUksQ0FDTCxDQUFDO1lBQ0YsT0FBTyxDQUFDLEtBQUssQ0FDWCxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssU0FBUyxHQUFHLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FDeEUsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FDWCxFQUFFLENBQUMsNEJBQTRCLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FDOUQsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYTtJQUNwQixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEVBQUU7UUFDOUMsYUFBYSxFQUFFLElBQUk7UUFDbkIsYUFBYSxFQUFFLElBQUk7UUFDbkIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTTtRQUM5QixNQUFNLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRO1FBQzlCLE1BQU0sRUFBRSxzQkFBc0I7S0FDL0IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyJ9