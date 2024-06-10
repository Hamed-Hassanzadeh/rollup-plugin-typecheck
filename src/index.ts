"use strict";
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import path from 'node:path';
import { exit } from 'node:process';
import type { Diagnostic } from 'typescript';
import { RollupPluginTypecheck } from '../types/types';

const colours = {
  fg: {
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      white: "\x1b[37m",
  },
  bg: {
      black: "\x1b[40m",
      red: "\x1b[41m",
  }
};

function reportDiagnostics(diagnostics: (Diagnostic | undefined)[]) { 
  const files: string[] = [];
  diagnostics.forEach(diagnostic => {
      const errArray = [colours.bg.red, colours.fg.white, 'Error'];
      if (diagnostic) {
        if (diagnostic.file) {
            const { file, start } = diagnostic;
            if (start) {
              const where = file.getLineAndCharacterOfPosition(start);
              errArray.push(
                colours.bg.black,
                colours.fg.blue,
                file.fileName,
                colours.fg.green,
                where.line.toString(),
                colours.fg.yellow,
                (where.character + 1).toString()
              );
              files.push(file.fileName);
            }
        }
        errArray.push(
          colours.bg.black,
          colours.fg.white,
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        );
      }
      console.log(errArray.join(' '));
  });
  return [...new Set(files)].length;
}

function readConfigFile(configFileName: string) { 
  // Read config file
  const { config, error } = ts.readConfigFile(configFileName, (path) => readFileSync(path, 'utf8'));
  if (error) {
    console.log(reportDiagnostics([error]));
    exit(1);
  } else {
    // force noEmit
    config.compilerOptions.noEmit = true;
    config.compilerOptions.pretty = true;

    // Extract config information
    const configParseResult = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(configFileName)
    );
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        exit(1);
    }
    return configParseResult;
  }
}


function compile(configFileName: string) {
  // Extract configuration from config file
  const config = readConfigFile(configFileName);

  // Compile
  const program = ts.createProgram(config.fileNames, config.options);
  const emitResult = program.emit();

  // Report errors
  const report = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
 const filesCount =  reportDiagnostics(report);

  return { numberOfErrors: report.length, filesCount };
}

let isError = false;

export default function rollupPluginTypecheck ({ tsconfig, shouldExitOnError }: RollupPluginTypecheck) {
	return {
		name: 'rollup-plugin-typecheck',
		resolveId: {
			order: 'pre',
			handler() {
        if (!isError) {
          const { numberOfErrors, filesCount } = compile(tsconfig);
          if (numberOfErrors > 0) {
              isError = true;
              console.log(`${numberOfErrors} errors in ${filesCount} file(s)`);
              if (shouldExitOnError) exit(1);
          }
        }
        return null;
      }
    }
	};
}