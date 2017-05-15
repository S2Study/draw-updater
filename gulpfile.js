// gulpfile.js

const gulp = require('gulp');
const merge2 = require('merge2');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const tslint = require("gulp-tslint");
const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

const tsConfig = typescript.createProject('tsconfig.json',{
	"declaration":true
});

const tsConfigTest = typescript.createProject('tsconfig.json',{
});

function doCompile(src, dest, config){

	let tsResult = gulp
		.src(src)
		.pipe(sourcemaps.init())
		.pipe(config());

	return merge2([
		tsResult.dts.pipe(gulp.dest(dest)),
		tsResult.js
			.pipe(sourcemaps.write(".",{
				includeContent: true,
				sourceRoot: '.'
			}))
			.pipe(gulp.dest(dest))
	]);
}

function remapCoverageFiles() {
	return gulp.src('./coverage/coverage-final.json')
		.pipe(remapIstanbul({
			reports: {
				'html': './coverage/report',
				'text-summary': null,
				'lcovonly': './coverage/lcov.info'
			}
		}));
}

gulp.task("tslint", () =>
	gulp.src(['src/**/*.ts'])
		.pipe(tslint({
			formatter: "verbose"
		}))
		.pipe(tslint.report())
);

gulp.task("pre-test",['compile-test'], () => {
		return gulp.src(['src/**/*.js'])
			.pipe(istanbul())
			.pipe(istanbul.hookRequire());
	}
);
gulp.task("test",['pre-test'], () => {
		return gulp.src('test/**/*Test.js')
		// .pipe(mocha({ui:'bdd'}))
			.pipe(mocha())
			.pipe(istanbul.writeReports({
				reporters: [ 'json'],
			})).pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })
			).on('end', remapCoverageFiles);
	}
);

gulp.task('compile-dev', () => {
	return doCompile(['src/**/*.ts'], 'src', tsConfigTest);
});
gulp.task('compile-test',['compile-dev'], () => {
	return doCompile(['test/**/*.ts'], 'test', tsConfigTest);
});
gulp.task('compile-lib',['tslint'], () => {
	return doCompile(['src/**/*.ts'], 'lib', tsConfig);
});
gulp.task('compile',['compile-lib'], ()=>{
	return doCompile(['index.ts'],'.', tsConfig);
});
gulp.task('default', ['compile']);
