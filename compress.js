import { transform } from "esbuild";
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { globby } from "globby";

export default function compression() {
    return {
        name: "noctura-compress",
        hooks: {
            'astro:build:done': async({ dir }) => {
                const files = await globby([`./dist/**/*.{css,js}`, "!./dist/sw"], {
                    expandDirectories: true
                });
                files.map(async (file) => {
                    console.log(file)
                    const input = await readFile(file);
                    let output;

                    if (file.endsWith("css")) {
                        try {
                            output = (await transform(input, {
                                minify: true,
                                minifyWhitespace: true,
                                loader: "css"
                            })).code
                        } catch (err) {
                            console.log("failed to build: " + file);
                        }
                    } else if (file.endsWith("js")) {
                        try {
                            output = (await transform(input, {
                                minify: true,
                                minifyWhitespace: true,
                                keepNames: true,
                                loader: "js"
                            })).code
                        } catch (err) {
                            console.log("failed to build: " + file);
                        }
                    }

                    await writeFile(file, output);
                })
            }
        }
    }
}