const webpack = require('webpack');
const path = require('path');

module.exports = {
    cache: {
        name: 'tauri-ngx-cache',
        type: 'filesystem',
        allowCollectingMemory: false,
        cacheDirectory: path.resolve(__dirname, 'dist', '.ngx_cache', 'dir'),
        cacheLocation: path.resolve(__dirname, 'dist', '.ngx_cache', 'loc'),
        compression: 'gzip',
        hashAlgorithm: 'sha256',
        maxAge: 7 * 24 * 3600 * 100
    },
    devServer: {
        client: {
            logging: 'info',
            progress: true,
        },
        compress: true,
        // static: {
        //     directory: path.join(__dirname, 'dist', 'webpack'),
        // },
    },
    plugins: [
        new webpack.DefinePlugin({
            "VERSION": JSON.stringify("1988")
        })
    ],
}