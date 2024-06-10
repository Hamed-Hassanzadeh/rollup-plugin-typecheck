import { exec } from 'node:child_process';
import pkg from '../package.json' with { type: "json" };

const { version, name } = pkg;

console.log(`\nPreparing to ${process.env.ACTION} ${name}-${version} ...\n`);

exec(
  `mv README.md temp.README.md &&` +                                                                                             // Rename README.md to temp.README.md. This is because we do not want to include this readme file in the package.
  `mv README_public.md README.md &&` +                                                                                           // Rename README_public.md to README.md. This is the README.md file we want to include in the package.
  `yarn build &&` +                                                                                                              // Build the project
  `yarn ${process.env.ACTION} ${process.env.ACTION === 'publish' ? '--access public' : ''} && npx clean-package restore &&` +    // Pack or Publish the package based on the env variable. Then restore the package.json to its original version (before the "prepack" npm script is executed)
  `rm -rf lib &&` +                                                                                                              // Remove the lib folder created in the build stage.
  `mv README.md README_public.md &&` +                                                                                           // Rename README.md back to README_public.md.
  `mv temp.README.md README.md`                                                                                                  // Restore the original project's README.md file.
, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`${process.env.ACTION}, success.`);
  }
});