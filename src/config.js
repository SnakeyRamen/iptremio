const config = {
    PORT: process.env.PORT || 7008,
    BASE_URL: process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 7008}`,
    HOST: process.env.HOST || '127.0.0.1',
    isDev: process.env.NODE_ENV === 'development',
    IMG_PROXY: process.env.IMG_PROXY || 'https://img.iptremio.click/',
    MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/iptremio',
    MONGODB_POOL_SIZE: process.env.MONGODB_POOL_SIZE || 20,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
}

module.exports = config;
