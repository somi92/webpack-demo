const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path");
const glob = require("glob");

const parts = require("./webpack.parts");

const PATHS = {
    app: path.join(__dirname, "src"),
    build: path.join(__dirname, "dist"),
};

const commonConfig = merge([
    {
        plugins: [
            new HtmlWebpackPlugin({
                title: "Webpack demo",
            }),
        ],
    },
    parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
    parts.clean(PATHS.build),
    parts.extractCSS({
        use: ["css-loader", parts.autoprefix()],
    }),
    parts.purifyCSS({
        paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
    }),
    parts.loadImages({
        options: {
            limit: 15000,
            name: "[name].[ext]",
        },
    }),
    parts.generateSourceMaps({ type: "source-map" }),
    {
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "initial",
                    },
                },
            },
        },
    },
    parts.attachRevision(),
]);

const developmentConfig = merge([
    parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT,
    }),
    parts.loadCSS(),
    parts.loadImages(),
]);

module.exports = mode => {
    if (mode === "production") {
        return merge(commonConfig, productionConfig, { mode });
    }
    return merge(commonConfig, developmentConfig, { mode });
};
