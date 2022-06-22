module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/owner': {
                target: 'http://192.168.1.151:5588/',
                changeOrigin: true,
            },
            '/*.mbtiles/': {
                target: 'http://192.168.1.151:5588/',
                changeOrigin: true
            },
            '/graphql': {
                target: 'http://192.168.1.151:5588/',
                changeOrigin: true
            }
        }
    }
}