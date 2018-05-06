const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyCSSPlugin = require("purifycss-webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const cssnano = require("cssnano");

exports.purifyCSS = ({ paths }) => ({
    plugins: [new PurifyCSSPlugin({ paths })],
});

exports.extractCSS = ({ include, exclude, use }) => {
    // Output extracted CSS to a file
    // Switched to mini-css-extract-plugin from extract-text-webpack-plugin due to [contenthash] issue
    // see: https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/763
    const plugin = new MiniCssExtractPlugin({
        // `allChunks` is needed to extract from extracted chunks as well.
        allChunks: true,
        filename: "[name].[contenthash].css",
    });

    const useLoaders = [MiniCssExtractPlugin.loader].concat(use);

    return {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    include,
                    exclude,
                    use: useLoaders
                },
            ],
        },
        plugins: [plugin],
    };
};

exports.devServer = ({ host, port, open } = {}) => ({
    devServer: {
        stats: "errors-only",
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        open,
        overlay: true,
    },
});

exports.loadCSS = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
                test: /\.css$/,
                include,
                exclude,

                use: ["style-loader", "css-loader"],
            },
        ],
    },
});

exports.autoprefix = () => ({
    loader: "postcss-loader",
    options: {
        plugins: () => [require("autoprefixer")()],
    },
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(png|jpg)$/,
                include,
                exclude,
                use: {
                    loader: "url-loader",
                    options,
                },
            },
        ],
    },
});

exports.loadJavaScript = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
                test: /\.js$/,
                include,
                exclude,
                use: "babel-loader",
            },
        ],
    },
});

exports.generateSourceMaps = ({ type }) => ({
    devtool: type,
});

exports.clean = path => ({
    plugins: [new CleanWebpackPlugin([path])],
});

exports.attachRevision = () => ({
    plugins: [
        new webpack.BannerPlugin({
            banner: new GitRevisionPlugin().version(),
        }),
    ],
});

exports.minifyJavaScript = () => ({
    optimization: {
        minimizer: [new UglifyWebpackPlugin({ sourceMap: true })],
    },
});

exports.minifyCSS = ({ options }) => ({
    plugins: [
        new OptimizeCSSAssetsPlugin({
            cssProcessor: cssnano,
            cssProcessorOptions: options,
            canPrint: false,
        }),
    ],
});

exports.setFreeVariable = (key, value) => {
    const env = {};
    env[key] = JSON.stringify(value);

    return {
        plugins: [new webpack.DefinePlugin(env)],
    };
};
