'use strict';

var childProcess = require('child_process');
var electron = require('electron-prebuilt');
var gulp = require('gulp');

gulp.task('start', ['build', 'watch'], function () {
    childProcess.spawn(electron, ['.'], {
        cwd: './build',  /* critical that this is ./build so that electron picks up native dlls. */
        stdio: 'inherit'
    })
    .on('close', function () {
        // User closed the app. Kill the host process.
        process.exit();
    });
});
