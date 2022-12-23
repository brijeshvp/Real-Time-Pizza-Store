// webpack.mix.js
let mix = require('laravel-mix');

// first arg is source, second arg is dest
// specifies compile from where to where
// Guide: https://laravel-mix.com/docs/6.0/examples
mix.js('resources/js/app.js', 'public/js/app.js');
mix.sass('resources/scss/app.scss', 'public/css/app.css');