// gulpfile.js

const gulp = require('gulp');
const babel = require('gulp-babel');
const merge2 = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const tsConfig = {
	target: 'es6',
	declaration:true
};
gulp.task('compile', () =>{
	let tsResult = gulp
		.src(['src/**/*.ts','typings/**/*.d.ts'])
		.pipe(sourcemaps.init())
		.pipe(typescript(tsConfig));

	return merge2([
		tsResult.dts.pipe(gulp.dest('lib')),
		tsResult.js
			.pipe(babel({ presets: ['stage-3', 'es2015'] }))
			.pipe(sourcemaps.write(".",{
				includeContent: true,
				sourceRoot: '.'
			}))
			.pipe(gulp.dest('lib'))
		]);
	}
);
gulp.task('default', ['compile']);
