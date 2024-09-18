const webpack = require('webpack');

module.exports = {
    cache: {
        type: 'filesystem'
    },
    plugins: [
        new webpack.DefinePlugin({
            "VERSION": JSON.stringify("1988")
        })
    ],
}