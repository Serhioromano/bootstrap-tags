module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            compress: {
                files: {
                    'css/bootstrap-tags.min.css': ['css/bootstrap-tags.css']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\nhttps://github.com/Serhioromano/bootstrap-calendar.git\n'
            },
            build: {
                src: 'js/bootstrap-tags.js',
                dest: 'js/bootstrap-tags.min.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['cssmin', 'uglify']);

};