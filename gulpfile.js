const { src, dest, series, watch } = require(`gulp`);
const sass = require(`gulp-sass`);
const babel = require(`gulp-babel`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const jsCompressor = require(`gulp-uglify`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
let browserChoice = `default`;

async function safari () {
    browserChoice = `safari`;
}

async function firefox () {
    browserChoice = `firefox`;
}

async function chrome () {
    browserChoice = `google chrome`;
}

async function opera () {
    browserChoice = `opera`;
}

async function edge () {
    browserChoice = `microsoft-edge`;
}

async function allBrowsers () {
    browserChoice = [
        `safari`,
        `firefox`,
        `google chrome`,
        `opera`,
        `microsoft-edge`
    ];
}

let validateHTML = () => {
    return src([
        `./*.html`,
        `./**/*.html`])
        .pipe(htmlValidator());
};

let compressHTML = () => {
    return src([`./*.html`,`./**/*.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`./compressedHTML/html`));
};

let compileCSSForDev = () => {
    return src(`./sass/style.scss`)
        .pipe(sass({
            outputStyle: `expanded`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`./css`));
};

let compileCSSForProd = () => {
    return src(`./sass/style.scss`)
        .pipe(sass({
            outputStyle: `compressed`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`./css`));
};

let transpileJSForDev = () => {
    return src(`./js/*.js`)
        .pipe(babel())
        .pipe(dest(`./js`));
};

let transpileJSForProd = () => {
    return src(`./js/**/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`./js`));

};

let serve = () => {
    browserSync({
        notify: true,
        port: 9000,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `./css`,
                `./js`,
                `./`
            ]
        }
    });

    watch(`./js/**/*.js`,
        series(transpileJSForDev)
    ).on(`change`, reload);

    watch(`./sass/**/*.scss`,
        series(compileCSSForDev)
    ).on(`change`, reload);

    watch(`./**/*.html`,
        series(validateHTML)
    ).on(`change`, reload);

};

async function listTasks () {
    let exec = require(`child_process`).exec;

    exec(`gulp --tasks`, function (error, stdout, stderr) {
        if (null !== error) {
            process.stdout.write(`An error was likely generated when invoking ` +
                `the “exec” program in the default task.`);
        }

        if (`` !== stderr) {
            process.stdout.write(`Content has been written to the stderr stream ` +
                `when invoking the “exec” program in the default task.`);
        }

        process.stdout.write(`\n\tThis default task does ` +
            `nothing but generate this message. The ` +
            `available tasks are:\n\n${stdout}`);
    });
}

exports.safari = series(safari, serve);
exports.firefox = series(firefox, serve);
exports.chrome = series(chrome, serve);
exports.opera = series(opera, serve);
exports.edge = series(edge, serve);
exports.safari = series(safari, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.compileCSSForDev = compileCSSForDev;
exports.compileCSSForProd = compileCSSForProd;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.build = series(
    validateHTML,
    compressHTML,
    compileCSSForProd,
    transpileJSForProd,
    transpileJSForDev
);
exports.serve = series(compileCSSForDev, validateHTML, transpileJSForDev, serve);
exports.default = listTasks;
